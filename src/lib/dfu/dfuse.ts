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
 * STM32 DfuSe protocol extension ported from webdfu
 * (https://github.com/devanlai/webdfu) and hmkdfu
 * (https://github.com/gohanda11/hmkdfu).
 */

import {
  DFU_STATUS_OK,
  DfuDevice,
  DfuState,
  errorMessage,
  type DfuInterfaceSettings,
  type DfuStatus,
} from "./dfu"

// DfuSe commands
export const DFUSE_GET_COMMANDS = 0x00
export const DFUSE_SET_ADDRESS = 0x21
export const DFUSE_ERASE_SECTOR = 0x41

const DFUSE_COMMAND_NAMES: Record<number, string> = {
  [DFUSE_GET_COMMANDS]: "GET_COMMANDS",
  [DFUSE_SET_ADDRESS]: "SET_ADDRESS",
  [DFUSE_ERASE_SECTOR]: "ERASE_SECTOR",
}

export interface DfuSeSegment {
  start: number
  end: number
  sectorSize: number
  readable: boolean
  erasable: boolean
  writable: boolean
}

export interface DfuSeMemoryInfo {
  name: string
  segments: DfuSeSegment[]
}

export function parseMemoryDescriptor(desc: string): DfuSeMemoryInfo {
  const nameEndIndex = desc.indexOf("/")
  if (!desc.startsWith("@") || nameEndIndex === -1) {
    throw new Error(`Not a DfuSe memory descriptor: "${desc}"`)
  }

  const name = desc.substring(1, nameEndIndex).trim()
  const segmentString = desc.substring(nameEndIndex)

  const segments: DfuSeSegment[] = []

  const sectorMultipliers: Record<string, number> = {
    " ": 1,
    B: 1,
    K: 1024,
    M: 1048576,
  }

  const contiguousSegmentRegex =
    /\/\s*(0x[0-9a-fA-F]{1,8})\s*\/(\s*[0-9]+\s*\*\s*[0-9]+\s?[ BKM]\s*[abcdefg]\s*,?\s*)+/g
  let contiguousSegmentMatch: RegExpExecArray | null
  while (
    (contiguousSegmentMatch = contiguousSegmentRegex.exec(segmentString)) !==
    null
  ) {
    const segmentRegex =
      /([0-9]+)\s*\*\s*([0-9]+)\s?([ BKM])\s*([abcdefg])\s*,?\s*/g
    let startAddress = parseInt(contiguousSegmentMatch[1], 16)
    let segmentMatch: RegExpExecArray | null
    while (
      (segmentMatch = segmentRegex.exec(contiguousSegmentMatch[0])) !== null
    ) {
      const sectorCount = parseInt(segmentMatch[1], 10)
      const sectorSize =
        parseInt(segmentMatch[2], 10) *
        (sectorMultipliers[segmentMatch[3]] ?? 1)
      const properties = segmentMatch[4].charCodeAt(0) - "a".charCodeAt(0) + 1
      segments.push({
        start: startAddress,
        sectorSize,
        end: startAddress + sectorSize * sectorCount,
        readable: (properties & 0x1) !== 0,
        erasable: (properties & 0x2) !== 0,
        writable: (properties & 0x4) !== 0,
      })

      startAddress += sectorSize * sectorCount
    }
  }

  return { name, segments }
}

export class DfuSeDevice extends DfuDevice {
  memoryInfo: DfuSeMemoryInfo | null = null
  startAddress = NaN

  constructor(device: USBDevice, settings: DfuInterfaceSettings) {
    super(device, settings)
    if (settings.name) {
      this.memoryInfo = parseMemoryDescriptor(settings.name)
    }
  }

  async dfuseCommand(command: number, param = 0x00, len = 1) {
    const payload = new ArrayBuffer(len + 1)
    const view = new DataView(payload)
    view.setUint8(0, command)
    if (len === 1) {
      view.setUint8(1, param)
    } else if (len === 4) {
      view.setUint32(1, param, true)
    } else {
      throw new Error(`Don't know how to handle data of len ${len}`)
    }

    try {
      await this.download(payload, 0)
    } catch (error) {
      throw new Error(
        `Error during special DfuSe command ${DFUSE_COMMAND_NAMES[command]}: ${errorMessage(error)}`,
      )
    }

    const status = await this.pollUntil((state) => state !== DfuState.dfuDNBUSY)
    if (status.status !== DFU_STATUS_OK) {
      throw new Error(
        `Special DfuSe command ${DFUSE_COMMAND_NAMES[command]} failed`,
      )
    }
  }

  getSegment(addr: number): DfuSeSegment | null {
    if (!this.memoryInfo || !this.memoryInfo.segments) {
      throw new Error("No memory map information available")
    }

    for (const segment of this.memoryInfo.segments) {
      if (segment.start <= addr && addr < segment.end) {
        return segment
      }
    }

    return null
  }

  getSectorStart(addr: number, segment?: DfuSeSegment | null): number {
    const seg = segment ?? this.getSegment(addr)
    if (!seg) {
      throw new Error(`Address ${addr.toString(16)} outside of memory map`)
    }

    const sectorIndex = Math.floor((addr - seg.start) / seg.sectorSize)
    return seg.start + sectorIndex * seg.sectorSize
  }

  getSectorEnd(addr: number, segment?: DfuSeSegment | null): number {
    const seg = segment ?? this.getSegment(addr)
    if (!seg) {
      throw new Error(`Address ${addr.toString(16)} outside of memory map`)
    }

    const sectorIndex = Math.floor((addr - seg.start) / seg.sectorSize)
    return seg.start + (sectorIndex + 1) * seg.sectorSize
  }

  getFirstWritableSegment(): DfuSeSegment | null {
    if (!this.memoryInfo || !this.memoryInfo.segments) {
      throw new Error("No memory map information available")
    }

    for (const segment of this.memoryInfo.segments) {
      if (segment.writable) {
        return segment
      }
    }

    return null
  }

  async erase(startAddr: number, length: number) {
    let segment = this.getSegment(startAddr)
    if (segment === null) {
      throw new Error(`Address ${startAddr.toString(16)} outside of memory map`)
    }

    let addr = this.getSectorStart(startAddr, segment)
    const endAddr = this.getSectorEnd(startAddr + length - 1)

    let bytesErased = 0
    const bytesToErase = endAddr - addr
    if (bytesToErase > 0) {
      this.logProgress(bytesErased, bytesToErase)
    }

    while (addr < endAddr) {
      if (segment.end <= addr) {
        const nextSegment = this.getSegment(addr)
        if (nextSegment === null) {
          throw new Error(`Address ${addr.toString(16)} outside of memory map`)
        }
        segment = nextSegment
      }
      if (!segment.erasable) {
        // Skip over the non-erasable section
        bytesErased = Math.min(bytesErased + segment.end - addr, bytesToErase)
        addr = segment.end
        this.logProgress(bytesErased, bytesToErase)
        continue
      }
      const sectorIndex = Math.floor(
        (addr - segment.start) / segment.sectorSize,
      )
      const sectorAddr = segment.start + sectorIndex * segment.sectorSize
      this.logDebug(
        `Erasing ${segment.sectorSize}B at 0x${sectorAddr.toString(16)}`,
      )
      await this.dfuseCommand(DFUSE_ERASE_SECTOR, sectorAddr, 4)
      addr = sectorAddr + segment.sectorSize
      bytesErased += segment.sectorSize
      this.logProgress(bytesErased, bytesToErase)
    }
  }

  override async doDownload(
    xferSize: number,
    data: ArrayBuffer,
    manifestationTolerant: boolean,
  ): Promise<void> {
    // DfuSe devices always self-reset after manifestation
    void manifestationTolerant

    if (!this.memoryInfo || !this.memoryInfo.segments) {
      throw new Error("No memory map available")
    }

    this.logInfo("Erasing DFU device memory")

    let bytesSent = 0
    const expectedSize = data.byteLength

    let startAddress = this.startAddress
    if (isNaN(startAddress)) {
      startAddress = this.memoryInfo.segments[0].start
      this.logWarning(
        `Using inferred start address 0x${startAddress.toString(16)}`,
      )
    } else if (this.getSegment(startAddress) === null) {
      this.logError(
        `Start address 0x${startAddress.toString(16)} outside of memory map bounds`,
      )
    }
    await this.erase(startAddress, expectedSize)

    this.logInfo("Copying data from browser to DFU device")

    let address = startAddress
    while (bytesSent < expectedSize) {
      const bytesLeft = expectedSize - bytesSent
      const chunkSize = Math.min(bytesLeft, xferSize)

      let bytesWritten = 0
      let dfuStatus: DfuStatus
      try {
        await this.dfuseCommand(DFUSE_SET_ADDRESS, address, 4)
        this.logDebug(`Set address to 0x${address.toString(16)}`)
        bytesWritten = await this.download(
          data.slice(bytesSent, bytesSent + chunkSize),
          2,
        )
        this.logDebug(`Sent ${bytesWritten} bytes`)
        dfuStatus = await this.pollUntilIdle(DfuState.dfuDNLOAD_IDLE)
        address += chunkSize
      } catch (error) {
        throw new Error(`Error during DfuSe download: ${errorMessage(error)}`)
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
    this.logInfo(`Wrote ${bytesSent} bytes`)

    this.logInfo("Manifesting new firmware")
    try {
      await this.dfuseCommand(DFUSE_SET_ADDRESS, startAddress, 4)
      await this.download(new ArrayBuffer(0), 0)
    } catch (error) {
      throw new Error(
        `Error during DfuSe manifestation: ${errorMessage(error)}`,
      )
    }

    try {
      await this.pollUntil((state) => state === DfuState.dfuMANIFEST)
    } catch (error) {
      const msg = errorMessage(error)
      if (
        msg.includes("NetworkError") ||
        msg.includes("NotFoundError") ||
        msg.includes("Device unavailable") ||
        msg.includes("device was disconnected")
      ) {
        this.logWarning(
          "Device reset during manifestation; this is normal after a successful flash.",
        )
      } else {
        this.logError(msg)
      }
    }
  }
}
