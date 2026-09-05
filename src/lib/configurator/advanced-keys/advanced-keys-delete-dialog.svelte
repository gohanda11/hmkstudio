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
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { t } from "$lib/i18n.svelte"
  import { displayUInt8 } from "$lib/integer"
  import {
    defaultAdvancedKey,
    type HMK_AdvancedKey,
  } from "$lib/libhmk/advanced-keys"
  import type { ComponentProps } from "svelte"
  import { advancedKeysStateContext } from "../context.svelte"
  import { getAdvancedKeyMetadata } from "../lib/advanced-keys"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"

  const {
    children,
    index,
    advancedKey,
    ...props
  }: ComponentProps<typeof Dialog.Trigger> & {
    index: number
    advancedKey: HMK_AdvancedKey
  } = $props()

  const advancedKeysState = advancedKeysStateContext.get()
  const { index: currentIndex } = $derived(advancedKeysState)

  const advancedKeysQuery = advancedKeysQueryContext.get()

  const { titleKey } = $derived(getAdvancedKeyMetadata(advancedKey.action.type))
  const title = $derived(
    t(titleKey, { value: displayUInt8(advancedKey.action.type) }),
  )
</script>

<Dialog.Root>
  <Dialog.Trigger {...props}>{@render children?.()}</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{t("advkeys.deleteDialog.title", { title })}</Dialog.Title>
      <Dialog.Description>
        {t("advkeys.deleteDialog.description")}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close>
        {#snippet child({ props })}
          <Button size="sm" variant="outline" {...props}
            >{t("advkeys.deleteDialog.cancel")}</Button
          >
        {/snippet}
      </Dialog.Close>
      <Dialog.Close
        onclick={() => {
          if (index === currentIndex) {
            advancedKeysState.setIndex(null)
          }
          advancedKeysQuery.set({
            offset: index,
            data: [defaultAdvancedKey],
          })
        }}
      >
        {#snippet child({ props })}
          <Button size="sm" variant="destructive" {...props}
            >{t("advkeys.deleteDialog.remove")}</Button
          >
        {/snippet}
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
