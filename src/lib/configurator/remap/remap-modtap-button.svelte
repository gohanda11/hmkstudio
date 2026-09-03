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
  import { getKeycodeMetadata } from "$lib/keycodes"
  import type { HMK_AKTapHold } from "$lib/libhmk/advanced-keys"
  import { cn, type WithoutChildren } from "$lib/utils"
  import type { ComponentProps } from "svelte"
  import { KeyButton } from "$lib/components/key-button"
  import * as Tooltip from "$lib/components/ui/tooltip"
  import { t } from "$lib/i18n.svelte"

  const {
    modtap,
    showTooltip,
    class: className,
    ...props
  }: WithoutChildren<ComponentProps<typeof KeyButton>> & {
    modtap: HMK_AKTapHold
    showTooltip?: boolean
  } = $props()

  const tapMetadata = $derived(getKeycodeMetadata(modtap.tapKeycode))
  const holdMetadata = $derived(getKeycodeMetadata(modtap.holdKeycode))
</script>

{#snippet buttonContent()}
  <KeyButton
    {...props}
    class={cn(className, "items-center justify-center leading-[1em]")}
  >
    {#each tapMetadata.display ?? [tapMetadata.name] as Variant, i (i)}
      {#if typeof Variant === "string"}
        <span>{Variant}</span>
      {:else}
        <Variant />
      {/if}
    {/each}
    <span
      class="text-muted-foreground text-[length:0.625em]! leading-[1em]">
      {holdMetadata.name}
    </span>
  </KeyButton>
{/snippet}

{#if !showTooltip}
  {@render buttonContent()}
{:else}
  <Tooltip.Root disableHoverableContent>
    <Tooltip.Trigger class="size-full">
      {#snippet child({ props })}
        <div {...props}>
          {@render buttonContent()}
        </div>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content class="max-w-56 text-wrap">
      {t("modtap.tooltip", { tap: tapMetadata.tooltip ?? tapMetadata.name, hold: holdMetadata.tooltip ?? holdMetadata.name })}
    </Tooltip.Content>
  </Tooltip.Root>
{/if}
