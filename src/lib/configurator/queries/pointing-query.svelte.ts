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

import {
  keyboardContext,
  type SetPointingConfigParams,
  type SetPointingSideConfigParams,
} from "$lib/keyboard"
import {
  HMK_POINTING_CONFIG_MIN_VERSION,
  HMK_POINTING_CONFIG_V3_VERSION,
  HMK_POINTING_SIDE_LEFT,
  HMK_POINTING_SIDE_RIGHT,
  type HMK_PointingConfigResult,
  type HMK_PointingSideConfigResult,
} from "$lib/libhmk/commands/pointing-config"
import { Context, resource, type ResourceReturn } from "runed"
import { optimisticUpdate } from "."

export class PointingQuery {
  result: ResourceReturn<HMK_PointingConfigResult | undefined>
  left: ResourceReturn<HMK_PointingSideConfigResult | undefined>
  right: ResourceReturn<HMK_PointingSideConfigResult | undefined>
  #keyboard = keyboardContext.get()

  constructor() {
    this.result = resource(
      () => {},
      () =>
        // GET_POINTING_CONFIG is not supported before firmware v0x0109 and
        // would block the command queue, so skip the fetch on older firmware.
        this.#keyboard.version >= HMK_POINTING_CONFIG_MIN_VERSION
          ? this.#keyboard.getPointingConfig()
          : Promise.resolve(undefined),
    )
    // Per-side orientation is stored on each half from firmware v0x010b;
    // older firmware has no GET_SIDE_CONFIG, so skip the fetch there.
    const sideAvailable =
      this.#keyboard.version >= HMK_POINTING_CONFIG_V3_VERSION
    this.left = resource(() => {}, () =>
      sideAvailable
        ? this.#keyboard.getPointingSideConfig(HMK_POINTING_SIDE_LEFT)
        : Promise.resolve(undefined),
    )
    this.right = resource(() => {}, () =>
      sideAvailable
        ? this.#keyboard.getPointingSideConfig(HMK_POINTING_SIDE_RIGHT)
        : Promise.resolve(undefined),
    )
  }

  async set(params: SetPointingConfigParams) {
    const { data } = params
    await optimisticUpdate({
      resource: this.result,
      optimisticFn: (current) => {
        if (!current) return current
        return { ...current, config: data }
      },
      updateFn: () => this.#keyboard.setPointingConfig(params),
    })
  }

  async setSide(params: SetPointingSideConfigParams) {
    const { side, data } = params
    const target = side === HMK_POINTING_SIDE_LEFT ? this.left : this.right
    await optimisticUpdate({
      resource: target,
      optimisticFn: (current) => {
        if (!current) return current
        return { ...current, config: data }
      },
      updateFn: () => this.#keyboard.setPointingSideConfig(params),
    })
  }
}

export const pointingQueryContext = new Context<PointingQuery>(
  "hmk-pointing-query",
)
