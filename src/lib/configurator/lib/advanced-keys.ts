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
  ArrowDownFromLineIcon,
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  ArrowUpToLineIcon,
  FileQuestionMarkIcon,
  LayersIcon,
  LayoutTemplateIcon,
  MoveHorizontalIcon,
  ToggleLeftIcon,
  WorkflowIcon,
} from "@lucide/svelte"
import type { I18nKey } from "$lib/i18n.svelte"
import type { KeyboardMetadata } from "$lib/keyboard/metadata"
import type { Feature } from "$lib/libhmk"
import {
  DEFAULT_BOTTOM_OUT_POINT,
  DEFAULT_TAPPING_TERM,
  defaultAdvancedKey,
  HMK_AKType,
  HMK_DKSAction,
  HMK_NullBindBehavior,
  type HMK_AdvancedKey,
} from "$lib/libhmk/advanced-keys"
import { Keycode } from "$lib/libhmk/keycodes"
import {
  HMK_MACRO_NODE_NONE,
  HMK_MacroAction,
  type HMK_MacroNode,
} from "$lib/libhmk/macro"
import type { Component } from "svelte"

export type AdvancedKeyMetadata = {
  type: HMK_AKType
  icon: Component
  titleKey: I18nKey
  descriptionKey: I18nKey
  numKeys: number
  keycodes: Keycode[]
  feature?: Feature
}

export const advancedKeyMetadata: AdvancedKeyMetadata[] = [
  {
    type: HMK_AKType.NULL_BIND,
    icon: MoveHorizontalIcon,
    titleKey: "advkeys.type.nullBindTitle",
    descriptionKey: "advkeys.type.nullBindDescription",
    numKeys: 2,
    keycodes: [Keycode.AK_NULL_BIND_PRIMARY, Keycode.AK_NULL_BIND_SECONDARY],
  },
  {
    type: HMK_AKType.DYNAMIC_KEYSTROKE,
    icon: LayersIcon,
    titleKey: "advkeys.type.dksTitle",
    descriptionKey: "advkeys.type.dksDescription",
    numKeys: 1,
    keycodes: [Keycode.AK_DYNAMIC_KEYSTROKE],
  },
  {
    type: HMK_AKType.TAP_HOLD,
    icon: LayoutTemplateIcon,
    titleKey: "advkeys.type.tapHoldTitle",
    descriptionKey: "advkeys.type.tapHoldDescription",
    numKeys: 1,
    keycodes: [Keycode.AK_TAP_HOLD],
  },
  {
    type: HMK_AKType.TOGGLE,
    icon: ToggleLeftIcon,
    titleKey: "advkeys.type.toggleTitle",
    descriptionKey: "advkeys.type.toggleDescription",
    numKeys: 1,
    keycodes: [Keycode.AK_TOGGLE],
  },
  {
    type: HMK_AKType.MACRO,
    icon: WorkflowIcon,
    titleKey: "advkeys.type.macroTitle",
    descriptionKey: "advkeys.type.macroDescription",
    numKeys: 1,
    keycodes: [Keycode.AK_MACRO],
    feature: "advancedKeyMacro",
  },
]

export function getAdvancedKeyMetadata(type: HMK_AKType): AdvancedKeyMetadata {
  const metadata = advancedKeyMetadata.find((m) => m.type === type)
  return (
    metadata ?? {
      type,
      icon: FileQuestionMarkIcon,
      titleKey: "advkeys.unknownTitle",
      descriptionKey: "advkeys.unknownDescription",
      numKeys: 0,
      keycodes: [],
    }
  )
}

export function createAdvancedKey(
  { numDynamicKeystrokeMaxBindings }: KeyboardMetadata,
  options: {
    layer: number
    type: HMK_AKType
    keys: number[]
    keycodes: Keycode[]
  },
): HMK_AdvancedKey {
  const { layer, type, keys, keycodes } = options

  switch (type) {
    case HMK_AKType.NULL_BIND:
      return {
        layer,
        key: keys[0],
        action: {
          type,
          secondaryKey: keys[1],
          behavior: HMK_NullBindBehavior.LAST,
          bottomOutPoint: 0,
        },
      }
    case HMK_AKType.DYNAMIC_KEYSTROKE:
      return {
        layer,
        key: keys[0],
        action: {
          type,
          keycodes: [
            keycodes[0],
            ...Array(numDynamicKeystrokeMaxBindings - 1).fill(Keycode.KC_NO),
          ],
          bitmap: [
            [
              HMK_DKSAction.PRESS,
              HMK_DKSAction.HOLD,
              HMK_DKSAction.HOLD,
              HMK_DKSAction.RELEASE,
            ],
            ...[...Array(numDynamicKeystrokeMaxBindings - 1)].map(() =>
              Array(4).fill(HMK_DKSAction.HOLD),
            ),
          ],
          bottomOutPoint: DEFAULT_BOTTOM_OUT_POINT,
        },
      }
    case HMK_AKType.TAP_HOLD:
      return {
        layer,
        key: keys[0],
        action: {
          type,
          tapKeycode: keycodes[0],
          holdKeycode: keycodes[1] ?? Keycode.KC_NO,
          tappingTerm: DEFAULT_TAPPING_TERM,
          holdOnOtherKeyPress: false,
        },
      }
    case HMK_AKType.TOGGLE:
      return {
        layer,
        key: keys[0],
        action: {
          type,
          keycode: keycodes[0],
          tappingTerm: DEFAULT_TAPPING_TERM,
        },
      }
    case HMK_AKType.MACRO:
      return {
        layer,
        key: keys[0],
        action: {
          type,
          head: HMK_MACRO_NODE_NONE,
        },
      }
    default:
      return defaultAdvancedKey
  }
}

export type NullBindBehaviorMetadata = {
  behavior: HMK_NullBindBehavior
  titleKey: I18nKey
  descriptionKey: I18nKey
}

export const nullBindBehaviorMetadata: NullBindBehaviorMetadata[] = [
  {
    behavior: HMK_NullBindBehavior.LAST,
    titleKey: "advkeys.nullBindBehavior.lastTitle",
    descriptionKey: "advkeys.nullBindBehavior.lastDescription",
  },
  {
    behavior: HMK_NullBindBehavior.PRIMARY,
    titleKey: "advkeys.nullBindBehavior.primaryTitle",
    descriptionKey: "advkeys.nullBindBehavior.primaryDescription",
  },
  {
    behavior: HMK_NullBindBehavior.SECONDARY,
    titleKey: "advkeys.nullBindBehavior.secondaryTitle",
    descriptionKey: "advkeys.nullBindBehavior.secondaryDescription",
  },
  {
    behavior: HMK_NullBindBehavior.NEUTRAL,
    titleKey: "advkeys.nullBindBehavior.neutralTitle",
    descriptionKey: "advkeys.nullBindBehavior.neutralDescription",
  },
  {
    behavior: HMK_NullBindBehavior.DISTANCE,
    titleKey: "advkeys.nullBindBehavior.distanceTitle",
    descriptionKey: "advkeys.nullBindBehavior.distanceDescription",
  },
]

export function getNullBindBehaviorMetadata(
  behavior: HMK_NullBindBehavior,
): NullBindBehaviorMetadata {
  const metadata = nullBindBehaviorMetadata.find((m) => m.behavior === behavior)
  return (
    metadata ?? {
      behavior,
      titleKey: "advkeys.unknownTitle",
      descriptionKey: "advkeys.unknownDescription",
    }
  )
}

export const DKS_BIT_COLUMN_WIDTH = 90
export const DKS_ROW_PADDING = 8
export const DKS_ACTION_SIZE = 32

export type DynamicKeystrokeHeader = {
  icon: Component
  tooltipKey: I18nKey
}

export const dynamicKeystrokeHeaders: DynamicKeystrokeHeader[] = [
  { icon: ArrowDownFromLineIcon, tooltipKey: "advkeys.dks.headerPress" },
  { icon: ArrowDownToLineIcon, tooltipKey: "advkeys.dks.headerFullyPressed" },
  {
    icon: ArrowUpFromLineIcon,
    tooltipKey: "advkeys.dks.headerReleaseFromFully",
  },
  { icon: ArrowUpToLineIcon, tooltipKey: "advkeys.dks.headerRelease" },
]

export function bitmapToIntervals(bitmap: HMK_DKSAction[]) {
  const ret: [number, number][] = []

  let left = null
  for (let i = 0; i < 4; i++) {
    if (bitmap[i] === HMK_DKSAction.HOLD) continue

    if (left !== null) {
      ret.push([left, i])
      left = null
    }

    if (bitmap[i] === HMK_DKSAction.PRESS) {
      left = i
    } else if (bitmap[i] === HMK_DKSAction.TAP) {
      ret.push([i, i])
    }
  }

  return ret
}

export function intervalsToBitmap(intervals: [number, number][]) {
  const bitmap: HMK_DKSAction[] = Array(4).fill(HMK_DKSAction.HOLD)

  for (const [l, r] of intervals) {
    if (l === r) {
      bitmap[l] = HMK_DKSAction.TAP
    } else {
      bitmap[l] = HMK_DKSAction.PRESS
      if (r < 4) bitmap[r] = HMK_DKSAction.RELEASE
    }
  }

  return bitmap
}

export function getDKSIntervalLeft([l]: [number, number]) {
  return l * DKS_BIT_COLUMN_WIDTH + DKS_ROW_PADDING
}

export function getDKSIntervalWidth([l, r]: [number, number]) {
  return l === r
    ? DKS_ACTION_SIZE
    : (r - l) * DKS_BIT_COLUMN_WIDTH - DKS_ROW_PADDING
}

export const macroActions = {
  Tap: HMK_MacroAction.TAP,
  Press: HMK_MacroAction.PRESS,
  Release: HMK_MacroAction.RELEASE,
} as const

export function getMacroSequence(macros: HMK_MacroNode[], head: number) {
  const visited = Array(macros.length).fill(false)
  const acc: number[] = []
  while (
    head < macros.length &&
    head !== HMK_MACRO_NODE_NONE &&
    !visited[head]
  ) {
    acc.push(head)
    visited[head] = true
    head = macros[head].next
  }

  return acc
}

export function findEmptyMacroNode(
  macros: HMK_MacroNode[],
  advancedKeys: HMK_AdvancedKey[],
) {
  const visited = Array(macros.length).fill(false)
  for (const { action } of advancedKeys) {
    if (action.type !== HMK_AKType.MACRO) continue

    let head = action.head
    while (
      head < macros.length &&
      head !== HMK_MACRO_NODE_NONE &&
      !visited[head]
    ) {
      visited[head] = true
      head = macros[head].next
    }
  }

  const i = visited.findIndex((v) => !v)
  return i === -1 ? null : i
}
