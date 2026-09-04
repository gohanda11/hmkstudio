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
  import { Badge } from "$lib/components/ui/badge"
  import { t } from "$lib/i18n.svelte"
  import { getKeycodeLayout } from "$lib/keycodes/layout.svelte"
  import { getTesterDisplayWithActual } from "$lib/keycodes/tester-display"
  import { remapTesterContext } from "./tester-state.svelte"

  const tester = remapTesterContext.get()

  function testerLabel(webCode: string): string {
    return getTesterDisplayWithActual(
      webCode,
      tester.shiftAtPress.get(webCode) ?? false,
      getKeycodeLayout(),
      tester.keyAtPress.get(webCode),
    )
  }

  const pressedDisplays = $derived(
    [...tester.pressed].map((webCode) => ({
      webCode,
      label: testerLabel(webCode),
    })),
  )
  const latchedDisplays = $derived(
    [...tester.latched]
      .filter((webCode) => !tester.pressed.has(webCode))
      .map((webCode) => ({
        webCode,
        label: testerLabel(webCode),
      })),
  )
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 py-2">
  <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
    <span class="text-xs font-medium text-muted-foreground">
      {t("remap.testerPressed")}
    </span>
    {#if pressedDisplays.length === 0}
      <span class="text-xs text-muted-foreground">—</span>
    {:else}
      {#each pressedDisplays as { webCode, label } (webCode)}
        <Badge>{label}</Badge>
      {/each}
    {/if}
  </div>
  <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
    <span class="text-xs font-medium text-muted-foreground">
      {t("remap.testerHistory")}
    </span>
    {#if latchedDisplays.length === 0}
      <span class="text-xs text-muted-foreground">—</span>
    {:else}
      {#each latchedDisplays as { webCode, label } (webCode)}
        <Badge variant="secondary">{label}</Badge>
      {/each}
    {/if}
  </div>
</div>
