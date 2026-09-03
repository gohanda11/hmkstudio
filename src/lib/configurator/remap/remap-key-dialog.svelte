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
  import { KeyButton } from "$lib/components/key-button"
  import KeycodeAccordion from "$lib/components/keycode-accordion.svelte"
  import { KeycodeButton } from "$lib/components/keycode-button"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Tabs from "$lib/components/ui/tabs"
  import { keyboardContext } from "$lib/keyboard"
  import { HMK_AKType } from "$lib/libhmk/advanced-keys"
  import { unitToStyle } from "$lib/ui"
  import { cn } from "$lib/utils"
  import { untrack } from "svelte"
  import { remapStateContext } from "../context.svelte"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import { applyModtap, assignKeycode, findModtapIndex } from "./modtap"

  let { open = $bindable(false), key }: { open?: boolean; key: number | null } =
    $props()

  const { metadata } = keyboardContext.get()
  const remapState = remapStateContext.get()

  const keymapQuery = keymapQueryContext.get()
  const advancedKeysQuery = advancedKeysQueryContext.get()
  const advancedKeys = $derived(advancedKeysQuery.advancedKeys.current)

  let editLayer = $state(0)
  let editKey = $state(0)
  let tab = $state("key")
  let binding = $state<"tap" | "hold" | "">("")
  let tapKeycode = $state<number | null>(null)
  let holdKeycode = $state<number | null>(null)

  $effect(() => {
    if (!open || key === null) return
    const layer = remapState.layer
    const target = key
    untrack(() => {
      editLayer = layer
      editKey = target
      tab = "key"
      binding = ""
      const index = advancedKeys
        ? findModtapIndex(advancedKeys, layer, target)
        : -1
      const action =
        advancedKeys && index !== -1 ? advancedKeys[index].action : null
      if (action?.type === HMK_AKType.TAP_HOLD) {
        tapKeycode = action.tapKeycode
        holdKeycode = action.holdKeycode
      } else {
        tapKeycode = keymapQuery.keymap.current?.[layer]?.[target] ?? null
        holdKeycode = null
        binding = "tap"
      }
    })
  })

  const canApply = $derived.by(() => {
    if (!advancedKeys || tapKeycode === null || holdKeycode === null) {
      return false
    }
    // Slot availability is checked when applying: a tap-hold that cannot be
    // created because all Advanced Keys slots are in use is reported there.
    return true
  })

  function selectKeycode(keycode: number) {
    assignKeycode(keymapQuery, advancedKeysQuery, advancedKeys, {
      layer: editLayer,
      key: editKey,
      keycode,
    })
    open = false
  }

  /** Selects the slot the next keycode pick should fill. */
  function arm(field: "tap" | "hold") {
    binding = field
  }

  function clearField(field: "tap" | "hold") {
    if (field === "tap") {
      tapKeycode = null
    } else {
      holdKeycode = null
    }
    binding = field
  }

  function selectBinding(keycode: number) {
    if (binding === "tap") {
      tapKeycode = keycode
      if (holdKeycode === null) binding = "hold"
    } else if (binding === "hold") {
      holdKeycode = keycode
      if (tapKeycode === null) binding = "tap"
    }
  }

  function apply() {
    if (!advancedKeys || tapKeycode === null || holdKeycode === null) return
    if (
      applyModtap(metadata, advancedKeysQuery, advancedKeys, {
        layer: editLayer,
        key: editKey,
        tapKeycode,
        holdKeycode,
      })
    ) {
      open = false
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-xl">
    <Dialog.Header>
      <Dialog.Title>Edit Key</Dialog.Title>
      <Dialog.Description>
        Assign a keycode to this key, or configure a tap-hold binding that
        registers different keycodes when tapped and held.
      </Dialog.Description>
    </Dialog.Header>
    <Tabs.Root bind:value={tab}>
      <Tabs.List class="w-full">
        <Tabs.Trigger class="flex-1" value="key">Key</Tabs.Trigger>
        <Tabs.Trigger class="flex-1" value="tap-hold">Tap-Hold</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="key">
        <div class="h-80">
          <FixedScrollArea class="py-1">
            <KeycodeAccordion onKeycodeSelected={selectKeycode} />
          </FixedScrollArea>
        </div>
      </Tabs.Content>
      <Tabs.Content value="tap-hold">
        <div class="flex flex-col gap-4">
          <div class="grid place-items-center pt-2 text-base">
            <div class="flex">
              <div class="flex flex-col items-center text-center">
                <div class="text-muted-foreground">Tap</div>
                <div
                  class={cn(
                    "rounded-md p-0.5",
                    binding === "tap" && "ring-2 ring-ring",
                  )}
                  style={unitToStyle()}
                >
                  {#if tapKeycode !== null}
                    <KeycodeButton
                      keycode={tapKeycode}
                      onclick={() => arm("tap")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        clearField("tap")
                      }}
                    />
                  {:else}
                    <KeyButton
                      class="border-dashed font-normal text-muted-foreground"
                      onclick={() => arm("tap")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        arm("tap")
                      }}
                    >
                      <span>Assign</span>
                    </KeyButton>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col items-center text-center">
                <div class="text-muted-foreground">Hold</div>
                <div
                  class={cn(
                    "rounded-md p-0.5",
                    binding === "hold" && "ring-2 ring-ring",
                  )}
                  style={unitToStyle()}
                >
                  {#if holdKeycode !== null}
                    <KeycodeButton
                      keycode={holdKeycode}
                      onclick={() => arm("hold")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        clearField("hold")
                      }}
                    />
                  {:else}
                    <KeyButton
                      class="border-dashed font-normal text-muted-foreground"
                      onclick={() => arm("hold")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        arm("hold")
                      }}
                    >
                      <span>Assign</span>
                    </KeyButton>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          <div class="h-56">
            <FixedScrollArea class="py-1">
              <KeycodeAccordion onKeycodeSelected={selectBinding} />
            </FixedScrollArea>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
    {#if tab === "tap-hold"}
      <Dialog.Footer>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button size="sm" variant="outline" {...props}>Cancel</Button>
          {/snippet}
        </Dialog.Close>
        <Button disabled={!canApply} onclick={apply} size="sm">Apply</Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
