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
  import * as KeyTester from "$lib/components/key-tester"
  import type { WithoutChildren } from "$lib/utils"
  import type { ComponentProps } from "svelte"
  import KeyTesterKeyboard from "./key-tester-keyboard.svelte"
  import KeyTesterMenu from "./key-tester-menu.svelte"
  import {
    KeyTesterLatchedState,
    keyTesterLatchedContext,
  } from "./latched-state.svelte"

  keyTesterLatchedContext.set(new KeyTesterLatchedState())

  const {
    ...props
  }: WithoutChildren<ComponentProps<typeof KeyboardEditor.Root>> = $props()
</script>

<KeyTester.Root>
  <KeyboardEditor.Root {...props}>
    <KeyboardEditor.Pane>
      <KeyTesterKeyboard />
    </KeyboardEditor.Pane>
    <KeyboardEditor.Handle />
    <KeyboardEditor.Pane>
      <KeyboardEditor.Container>
        <KeyTesterMenu />
      </KeyboardEditor.Container>
    </KeyboardEditor.Pane>
  </KeyboardEditor.Root>
</KeyTester.Root>
