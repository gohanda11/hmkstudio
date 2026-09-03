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

import { PersistedState } from "runed"

/** Physical legend layout used for keycode display names. */
export type KeycodeLayout = "us" | "jp"

export const keycodeLayouts: KeycodeLayout[] = ["us", "jp"]

const fallback: KeycodeLayout = "us"

/**
 * Shared, localStorage-persisted legend layout. Read inside `$derived` or
 * template expressions so legends update reactively on layout change.
 */
export const keycodeLayoutState = new PersistedState<KeycodeLayout>(
  "hmk-keycode-layout",
  fallback,
)

export function getKeycodeLayout(): KeycodeLayout {
  const current = keycodeLayoutState.current
  return current === "jp" || current === "us" ? current : fallback
}

export function setKeycodeLayout(layout: KeycodeLayout) {
  keycodeLayoutState.current = layout
}
