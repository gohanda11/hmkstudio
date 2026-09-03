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

import { keyboardContext, type SetPointingConfigParams } from "$lib/keyboard"
import {
  HMK_POINTING_CONFIG_MIN_VERSION,
  type HMK_PointingConfigResult,
} from "$lib/libhmk/commands/pointing-config"
import { Context, resource, type ResourceReturn } from "runed"
import { optimisticUpdate } from "."

export class PointingQuery {
  result: ResourceReturn<HMK_PointingConfigResult | undefined>

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
}

export const pointingQueryContext = new Context<PointingQuery>(
  "hmk-pointing-query",
)
