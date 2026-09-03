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
  import { InfoIcon } from "@lucide/svelte"
  import CommitSlider from "$lib/components/commit-slider.svelte"
  import { tickRateQueryContext } from "$lib/configurator/queries/tick-rate-query.svelte"
  import { t } from "$lib/i18n.svelte"
  import { DEFAULT_TICK_RATE } from "$lib/libhmk/advanced-keys"
  import { cn, type WithoutChildren } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const tickRateQuery = tickRateQueryContext.get()
  const { current: tickRate } = $derived(tickRateQuery.tickRate)
</script>

<div class={cn("flex flex-col gap-4", className)} {...props}>
  <CommitSlider
    bind:committed={
      () => tickRate ?? DEFAULT_TICK_RATE, (v) => tickRateQuery.set({ data: v })
    }
    description={t("advkeys.tickRate.description")}
    disabled={tickRate === undefined}
    min={0}
    max={255}
    step={5}
    title={t("advkeys.tickRate.title")}
  />
  <div class="flex items-center gap-2 text-muted-foreground">
    <InfoIcon class="size-4" />
    <p class="text-sm text-wrap">
      {t("advkeys.tickRate.note")}
    </p>
  </div>
</div>
