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
  import * as KeyboardEditor from "$lib/components/keyboard-editor"
  import type { WithoutChildren } from "$lib/utils"
  import type { ComponentProps } from "svelte"
  import RemapKeyboard from "./remap-keyboard.svelte"
  import RemapMenu from "./remap-menu.svelte"
  import RemapMenubar from "./remap-menubar.svelte"
  import RemapTesterStatus from "./remap-tester-status.svelte"
  import RemapToolbar from "./remap-toolbar.svelte"
  import { RemapTesterState, remapTesterContext } from "./tester-state.svelte"

  const {
    ...props
  }: WithoutChildren<ComponentProps<typeof KeyboardEditor.Root>> = $props()

  remapTesterContext.set(new RemapTesterState())

  let testerMode = $state(false)
</script>

<KeyboardEditor.Root {...props}>
  <KeyboardEditor.Pane>
    <div class="flex h-full min-h-0 flex-1 flex-row">
      <div class="flex min-w-0 flex-1 flex-col">
        <RemapKeyboard {testerMode} />
        {#if testerMode}
          <RemapTesterStatus />
        {/if}
        <RemapMenubar />
      </div>
      <RemapToolbar bind:testerMode />
    </div>
  </KeyboardEditor.Pane>
  <KeyboardEditor.Handle />
  <KeyboardEditor.Pane>
    <KeyboardEditor.Container>
      <RemapMenu {testerMode} />
    </KeyboardEditor.Container>
  </KeyboardEditor.Pane>
</KeyboardEditor.Root>
