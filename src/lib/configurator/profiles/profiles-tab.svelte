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
  import { EllipsisVerticalIcon } from "@lucide/svelte"
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
  import { keyboardContext } from "$lib/keyboard"
  import { cn, type WithoutChildren } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"
  import { profileQueryContext } from "../queries/profile-query.svelte"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const { numProfiles } = keyboardContext.get().metadata

  const profileQuery = profileQueryContext.get()
  const { current: currentProfile } = $derived(profileQuery.profile)
</script>

<div
  class={cn("mx-auto flex size-full max-w-3xl flex-col", className)}
  {...props}
>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <div class="grid shrink-0">
      <span class="font-semibold">Configure Profiles</span>
      <span class="text-sm text-muted-foreground">
        Manage your keyboard profiles here. Use the menu on each profile to
        duplicate it from another profile or restore its default bindings.
        Switch, import, and export the active profile using the toolbar at the
        top.
      </span>
    </div>
    <div class="grid grid-cols-2 gap-4">
      {#each { length: numProfiles }, profile (profile)}
        <div
          class="flex items-center gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="grid flex-1 truncate font-semibold">
            Profile {profile}
          </div>
          <div class="flex shrink-0 items-center gap-2">
            {#if profile === currentProfile}
              <Badge>Active</Badge>
            {/if}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                {#snippet child({ props })}
                  <Button size="icon" variant="ghost" {...props}>
                    <EllipsisVerticalIcon />
                    <span class="sr-only">Open Menu</span>
                  </Button>
                {/snippet}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start" class="w-40">
                <DropdownMenu.Group>
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>
                      Duplicate From
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                      {#each { length: numProfiles }, srcProfile (srcProfile)}
                        {#if srcProfile !== profile}
                          <DropdownMenu.Item
                            onSelect={() =>
                              profileQuery.duplicateProfile({
                                profile,
                                srcProfile,
                              })}
                          >
                            Profile {srcProfile}
                          </DropdownMenu.Item>
                        {/if}
                      {/each}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>
                  <DropdownMenu.Item
                    onSelect={() => profileQuery.resetProfile({ profile })}
                  >
                    Restore Default
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      {/each}
    </div>
  </FixedScrollArea>
</div>
