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
  import Switch from "$lib/components/switch.svelte"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Select from "$lib/components/ui/select"
  import { getLocale, locales, setLocale, t } from "$lib/i18n.svelte"
  import { keyboardContext } from "$lib/keyboard"
  import { cn, isFeatureAvailable, type WithoutChildren } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"
  import { optionsQueryContext } from "../queries/options-query.svelte"
  import { profileQueryContext } from "../queries/profile-query.svelte"
  import FirmwarePanel from "./firmware-panel.svelte"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const keyboard = keyboardContext.get()
  const {
    demo,
    version,
    metadata: { usbHighSpeed },
  } = keyboard

  const profileQuery = profileQueryContext.get()
  const optionsQuery = optionsQueryContext.get()
  const { current: options } = $derived(optionsQuery.options)
</script>

<div
  class={cn("mx-auto flex size-full max-w-3xl flex-col", className)}
  {...props}
>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{t("settings.languageTitle")}</span>
        <span class="text-muted-foreground">
          {t("settings.languageDescription")}
        </span>
      </div>
      <div>
        <Select.Root
          bind:value={
            () => getLocale(),
            (v) => {
              if (v === "ja" || v === "en") setLocale(v)
            }
          }
          type="single"
        >
          <Select.Trigger
            aria-label={t("settings.languageLabel")}
            class="w-48"
            size="sm"
          >
            {locales.find((locale) => locale.value === getLocale())?.label}
          </Select.Trigger>
          <Select.Content class="w-[var(--bits-select-anchor-width)]">
            {#each locales as locale (locale.value)}
              <Select.Item value={locale.value}>
                {locale.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
    {#if usbHighSpeed && isFeatureAvailable("pollingRateSwitch", version)}
      <Switch
        bind:checked={
          () => options?.highPollingRateEnabled ?? false,
          (v) =>
            options &&
            optionsQuery.set({
              data: { ...options, highPollingRateEnabled: v },
            })
        }
        id="8000hz-polling-rate"
        title={t("settings.pollingTitle")}
        description={t("settings.pollingDescription")}
      />
    {/if}
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{t("settings.restartTitle")}</span>
        <span class="text-muted-foreground">
          {t("settings.restartDescription")}
        </span>
      </div>
      <div>
        <Button
          disabled={demo}
          onclick={() => keyboard.reboot()}
          size="sm"
          variant="outline"
        >
          {t("settings.restartButton")}
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{t("settings.bootloaderTitle")}</span>
        <span class="text-muted-foreground">
          {t("settings.bootloaderDescription")}
        </span>
      </div>
      <div>
        <Button
          disabled={demo}
          onclick={() => keyboard.bootloader()}
          size="sm"
          variant="outline"
        >
          {t("settings.bootloaderButton")}
        </Button>
      </div>
    </div>
    <FirmwarePanel />
    <div class="flex flex-col gap-2">
      <div class="grid text-sm text-wrap">
        <span class="font-semibold">{t("settings.factoryTitle")}</span>
        <span class="text-muted-foreground">
          {t("settings.factoryDescription")}
        </span>
      </div>
      <div>
        <Dialog.Root>
          <Dialog.Trigger>
            {#snippet child({ props })}
              <Button
                disabled={demo}
                size="sm"
                variant="destructive"
                {...props}
              >
                {t("settings.factoryButton")}
              </Button>
            {/snippet}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("settings.factoryConfirmTitle")}</Dialog.Title>
              <Dialog.Description>
                {t("settings.factoryConfirmDescription")}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close>
                {#snippet child({ props })}
                  <Button size="sm" variant="outline" {...props}
                    >{t("settings.cancel")}</Button
                  >
                {/snippet}
              </Dialog.Close>
              <Dialog.Close onclick={() => profileQuery.factoryReset()}>
                {#snippet child({ props })}
                  <Button size="sm" variant="destructive" {...props}>
                    {t("settings.factoryButton")}
                  </Button>
                {/snippet}
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  </FixedScrollArea>
</div>
