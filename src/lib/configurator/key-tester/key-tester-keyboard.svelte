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
  import * as KeyButton from "$lib/components/key-button"
  import { keyTesterStateContext } from "$lib/components/key-tester/context.svelte"
  import { KeyboardEditorKeyboard } from "$lib/components/keyboard-editor"
  import { getKeycodeMetadata } from "$lib/keycodes"
  import { HMK_AKType } from "$lib/libhmk/advanced-keys"
  import { Keycode } from "$lib/libhmk/keycodes"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import { keyTesterLatchedContext } from "./latched-state.svelte"
  import { untrack } from "svelte"

  const { current: keymap } = $derived(keymapQueryContext.get().keymap)
  const { current: advancedKeys } = $derived(
    advancedKeysQueryContext.get().advancedKeys,
  )
  const { keyEvents } = $derived(keyTesterStateContext.get())
  const latched = keyTesterLatchedContext.get()

  const pressedWebCodes = $derived(
    new Set(
      keyEvents.filter(({ pressed }) => pressed).map(({ webCode }) => webCode),
    ),
  )

  // Latch every observed web code so released keys stay highlighted, like a
  // QMK matrix test. Reset clears both the latched set and the tester state's
  // key events, so draining events cannot re-latch keys after a reset.
  $effect(() => {
    const webCodes = keyEvents.map(({ webCode }) => webCode)
    untrack(() => {
      for (const webCode of webCodes) {
        latched.codes.add(webCode)
      }
    })
  })

  function testerState(webCodes: string[]): "active" | "latched" | "off" {
    if (webCodes.some((webCode) => pressedWebCodes.has(webCode))) {
      return "active"
    }
    if (webCodes.some((webCode) => latched.codes.has(webCode))) {
      return "latched"
    }
    return "off"
  }

  /**
   * Resolves the keycode a key reports on the default layer. Keys configured
   * as tap-hold (modtap) advanced keys register their tap keycode when
   * tapped, so those resolve through the advanced key table instead of the
   * keymap entry.
   */
  function testerKeycode(key: number): number {
    for (const { layer, key: akKey, action } of advancedKeys ?? []) {
      if (layer === 0 && akKey === key && action.type === HMK_AKType.TAP_HOLD) {
        return action.tapKeycode
      }
    }
    return keymap?.[0][key] ?? Keycode.KC_NO
  }
</script>

<KeyboardEditorKeyboard>
  {#snippet keyGenerator(key)}
    {#if !keymap}
      <KeyButton.Skeleton />
    {:else}
      {@const { name, display, webCodes } = getKeycodeMetadata(
        testerKeycode(key),
      )}
      <KeyButton.Root
        class="data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=latched]:border-primary data-[state=latched]:bg-accent data-[state=latched]:text-accent-foreground"
        data-state={testerState(webCodes)}
        tabindex={-1}
      >
        {#each display ?? [name] as Variant, i (i)}
          {#if typeof Variant === "string"}
            <span>{Variant}</span>
          {:else}
            <Variant />
          {/if}
        {/each}
      </KeyButton.Root>
    {/if}
  {/snippet}
</KeyboardEditorKeyboard>
