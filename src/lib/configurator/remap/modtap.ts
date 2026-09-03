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

import { t } from "$lib/i18n.svelte"
import type { KeyboardMetadata } from "$lib/keyboard/metadata"
import {
  defaultAdvancedKey,
  HMK_AKType,
  type HMK_AdvancedKey,
  type HMK_AKTapHold,
} from "$lib/libhmk/advanced-keys"
import {
  defaultMacroNode,
  type HMK_MacroNode,
} from "$lib/libhmk/macro"
import { toast } from "svelte-sonner"
import { createAdvancedKey, getMacroSequence } from "../lib/advanced-keys"
import type { AdvancedKeysQuery } from "../queries/advanced-keys-query.svelte"
import type { KeymapQuery } from "../queries/keymap-query.svelte"
import type { MacrosQuery } from "../queries/macros-query.svelte"

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

export async function clearModtap(
  advancedKeysQuery: AdvancedKeysQuery,
  advancedKeys: HMK_AdvancedKey[] | undefined,
  { layer, key }: { layer: number; key: number },
) {
  if (!advancedKeys) return
  const index = findModtapIndex(advancedKeys, layer, key)
  if (index !== -1) {
    await advancedKeysQuery.set({ offset: index, data: [defaultAdvancedKey] })
  }
}

/**
 * Removes the MACRO advanced key bound to (layer, key), if any, and frees
 * its macro chain. TAP_HOLD and MACRO are mutually exclusive per key, so
 * every path that binds a tap-hold or a plain keycode clears the macro
 * first. Returns the freed AK slot index, or -1 when no macro was bound.
 */
async function clearMacro(
  advancedKeysQuery: AdvancedKeysQuery,
  macrosQuery: MacrosQuery,
  advancedKeys: HMK_AdvancedKey[],
  macros: HMK_MacroNode[] | undefined,
  { layer, key }: { layer: number; key: number },
): Promise<number> {
  const index = advancedKeys.findIndex(
    (advancedKey) =>
      advancedKey.layer === layer &&
      advancedKey.key === key &&
      advancedKey.action.type === HMK_AKType.MACRO,
  )
  if (index === -1) return -1
  const action = advancedKeys[index].action
  const sequence =
    action.type === HMK_AKType.MACRO && macros
      ? getMacroSequence(macros, action.head)
      : []
  await advancedKeysQuery.set({ offset: index, data: [defaultAdvancedKey] })
  for (const nodeIndex of sequence) {
    await macrosQuery.set({
      offset: nodeIndex,
      data: [{ ...defaultMacroNode }],
    })
  }
  return index
}

export async function assignKeycode(
  keymapQuery: KeymapQuery,
  advancedKeysQuery: AdvancedKeysQuery,
  macrosQuery: MacrosQuery,
  advancedKeys: HMK_AdvancedKey[] | undefined,
  macros: HMK_MacroNode[] | undefined,
  { layer, key, keycode }: { layer: number; key: number; keycode: number },
) {
  await keymapQuery.set({ layer, offset: key, data: [keycode] })
  if (!advancedKeys) return
  await clearModtap(advancedKeysQuery, advancedKeys, { layer, key })
  await clearMacro(advancedKeysQuery, macrosQuery, advancedKeys, macros, {
    layer,
    key,
  })
}

export async function applyModtap(
  metadata: KeyboardMetadata,
  advancedKeysQuery: AdvancedKeysQuery,
  macrosQuery: MacrosQuery,
  advancedKeys: HMK_AdvancedKey[],
  macros: HMK_MacroNode[] | undefined,
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
): Promise<boolean> {
  const index = findModtapIndex(advancedKeys, layer, key)
  if (index !== -1) {
    const advancedKey = advancedKeys[index]
    if (advancedKey.action.type !== HMK_AKType.TAP_HOLD) return false
    // A key cannot be both tap-hold and a combo macro; the macro binding is
    // replaced by the tap-hold. Clear it first so no double binding remains.
    await clearMacro(advancedKeysQuery, macrosQuery, advancedKeys, macros, {
      layer,
      key,
    })
    await advancedKeysQuery.set({
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

  const macroIndex = advancedKeys.findIndex(
    (advancedKey) =>
      advancedKey.layer === layer &&
      advancedKey.key === key &&
      advancedKey.action.type === HMK_AKType.MACRO,
  )
  const emptyIndex = advancedKeys.findIndex(
    ({ action }) => action.type === HMK_AKType.NONE,
  )
  // The macro slot is freed below, so it can back the new tap-hold when no
  // empty slot remains. Resolve the target before writing anything so a
  // full table fails without leaving a partial application behind.
  const targetIndex = emptyIndex !== -1 ? emptyIndex : macroIndex
  if (targetIndex === -1) {
    toast.error(t("toast.tapHoldSlots"))
    return false
  }
  const macroAction = macroIndex !== -1 ? advancedKeys[macroIndex].action : null
  const sequence =
    macroAction?.type === HMK_AKType.MACRO && macros
      ? getMacroSequence(macros, macroAction.head)
      : []
  if (macroIndex !== -1 && macroIndex !== targetIndex) {
    await advancedKeysQuery.set({
      offset: macroIndex,
      data: [defaultAdvancedKey],
    })
  }
  for (const nodeIndex of sequence) {
    await macrosQuery.set({
      offset: nodeIndex,
      data: [{ ...defaultMacroNode }],
    })
  }
  await advancedKeysQuery.set({
    offset: targetIndex,
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
