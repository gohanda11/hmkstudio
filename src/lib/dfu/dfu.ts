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
 * USB DFU protocol implementation ported from webdfu
 * (https://github.com/devanlai/webdfu) and hmkdfu
 * (https://github.com/gohanda11/hmkdfu).
 */

// DFU class-specific requests
export const DFU_DNLOAD = 0x01
export const DFU_GETSTATUS = 0x03
export const DFU_CLRSTATUS = 0x04

// DFU states
export const DfuState = {
  appIDLE: 0,
  appDETACH: 1,
  dfuIDLE: 2,
  dfuDNLOAD_SYNC: 3,
  dfuDNBUSY: 4,
  dfuDNLOAD_IDLE: 5,
  dfuMANIFEST_SYNC: 6,
  dfuMANIFEST: 7,
  dfuMANIFEST_WAIT_RESET: 8,
  dfuUPLOAD_IDLE: 9,
  dfuERROR: 10,
} as const

export const DFU_STATUS_OK = 0x00

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export interface DfuInterfaceSettings {
  configuration: USBConfiguration
  interface: USBInterface
  alternate: USBAlternateInterface
  name: string | null
}

export interface DfuStatus {
  status: number
  pollTimeout: number
  state: number
}

export interface DfuInterfaceDescriptor {
  bLength: number
  bDescriptorType: number
  bInterfaceNumber: number
  bAlternateSetting: number
  bNumEndpoints: number
  bInterfaceClass: number
  bInterfaceSubClass: number
  bInterfaceProtocol: number
  iInterface: number
  descriptors: DfuDescriptor[]
}

export interface DfuFunctionalDescriptor {
  bLength: number
  bDescriptorType: number
  bmAttributes: number
  wDetachTimeOut: number
  wTransferSize: number
  bcdDFUVersion: number
}

export interface DfuGenericDescriptor {
  bLength: number
  bDescriptorType: number
  data: DataView
}

export type DfuDescriptor =
  | DfuInterfaceDescriptor
  | DfuFunctionalDescriptor
  | DfuGenericDescriptor

export interface DfuConfigurationDescriptor {
  bLength: number
  bDescriptorType: number
  wTotalLength: number
  bNumInterfaces: number
  bConfigurationValue: number
  iConfiguration: number
  bmAttributes: number
  bMaxPower: number
  descriptors: DfuDescriptor[]
}

export function findDeviceDfuInterfaces(device: USBDevice) {
  const interfaces: DfuInterfaceSettings[] = []
  for (const conf of device.configurations) {
    for (const intf of conf.interfaces) {
      for (const alt of intf.alternates) {
        if (
          alt.interfaceClass === 0xfe &&
          alt.interfaceSubclass === 0x01 &&
          (alt.interfaceProtocol === 0x01 || alt.interfaceProtocol === 0x02)
        ) {
          interfaces.push({
            configuration: conf,
            interface: intf,
            alternate: alt,
            name: alt.interfaceName,
          })
        }
      }
    }
  }

  return interfaces
}

export function parseInterfaceDescriptor(
  data: DataView,
): DfuInterfaceDescriptor {
  return {
    bLength: data.getUint8(0),
    bDescriptorType: data.getUint8(1),
    bInterfaceNumber: data.getUint8(2),
    bAlternateSetting: data.getUint8(3),
    bNumEndpoints: data.getUint8(4),
    bInterfaceClass: data.getUint8(5),
    bInterfaceSubClass: data.getUint8(6),
    bInterfaceProtocol: data.getUint8(7),
    iInterface: data.getUint8(8),
    descriptors: [],
  }
}

export function parseFunctionalDescriptor(
  data: DataView,
): DfuFunctionalDescriptor {
  return {
    bLength: data.getUint8(0),
    bDescriptorType: data.getUint8(1),
    bmAttributes: data.getUint8(2),
    wDetachTimeOut: data.getUint16(3, true),
    wTransferSize: data.getUint16(5, true),
    bcdDFUVersion: data.getUint16(7, true),
  }
}

export function parseSubDescriptors(descriptorData: DataView) {
  const DT_INTERFACE = 4
  const DT_DFU_FUNCTIONAL = 0x21
  const USB_CLASS_APP_SPECIFIC = 0xfe
  const USB_SUBCLASS_DFU = 0x01

  let remainingData = descriptorData
  const descriptors: DfuDescriptor[] = []
  let currIntf: DfuInterfaceDescriptor | undefined
  let inDfuIntf = false

  while (remainingData.byteLength > 2) {
    const bLength = remainingData.getUint8(0)
    const bDescriptorType = remainingData.getUint8(1)
    const descData = new DataView(
      remainingData.buffer.slice(
        remainingData.byteOffset,
        remainingData.byteOffset + bLength,
      ),
    )
    if (bDescriptorType === DT_INTERFACE) {
      currIntf = parseInterfaceDescriptor(descData)
      inDfuIntf =
        currIntf.bInterfaceClass === USB_CLASS_APP_SPECIFIC &&
        currIntf.bInterfaceSubClass === USB_SUBCLASS_DFU
      descriptors.push(currIntf)
    } else if (inDfuIntf && bDescriptorType === DT_DFU_FUNCTIONAL) {
      const funcDesc = parseFunctionalDescriptor(descData)
      descriptors.push(funcDesc)
      currIntf?.descriptors.push(funcDesc)
    } else {
      const desc: DfuGenericDescriptor = {
        bLength,
        bDescriptorType,
        data: descData,
      }
      descriptors.push(desc)
      currIntf?.descriptors.push(desc)
    }
    if (bLength === 0) break
    remainingData = new DataView(
      remainingData.buffer.slice(remainingData.byteOffset + bLength),
    )
  }

  return descriptors
}

export function parseConfigurationDescriptor(
  data: DataView,
): DfuConfigurationDescriptor {
  const descriptorData = new DataView(
    data.buffer.slice(data.byteOffset + 9, data.byteOffset + data.byteLength),
  )
  const descriptors = parseSubDescriptors(descriptorData)
  return {
    bLength: data.getUint8(0),
    bDescriptorType: data.getUint8(1),
    wTotalLength: data.getUint16(2, true),
    bNumInterfaces: data.getUint8(4),
    bConfigurationValue: data.getUint8(5),
    iConfiguration: data.getUint8(6),
    bmAttributes: data.getUint8(7),
    bMaxPower: data.getUint8(8),
    descriptors,
  }
}

export class DfuDevice {
  readonly usbDevice: USBDevice
  readonly settings: DfuInterfaceSettings
  readonly intfNumber: number
  disconnected = false

  logDebug: (msg: string) => void = () => {}
  logInfo: (msg: string) => void = (msg) => console.log(msg)
  logWarning: (msg: string) => void = (msg) => console.warn(msg)
  logError: (msg: string) => void = (msg) => console.error(msg)
  logProgress: (done: number, total?: number) => void = (done, total) => {
    if (total === undefined) console.log(done)
    else console.log(`${done}/${total}`)
  }

  constructor(device: USBDevice, settings: DfuInterfaceSettings) {
    this.usbDevice = device
    this.settings = settings
    this.intfNumber = settings.interface.interfaceNumber
  }

  async open() {
    await this.usbDevice.open()
    const confValue = this.settings.configuration.configurationValue
    if (
      this.usbDevice.configuration === null ||
      this.usbDevice.configuration.configurationValue !== confValue
    ) {
      await this.usbDevice.selectConfiguration(confValue)
    }

    const configuration = this.usbDevice.configuration
    if (configuration === null) {
      throw new Error("Failed to select USB configuration.")
    }

    const intfNumber = this.settings.interface.interfaceNumber
    if (!configuration.interfaces[intfNumber].claimed) {
      await this.usbDevice.claimInterface(intfNumber)
    }

    const altSetting = this.settings.alternate.alternateSetting
    const intf = configuration.interfaces[intfNumber]
    const currentAlternate = intf.alternate as USBAlternateInterface | null
    if (
      currentAlternate === null ||
      currentAlternate.alternateSetting !== altSetting ||
      intf.alternates.length > 1
    ) {
      try {
        await this.usbDevice.selectAlternateInterface(intfNumber, altSetting)
      } catch (error) {
        if (
          currentAlternate !== null &&
          currentAlternate.alternateSetting === altSetting &&
          errorMessage(error).endsWith("Unable to set device interface.")
        ) {
          this.logWarning(
            `Redundant SET_INTERFACE request to select altSetting ${altSetting} failed`,
          )
        } else {
          throw error
        }
      }
    }
  }

  async close() {
    try {
      await this.usbDevice.close()
    } catch (error) {
      console.log(error)
    }
  }

  async readConfigurationDescriptor(index: number): Promise<DataView> {
    const GET_DESCRIPTOR = 0x06
    const DT_CONFIGURATION = 0x02
    const wValue = (DT_CONFIGURATION << 8) | index

    const setup: USBControlTransferParameters = {
      requestType: "standard",
      recipient: "device",
      request: GET_DESCRIPTOR,
      value: wValue,
      index: 0,
    }

    const header = await this.usbDevice.controlTransferIn(setup, 4)
    if (header.status !== "ok" || !header.data) {
      throw new Error(`Failed to read configuration descriptor: ${header.status}`)
    }

    // Read out the full configuration descriptor
    const wLength = header.data.getUint16(2, true)
    const result = await this.usbDevice.controlTransferIn(setup, wLength)
    if (result.status !== "ok" || !result.data) {
      throw new Error(`Failed to read configuration descriptor: ${result.status}`)
    }

    return result.data
  }

  async readStringDescriptor(
    index: number,
    langID = 0,
  ): Promise<string | number[]> {
    const GET_DESCRIPTOR = 0x06
    const DT_STRING = 0x03
    const wValue = (DT_STRING << 8) | index

    const setup: USBControlTransferParameters = {
      requestType: "standard",
      recipient: "device",
      request: GET_DESCRIPTOR,
      value: wValue,
      index: langID,
    }

    // Read enough for bLength
    let result = await this.usbDevice.controlTransferIn(setup, 1)
    if (result.status !== "ok" || !result.data) {
      throw new Error(`Failed to read string descriptor ${index}: ${result.status}`)
    }

    // Retrieve the full descriptor
    const bLength = result.data.getUint8(0)
    result = await this.usbDevice.controlTransferIn(setup, bLength)
    if (result.status !== "ok" || !result.data) {
      throw new Error(`Failed to read string descriptor ${index}: ${result.status}`)
    }

    const data = result.data
    const len = (bLength - 2) / 2
    const u16Words: number[] = []
    for (let i = 0; i < len; i++) {
      u16Words.push(data.getUint16(2 + i * 2, true))
    }
    if (langID === 0) {
      // Return the langID array
      return u16Words
    } else {
      // Decode from UCS-2 into a string
      return String.fromCharCode(...u16Words)
    }
  }

  async readInterfaceNames(): Promise<
    Record<number, Record<number, Record<number, string | null>>>
  > {
    const DT_INTERFACE = 4

    const configs: Record<number, Record<number, Record<number, number>>> = {}
    const allStringIndices = new Set<number>()
    for (
      let configIndex = 0;
      configIndex < this.usbDevice.configurations.length;
      configIndex++
    ) {
      const rawConfig = await this.readConfigurationDescriptor(configIndex)
      const configDesc = parseConfigurationDescriptor(rawConfig)
      const configValue = configDesc.bConfigurationValue
      configs[configValue] = {}

      // Retrieve string indices for interface names
      for (const desc of configDesc.descriptors) {
        if (desc.bDescriptorType === DT_INTERFACE && "iInterface" in desc) {
          if (!(desc.bInterfaceNumber in configs[configValue])) {
            configs[configValue][desc.bInterfaceNumber] = {}
          }
          configs[configValue][desc.bInterfaceNumber][desc.bAlternateSetting] =
            desc.iInterface
          if (desc.iInterface > 0) {
            allStringIndices.add(desc.iInterface)
          }
        }
      }
    }

    // Retrieve interface name strings
    const strings: Record<number, string | null> = {}
    for (const index of allStringIndices) {
      try {
        strings[index] = (await this.readStringDescriptor(
          index,
          0x0409,
        )) as string
      } catch (error) {
        console.log(error)
        strings[index] = null
      }
    }

    const names: Record<number, Record<number, Record<number, string | null>>> =
      {}
    for (const [configValue, interfaces] of Object.entries(configs)) {
      names[Number(configValue)] = {}
      for (const [intfNumber, alternates] of Object.entries(interfaces)) {
        names[Number(configValue)][Number(intfNumber)] = {}
        for (const [alt, iIndex] of Object.entries(alternates)) {
          names[Number(configValue)][Number(intfNumber)][Number(alt)] =
            strings[iIndex] ?? null
        }
      }
    }

    return names
  }

  async requestOut(
    bRequest: number,
    data?: BufferSource,
    wValue = 0,
  ): Promise<number> {
    let result: USBOutTransferResult
    try {
      result = await this.usbDevice.controlTransferOut(
        {
          requestType: "class",
          recipient: "interface",
          request: bRequest,
          value: wValue,
          index: this.intfNumber,
        },
        data,
      )
    } catch (error) {
      throw new Error(`ControlTransferOut failed: ${errorMessage(error)}`)
    }

    if (result.status !== "ok") {
      throw new Error(`ControlTransferOut failed: ${result.status}`)
    }

    return result.bytesWritten
  }

  async requestIn(
    bRequest: number,
    wLength: number,
    wValue = 0,
  ): Promise<DataView> {
    let result: USBInTransferResult
    try {
      result = await this.usbDevice.controlTransferIn(
        {
          requestType: "class",
          recipient: "interface",
          request: bRequest,
          value: wValue,
          index: this.intfNumber,
        },
        wLength,
      )
    } catch (error) {
      throw new Error(`ControlTransferIn failed: ${errorMessage(error)}`)
    }

    if (result.status !== "ok" || !result.data) {
      throw new Error(`ControlTransferIn failed: ${result.status}`)
    }

    return result.data
  }

  download(data: BufferSource, blockNum: number) {
    return this.requestOut(DFU_DNLOAD, data, blockNum)
  }

  clearStatus() {
    return this.requestOut(DFU_CLRSTATUS)
  }

  async getStatus(): Promise<DfuStatus> {
    let data: DataView
    try {
      data = await this.requestIn(DFU_GETSTATUS, 6)
    } catch (error) {
      throw new Error(`DFU GETSTATUS failed: ${errorMessage(error)}`)
    }

    return {
      status: data.getUint8(0),
      pollTimeout: data.getUint32(1, true) & 0xffffff,
      state: data.getUint8(4),
    }
  }

  async pollUntil(
    statePredicate: (state: number) => boolean,
  ): Promise<DfuStatus> {
    let dfuStatus = await this.getStatus()

    while (
      !statePredicate(dfuStatus.state) &&
      dfuStatus.state !== DfuState.dfuERROR
    ) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, dfuStatus.pollTimeout),
      )
      dfuStatus = await this.getStatus()
    }

    return dfuStatus
  }

  pollUntilIdle(idleState: number) {
    return this.pollUntil((state) => state === idleState)
  }

  async doDownload(
    xferSize: number,
    data: ArrayBuffer,
    manifestationTolerant: boolean,
  ): Promise<void> {
    let bytesSent = 0
    const expectedSize = data.byteLength
    let transaction = 0

    this.logInfo("Copying data from browser to DFU device")

    // Initialize progress to 0
    this.logProgress(bytesSent, expectedSize)

    while (bytesSent < expectedSize) {
      const bytesLeft = expectedSize - bytesSent
      const chunkSize = Math.min(bytesLeft, xferSize)

      let bytesWritten = 0
      let dfuStatus: DfuStatus
      try {
        bytesWritten = await this.download(
          data.slice(bytesSent, bytesSent + chunkSize),
          transaction++,
        )
        this.logDebug(`Sent ${bytesWritten} bytes`)
        dfuStatus = await this.pollUntilIdle(DfuState.dfuDNLOAD_IDLE)
      } catch (error) {
        throw new Error(`Error during DFU download: ${errorMessage(error)}`)
      }

      if (dfuStatus.status !== DFU_STATUS_OK) {
        throw new Error(
          `DFU DOWNLOAD failed state=${dfuStatus.state}, status=${dfuStatus.status}`,
        )
      }

      this.logDebug(`Wrote ${bytesWritten} bytes`)
      bytesSent += bytesWritten

      this.logProgress(bytesSent, expectedSize)
    }

    this.logDebug("Sending empty block")
    try {
      await this.download(new ArrayBuffer(0), transaction++)
    } catch (error) {
      throw new Error(`Error during final DFU download: ${errorMessage(error)}`)
    }

    this.logInfo(`Wrote ${bytesSent} bytes`)
    this.logInfo("Manifesting new firmware")

    if (manifestationTolerant) {
      // Transition to MANIFEST_SYNC state
      try {
        // Wait until it returns to idle. If it is not really manifestation
        // tolerant, it might transition to MANIFEST_WAIT_RESET instead.
        const dfuStatus = await this.pollUntil(
          (state) =>
            state === DfuState.dfuIDLE ||
            state === DfuState.dfuMANIFEST_WAIT_RESET,
        )
        if (dfuStatus.state === DfuState.dfuMANIFEST_WAIT_RESET) {
          this.logDebug(
            "Device transitioned to MANIFEST_WAIT_RESET even though it is manifestation tolerant",
          )
        }
        if (dfuStatus.status !== DFU_STATUS_OK) {
          throw new Error(
            `DFU MANIFEST failed state=${dfuStatus.state}, status=${dfuStatus.status}`,
          )
        }
      } catch (error) {
        const msg = errorMessage(error)
        if (
          msg.includes("NetworkError") ||
          msg.includes("NotFoundError") ||
          msg.includes("Device unavailable") ||
          msg.includes("device was disconnected")
        ) {
          this.logWarning("Unable to poll final manifestation status")
        } else {
          throw new Error(`Error during DFU manifest: ${msg}`)
        }
      }
    } else {
      // Try polling once to initiate manifestation
      try {
        const finalStatus = await this.getStatus()
        this.logDebug(
          `Final DFU status: state=${finalStatus.state}, status=${finalStatus.status}`,
        )
      } catch (error) {
        this.logDebug(`Manifest GET_STATUS poll error: ${errorMessage(error)}`)
      }
    }

    // Reset to exit MANIFEST_WAIT_RESET
    try {
      await this.usbDevice.reset()
    } catch (error) {
      const msg = errorMessage(error)
      if (
        msg.includes("Unable to reset the device") ||
        msg.includes("Device unavailable") ||
        msg.includes("device was disconnected")
      ) {
        this.logDebug("Ignored reset error")
      } else {
        throw new Error(`Error during reset for manifestation: ${msg}`)
      }
    }
  }
}
