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
  import {
    ActivityIcon,
    DownloadIcon,
    RotateCcwIcon,
    UploadIcon,
  } from "@lucide/svelte"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Select from "$lib/components/ui/select"
  import * as Tooltip from "$lib/components/ui/tooltip"
  import { t } from "$lib/i18n.svelte"
  import { keyboardContext } from "$lib/keyboard"
  import {
    getKeycodeLayout,
    keycodeLayouts,
    setKeycodeLayout,
    type KeycodeLayout,
  } from "$lib/keycodes/layout.svelte"
  import { toast } from "svelte-sonner"
  import z from "zod"
  import { globalStateContext } from "../context.svelte"
  import { KeyboardConfig } from "../lib/keyboard-config.svelte"
  import { profileQueryContext } from "../queries/profile-query.svelte"

  let { testerMode = $bindable(false) }: { testerMode?: boolean } = $props()

  const { name } = keyboardContext.get().metadata
  const globalState = globalStateContext.get()
  const { profile } = $derived(globalState)
  const keyboardConfig = new KeyboardConfig()
  const profileQuery = profileQueryContext.get()

  let fileRef: HTMLInputElement | null = $state(null)
  let anchorRef: HTMLAnchorElement | null = $state(null)
  let resetOpen = $state(false)

  const formatZodError = (err: z.ZodError) =>
    [
      ...new Set(
        err.issues.map((issue) =>
          issue.path.length > 0
            ? `${issue.path.join(".")}: ${issue.message}`
            : issue.message,
        ),
      ),
    ].join(" ")

  const importProfile = async () => {
    if (!fileRef) return
    fileRef.onchange = null
    fileRef.value = ""
    fileRef.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const json = JSON.parse(await file.text())
        await keyboardConfig.setConfig(profile, json)
        toast.success(t("toast.profileImported", { profile }))
      } catch (err) {
        if (err instanceof SyntaxError) {
          toast.error(t("toast.profileImportInvalidJson", { profile }))
        } else if (err instanceof z.ZodError) {
          toast.error(
            t("toast.profileImportFailed", { profile, error: formatZodError(err) }),
          )
          console.error(z.treeifyError(err))
        } else {
          toast.error(t("toast.profileImportFailed", { profile, error: String(err) }))
        }
      }
    }
    fileRef.click()
  }

  const exportProfile = async () => {
    if (!anchorRef) return
    try {
      const config = await keyboardConfig.getConfig(profile)
      const blob = new Blob([JSON.stringify(config)], {
        type: "application/json",
      })
      anchorRef.href = URL.createObjectURL(blob)
      anchorRef.download = `${name}-profile-${profile}.json`
      anchorRef.click()
      toast.success(t("toast.profileExported", { profile }))
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          t("toast.profileExportFailed", { profile, error: formatZodError(err) }),
        )
        console.error(z.treeifyError(err))
      } else {
        toast.error(t("toast.profileExportFailed", { profile, error: String(err) }))
      }
    }
  }
</script>

<div class="flex flex-col items-center gap-2 border-l p-2">
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          aria-pressed={testerMode}
          onclick={() => (testerMode = !testerMode)}
          size="icon"
          variant={testerMode ? "default" : "outline"}
        >
          <ActivityIcon />
          <span class="sr-only">{t("remap.testerHighlightSr")}</span>
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content side="left">{t("remap.testerHighlight")}</Tooltip.Content>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <div {...props}>
            <Select.Root
              bind:value={
                () => getKeycodeLayout(),
                (v) => {
                  if (v === "us" || v === "jp") setKeycodeLayout(v)
                }
              }
              type="single"
            >
            <Select.Trigger aria-label={t("remap.legendLayout")} class="w-16" size="sm">
              {getKeycodeLayout().toUpperCase()}
            </Select.Trigger>
            <Select.Content>
              {#each keycodeLayouts as layout (layout)}
                <Select.Item value={layout}>
                  {layout.toUpperCase()}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content side="left">{t("remap.legendLayoutTooltip")}</Tooltip.Content>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button {...props} onclick={importProfile} size="icon" variant="outline">
          <UploadIcon />
          <span class="sr-only">{t("remap.importProfile")}</span>
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content side="left">{t("remap.importProfileTooltip")}</Tooltip.Content>
  </Tooltip.Root>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button {...props} onclick={exportProfile} size="icon" variant="outline">
          <DownloadIcon />
          <span class="sr-only">{t("remap.exportProfile")}</span>
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content side="left">{t("remap.exportProfileTooltip")}</Tooltip.Content>
  </Tooltip.Root>

  <Dialog.Root bind:open={resetOpen}>
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <Dialog.Trigger {...props}>
            {#snippet child({ props })}
              <Button size="icon" variant="destructive" {...props}>
                <RotateCcwIcon />
                <span class="sr-only">{t("remap.resetProfile")}</span>
              </Button>
            {/snippet}
          </Dialog.Trigger>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content side="left">{t("remap.resetProfileTooltip")}</Tooltip.Content>
    </Tooltip.Root>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{t("remap.resetTitle", { profile })}</Dialog.Title>
        <Dialog.Description>
          {t("remap.resetDescription")}
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button size="sm" variant="outline" {...props}>{t("remap.cancel")}</Button>
          {/snippet}
        </Dialog.Close>
        <Dialog.Close
          onclick={() => profileQuery.resetProfile({ profile })}
        >
          {#snippet child({ props })}
            <Button size="sm" variant="destructive" {...props}>{t("remap.reset")}</Button>
          {/snippet}
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>

<input
  bind:this={fileRef}
  accept="application/json"
  aria-hidden="true"
  hidden
  type="file"
/>
<a bind:this={anchorRef} aria-hidden="true" hidden href="#0"></a>
