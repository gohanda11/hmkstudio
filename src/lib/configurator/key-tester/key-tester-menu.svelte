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
  import * as KeyTester from "$lib/components/key-tester"
  import { keyTesterStateContext } from "$lib/components/key-tester/context.svelte"
  import { Button } from "$lib/components/ui/button"
  import { t } from "$lib/i18n.svelte"
  import { keyTesterLatchedContext } from "./latched-state.svelte"

  const tester = keyTesterStateContext.get()
  const latched = keyTesterLatchedContext.get()

  function resetTester() {
    // Clear draining key events first so the keyboard's latch effect cannot
    // re-latch released keys after the latched set is cleared.
    tester.keyEvents.length = 0
    latched.reset()
  }
</script>

<FixedScrollArea class="flex flex-col gap-4 p-4">
  <div class="flex justify-end">
    <Button
      disabled={latched.codes.size === 0 && tester.keyEvents.length === 0}
      onclick={resetTester}
      size="sm"
      variant="outline"
    >
      {t("tester.reset")}
    </Button>
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-sm font-medium">{t("tester.pressedKeys")}</div>
    <KeyTester.Press class="h-32 w-full" />
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-sm font-medium">{t("tester.releasedKeys")}</div>
    <KeyTester.Release class="h-32 w-full" />
  </div>
</FixedScrollArea>
