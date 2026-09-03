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

import { displayUInt16 } from "$lib/integer"
import type { KeyboardMetadata } from "$lib/keyboard/metadata"
import { Keycode, MO_GET_LAYER, PF_GET_PROFILE } from "$lib/libhmk/keycodes"
import type { Component } from "svelte"
import { advancedKeysKeycodeMetadata } from "./advanced-keys"
import { basicKeycodeMetadata, basicKeycodes } from "./basic"
import { extendedKeycodeMetadata, extendedKeycodes } from "./extended"
import { gamepadKeycodeMetadata } from "./gamepad"
import { getKeycodeLayout, type KeycodeLayout } from "./layout.svelte"
import { mediaKeycodeMetadata, mediaKeycodes } from "./media"
import { mouseKeycodeMetadata, mouseKeycodes } from "./mouse"
import { getProfilesKeycodes, profilesKeycodeMetadata } from "./profiles"
import { getSpecialKeycodes, specialKeycodeMetadata } from "./special"

export type { KeycodeLayout } from "./layout.svelte"

export const keycodeCategories = {
  BASIC: "Basic",
  EXTENDED: "Extended",
  SPECIAL: "Special",
  PROFILES: "Profiles",
  MEDIA: "Media",
  MOUSE: "Mouse",
  ADVANCED_KEYS: "Advanced Keys",
  GAMEPAD: "Gamepad",
  UNKNOWN: "Unknown",
} as const

export type KeycodeCategory =
  (typeof keycodeCategories)[keyof typeof keycodeCategories]

export type KeycodeMetadata = {
  name: string
  tooltip?: string
  display?: (string | Component)[]
  keycode: Keycode
  webCodes: string[]
  category: KeycodeCategory
}

export const keycodeMetadata: KeycodeMetadata[] = [
  ...basicKeycodeMetadata,
  ...extendedKeycodeMetadata,
  ...specialKeycodeMetadata,
  ...profilesKeycodeMetadata,
  ...mediaKeycodeMetadata,
  ...mouseKeycodeMetadata,
  ...advancedKeysKeycodeMetadata,
  ...gamepadKeycodeMetadata,
]

const keycodeMetadataMap = new Map(
  keycodeMetadata.map((metadata) => [metadata.keycode, metadata]),
)

/**
+ * US legends for JIS-specific keys. The base metadata carries JIS glyphs
+ * (ろ, かな, ¥, …), so the US layout overrides them with neutral names.
+ */
const usNameOverrides: Partial<
  Record<Keycode, { name: string; tooltip?: string }>
> = {
  [Keycode.KC_INTERNATIONAL_1]: { name: "Ro", tooltip: "Ro (Int1)" },
  [Keycode.KC_INTERNATIONAL_2]: { name: "Kana", tooltip: "Kana (Int2)" },
  [Keycode.KC_INTERNATIONAL_3]: { name: "Yen", tooltip: "Yen (Int3)" },
  [Keycode.KC_INTERNATIONAL_4]: { name: "Henkan", tooltip: "Henkan (Int4)" },
  [Keycode.KC_INTERNATIONAL_5]: {
    name: "Muhenkan",
    tooltip: "Muhenkan (Int5)",
  },
  [Keycode.KC_LANGUAGE_1]: { name: "Lang 1", tooltip: "Language 1 (Lang1)" },
  [Keycode.KC_LANGUAGE_2]: { name: "Lang 2", tooltip: "Language 2 (Lang2)" },
}

/**
+ * JIS (JP) legends for symbol keys. The base metadata carries US glyphs, so
+ * the JP layout overrides the keys whose legends differ on JIS keyboards.
+ */
const jpNameOverrides: Partial<
  Record<Keycode, { name: string; tooltip?: string }>
> = {
  [Keycode.KC_GRAVE]: { name: "半/全", tooltip: "Zenkaku/Hankaku" },
  [Keycode.KC_2]: { name: '"\n2' },
  [Keycode.KC_6]: { name: "&\n6" },
  [Keycode.KC_7]: { name: "'\n7" },
  [Keycode.KC_8]: { name: "(\n8" },
  [Keycode.KC_9]: { name: ")\n9" },
  [Keycode.KC_0]: { name: "0" },
  [Keycode.KC_MINUS]: { name: "=\n-" },
  [Keycode.KC_EQUAL]: { name: "~\n^" },
  [Keycode.KC_LEFT_BRACKET]: { name: "`\n@" },
  [Keycode.KC_RIGHT_BRACKET]: { name: "{\n[" },
  [Keycode.KC_BACKSLASH]: { name: "}\n]" },
  [Keycode.KC_SEMICOLON]: { name: "+\n;" },
  [Keycode.KC_QUOTE]: { name: "*\n:" },
}

export function getKeycodeMetadata(
  keycode: Keycode,
  layout?: KeycodeLayout,
): KeycodeMetadata {
  if (Keycode.SP_MO_MIN <= keycode && keycode <= Keycode.SP_MO_MAX) {
    const layer = MO_GET_LAYER(keycode)
    return {
      name: `MO(${layer})`,
      tooltip: `Hold to Activate Layer ${layer}`,
      keycode,
      webCodes: [],
      category: "Special",
    }
  }

  if (Keycode.SP_PF_MIN <= keycode && keycode <= Keycode.SP_PF_MAX) {
    const profile = PF_GET_PROFILE(keycode)
    return {
      name: `PF(${profile})`,
      tooltip: `Switch to Profile ${profile}`,
      keycode,
      webCodes: [],
      category: "Profiles",
    }
  }

  const resolvedLayout = layout ?? getKeycodeLayout()
  const base =
    keycodeMetadataMap.get(keycode) ?? {
      name: displayUInt16(keycode),
      tooltip: `Unknown Keycode: ${displayUInt16(keycode)}`,
      keycode,
      webCodes: [],
      category: "Unknown" as const,
    }
  const override =
    resolvedLayout === "jp" ? jpNameOverrides[keycode] : usNameOverrides[keycode]
  return override ? { ...base, ...override } : base
}

export function getCategorizedKeycodes({
  numProfiles,
  numLayers,
}: KeyboardMetadata): [KeycodeCategory, number[]][] {
  return [
    ["Basic", basicKeycodes],
    ["Extended", extendedKeycodes],
    ["Special", getSpecialKeycodes(numLayers)],
    ["Profiles", getProfilesKeycodes(numProfiles)],
    ["Media", mediaKeycodes],
    ["Mouse", mouseKeycodes],
  ]
}
