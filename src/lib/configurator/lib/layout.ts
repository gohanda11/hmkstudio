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
  CrosshairIcon,
  Gamepad2Icon,
  GaugeIcon,
  Grid2x2Icon,
  MouseIcon,
  PencilIcon,
  SettingsIcon,
  SquareChevronUpIcon,
} from "@lucide/svelte"
import type { I18nKey } from "$lib/i18n.svelte"
import type { Component } from "svelte"
import type { ConfiguratorTabs } from "../context.svelte"

export const MIN_WINDOW_WIDTH = 1024
export const MIN_WINDOW_HEIGHT = 768

export type SidebarTabGroup = {
  groupKey: I18nKey
  tabs: {
    labelKey: I18nKey
    value: ConfiguratorTabs
    icon: Component
  }[]
}

export const sidebarTabGroups: SidebarTabGroup[] = [
  {
    groupKey: "sidebar.groupProfiles",
    tabs: [
      { labelKey: "sidebar.tabProfiles", value: "profiles", icon: Grid2x2Icon },
    ],
  },
  {
    groupKey: "sidebar.groupKeyboard",
    tabs: [
      { labelKey: "sidebar.tabRemap", value: "remap", icon: PencilIcon },
      {
        labelKey: "sidebar.tabPerformance",
        value: "performance",
        icon: GaugeIcon,
      },
      {
        labelKey: "sidebar.tabAdvancedKeys",
        value: "advanced-keys",
        icon: SquareChevronUpIcon,
      },
      { labelKey: "sidebar.tabGamepad", value: "gamepad", icon: Gamepad2Icon },
      { labelKey: "sidebar.tabPointing", value: "pointing", icon: MouseIcon },
      {
        labelKey: "sidebar.tabCalibration",
        value: "calibration",
        icon: CrosshairIcon,
      },
    ],
  },
  {
    groupKey: "sidebar.groupSettings",
    tabs: [
      {
        labelKey: "sidebar.tabSettings",
        value: "settings",
        icon: SettingsIcon,
      },
    ],
  },
]
