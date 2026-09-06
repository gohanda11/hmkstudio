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
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import { t } from "$lib/i18n.svelte"
  import {
    getKeycodeLayout,
    setKeycodeLayout,
  } from "$lib/keycodes/layout.svelte"
  import { getTesterDisplayWithActual } from "$lib/keycodes/tester-display"
  import { keyTesterHighlightContext } from "./tester-state.svelte"

  const tester = keyTesterHighlightContext.get()

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

  const toggleLayout = () => {
    setKeycodeLayout(getKeycodeLayout() === "us" ? "jp" : "us")
  }
</script>

<FixedScrollArea class="flex flex-col gap-4 p-4">
  <div class="flex items-center justify-between gap-2">
    <Button
      aria-label={t("remap.legendLayout")}
      class="text-xs font-bold"
      onclick={toggleLayout}
      size="sm"
      title={t("remap.legendLayoutTooltip")}
      variant="outline"
    >
      {getKeycodeLayout().toUpperCase()}
    </Button>
    <Button
      disabled={tester.empty}
      onclick={() => tester.reset()}
      size="sm"
      variant="outline"
    >
      {t("tester.reset")}
    </Button>
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-sm font-medium">{t("tester.pressedKeys")}</div>
    <div class="flex flex-wrap gap-1.5">
      {#if pressedDisplays.length === 0}
        <span class="text-xs text-muted-foreground">—</span>
      {:else}
        {#each pressedDisplays as { webCode, label } (webCode)}
          <Badge>{label}</Badge>
        {/each}
      {/if}
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-sm font-medium">{t("tester.releasedKeys")}</div>
    <div class="flex flex-wrap gap-1.5">
      {#if latchedDisplays.length === 0}
        <span class="text-xs text-muted-foreground">—</span>
      {:else}
        {#each latchedDisplays as { webCode, label } (webCode)}
          <Badge variant="secondary">{label}</Badge>
        {/each}
      {/if}
    </div>
  </div>
</FixedScrollArea>
