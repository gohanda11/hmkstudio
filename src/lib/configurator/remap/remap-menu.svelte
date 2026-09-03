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
  import KeycodeAccordion from "$lib/components/keycode-accordion.svelte"
  import { displayLayoutContext, remapStateContext } from "../context.svelte"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import { macrosQueryContext } from "../queries/macros-query.svelte"
  import { assignKeycode } from "./modtap"

  const allKeys = $derived(
    displayLayoutContext.get().displayKeys.map(({ key }) => key),
  )

  const remapState = remapStateContext.get()
  const { layer, key } = $derived(remapState)

  const keymapQuery = keymapQueryContext.get()
  const advancedKeysQuery = advancedKeysQueryContext.get()
  const { current: advancedKeys } = $derived(advancedKeysQuery.advancedKeys)
  const macrosQuery = macrosQueryContext.get()
  const { current: macros } = $derived(macrosQuery.macros)
</script>

<FixedScrollArea class="p-4">
  <KeycodeAccordion
    onKeycodeSelected={(keycode) => {
      if (key === null) return
      void assignKeycode(
        keymapQuery,
        advancedKeysQuery,
        macrosQuery,
        advancedKeys,
        macros,
        {
          layer,
          key,
          keycode,
        },
      )
      const index = allKeys.indexOf(key)
      remapState.key =
        index !== -1 && index + 1 < allKeys.length ? allKeys[index + 1] : null
    }}
  />
</FixedScrollArea>
