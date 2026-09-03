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

import type { KeycodeLayout } from "./layout.svelte"

type KeyChar = { normal: string; shift: string }

/**
 * `KeyboardEvent.code` + Shift -> printable character, per physical layout.
 * Used by the Remap tester mode so pressed-key badges reflect the US/JP
 * legend layout immediately (e.g. Shift+Digit9 is `(` on US, `)` on JP).
 */
const usTesterChars: Record<string, KeyChar> = {
  Digit1: { normal: "1", shift: "!" },
  Digit2: { normal: "2", shift: "@" },
  Digit3: { normal: "3", shift: "#" },
  Digit4: { normal: "4", shift: "$" },
  Digit5: { normal: "5", shift: "%" },
  Digit6: { normal: "6", shift: "^" },
  Digit7: { normal: "7", shift: "&" },
  Digit8: { normal: "8", shift: "*" },
  Digit9: { normal: "9", shift: "(" },
  Digit0: { normal: "0", shift: ")" },
  Minus: { normal: "-", shift: "_" },
  Equal: { normal: "=", shift: "+" },
  BracketLeft: { normal: "[", shift: "{" },
  BracketRight: { normal: "]", shift: "}" },
  Backslash: { normal: "\\", shift: "|" },
  Semicolon: { normal: ";", shift: ":" },
  Quote: { normal: "'", shift: '"' },
  Backquote: { normal: "`", shift: "~" },
  Comma: { normal: ",", shift: "<" },
  Period: { normal: ".", shift: ">" },
  Slash: { normal: "/", shift: "?" },
  IntlBackslash: { normal: "\\", shift: "|" },
  IntlYen: { normal: "¥", shift: "|" },
  IntlRo: { normal: "ろ", shift: "ろ" },
}

const jpTesterChars: Record<string, KeyChar> = {
  Digit1: { normal: "1", shift: "!" },
  Digit2: { normal: "2", shift: '"' },
  Digit3: { normal: "3", shift: "#" },
  Digit4: { normal: "4", shift: "$" },
  Digit5: { normal: "5", shift: "%" },
  Digit6: { normal: "6", shift: "&" },
  Digit7: { normal: "7", shift: "'" },
  Digit8: { normal: "8", shift: "(" },
  Digit9: { normal: "9", shift: ")" },
  Digit0: { normal: "0", shift: "0" },
  Minus: { normal: "-", shift: "=" },
  Equal: { normal: "^", shift: "~" },
  BracketLeft: { normal: "@", shift: "`" },
  BracketRight: { normal: "[", shift: "{" },
  Backslash: { normal: "]", shift: "}" },
  Semicolon: { normal: ";", shift: "+" },
  Quote: { normal: ":", shift: "*" },
  Backquote: { normal: "半/全", shift: "半/全" },
  Comma: { normal: ",", shift: "<" },
  Period: { normal: ".", shift: ">" },
  Slash: { normal: "/", shift: "?" },
  IntlBackslash: { normal: "_", shift: "?" },
  IntlYen: { normal: "¥", shift: "|" },
  IntlRo: { normal: "ろ", shift: "ろ" },
}

const friendlyNames: Record<string, string> = {
  Space: "Space",
  Enter: "Enter",
  Tab: "Tab",
  Backspace: "Backspace",
  Escape: "Esc",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  AltLeft: "Alt",
  AltRight: "Alt",
  MetaLeft: "Meta",
  MetaRight: "Meta",
  CapsLock: "Caps",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  KanaMode: "かな",
  Convert: "変換",
  NonConvert: "無変換",
  Lang1: "Lang1",
  Lang2: "Lang2",
}

/**
 * Display label for a physical key in the tester UI. Letters resolve to
 * a/A (layout-independent); symbol keys resolve through the US/JP tables
 * above so a layout switch is reflected immediately. Unknown codes fall
 * back to the raw `code` (e.g. `F1`, `Insert`).
 */
export function getTesterDisplay(
  webCode: string,
  shift: boolean,
  layout: KeycodeLayout,
): string {
  if (webCode.length === 4 && webCode.startsWith("Key")) {
    const letter = webCode.slice(3).toLowerCase()
    return shift ? letter.toUpperCase() : letter
  }
  const table = layout === "jp" ? jpTesterChars : usTesterChars
  const entry = table[webCode]
  if (entry) {
    return shift ? entry.shift : entry.normal
  }
  return friendlyNames[webCode] ?? webCode
}
