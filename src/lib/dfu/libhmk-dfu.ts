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
 *
 * High-level libhmk firmware update helpers ported from hmkdfu
 * (https://github.com/gohanda11/hmkdfu).
 */

import z from "zod"
import {
  DfuDevice,
  errorMessage,
  findDeviceDfuInterfaces,
  parseConfigurationDescriptor,
  type DfuInterfaceSettings,
} from "./dfu"
import { DfuSeDevice } from "./dfuse"

export const LIBHMK_REPO = "gohanda11/libhmk"
export const LIBHMK_FIRMWARE_BRANCH = "firmware"
export const LIBHMK_MANIFEST_URL = `https://raw.githubusercontent.com/${LIBHMK_REPO}/${LIBHMK_FIRMWARE_BRANCH}/manifest.json`
export const LIBHMK_RAW_BASE_URL = `https://raw.githubusercontent.com/${LIBHMK_REPO}`

// Factory DFU bootloaders used by libhmk keyboards
export const HMK_DFU_DEVICE_FILTERS: USBDeviceFilter[] = [
  { vendorId: 0x2e3c, productId: 0xdf11 }, // AT32F405
  { vendorId: 0x0483, productId: 0xdf11 }, // STM32
]

const DEFAULT_TRANSFER_SIZE = 1024

export const firmwareManifestSchema = z.object({
  commit: z.string(),
  firmwares: z.array(
    z.object({
      keyboard: z.string(),
      url: z.string(),
      size: z.number(),
      commit: z.string(),
      built_at: z.string(),
    }),
  ),
})

export type FirmwareManifest = z.infer<typeof firmwareManifestSchema>
export type FirmwareEntry = FirmwareManifest["firmwares"][number]

export function isWebUSBSupported() {
  return "usb" in navigator
}

export async function fetchFirmwareManifest(): Promise<FirmwareManifest> {
  const res = await fetch(LIBHMK_MANIFEST_URL, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to fetch the firmware manifest: HTTP ${res.status}`)
  }

  return firmwareManifestSchema.parse(await res.json())
}

function normalizeKeyboardName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const keyboardJsonSchema = z.object({
  usb: z.object({ vid: z.string(), pid: z.string() }),
  hardware: z.object({ driver: z.string() }).optional(),
})

async function fetchKeyboardJson(commit: string, keyboard: string) {
  const res = await fetch(
    `${LIBHMK_RAW_BASE_URL}/${commit}/keyboards/${keyboard}/keyboard.json`,
    { cache: "no-store" },
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch keyboard metadata: HTTP ${res.status}`)
  }

  return keyboardJsonSchema.parse(await res.json())
}

// The DFU bootloader a keyboard enters is the factory bootloader of its MCU:
// STM32-based boards re-enumerate as 0x0483:0xDF11 and AT32F405-based boards
// as 0x2E3C:0xDF11. Returns the expected bootloader vendor ID for the
// keyboard, or null when it cannot be determined (unknown MCU driver, missing
// hardware metadata, or a network failure).
export async function fetchExpectedDfuVendorId(
  commit: string,
  keyboard: string,
): Promise<number | null> {
  try {
    const { hardware } = await fetchKeyboardJson(commit, keyboard)
    const driver = (hardware?.driver ?? "").toLowerCase()
    if (driver.startsWith("stm32")) return 0x0483
    if (driver.startsWith("at32")) return 0x2e3c
    return null
  } catch {
    return null
  }
}

// Multiple keyboards can report the same display name (e.g. he60, he60-v2 and
// he60-flexcut all report "HE60"), so the manifest entry is resolved by
// matching the normalized name and disambiguating with the USB VID/PID.
//
// Some boards even share the same USB VID/PID and display name while using
// different microcontrollers (he60 and he60-v2 both report "HE60" with
// 0xAB50:0xAB60, on STM32F446 and AT32F405 respectively). When the VID/PID
// leaves more than one candidate, the correct build cannot be identified and
// guessing could flash firmware for the wrong MCU, permanently damaging the
// keyboard — so the resolution is reported as an error instead of guessing.
export async function resolveFirmwareEntry(
  manifest: FirmwareManifest,
  metadata: { name: string; vendorId: number; productId: number },
): Promise<FirmwareEntry | undefined> {
  const normalizedName = normalizeKeyboardName(metadata.name)
  const candidates = manifest.firmwares.filter((fw) => {
    const k = normalizeKeyboardName(fw.keyboard)
    return k === normalizedName || k.startsWith(normalizedName)
  })
  if (candidates.length === 0) return undefined
  if (candidates.length === 1) return candidates[0]

  const matches = (
    await Promise.all(
      candidates.map(async (fw) => {
        try {
          const { usb } = await fetchKeyboardJson(manifest.commit, fw.keyboard)
          return parseInt(usb.vid, 16) === metadata.vendorId &&
            parseInt(usb.pid, 16) === metadata.productId
            ? fw
            : null
        } catch {
          return null
        }
      }),
    )
  ).filter((fw): fw is FirmwareEntry => fw !== null)

  if (matches.length === 1) return matches[0]

  const boardNames = (matches.length > 1 ? matches : candidates)
    .map((fw) => fw.keyboard)
    .join(", ")
  const ambiguity =
    matches.length === 0
      ? `none of the boards with this name (${boardNames}) could be confirmed against the keyboard's USB ID [${hex4(metadata.vendorId)}:${hex4(metadata.productId)}]`
      : `multiple boards with this name (${boardNames}) share the USB ID [${hex4(metadata.vendorId)}:${hex4(metadata.productId)}] and cannot be told apart`
  throw new Error(
    `Cannot determine the firmware for "${metadata.name}": ${ambiguity}, so the correct build cannot be selected automatically. Refusing to auto-update — flashing firmware built for the wrong microcontroller can permanently damage the keyboard. Please update manually with hmkdfu (https://github.com/gohanda11/hmkdfu) and choose the DFU device whose bootloader matches your keyboard (VID 0x2E3C:0xDF11 for AT32F405 boards, VID 0x0483:0xDF11 for STM32 boards).`,
  )
}

export function parseFirmwareVersion(source: string): number | null {
  const match = /^\s*#define\s+FIRMWARE_VERSION\s+0x([0-9a-fA-F]{1,4})/m.exec(
    source,
  )
  return match === null ? null : parseInt(match[1], 16)
}

export async function fetchLatestFirmwareVersion(
  commit: string,
): Promise<number> {
  const res = await fetch(`${LIBHMK_RAW_BASE_URL}/${commit}/include/common.h`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch the latest firmware version: HTTP ${res.status}`,
    )
  }

  const version = parseFirmwareVersion(await res.text())
  if (version === null) {
    throw new Error("Failed to parse FIRMWARE_VERSION from common.h.")
  }

  return version
}

export async function fetchFirmwareBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to download the firmware: HTTP ${res.status}`)
  }

  return await res.arrayBuffer()
}

export function formatDfuError(error: unknown): string {
  const msg = errorMessage(error)
  const lower = msg.toLowerCase()
  if (
    lower.includes("notfounderror") ||
    lower.includes("device unavailable") ||
    lower.includes("device was disconnected")
  ) {
    return "Device not found or disconnected. Make sure the keyboard is in DFU bootloader mode and the USB cable supports data transfer."
  }
  if (
    lower.includes("access denied") ||
    lower.includes("not allowed") ||
    lower.includes("securityerror")
  ) {
    return "Access denied. On Windows, a WinUSB driver (e.g. installed with Zadig) must be bound to the DFU device."
  }
  if (lower.includes("security")) {
    return "WebUSB is blocked. Use a Chromium-based browser (Chrome/Edge) and access this page over HTTPS or localhost."
  }

  return msg
}

export function niceSize(n: number) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MiB`
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KiB`
  return `${n} B`
}

function hex4(n: number) {
  return n.toString(16).padStart(4, "0")
}

function hexAddr8(n: number) {
  return `0x${n.toString(16).padStart(8, "0")}`
}

export function formatDfuSummary(device: DfuDevice) {
  const vid = hex4(device.usbDevice.vendorId)
  const pid = hex4(device.usbDevice.productId)
  const cfg = device.settings.configuration.configurationValue
  const intf = device.settings.interface.interfaceNumber
  const alt = device.settings.alternate.alternateSetting
  const serial = device.usbDevice.serialNumber
  let mode = "Unknown"
  if (device.settings.alternate.interfaceProtocol === 0x01) mode = "Runtime"
  else if (device.settings.alternate.interfaceProtocol === 0x02) mode = "DFU"

  return `${mode}: [${vid}:${pid}] cfg=${cfg}, intf=${intf}, alt=${alt}, serial="${serial}"`
}

export interface DfuDescriptorProperties {
  willDetach: boolean
  manifestationTolerant: boolean
  canUpload: boolean
  canDownload: boolean
  transferSize: number
  detachTimeout: number
  dfuVersion: number
}

export async function getDFUDescriptorProperties(
  device: DfuDevice,
): Promise<DfuDescriptorProperties | null> {
  const data = await device.readConfigurationDescriptor(0)
  const configDesc = parseConfigurationDescriptor(data)
  const configValue = device.settings.configuration.configurationValue
  if (configDesc.bConfigurationValue !== configValue) return null

  for (const desc of configDesc.descriptors) {
    if (desc.bDescriptorType === 0x21 && "bcdDFUVersion" in desc) {
      return {
        willDetach: (desc.bmAttributes & 0x08) !== 0,
        manifestationTolerant: (desc.bmAttributes & 0x04) !== 0,
        canUpload: (desc.bmAttributes & 0x02) !== 0,
        canDownload: (desc.bmAttributes & 0x01) !== 0,
        transferSize: desc.wTransferSize,
        detachTimeout: desc.wDetachTimeOut,
        dfuVersion: desc.bcdDFUVersion,
      }
    }
  }

  return null
}

async function fixInterfaceNames(
  device: USBDevice,
  interfaces: DfuInterfaceSettings[],
) {
  if (interfaces.some((intf) => intf.name === null)) {
    const tempDevice = new DfuDevice(device, interfaces[0])
    await tempDevice.usbDevice.open()
    await tempDevice.usbDevice.selectConfiguration(1)
    const mapping = await tempDevice.readInterfaceNames()
    await tempDevice.close()

    for (const intf of interfaces) {
      if (intf.name === null) {
        const configIndex = intf.configuration.configurationValue
        const intfNumber = intf.interface.interfaceNumber
        const alt = intf.alternate.alternateSetting
        intf.name = mapping[configIndex]?.[intfNumber]?.[alt] ?? null
      }
    }
  }
}

function selectPreferredInterface(interfaces: DfuInterfaceSettings[]) {
  const preferred = interfaces.find(
    (intf) => intf.name !== null && intf.name.includes("@Internal Flash"),
  )
  return preferred ?? interfaces[0]
}

export interface DfuConnection {
  device: DfuDevice
  transferSize: number
  manifestationTolerant: boolean
  memorySummary: string
}

export async function requestDfuDevice(): Promise<USBDevice | null> {
  try {
    return await navigator.usb.requestDevice({
      filters: HMK_DFU_DEVICE_FILTERS,
    })
  } catch (error) {
    // The user dismissed the device picker
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return null
    }
    throw error
  }
}

export async function connectDfuDevice(
  usbDevice: USBDevice,
): Promise<DfuConnection> {
  const interfaces = findDeviceDfuInterfaces(usbDevice)
  if (interfaces.length === 0) {
    throw new Error("The selected device does not have any USB DFU interfaces.")
  }

  try {
    await fixInterfaceNames(usbDevice, interfaces)
  } catch (error) {
    console.warn("Failed to read interface names, continuing:", error)
  }

  const settings = selectPreferredInterface(interfaces)
  let device: DfuDevice = new DfuDevice(usbDevice, settings)
  await device.open()

  let transferSize = DEFAULT_TRANSFER_SIZE
  let manifestationTolerant = true
  let memorySummary = ""

  let props: DfuDescriptorProperties | null = null
  try {
    props = await getDFUDescriptorProperties(device)
  } catch (error) {
    console.warn("Failed to read DFU functional descriptor:", error)
  }

  if (props !== null) {
    if (props.transferSize >= 8) {
      transferSize = props.transferSize
    }
    manifestationTolerant = props.manifestationTolerant

    // Devices reporting DfuSe (e.g. the STM32 factory bootloader) require
    // the DfuSe protocol extensions to erase and write flash memory.
    if (
      props.dfuVersion === 0x011a &&
      settings.alternate.interfaceProtocol === 0x02
    ) {
      try {
        const dfuseDevice = new DfuSeDevice(usbDevice, settings)
        if (dfuseDevice.memoryInfo) {
          const total = dfuseDevice.memoryInfo.segments.reduce(
            (acc, segment) => acc + (segment.end - segment.start),
            0,
          )
          memorySummary = `Selected memory region: ${dfuseDevice.memoryInfo.name} (${niceSize(total)})`
          for (const segment of dfuseDevice.memoryInfo.segments) {
            const propsList: string[] = []
            if (segment.readable) propsList.push("readable")
            if (segment.erasable) propsList.push("erasable")
            if (segment.writable) propsList.push("writable")
            memorySummary += `\n${hexAddr8(segment.start)}-${hexAddr8(segment.end - 1)} (${propsList.join(", ") || "inaccessible"})`
          }
        }
        device = dfuseDevice
      } catch (error) {
        console.warn(
          "Failed to set up DfuSe, continuing as standard DFU:",
          error,
        )
      }
    }
  }

  return { device, transferSize, manifestationTolerant, memorySummary }
}
