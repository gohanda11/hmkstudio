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
} from "$lib/libhmk/advanced-keys"
import { Keycode } from "$lib/libhmk/keycodes"
import {
  defaultMacroNode,
  HMK_MACRO_NODE_NONE,
  HMK_MacroAction,
  type HMK_MacroNode,
} from "$lib/libhmk/macro"
import { toast } from "svelte-sonner"
import { createAdvancedKey, getMacroSequence } from "../lib/advanced-keys"
import type { AdvancedKeysQuery } from "../queries/advanced-keys-query.svelte"
import type { MacrosQuery } from "../queries/macros-query.svelte"
import { findModtapIndex } from "./modtap"

export type ModifierFamily = "ctrl" | "shift" | "alt" | "gui"
export type ModifierSide = "left" | "right"

export const modifierFamilies: {
  family: ModifierFamily
  label: string
  left: Keycode
  right: Keycode
}[] = [
  {
    family: "ctrl",
    label: "Ctrl",
    left: Keycode.KC_LEFT_CTRL,
    right: Keycode.KC_RIGHT_CTRL,
  },
  {
    family: "shift",
    label: "Shift",
    left: Keycode.KC_LEFT_SHIFT,
    right: Keycode.KC_RIGHT_SHIFT,
  },
  {
    family: "alt",
    label: "Alt",
    left: Keycode.KC_LEFT_ALT,
    right: Keycode.KC_RIGHT_ALT,
  },
  {
    family: "gui",
    label: "Win",
    left: Keycode.KC_LEFT_GUI,
    right: Keycode.KC_RIGHT_GUI,
  },
]

const modifierKeycodeList: number[] = modifierFamilies.flatMap(
  ({ left, right }) => [left, right],
)

export function isModifierKeycode(keycode: number): boolean {
  return modifierKeycodeList.includes(keycode)
}

export function modifierFamilyOf(keycode: number): ModifierFamily | null {
  return (
    modifierFamilies.find(
      ({ left, right }) => left === keycode || right === keycode,
    )?.family ?? null
  )
}

export function modifierSideOf(keycode: number): ModifierSide | null {
  for (const { left, right } of modifierFamilies) {
    if (keycode === left) return "left"
    if (keycode === right) return "right"
  }
  return null
}

export type ParsedModifierCombo = {
  base: number
  mods: number[]
}

/**
 * Parses a macro chain as a modifier combo of the form
 * press(mod…) tap(base) release(…mod). Returns null for chains that were not
 * created as a modifier combo (e.g. hand-built macros), which must be left
 * untouched.
 */
export function parseModifierCombo(
  macros: HMK_MacroNode[],
  head: number,
): ParsedModifierCombo | null {
  const sequence = getMacroSequence(macros, head)
  if (sequence.length < 3) return null
  const nodes = sequence.map((index) => macros[index])
  if (nodes.some(({ delay }) => delay !== 0)) return null

  const tapIndices = nodes
    .map((node, i) => (node.action === HMK_MacroAction.TAP ? i : -1))
    .filter((i) => i !== -1)
  if (tapIndices.length !== 1) return null
  const tapIndex = tapIndices[0]

  const base = nodes[tapIndex].keycode
  if (isModifierKeycode(base)) return null

  const presses = nodes.slice(0, tapIndex)
  const releases = nodes.slice(tapIndex + 1)
  if (presses.length === 0 || presses.length !== releases.length) return null
  if (
    !presses.every(
      ({ action, keycode }) =>
        action === HMK_MacroAction.PRESS && isModifierKeycode(keycode),
    )
  ) {
    return null
  }
  for (let i = 0; i < presses.length; i++) {
    const release = releases[i]
    if (
      release.action !== HMK_MacroAction.RELEASE ||
      release.keycode !== presses[presses.length - 1 - i].keycode
    ) {
      return null
    }
  }

  return { base, mods: presses.map(({ keycode }) => keycode) }
}

export function findMacroIndex(
  advancedKeys: HMK_AdvancedKey[],
  layer: number,
  key: number,
) {
  return advancedKeys.findIndex(
    (advancedKey) =>
      advancedKey.layer === layer &&
      advancedKey.key === key &&
      advancedKey.action.type === HMK_AKType.MACRO,
  )
}

/** Collects unvisited macro node indices, reusing a previous chain first. */
function collectFreeMacroNodes(
  macros: HMK_MacroNode[],
  advancedKeys: HMK_AdvancedKey[],
  reuse: number[],
  count: number,
): number[] | null {
  const visited = Array(macros.length).fill(false)
  const reusable = new Set(reuse)
  for (const { action } of advancedKeys) {
    if (action.type !== HMK_AKType.MACRO) continue
    let head = action.head
    const seen = new Set<number>()
    while (
      head < macros.length &&
      head !== HMK_MACRO_NODE_NONE &&
      !seen.has(head)
    ) {
      seen.add(head)
      if (!reusable.has(head)) visited[head] = true
      head = macros[head].next
    }
  }

  const ret = [...reuse]
  for (let i = 0; i < macros.length && ret.length < count; i++) {
    if (!visited[i] && !reusable.has(i)) ret.push(i)
  }
  return ret.length >= count ? ret.slice(0, count) : null
}

/**
 * Creates, updates, or removes the MACRO advanced key backing a modifier
 * combo. An empty modifier list removes a combo macro and restores the plain
 * key; hand-built macros are never removed.
 */
export async function applyModifierCombo(
  metadata: KeyboardMetadata,
  advancedKeysQuery: AdvancedKeysQuery,
  macrosQuery: MacrosQuery,
  advancedKeys: HMK_AdvancedKey[],
  macros: HMK_MacroNode[],
  {
    layer,
    key,
    base,
    mods,
  }: {
    layer: number
    key: number
    base: number
    mods: number[]
  },
): Promise<boolean> {
  const macroIndex = findMacroIndex(advancedKeys, layer, key)
  const oldHead =
    macroIndex !== -1 &&
    advancedKeys[macroIndex].action.type === HMK_AKType.MACRO
      ? advancedKeys[macroIndex].action.head
      : HMK_MACRO_NODE_NONE
  const oldSequence =
    oldHead !== HMK_MACRO_NODE_NONE ? getMacroSequence(macros, oldHead) : []
  const oldIsCombo =
    oldHead === HMK_MACRO_NODE_NONE ||
    parseModifierCombo(macros, oldHead) !== null

  if (mods.length === 0) {
    if (macroIndex !== -1 && oldIsCombo) {
      await advancedKeysQuery.set({
        offset: macroIndex,
        data: [{ ...defaultAdvancedKey }],
      })
      for (const index of oldSequence) {
        await macrosQuery.set({
          offset: index,
          data: [{ ...defaultMacroNode }],
        })
      }
    }
    return true
  }

  let akIndex = macroIndex
  if (akIndex === -1) {
    akIndex = advancedKeys.findIndex(
      ({ action }) => action.type === HMK_AKType.NONE,
    )
    if (akIndex === -1) {
      toast.error(t("toast.modComboSlots"))
      return false
    }
  }

  const indices = collectFreeMacroNodes(
    macros,
    advancedKeys,
    oldIsCombo ? oldSequence : [],
    mods.length * 2 + 1,
  )
  if (indices === null) {
    toast.error(t("toast.macroNodes"))
    return false
  }

  const nodes: HMK_MacroNode[] = [
    ...mods.map((keycode, i) => ({
      keycode,
      action: HMK_MacroAction.PRESS as const,
      delay: 0,
      next: indices[i + 1],
    })),
    {
      keycode: base,
      action: HMK_MacroAction.TAP as const,
      delay: 0,
      next: indices[mods.length + 1] ?? HMK_MACRO_NODE_NONE,
    },
    ...[...mods].reverse().map((keycode, i) => ({
      keycode,
      action: HMK_MacroAction.RELEASE as const,
      delay: 0,
      next: indices[mods.length + 1 + i + 1] ?? HMK_MACRO_NODE_NONE,
    })),
  ]
  for (let i = 0; i < indices.length; i++) {
    await macrosQuery.set({ offset: indices[i], data: [nodes[i]] })
  }
  if (oldIsCombo) {
    for (const index of oldSequence) {
      if (!indices.includes(index)) {
        await macrosQuery.set({
          offset: index,
          data: [{ ...defaultMacroNode }],
        })
      }
    }
  }

  // A key cannot be both tap-hold and a combo; the tap-hold binding (owned by
  // this tab) is replaced by the combo.
  const modtapIndex = findModtapIndex(advancedKeys, layer, key)
  if (modtapIndex !== -1 && modtapIndex !== akIndex) {
    await advancedKeysQuery.set({
      offset: modtapIndex,
      data: [{ ...defaultAdvancedKey }],
    })
  }
  await advancedKeysQuery.set({
    offset: akIndex,
    data: [
      akIndex === macroIndex
        ? {
            ...advancedKeys[macroIndex],
            action: { type: HMK_AKType.MACRO as const, head: indices[0] },
          }
        : {
            ...createAdvancedKey(metadata, {
              layer,
              type: HMK_AKType.MACRO,
              keys: [key],
              keycodes: [],
            }),
            layer,
            key,
            action: { type: HMK_AKType.MACRO as const, head: indices[0] },
          },
    ],
  })
  return true
}
