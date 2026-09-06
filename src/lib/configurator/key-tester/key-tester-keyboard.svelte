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
  import { KeyboardEditorKeyboard } from "$lib/components/keyboard-editor"
  import { getKeycodeMetadata } from "$lib/keycodes"
  import { HMK_AKType } from "$lib/libhmk/advanced-keys"
  import { Keycode } from "$lib/libhmk/keycodes"
  import { useEventListener } from "runed"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import { keyTesterHighlightContext } from "./tester-state.svelte"

  const { current: keymap } = $derived(keymapQueryContext.get().keymap)
  const { current: advancedKeys } = $derived(
    advancedKeysQueryContext.get().advancedKeys,
  )
  const tester = keyTesterHighlightContext.get()

  useEventListener(
    () => window,
    "keydown",
    (e) => {
      if (!e.repeat) {
        tester.pressed.add(e.code)
        tester.latched.add(e.code)
        tester.shiftAtPress.set(
          e.code,
          e.shiftKey || e.code.startsWith("Shift"),
        )
        tester.keyAtPress.set(e.code, e.key)
      }
    },
  )
  useEventListener(
    () => window,
    "keyup",
    (e) => {
      tester.pressed.delete(e.code)
    },
  )
  useEventListener(
    () => window,
    "blur",
    () => tester.pressed.clear(),
  )

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

  function testerState(webCodes: string[]): "active" | "latched" | "off" {
    if (webCodes.some((webCode) => tester.pressed.has(webCode))) {
      return "active"
    }
    if (webCodes.some((webCode) => tester.latched.has(webCode))) {
      return "latched"
    }
    return "off"
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
