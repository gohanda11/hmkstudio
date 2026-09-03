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
  import { niceSize } from "$lib/dfu/libhmk-dfu"
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
      <Dialog.Title>Firmware Update</Dialog.Title>
      <Dialog.Description>
        {firmwareUpdate.keyboardName}
        {#if firmwareUpdate.latestVersion !== null}
          - {displayVersion(firmwareUpdate.currentVersion)} to
          {displayVersion(firmwareUpdate.latestVersion)}
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if firmwareUpdate.step === "preparing"}
      <p class="text-sm text-muted-foreground">
        Downloading the latest firmware from GitHub...
      </p>
    {:else if firmwareUpdate.step === "select" || firmwareUpdate.step === "connecting"}
      <div class="grid gap-2 text-sm text-wrap">
        <p>
          The keyboard is restarting in DFU bootloader mode. Click "Select DFU
          Device" and choose the DFU device (e.g. "STM32 BOOTLOADER" or "AT32
          DFU", VID 0x2E3C/0x0483, PID 0xDF11). If several DFU devices are
          listed, choose the one that appeared when your keyboard restarted.
        </p>
        <p class="text-muted-foreground">
          On Windows, the DFU device requires a WinUSB driver (installable with
          Zadig). The keyboard disconnects from the configurator during this
          process; this is expected. The update waits {DFU_SELECT_TIMEOUT_S}
          seconds for the DFU device to be selected.
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
          Cancel
        </Button>
        <Button
          disabled={firmwareUpdate.step === "connecting"}
          onclick={() => void firmwareUpdate.selectDevice()}
          size="sm"
        >
          {firmwareUpdate.step === "connecting"
            ? "Connecting..."
            : "Select DFU Device"}
        </Button>
      </Dialog.Footer>
    {:else if firmwareUpdate.step === "ready"}
      <div class="grid gap-2 text-sm">
        <p>
          DFU device connected. Ready to write {niceSize(
            firmwareUpdate.firmwareSize,
          )} of firmware to {firmwareUpdate.keyboardName}.
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
            <p class="font-semibold text-destructive">Verify the DFU device</p>
            <p>{firmwareUpdate.identityWarning}</p>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                bind:checked={firmwareUpdate.identityConfirmed}
                class="size-4"
              />
              <span>
                I confirm that this DFU device belongs to the "{firmwareUpdate.keyboardName}"
                keyboard I am updating.
              </span>
            </label>
          </div>
        {/if}
        <p class="text-destructive">
          Do not disconnect the keyboard while flashing.
        </p>
      </div>
      <Dialog.Footer>
        <Button
          onclick={() => void firmwareUpdate.close()}
          size="sm"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onclick={() => void firmwareUpdate.flash()}
          disabled={firmwareUpdate.identityWarning !== null &&
            !firmwareUpdate.identityConfirmed}
          size="sm"
        >
          Flash Firmware
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
        <p class="font-semibold text-primary">Firmware updated successfully.</p>
        <p class="text-muted-foreground">
          The keyboard is restarting with the new firmware. Close this dialog
          and connect the keyboard again.
        </p>
      </div>
      <pre
        bind:this={logElement}
        class="max-h-40 overflow-y-auto rounded-md bg-muted p-2 font-mono text-xs break-all whitespace-pre-wrap">{firmwareUpdate.logs.join(
          "\n",
        )}</pre>
      <Dialog.Footer>
        <Button onclick={() => void firmwareUpdate.close()} size="sm">
          Close
        </Button>
      </Dialog.Footer>
    {:else if firmwareUpdate.step === "error"}
      <div class="grid gap-2 text-sm">
        <p class="text-destructive">{firmwareUpdate.error}</p>
        <p class="text-muted-foreground">
          If the keyboard became unresponsive, unplug it and plug it back in,
          then try again. On Windows, make sure a WinUSB driver is bound to the
          DFU device.
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
          Close
        </Button>
        <Button onclick={() => void firmwareUpdate.retry()} size="sm">
          Try Again
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
