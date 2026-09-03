<!--
This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar"
  import { t } from "$lib/i18n.svelte"
  import { Tabs } from "bits-ui"
  import { globalStateContext } from "../context.svelte"
  import { sidebarTabGroups } from "../lib/layout"

  const { tab } = $derived(globalStateContext.get())
</script>

{#each sidebarTabGroups as { groupKey, tabs } (groupKey)}
  <Sidebar.Group>
    <Sidebar.GroupLabel class="truncate">
      {t(groupKey)}
    </Sidebar.GroupLabel>
    <Sidebar.Menu>
      {#each tabs as { labelKey, value, icon: Icon } (value)}
        <Sidebar.MenuItem>
          <Tabs.Trigger {value}>
            {#snippet child({ props })}
              <Sidebar.MenuButton
                isActive={tab === value}
                tooltipContent={t(labelKey)}
                {...props}
              >
                <Icon />
                <span>{t(labelKey)}</span>
              </Sidebar.MenuButton>
            {/snippet}
          </Tabs.Trigger>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.Group>
{/each}
