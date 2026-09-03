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
  import { DownloadIcon, UploadIcon } from "@lucide/svelte"
  import { Button } from "$lib/components/ui/button"
  import { keyboardContext } from "$lib/keyboard"
  import { toast } from "svelte-sonner"
  import z from "zod"
  import { globalStateContext } from "./context.svelte"
  import { KeyboardConfig } from "./lib/keyboard-config.svelte"

  const { name } = keyboardContext.get().metadata
  const globalState = globalStateContext.get()
  const { profile } = $derived(globalState)
  const keyboardConfig = new KeyboardConfig()

  let fileRef: HTMLInputElement | null = $state(null)
  let anchorRef: HTMLAnchorElement | null = $state(null)

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
        toast.success(`Successfully imported Profile ${profile}.`)
      } catch (err) {
        if (err instanceof SyntaxError) {
          toast.error(
            `Failed to import Profile ${profile}: The selected file is not a valid JSON.`,
          )
        } else if (err instanceof z.ZodError) {
          toast.error(
            `Failed to import Profile ${profile}: ${formatZodError(err)}`,
          )
          console.error(z.treeifyError(err))
        } else {
          toast.error(`Failed to import Profile ${profile}: ${String(err)}`)
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
      toast.success(`Successfully exported Profile ${profile}.`)
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          `Failed to export Profile ${profile}: ${formatZodError(err)}`,
        )
        console.error(z.treeifyError(err))
      } else {
        toast.error(`Failed to export Profile ${profile}: ${String(err)}`)
      }
    }
  }
</script>

<Button onclick={importProfile} size="icon" variant="outline">
  <UploadIcon />
  <span class="sr-only">Import Profile</span>
</Button>
<Button onclick={exportProfile} size="icon" variant="outline">
  <DownloadIcon />
  <span class="sr-only">Export Profile</span>
</Button>
<input
  bind:this={fileRef}
  accept="application/json"
  aria-hidden="true"
  hidden
  type="file"
/>
<a bind:this={anchorRef} aria-hidden="true" hidden href="#0"></a>
