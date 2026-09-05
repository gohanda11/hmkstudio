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
  import * as Select from "$lib/components/ui/select"
  import { niceSize } from "$lib/dfu/libhmk-dfu"
  import { t } from "$lib/i18n.svelte"
  import { displayVersion } from "$lib/utils"
  import {
    DFU_SELECT_TIMEOUT_S,
    firmwareUpdate,
  } from "./firmware-update.svelte"

  let logElement = $state<HTMLPreElement | null>(null)

  $effect(() => {
    // Scroll the log to the bottom on new entries
    firmwareUpdate.logs
    if (logElement) logElement.scrollTop = logElement.scrollHeight
  })
</script>

<Dialog.Root
  open={firmwareUpdate.active}
  onOpenChange={(open) => {
    if (!open) void firmwareUpdate.close()
  }}
>
  <Dialog.Content
    class="sm:max-w-lg"
    showCloseButton={!firmwareUpdate.busy}
    onEscapeKeydown={(e) => {
      if (firmwareUpdate.busy) e.preventDefault()
    }}
  >
    <Dialog.Header>
      <Dialog.Title>{t("dfu.title")}</Dialog.Title>
      <Dialog.Description>
        {firmwareUpdate.keyboardName}
        {#if firmwareUpdate.step === "version" && firmwareUpdate.selectedVersion !== null}
          {t("dfu.versionRange", { current: displayVersion(firmwareUpdate.currentVersion), latest: firmwareUpdate.selectedVersion.tag })}
        {:else if firmwareUpdate.latestVersion !== null}
          {t("dfu.versionRange", { current: displayVersion(firmwareUpdate.currentVersion), latest: firmwareUpdate.latestVersion !== null ? displayVersion(firmwareUpdate.latestVersion) : "" })}
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if firmwareUpdate.step === "preparing"}
      <p class="text-sm text-muted-foreground">
        {firmwareUpdate.loadingList
          ? t("dfu.preparingVersions")
          : t("dfu.preparing")}
      </p>
    {:else if firmwareUpdate.step === "version"}
      <div class="grid gap-2 text-sm">
        <p class="text-muted-foreground">
          {t("dfu.versionHint")}
        </p>
        <div class="grid gap-1">
          <span class="font-medium">{t("dfu.selectVersion")}</span>
          <Select.Root
            bind:value={
              () => firmwareUpdate.selectedTag ?? "",
              (v) => {
                firmwareUpdate.selectedTag = v
              }
            }
            type="single"
          >
            <Select.Trigger class="w-full" size="sm">
              <span>{firmwareUpdate.selectedVersion?.tag ?? ""}</span>
            </Select.Trigger>
            <Select.Content class="w-[var(--bits-select-anchor-width)]">
              {#each firmwareUpdate.availableVersions as v (v.tag)}
                <Select.Item value={v.tag}>{v.tag}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="grid gap-1">
          <span class="font-medium">{t("dfu.changelog")}</span>
          {#if firmwareUpdate.selectedChangelog.length > 0}
            <ul
              class="grid max-h-32 gap-1 overflow-y-auto rounded-md bg-muted p-2 text-xs"
            >
              {#each firmwareUpdate.selectedChangelog as line, i (i)}
                <li class="break-words">{line}</li>
              {/each}
            </ul>
          {:else}
            <p class="text-xs text-muted-foreground">{t("dfu.noChangelog")}</p>
          {/if}
        </div>
        {#if firmwareUpdate.isDowngrade && firmwareUpdate.selectedVersion !== null}
          <p
            class="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-destructive"
          >
            {t("dfu.downgradeBody", { selected: firmwareUpdate.selectedVersion.tag, current: displayVersion(firmwareUpdate.currentVersion) })}
          </p>
        {/if}
      </div>
      <Dialog.Footer>
        <Button
          onclick={() => void firmwareUpdate.close()}
          size="sm"
          variant="outline"
        >
          {t("dfu.cancel")}
        </Button>
        <Button onclick={() => void firmwareUpdate.confirmVersion()} size="sm">
          {t("dfu.continue")}
        </Button>
      </Dialog.Footer>
    {:else if firmwareUpdate.step === "select" || firmwareUpdate.step === "connecting"}
      <div class="grid gap-2 text-sm text-wrap">
        <p>
          {t("dfu.selectBody1")}
        </p>
        <p class="text-muted-foreground">
          {t("dfu.selectBody2", { seconds: DFU_SELECT_TIMEOUT_S })}
        </p>
      </div>
      {#if firmwareUpdate.error !== null}
        <p class="text-sm text-destructive">{firmwareUpdate.error}</p>
      {/if}
      <Dialog.Footer>
        <Button
          onclick={() => void firmwareUpdate.close()}
          size="sm"
          variant="outline"
        >
          {t("dfu.cancel")}
        </Button>
        <Button
          disabled={firmwareUpdate.step === "connecting"}
          onclick={() => void firmwareUpdate.selectDevice()}
          size="sm"
        >
          {firmwareUpdate.step === "connecting"
            ? t("dfu.connecting")
            : t("dfu.selectDevice")}
        </Button>
      </Dialog.Footer>
    {:else if firmwareUpdate.step === "ready"}
      <div class="grid gap-2 text-sm">
        <p>
          {t("dfu.readyBody", { size: niceSize(firmwareUpdate.firmwareSize), name: firmwareUpdate.keyboardName })}
        </p>
        <pre
          class="rounded-md bg-muted p-2 font-mono text-xs break-all whitespace-pre-wrap">{firmwareUpdate.deviceSummary}{firmwareUpdate.memorySummary ===
          ""
            ? ""
            : `\n${firmwareUpdate.memorySummary}`}</pre>
        {#if firmwareUpdate.identityWarning !== null}
          <div
            class="grid gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3"
          >
            <p class="font-semibold text-destructive">{t("dfu.verifyTitle")}</p>
            <p>{firmwareUpdate.identityWarning}</p>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                bind:checked={firmwareUpdate.identityConfirmed}
                class="size-4"
              />
              <span>
                {t("dfu.confirmLabel", { name: firmwareUpdate.keyboardName })}
              </span>
            </label>
          </div>
        {/if}
        <p class="text-destructive">
          {t("dfu.doNotDisconnect")}
        </p>
      </div>
      <Dialog.Footer>
        <Button
          onclick={() => void firmwareUpdate.close()}
          size="sm"
          variant="outline"
        >
          {t("dfu.cancel")}
        </Button>
        <Button
          onclick={() => void firmwareUpdate.flash()}
          disabled={firmwareUpdate.identityWarning !== null &&
            !firmwareUpdate.identityConfirmed}
          size="sm"
        >
          {t("dfu.flash")}
        </Button>
      </Dialog.Footer>
    {:else if firmwareUpdate.step === "flashing"}
      <div class="grid gap-2 text-sm">
        <span>{firmwareUpdate.phase}</span>
        {#if firmwareUpdate.progress !== null}
          {@const { done, total } = firmwareUpdate.progress}
          <progress class="w-full" value={done} max={total ?? 100}></progress>
          <span class="text-muted-foreground">
            {niceSize(done)}{total === undefined ? "" : ` / ${niceSize(total)}`}
          </span>
        {/if}
      </div>
      <pre
        bind:this={logElement}
        class="max-h-40 overflow-y-auto rounded-md bg-muted p-2 font-mono text-xs break-all whitespace-pre-wrap">{firmwareUpdate.logs.join(
          "\n",
        )}</pre>
    {:else if firmwareUpdate.step === "done"}
      <div class="grid gap-2 text-sm">
        <p class="font-semibold text-primary">{t("dfu.doneTitle")}</p>
        <p class="text-muted-foreground">
          {t("dfu.doneBody")}
        </p>
      </div>
      <pre
        bind:this={logElement}
        class="max-h-40 overflow-y-auto rounded-md bg-muted p-2 font-mono text-xs break-all whitespace-pre-wrap">{firmwareUpdate.logs.join(
          "\n",
        )}</pre>
      <Dialog.Footer>
        <Button onclick={() => void firmwareUpdate.close()} size="sm">
          {t("dfu.close")}
        </Button>
      </Dialog.Footer>
    {:else if firmwareUpdate.step === "error"}
      <div class="grid gap-2 text-sm">
        <p class="text-destructive">{firmwareUpdate.error}</p>
        <p class="text-muted-foreground">
          {t("dfu.errorBody")}
        </p>
      </div>
      {#if firmwareUpdate.logs.length > 0}
        <pre
          bind:this={logElement}
          class="max-h-40 overflow-y-auto rounded-md bg-muted p-2 font-mono text-xs break-all whitespace-pre-wrap">{firmwareUpdate.logs.join(
            "\n",
          )}</pre>
      {/if}
      <Dialog.Footer>
        <Button
          onclick={() => void firmwareUpdate.close()}
          size="sm"
          variant="outline"
        >
          {t("dfu.close")}
        </Button>
        <Button onclick={() => void firmwareUpdate.retry()} size="sm">
          {t("dfu.tryAgain")}
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
