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

import { DataViewReader } from "$lib/data-view-reader"
import { uint8Schema, uint16Schema, uint16ToUInt8s } from "$lib/integer"
import type {
  SetPointingConfigParams,
  SetPointingSideConfigParams,
} from "$lib/keyboard"
import type { Commander } from "$lib/keyboard/commander"
import z from "zod"
import { HMK_Command } from "."

export const HMK_POINTING_SCROLL_LAYER_OFF = 0xff
export const HMK_POINTING_DEFAULT_SCROLL_DIVISOR = 32

// GET/SET_POINTING_CONFIG was introduced in firmware v0x0109 with a basic
// 5-byte config. Firmware v0x010a extended it to the 16-byte v2 layout.
// Firmware v0x010b moved the orientation fields (rotation/invert/swap) out
// of the global config into the per-side config below (GET/SET_SIDE_CONFIG),
// leaving the 10-byte v3 global layout.
export const HMK_POINTING_CONFIG_MIN_VERSION = 0x0109
export const HMK_POINTING_CONFIG_V2_VERSION = 0x010a
export const HMK_POINTING_CONFIG_V3_VERSION = 0x010b

// Split-half side ids for GET/SET_SIDE_CONFIG (firmware contract: LEFT=1,
// RIGHT=2). GET_POINTING_CONFIG reports the same ids for single-sided
// hardware, and 0 when both halves carry a sensor (dual).
export const HMK_POINTING_SIDE_LEFT = 1
export const HMK_POINTING_SIDE_RIGHT = 2

// pointing_config v1 wire format (5 bytes, little-endian, packed):
//   [0] enabled u8
//   [1] auto_mouse_layer_enabled u8
//   [2-3] cpi u16 LE
//   [4] auto_mouse_layer u8
//
// pointing_config v2 wire format (16 bytes, little-endian, packed):
//   [0] enabled u8
//   [1] auto_mouse_layer_enabled u8
//   [2] invert_x u8
//   [3] invert_y u8
//   [4] swap_axes u8
//   [5] invert_scroll u8
//   [6] scroll_layer u8 (0xFF=off)
//   [7] scroll_divisor u8 (default 32)
//   [8] snap_axis u8 (0=off,1=X,2=Y)
//   [9] snap_threshold u8 (percent)
//   [10] auto_mouse_layer u8
//   [11] reserved u8 (0xFF)
//   [12-13] rotation_deg u16 LE
//   [14-15] cpi u16 LE
//
// pointing_config v3 wire format (10 bytes, firmware v0x010b or later):
// orientation moved to the per-side config; the global config keeps only
//   [0] enabled u8
//   [1] auto_mouse_layer_enabled u8
//   [2] invert_scroll u8
//   [3] scroll_layer u8 (0xFF=off)
//   [4] scroll_divisor u8 (default 32)
//   [5] snap_axis u8 (0=off,1=X,2=Y)
//   [6] snap_threshold u8 (percent)
//   [7] auto_mouse_layer u8
//   [8-9] cpi u16 LE
//
// GET_POINTING_CONFIG response prepends a 2-byte header:
//   [0] supported u8 (pointing device present)
//   [1] side u8 (split half the device is on)
// SET_POINTING_CONFIG payload is the config bytes only (16/10/5 by version).
//
// Per-side orientation config (GET_SIDE_CONFIG=21 / SET_SIDE_CONFIG=22):
// request: [side u8]; response: [supported u8][rotation_deg u16 LE]
//   [invert_x u8][invert_y u8][swap_axes u8].
// SET_SIDE_CONFIG payload: [side u8][rotation_deg u16 LE]
//   [invert_x u8][invert_y u8][swap_axes u8]; out ack.
// Each half stores its own side config in local EEPROM.
export const hmkPointingConfigSchema = z.object({
  enabled: z.boolean(),
  autoMouseLayerEnabled: z.boolean(),
  invertX: z.boolean(),
  invertY: z.boolean(),
  swapAxes: z.boolean(),
  invertScroll: z.boolean(),
  scrollLayer: uint8Schema,
  scrollDivisor: uint8Schema,
  snapAxis: uint8Schema,
  snapThreshold: uint8Schema,
  autoMouseLayer: uint8Schema,
  rotationDeg: uint16Schema,
  cpi: uint16Schema,
})

export type HMK_PointingConfig = z.infer<typeof hmkPointingConfigSchema>

export const defaultPointingConfig: HMK_PointingConfig = {
  enabled: true,
  autoMouseLayerEnabled: false,
  invertX: false,
  invertY: false,
  swapAxes: false,
  invertScroll: false,
  scrollLayer: HMK_POINTING_SCROLL_LAYER_OFF,
  scrollDivisor: HMK_POINTING_DEFAULT_SCROLL_DIVISOR,
  snapAxis: 0,
  snapThreshold: 0,
  autoMouseLayer: 0,
  rotationDeg: 0,
  cpi: 800,
}
export const hmkPointingSideConfigSchema = z.object({
  rotationDeg: uint16Schema,
  invertX: z.boolean(),
  invertY: z.boolean(),
  swapAxes: z.boolean(),
})

export type HMK_PointingSideConfig = z.infer<typeof hmkPointingSideConfigSchema>

export const defaultPointingSideConfig: HMK_PointingSideConfig = {
  rotationDeg: 0,
  invertX: false,
  invertY: false,
  swapAxes: false,
}

export type HMK_PointingSideConfigResult = {
  supported: boolean
  config: HMK_PointingSideConfig
}

export type HMK_PointingConfigResult = {
  supported: boolean
  side: number
  config: HMK_PointingConfig
}

export async function getPointingConfig(
  commander: Commander,
  version: number,
): Promise<HMK_PointingConfigResult> {
  const reader = new DataViewReader(
    await commander.sendCommand({
      command: HMK_Command.GET_POINTING_CONFIG,
    }),
  )

  const supported = reader.uint8() !== 0
  const side = reader.uint8()

  const enabled = reader.uint8() !== 0
  const autoMouseLayerEnabled = reader.uint8() !== 0
  if (version >= HMK_POINTING_CONFIG_V3_VERSION) {
    // v3 layout: orientation lives in the per-side config; report the
    // global fields and keep orientation defaults here.
    const invertScroll = reader.uint8() !== 0
    const scrollLayer = reader.uint8()
    const scrollDivisor = reader.uint8()
    const snapAxis = reader.uint8()
    const snapThreshold = reader.uint8()
    const autoMouseLayer = reader.uint8()
    const cpi = reader.uint16()
    return {
      supported,
      side,
      config: {
        ...defaultPointingConfig,
        enabled,
        autoMouseLayerEnabled,
        invertScroll,
        scrollLayer,
        scrollDivisor,
        snapAxis,
        snapThreshold,
        autoMouseLayer,
        cpi,
      },
    }
  }
  if (version < HMK_POINTING_CONFIG_V2_VERSION) {
    // v1 layout: only the basic fields are reported below v0x010a; keep the
    // defaults for the extended fields that the device cannot report.
    return {
      supported,
      side,
      config: {
        ...defaultPointingConfig,
        enabled,
        autoMouseLayerEnabled,
        cpi: reader.uint16(),
        autoMouseLayer: reader.uint8(),
      },
    }
  }

  const invertX = reader.uint8() !== 0
  const invertY = reader.uint8() !== 0
  const swapAxes = reader.uint8() !== 0
  const invertScroll = reader.uint8() !== 0
  const scrollLayer = reader.uint8()
  const scrollDivisor = reader.uint8()
  const snapAxis = reader.uint8()
  const snapThreshold = reader.uint8()
  const autoMouseLayer = reader.uint8()
  reader.uint8() // reserved
  const rotationDeg = reader.uint16()
  const cpi = reader.uint16()

  return {
    supported,
    side,
    config: {
      enabled,
      autoMouseLayerEnabled,
      invertX,
      invertY,
      swapAxes,
      invertScroll,
      scrollLayer,
      scrollDivisor,
      snapAxis,
      snapThreshold,
      autoMouseLayer,
      rotationDeg,
      cpi,
    },
  }
}

export async function setPointingConfig(
  commander: Commander,
  {
    data: {
      enabled,
      autoMouseLayerEnabled,
      invertX,
      invertY,
      swapAxes,
      invertScroll,
      scrollLayer,
      scrollDivisor,
      snapAxis,
      snapThreshold,
      autoMouseLayer,
      rotationDeg,
      cpi,
    },
  }: SetPointingConfigParams,
  version: number,
) {
  const payload =
    version >= HMK_POINTING_CONFIG_V3_VERSION
      ? [
          // v3 layout: orientation is stored per side; send globals only.
          enabled ? 1 : 0,
          autoMouseLayerEnabled ? 1 : 0,
          invertScroll ? 1 : 0,
          scrollLayer,
          scrollDivisor,
          snapAxis,
          snapThreshold,
          autoMouseLayer,
          ...uint16ToUInt8s(cpi),
        ]
      : version >= HMK_POINTING_CONFIG_V2_VERSION
        ? [
            enabled ? 1 : 0,
            autoMouseLayerEnabled ? 1 : 0,
            invertX ? 1 : 0,
            invertY ? 1 : 0,
            swapAxes ? 1 : 0,
            invertScroll ? 1 : 0,
            scrollLayer,
            scrollDivisor,
            snapAxis,
            snapThreshold,
            autoMouseLayer,
            0xff, // reserved
            ...uint16ToUInt8s(rotationDeg),
            ...uint16ToUInt8s(cpi),
          ]
        : [
            // v1 layout: only the basic fields are accepted below v0x010a.
            enabled ? 1 : 0,
            autoMouseLayerEnabled ? 1 : 0,
            ...uint16ToUInt8s(cpi),
            autoMouseLayer,
          ]

  await commander.sendCommand({
    command: HMK_Command.SET_POINTING_CONFIG,
    payload,
  })
}

export async function getPointingSideConfig(
  commander: Commander,
  side: number,
): Promise<HMK_PointingSideConfigResult> {
  const reader = new DataViewReader(
    await commander.sendCommand({
      command: HMK_Command.GET_SIDE_CONFIG,
      payload: [side],
    }),
  )

  const supported = reader.uint8() !== 0
  const rotationDeg = reader.uint16()
  const invertX = reader.uint8() !== 0
  const invertY = reader.uint8() !== 0
  const swapAxes = reader.uint8() !== 0

  return { supported, config: { rotationDeg, invertX, invertY, swapAxes } }
}

export async function setPointingSideConfig(
  commander: Commander,
  { side, data: { rotationDeg, invertX, invertY, swapAxes } }: SetPointingSideConfigParams,
) {
  await commander.sendCommand({
    command: HMK_Command.SET_SIDE_CONFIG,
    payload: [
      side,
      ...uint16ToUInt8s(rotationDeg),
      invertX ? 1 : 0,
      invertY ? 1 : 0,
      swapAxes ? 1 : 0,
    ],
  })
}
