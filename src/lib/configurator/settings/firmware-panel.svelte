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
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import {
    fetchFirmwareManifest,
    fetchLatestFirmwareVersion,
    isWebUSBSupported,
    resolveFirmwareEntry,
  } from "$lib/dfu/libhmk-dfu"
  import { keyboardContext } from "$lib/keyboard"
  import { displayVersion } from "$lib/utils"
  import { firmwareUpdate } from "./firmware-update.svelte"

  const keyboard = keyboardContext.get()
  const { demo, version, metadata } = keyboard

  let checking = $state(false)
  let checked = $state(false)
  let supported = $state(false)
  let latestVersion = $state<number | null>(null)
  let webUsb = $state(true)

  const updateAvailable = $derived(
    latestVersion !== null && latestVersion > version,
  )

  async function checkForUpdates() {
    checking = true
    try {
      const manifest = await fetchFirmwareManifest()
      supported = (await resolveFirmwareEntry(manifest, metadata)) !== undefined
      latestVersion = supported
        ? await fetchLatestFirmwareVersion(manifest.commit)
        : null
    } catch (error) {
      console.error("Failed to check for firmware updates:", error)
      supported = false
      latestVersion = null
    } finally {
      checking = false
      checked = true
    }
  }

  $effect(() => {
    webUsb = isWebUSBSupported()
    if (!demo) void checkForUpdates()
  })
</script>

<div class="flex flex-col gap-2">
  <div class="grid text-sm text-wrap">
    <span class="font-semibold">Firmware</span>
    <span class="text-muted-foreground">
      Current version: {displayVersion(version)}
    </span>
  </div>
  {#if checking}
    <span class="text-sm text-muted-foreground">Checking for updates...</span>
  {:else if checked && supported && latestVersion !== null}
    <div class="flex items-center gap-2 text-sm">
      <span class="text-muted-foreground">
        Latest version: {displayVersion(latestVersion)}
      </span>
      {#if updateAvailable}
        <Badge variant="destructive">New version available</Badge>
      {/if}
    </div>
    {#if !updateAvailable}
      <span class="text-sm text-muted-foreground">
        Your firmware is up to date.
      </span>
    {/if}
  {:else if checked && !supported}
    <span class="text-sm text-muted-foreground">
      No firmware build is available for {metadata.name}.
    </span>
  {:else if checked}
    <div class="flex items-center gap-2">
      <span class="text-sm text-destructive">Failed to check for updates.</span>
      <Button
        onclick={() => void checkForUpdates()}
        size="sm"
        variant="outline"
      >
        Retry
      </Button>
    </div>
  {/if}
  {#if !webUsb}
    <span class="text-sm text-muted-foreground">
      Firmware updates require WebUSB. Please use a Chromium-based browser
      (Chrome, Edge, etc.).
    </span>
  {/if}
  <div>
    <Button
      disabled={demo ||
        !webUsb ||
        (checked && !supported) ||
        firmwareUpdate.active}
      onclick={() => void firmwareUpdate.start(keyboard)}
      size="sm"
      variant="outline"
    >
      Update Firmware
    </Button>
  </div>
</div>
