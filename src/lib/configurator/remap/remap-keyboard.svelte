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
  import { KeyboardEditorKeyboard } from "$lib/components/keyboard-editor"
  import * as KeycodeButton from "$lib/components/keycode-button"
  import { Keycode } from "$lib/libhmk/keycodes"
  import { numberNullable, stringNullable } from "$lib/utils"
  import { ToggleGroup } from "bits-ui"
  import { remapStateContext } from "../context.svelte"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import { macrosQueryContext } from "../queries/macros-query.svelte"
  import { assignKeycode, getModtapKeymap } from "./modtap"
  import RemapKeyDialog from "./remap-key-dialog.svelte"
  import RemapModtapButton from "./remap-modtap-button.svelte"

  const remapState = remapStateContext.get()
  const { layer, key } = $derived(remapState)

  const keymapQuery = keymapQueryContext.get()
  const { current: keymap } = $derived(keymapQuery.keymap)
  const advancedKeysQuery = advancedKeysQueryContext.get()
  const { current: advancedKeys } = $derived(advancedKeysQuery.advancedKeys)
  const macrosQuery = macrosQueryContext.get()
  const { current: macros } = $derived(macrosQuery.macros)

  const modtapKeymap = $derived(
    keymap && advancedKeys ? getModtapKeymap(advancedKeys, keymap) : null,
  )

  let keyDialogOpen = $state(false)
  let keyDialogKey = $state<number | null>(null)

  // Single click selects the key (via the toggle group below); a second click
  // on the same key within the threshold opens the edit dialog instead.
  const DOUBLE_CLICK_MS = 300
  let lastClickedKey: number | null = null
  let lastClickedAt = 0

  function handleKeyClick(key: number) {
    const now = Date.now()
    if (lastClickedKey === key && now - lastClickedAt < DOUBLE_CLICK_MS) {
      lastClickedKey = null
      remapState.key = key
      keyDialogKey = key
      keyDialogOpen = true
      return
    }
    lastClickedKey = key
    lastClickedAt = now
  }
</script>

<ToggleGroup.Root
  class="flex min-h-0 min-w-0 flex-1 flex-col"
  bind:value={
    () => stringNullable(key),
    (v) => {
      const next = numberNullable(v)
      // The dialog-opening second click of a double-click re-toggles the
      // active item off; ignore that transient deselect while the dialog is
      // open so the selection (and right-menu assignment) survives.
      if (next === null && keyDialogOpen) return
      remapState.key = next
    }
  }
  type="single"
>
  {#snippet child({ props })}
    <KeyboardEditorKeyboard {...props}>
      {#snippet keyGenerator(key)}
        {#if !keymap || !advancedKeys}
          <KeycodeButton.Skeleton />
        {:else}
          <ToggleGroup.Item
            onclick={() => handleKeyClick(key)}
            oncontextmenu={(e) => {
              e.preventDefault()
              void assignKeycode(
                keymapQuery,
                advancedKeysQuery,
                macrosQuery,
                advancedKeys,
                macros,
                {
                  layer,
                  key,
                  keycode: Keycode.KC_NO,
                },
              )
            }}
            value={String(key)}
          >
            {#snippet child({ props })}
              {@const modtap = modtapKeymap?.[layer][key]}
              {#if modtap}
                <RemapModtapButton {modtap} showTooltip {...props} />
              {:else}
                <KeycodeButton.Root
                  keycode={keymap[layer][key]}
                  showTooltip
                  {...props}
                />
              {/if}
            {/snippet}
          </ToggleGroup.Item>
        {/if}
      {/snippet}
    </KeyboardEditorKeyboard>
  {/snippet}
</ToggleGroup.Root>

<RemapKeyDialog bind:open={keyDialogOpen} key={keyDialogKey} />
