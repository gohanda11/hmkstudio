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
</script>

<FixedScrollArea class="flex flex-col gap-4 p-4">
  <div class="flex flex-col gap-2">
    <div class="text-sm font-medium">Pressed Keys</div>
    <KeyTester.Press class="h-32 w-full" />
  </div>
  <div class="flex flex-col gap-2">
    <div class="text-sm font-medium">Released Keys</div>
    <KeyTester.Release class="h-32 w-full" />
  </div>
</FixedScrollArea>
