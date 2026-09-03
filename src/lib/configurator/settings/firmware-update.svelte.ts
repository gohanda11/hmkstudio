/*
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { DfuState } from "$lib/dfu/dfu"
import {
  connectDfuDevice,
  fetchExpectedDfuVendorId,
  fetchFirmwareBinary,
  fetchFirmwareManifest,
  fetchLatestFirmwareVersion,
  formatDfuError,
  formatDfuSummary,
  niceSize,
  requestDfuDevice,
  resolveFirmwareEntry,
  type DfuConnection,
  type FirmwareEntry,
} from "$lib/dfu/libhmk-dfu"
import type { Keyboard } from "$lib/keyboard"
import { toast } from "svelte-sonner"

export type FirmwareUpdateStep =
  | "idle"
  | "preparing"
  | "select"
  | "connecting"
  | "ready"
  | "flashing"
  | "done"
  | "error"

// How long the user may take to pick the DFU device after the keyboard has
// jumped to the bootloader before an error with recovery guidance is shown.
export const DFU_SELECT_TIMEOUT_S = 60

const dfuSelectTimeoutMessage = `Timed out waiting for a DFU device to be selected (${DFU_SELECT_TIMEOUT_S} seconds). If the keyboard is stuck in DFU bootloader mode, unplug it and plug it back in (or press its reset button), then click "Select DFU Device" again. On Windows, make sure the DFU device is bound to a WinUSB driver (Zadig).`

function dfuVendorLabel(vendorId: number) {
  switch (vendorId) {
    case 0x0483:
      return "STM32 (VID 0x0483:0xDF11)"
    case 0x2e3c:
      return "AT32F405 (VID 0x2E3C:0xDF11)"
    default:
      return `VID 0x${vendorId.toString(16).padStart(4, "0")}:0xDF11`
  }
}

function dfuDeviceDescription(device: USBDevice) {
  const serial = device.serialNumber
  const id = `[0x${device.vendorId.toString(16).padStart(4, "0")}:0x${device.productId.toString(16).padStart(4, "0")}]`
  return serial === null || serial === "" ? id : `${id} (serial "${serial}")`
}

class FirmwareUpdate {
  step = $state<FirmwareUpdateStep>("idle")
  keyboardName = $state("")
  currentVersion = $state(0)
  latestVersion = $state<number | null>(null)
  firmwareSize = $state(0)
  deviceSummary = $state("")
  memorySummary = $state("")
  phase = $state("")
  progress = $state<{ done: number; total?: number } | null>(null)
  logs = $state<string[]>([])
  error = $state<string | null>(null)
  // Set when the connected DFU device cannot be positively identified as the
  // keyboard being updated; flashing is then gated on user confirmation.
  identityWarning = $state<string | null>(null)
  identityConfirmed = $state(false)

  #firmware: ArrayBuffer | null = null
  #entry: FirmwareEntry | null = null
  #connection: DfuConnection | null = null
  #onUsbDisconnect: ((event: USBConnectionEvent) => void) | null = null
  #selectTimer: ReturnType<typeof setTimeout> | null = null

  get active() {
    return this.step !== "idle"
  }

  get busy() {
    return (
      this.step === "preparing" ||
      this.step === "connecting" ||
      this.step === "flashing"
    )
  }

  async start(keyboard: Keyboard) {
    if (this.step !== "idle") return

    this.#resetState()
    this.keyboardName = keyboard.metadata.name
    this.currentVersion = keyboard.version
    this.step = "preparing"

    try {
      const manifest = await fetchFirmwareManifest()
      const entry = await resolveFirmwareEntry(manifest, keyboard.metadata)
      if (entry === undefined) {
        throw new Error(
          `No firmware build is available for "${this.keyboardName}".`,
        )
      }
      this.#entry = entry

      const [latestVersion, firmware] = await Promise.all([
        fetchLatestFirmwareVersion(manifest.commit).catch(() => null),
        fetchFirmwareBinary(entry.url),
      ])
      if (firmware.byteLength !== entry.size) {
        throw new Error(
          `The downloaded firmware is invalid: expected ${entry.size} bytes but received ${firmware.byteLength} bytes. The download may be incomplete or corrupted — please try again.`,
        )
      }
      this.latestVersion = latestVersion
      this.#firmware = firmware
      this.firmwareSize = firmware.byteLength
      this.#log(
        `Downloaded ${this.keyboardName} firmware (${niceSize(firmware.byteLength)}, commit ${entry.commit.slice(0, 7)})`,
      )
    } catch (error) {
      this.error = formatDfuError(error)
      this.step = "error"
      return
    }

    // The firmware jumps to the bootloader without responding to the HID
    // command, so the returned promise never resolves. The keyboard then
    // disconnects and re-enumerates as a DFU device.
    void keyboard.bootloader().catch(() => undefined)
    this.step = "select"
    this.#armSelectTimeout()
  }

  async selectDevice() {
    if (this.step !== "select") return

    this.error = null
    this.identityWarning = null
    this.identityConfirmed = false

    let usbDevice: USBDevice | null
    try {
      usbDevice = await requestDfuDevice()
    } catch (error) {
      this.error = formatDfuError(error)
      return
    }
    // The user dismissed the device picker
    if (usbDevice === null) {
      this.#armSelectTimeout()
      return
    }

    this.#clearSelectTimer()
    this.step = "connecting"

    let connection: DfuConnection
    try {
      connection = await connectDfuDevice(usbDevice)
    } catch (error) {
      this.error = formatDfuError(error)
      this.step = "select"
      this.#armSelectTimeout()
      return
    }

    const { device } = connection
    device.logInfo = (msg) => this.#logInfo(msg)
    device.logWarning = (msg) => this.#log(`Warning: ${msg}`)
    device.logError = (msg) => this.#log(`Error: ${msg}`)
    device.logProgress = (done, total) => {
      this.progress = { done, total }
    }

    // The DFU bootloader cannot prove which keyboard it belongs to, so refuse
    // to continue when it contradicts the keyboard being updated, and require
    // explicit user confirmation before flashing in every other case.
    const expectedVendorId =
      this.#entry === null
        ? null
        : await fetchExpectedDfuVendorId(
            this.#entry.commit,
            this.#entry.keyboard,
          )
    if (expectedVendorId !== null && usbDevice.vendorId !== expectedVendorId) {
      this.#log(
        `Warning: the selected DFU device (${dfuDeviceDescription(usbDevice)}) is not the bootloader expected for ${this.keyboardName} (${dfuVendorLabel(expectedVendorId)})`,
      )
      await connection.device.close()
      this.error = `The selected DFU device (${dfuDeviceDescription(usbDevice)}) does not match "${this.keyboardName}", which expects the ${dfuVendorLabel(expectedVendorId)} DFU bootloader. To avoid flashing the wrong keyboard, disconnect the other device and select the DFU device that appeared when "${this.keyboardName}" restarted.`
      this.step = "select"
      this.#armSelectTimeout()
      return
    }

    this.#connection = connection
    this.deviceSummary = formatDfuSummary(device)
    this.memorySummary = connection.memorySummary

    this.#onUsbDisconnect = (event) => {
      if (event.device === usbDevice) this.#handleDeviceDisconnected()
    }
    navigator.usb.addEventListener("disconnect", this.#onUsbDisconnect)

    this.#log(`Connected to ${this.deviceSummary}`)
    this.identityWarning = this.#buildIdentityWarning(
      usbDevice,
      expectedVendorId,
    )
    this.step = "ready"
  }

  async flash() {
    const connection = this.#connection
    const firmware = this.#firmware
    if (this.step !== "ready" || connection === null || firmware === null) {
      return
    }
    // The identity of the DFU device could not be verified, so flashing is
    // only allowed after the user confirms it in the dialog.
    if (this.identityWarning !== null && !this.identityConfirmed) return

    this.step = "flashing"
    this.error = null
    this.phase = ""
    this.progress = { done: 0, total: firmware.byteLength }

    try {
      const status = await connection.device.getStatus()
      if (status.state === DfuState.dfuERROR) {
        await connection.device.clearStatus()
      }
    } catch {
      this.#log("Warning: failed to clear DFU status")
    }

    try {
      await connection.device.doDownload(
        connection.transferSize,
        firmware,
        connection.manifestationTolerant,
      )
      this.phase = ""
      this.#log("Done!")
      this.step = "done"
    } catch (error) {
      this.error = formatDfuError(error)
      this.step = "error"
    }
  }

  async retry() {
    if (this.step !== "error") return

    await this.#closeConnection()
    this.error = null
    this.step = this.#firmware === null ? "idle" : "select"
    if (this.step === "select") this.#armSelectTimeout()
  }

  async close() {
    if (this.step === "idle" || this.busy) return

    // Cancelling after the BOOTLOADER command was issued can leave the
    // keyboard in DFU bootloader mode (its HID interface is gone), so keep
    // recovery guidance visible after the dialog closes.
    const keyboardMayBeInDfu = this.step === "select" || this.step === "ready"
    const keyboardName = this.keyboardName

    await this.#closeConnection()
    this.#resetState()

    if (keyboardMayBeInDfu) {
      toast.warning(
        `Firmware update cancelled. "${keyboardName}" may still be in DFU bootloader mode: if it does not reconnect as a keyboard, unplug it and plug it back in (or press its reset button).`,
      )
    }
  }

  #handleDeviceDisconnected() {
    // While flashing, transfer errors are surfaced by doDownload, and a
    // disconnect at the end of a successful flash is expected.
    if (this.step !== "connecting" && this.step !== "ready") return

    this.error = "The DFU device was disconnected."
    this.step = "error"
  }

  async #closeConnection() {
    if (this.#onUsbDisconnect !== null) {
      navigator.usb.removeEventListener("disconnect", this.#onUsbDisconnect)
      this.#onUsbDisconnect = null
    }
    if (this.#connection !== null) {
      await this.#connection.device.close()
      this.#connection = null
    }
  }

  #buildIdentityWarning(usbDevice: USBDevice, expectedVendorId: number | null) {
    const serial = usbDevice.serialNumber
    const serialNote =
      serial === null || serial === ""
        ? ", and it exposes no serial number"
        : ` (serial "${serial}")`
    const identityNote =
      expectedVendorId === null
        ? `The expected DFU bootloader for "${this.keyboardName}" could not be verified, and a DFU bootloader does not identify which keyboard it belongs to`
        : `The selected DFU device matches the ${dfuVendorLabel(expectedVendorId)} bootloader expected for "${this.keyboardName}", but the bootloader cannot prove that it belongs to this keyboard`
    return `${identityNote}${serialNote}. If more than one DFU-capable keyboard is connected, disconnect the others so that only "${this.keyboardName}" remains attached, and verify the device summary above before flashing.`
  }

  #armSelectTimeout() {
    this.#clearSelectTimer()
    this.#selectTimer = setTimeout(() => {
      this.#selectTimer = null
      if (this.step !== "select") return
      this.error = dfuSelectTimeoutMessage
      this.#log(
        `Timed out waiting for a DFU device to be selected (${DFU_SELECT_TIMEOUT_S} seconds).`,
      )
    }, DFU_SELECT_TIMEOUT_S * 1000)
  }

  #clearSelectTimer() {
    if (this.#selectTimer !== null) {
      clearTimeout(this.#selectTimer)
      this.#selectTimer = null
    }
  }

  #logInfo(msg: string) {
    if (msg === "Erasing DFU device memory") {
      this.phase = "Erasing flash memory..."
    } else if (msg === "Copying data from browser to DFU device") {
      this.phase = "Writing firmware..."
    } else if (msg === "Manifesting new firmware") {
      this.phase = "Manifesting new firmware..."
    }
    this.#log(msg)
  }

  #log(message: string) {
    this.logs = [...this.logs.slice(-99), message]
  }

  #resetState() {
    this.step = "idle"
    this.keyboardName = ""
    this.currentVersion = 0
    this.latestVersion = null
    this.firmwareSize = 0
    this.deviceSummary = ""
    this.memorySummary = ""
    this.phase = ""
    this.progress = null
    this.logs = []
    this.error = null
    this.identityWarning = null
    this.identityConfirmed = false
    this.#clearSelectTimer()
    this.#firmware = null
    this.#entry = null
  }
}

export const firmwareUpdate = new FirmwareUpdate()
