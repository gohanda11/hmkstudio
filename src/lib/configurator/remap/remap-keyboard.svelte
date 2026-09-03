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
  import { assignKeycode, getModtapKeymap } from "./modtap"
  import RemapKeyDialog from "./remap-key-dialog.svelte"
  import RemapModtapButton from "./remap-modtap-button.svelte"

  const remapState = remapStateContext.get()
  const { layer, key } = $derived(remapState)

  const keymapQuery = keymapQueryContext.get()
  const { current: keymap } = $derived(keymapQuery.keymap)
  const advancedKeysQuery = advancedKeysQueryContext.get()
  const { current: advancedKeys } = $derived(advancedKeysQuery.advancedKeys)

  const modtapKeymap = $derived(
    keymap && advancedKeys ? getModtapKeymap(advancedKeys, keymap) : null,
  )

  let keyDialogOpen = $state(false)
  let keyDialogKey = $state<number | null>(null)
</script>

<ToggleGroup.Root
  bind:value={
    () => stringNullable(key), (v) => (remapState.key = numberNullable(v))
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
            onclick={() => {
              keyDialogKey = key
              keyDialogOpen = true
            }}
            oncontextmenu={(e) => {
              e.preventDefault()
              assignKeycode(keymapQuery, advancedKeysQuery, advancedKeys, {
                layer,
                key,
                keycode: Keycode.KC_NO,
              })
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
