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

import type { KeyboardMetadata } from "$lib/keyboard/metadata"
import {
  defaultAdvancedKey,
  HMK_AKType,
  type HMK_AdvancedKey,
  type HMK_AKTapHold,
} from "$lib/libhmk/advanced-keys"
import { toast } from "svelte-sonner"
import { createAdvancedKey } from "../lib/advanced-keys"
import type { AdvancedKeysQuery } from "../queries/advanced-keys-query.svelte"
import type { KeymapQuery } from "../queries/keymap-query.svelte"

export function findModtapIndex(
  advancedKeys: HMK_AdvancedKey[],
  layer: number,
  key: number,
) {
  return advancedKeys.findIndex(
    (advancedKey) =>
      advancedKey.layer === layer &&
      advancedKey.key === key &&
      advancedKey.action.type === HMK_AKType.TAP_HOLD,
  )
}

export function getModtapKeymap(
  advancedKeys: HMK_AdvancedKey[],
  keymap: number[][],
): (HMK_AKTapHold | null)[][] {
  const ret: (HMK_AKTapHold | null)[][] = keymap.map((row) =>
    row.map(() => null),
  )
  for (const { layer, key, action } of advancedKeys) {
    if (action.type !== HMK_AKType.TAP_HOLD) continue
    if (layer < ret.length && key < ret[layer].length) {
      ret[layer][key] = action
    }
  }
  return ret
}

export function clearModtap(
  advancedKeysQuery: AdvancedKeysQuery,
  advancedKeys: HMK_AdvancedKey[] | undefined,
  { layer, key }: { layer: number; key: number },
) {
  if (!advancedKeys) return
  const index = findModtapIndex(advancedKeys, layer, key)
  if (index !== -1) {
    advancedKeysQuery.set({ offset: index, data: [defaultAdvancedKey] })
  }
}

export function assignKeycode(
  keymapQuery: KeymapQuery,
  advancedKeysQuery: AdvancedKeysQuery,
  advancedKeys: HMK_AdvancedKey[] | undefined,
  { layer, key, keycode }: { layer: number; key: number; keycode: number },
) {
  keymapQuery.set({ layer, offset: key, data: [keycode] })
  clearModtap(advancedKeysQuery, advancedKeys, { layer, key })
}

export function applyModtap(
  metadata: KeyboardMetadata,
  advancedKeysQuery: AdvancedKeysQuery,
  advancedKeys: HMK_AdvancedKey[],
  {
    layer,
    key,
    tapKeycode,
    holdKeycode,
  }: {
    layer: number
    key: number
    tapKeycode: number
    holdKeycode: number
  },
): boolean {
  const index = findModtapIndex(advancedKeys, layer, key)
  if (index !== -1) {
    const advancedKey = advancedKeys[index]
    if (advancedKey.action.type !== HMK_AKType.TAP_HOLD) return false
    advancedKeysQuery.set({
      offset: index,
      data: [
        {
          ...advancedKey,
          action: { ...advancedKey.action, tapKeycode, holdKeycode },
        },
      ],
    })
    return true
  }

  const emptyIndex = advancedKeys.findIndex(
    ({ action }) => action.type === HMK_AKType.NONE,
  )
  if (emptyIndex === -1) {
    toast.error(
      "Could not add the tap-hold binding: all Advanced Keys slots are in use. Clear an Advanced Key you no longer need to free a slot, then try again.",
    )
    return false
  }
  advancedKeysQuery.set({
    offset: emptyIndex,
    data: [
      createAdvancedKey(metadata, {
        layer,
        type: HMK_AKType.TAP_HOLD,
        keys: [key],
        keycodes: [tapKeycode, holdKeycode],
      }),
    ],
  })
  return true
}
