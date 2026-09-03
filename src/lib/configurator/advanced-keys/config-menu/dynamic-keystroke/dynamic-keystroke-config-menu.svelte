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
  import * as Tabs from "$lib/components/ui/tabs"
  import { t } from "$lib/i18n.svelte"
  import KeyTesterTab from "../key-tester-tab.svelte"
  import TickRateSlider from "../tick-rate-slider.svelte"
  import DynamicKeystrokeActions from "./actions/actions.svelte"
  import {
    DKSConfigMenuState,
    dksConfigMenuStateContext,
  } from "./context.svelte"
  import DynamicKeystrokeBindingsTab from "./dynamic-keystroke-bindings-tab.svelte"
  import DynamicKeystrokePerformanceTab from "./dynamic-keystroke-performance-tab.svelte"

  dksConfigMenuStateContext.set(new DKSConfigMenuState())
</script>

<FixedScrollArea class="flex flex-col gap-4 p-4 pt-0">
  <div class="grid text-sm">
    <span class="font-medium">{t("advkeys.dks.configureTitle")}</span>
    <span class="text-muted-foreground">
      {t("advkeys.dks.configureDescription")}
    </span>
  </div>
  <DynamicKeystrokeActions />
</FixedScrollArea>
<FixedScrollArea class="flex flex-col gap-4 p-4 pt-0">
  <Tabs.Root value="bindings">
    <Tabs.List>
      <Tabs.Trigger value="bindings">{t("advkeys.tabs.bindings")}</Tabs.Trigger>
      <Tabs.Trigger value="performance">{t("advkeys.tabs.performance")}</Tabs.Trigger>
      <Tabs.Trigger value="advanced">{t("advkeys.tabs.advanced")}</Tabs.Trigger>
      <Tabs.Trigger value="key-tester">{t("advkeys.tabs.keyTester")}</Tabs.Trigger>
    </Tabs.List>
    <div class="p-2">
      <Tabs.Content value="bindings">
        {#snippet child({ props })}
          <DynamicKeystrokeBindingsTab {...props} />
        {/snippet}
      </Tabs.Content>
      <Tabs.Content value="performance">
        {#snippet child({ props })}
          <DynamicKeystrokePerformanceTab {...props} />
        {/snippet}
      </Tabs.Content>
      <Tabs.Content value="advanced">
        {#snippet child({ props })}
          <TickRateSlider {...props} />
        {/snippet}
      </Tabs.Content>
      <Tabs.Content value="key-tester">
        {#snippet child({ props })}
          <KeyTesterTab {...props} />
        {/snippet}
      </Tabs.Content>
    </div>
  </Tabs.Root>
</FixedScrollArea>
