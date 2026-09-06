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
  import { KeyButton } from "$lib/components/key-button"
  import KeycodeAccordion from "$lib/components/keycode-accordion.svelte"
  import { KeycodeButton } from "$lib/components/keycode-button"
  import Switch from "$lib/components/switch.svelte"
  import { Button } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Tabs from "$lib/components/ui/tabs"
  import * as ToggleGroup from "$lib/components/ui/toggle-group"
  import { t } from "$lib/i18n.svelte"
  import { keyboardContext } from "$lib/keyboard"
  import { getKeycodeMetadata } from "$lib/keycodes"
  import { HMK_AKType } from "$lib/libhmk/advanced-keys"
  import { unitToStyle } from "$lib/ui"
  import { cn } from "$lib/utils"
  import { untrack } from "svelte"
  import { remapStateContext } from "../context.svelte"
  import { advancedKeysQueryContext } from "../queries/advanced-keys-query.svelte"
  import { keymapQueryContext } from "../queries/keymap-query.svelte"
  import { macrosQueryContext } from "../queries/macros-query.svelte"
  import {
    applyModifierCombo,
    findMacroIndex,
    modifierFamilies,
    modifierFamilyOf,
    modifierSideOf,
    parseModifierCombo,
    type ModifierSide,
  } from "./modifier-combo"
  import { applyModtap, findModtapIndex } from "./modtap"

  let { open = $bindable(false), key }: { open?: boolean; key: number | null } =
    $props()

  const { metadata } = keyboardContext.get()
  const remapState = remapStateContext.get()

  const keymapQuery = keymapQueryContext.get()
  const advancedKeysQuery = advancedKeysQueryContext.get()
  const macrosQuery = macrosQueryContext.get()
  const advancedKeys = $derived(advancedKeysQuery.advancedKeys.current)
  const macros = $derived(macrosQuery.macros.current)

  let editLayer = $state(0)
  let editKey = $state(0)
  let tab = $state("key")
  let binding = $state<"tap" | "hold" | "">("")
  let tapKeycode = $state<number | null>(null)
  let holdKeycode = $state<number | null>(null)
  let holdOnOtherKeyPress = $state(true)

  // Modifier-combo ("Key" tab) state. The base key is display-only here; it is
  // changed from the right-side menu, matching the tab guidance.
  let baseKeycode = $state<number | null>(null)
  let modSide = $state<ModifierSide>("left")
  let modCtrl = $state(false)
  let modShift = $state(false)
  let modAlt = $state(false)
  let modGui = $state(false)

  $effect(() => {
    if (!open || key === null) return
    const layer = remapState.layer
    const target = key
    // Tracked so a late-loading macro table re-initializes the combo state.
    const macroTable = macros
    untrack(() => {
      editLayer = layer
      editKey = target
      tab = "key"
      binding = ""
      baseKeycode = keymapQuery.keymap.current?.[layer]?.[target] ?? null
      modSide = "left"
      modCtrl = modShift = modAlt = modGui = false
      const index = advancedKeys
        ? findModtapIndex(advancedKeys, layer, target)
        : -1
      const action =
        advancedKeys && index !== -1 ? advancedKeys[index].action : null
      if (action?.type === HMK_AKType.TAP_HOLD) {
        tapKeycode = action.tapKeycode
        holdKeycode = action.holdKeycode
        holdOnOtherKeyPress =
          typeof action.holdOnOtherKeyPress === "boolean"
            ? action.holdOnOtherKeyPress
            : true
      } else {
        tapKeycode = keymapQuery.keymap.current?.[layer]?.[target] ?? null
        holdKeycode = null
        holdOnOtherKeyPress = true
        binding = "tap"
      }
      if (advancedKeys && macroTable) {
        const macroIndex = findMacroIndex(advancedKeys, layer, target)
        if (macroIndex !== -1) {
          const macroAction = advancedKeys[macroIndex].action
          if (macroAction.type === HMK_AKType.MACRO) {
            const combo = parseModifierCombo(macroTable, macroAction.head)
            if (combo) {
              baseKeycode = combo.base
              for (const mod of combo.mods) {
                const family = modifierFamilyOf(mod)
                if (family === "ctrl") modCtrl = true
                else if (family === "shift") modShift = true
                else if (family === "alt") modAlt = true
                else if (family === "gui") modGui = true
              }
              modSide = modifierSideOf(combo.mods[0]) ?? "left"
            }
          }
        }
      }
    })
  })

  const canApply = $derived.by(() => {
    if (!advancedKeys || tapKeycode === null || holdKeycode === null) {
      return false
    }
    // Slot availability is checked when applying: a tap-hold that cannot be
    // created because all Advanced Keys slots are in use is reported there.
    return true
  })

  const comboMods = $derived(
    modifierFamilies
      .filter(({ family }) =>
        family === "ctrl"
          ? modCtrl
          : family === "shift"
            ? modShift
            : family === "alt"
              ? modAlt
              : modGui,
      )
      .map((entry) => (modSide === "left" ? entry.left : entry.right)),
  )

  const comboSummary = $derived.by(() => {
    if (baseKeycode === null) return ""
    const parts = [
      ...comboMods.map((mod) =>
        getKeycodeMetadata(mod).name.replaceAll("\n", " "),
      ),
      getKeycodeMetadata(baseKeycode).name.replaceAll("\n", " "),
    ]
    return parts.join(" + ")
  })

  async function applyCombo() {
    if (!advancedKeys || !macros || baseKeycode === null) return
    if (
      await applyModifierCombo(
        metadata,
        advancedKeysQuery,
        macrosQuery,
        advancedKeys,
        macros,
        { layer: editLayer, key: editKey, base: baseKeycode, mods: comboMods },
      )
    ) {
      open = false
    }
  }

  async function apply() {
    if (!advancedKeys || tapKeycode === null || holdKeycode === null) return
    if (
      await applyModtap(
        metadata,
        advancedKeysQuery,
        macrosQuery,
        advancedKeys,
        macros ?? undefined,
        {
          layer: editLayer,
          key: editKey,
          tapKeycode,
          holdKeycode,
          holdOnOtherKeyPress,
        },
      )
    ) {
      open = false
    }
  }

  /** Selects the slot the next keycode pick should fill. */
  function arm(field: "tap" | "hold") {
    binding = field
  }
  function clearField(field: "tap" | "hold") {
    if (field === "tap") {
      tapKeycode = null
    } else {
      holdKeycode = null
    }
    binding = field
  }

  function selectBinding(keycode: number) {
    if (binding === "tap") {
      tapKeycode = keycode
      if (holdKeycode === null) binding = "hold"
    } else if (binding === "hold") {
      holdKeycode = keycode
      if (tapKeycode === null) binding = "tap"
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-xl">
    <Dialog.Header>
      <Dialog.Title>{t("dialog.editKey")}</Dialog.Title>
      <Dialog.Description>
        {t("dialog.editKeyDescription")}
      </Dialog.Description>
    </Dialog.Header>
    <Tabs.Root bind:value={tab}>
      <Tabs.List class="w-full">
        <Tabs.Trigger class="flex-1" value="key"
          >{t("dialog.combo")}</Tabs.Trigger
        >
        <Tabs.Trigger class="flex-1" value="tap-hold"
          >{t("dialog.tapHold")}</Tabs.Trigger
        >
      </Tabs.List>
      <Tabs.Content value="key">
        <div class="flex flex-col gap-4 py-2">
          <div class="flex items-center gap-3">
            <div class="rounded-md p-0.5" style={unitToStyle()}>
              {#if baseKeycode !== null}
                <KeycodeButton keycode={baseKeycode} />
              {/if}
            </div>
            <p class="text-sm text-muted-foreground">
              {t("dialog.baseKeyNote")}
            </p>
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium">{t("dialog.modifierSide")}</span>
            <ToggleGroup.Root
              bind:value={
                () => modSide,
                (v) => {
                  if (v === "left" || v === "right") modSide = v
                }
              }
              type="single"
              variant="outline"
            >
              <ToggleGroup.Item value="left"
                >{t("dialog.left")}</ToggleGroup.Item
              >
              <ToggleGroup.Item value="right"
                >{t("dialog.right")}</ToggleGroup.Item
              >
            </ToggleGroup.Root>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <Switch bind:checked={modCtrl} id="combo-ctrl" title="Ctrl" />
            <Switch bind:checked={modShift} id="combo-shift" title="Shift" />
            <Switch bind:checked={modAlt} id="combo-alt" title="Alt" />
            <Switch bind:checked={modGui} id="combo-gui" title="Win" />
          </div>
          <p class="text-sm text-muted-foreground">
            {#if comboMods.length === 0}
              {t("dialog.noModifiers")}
            {:else}
              {t("dialog.appliesAs", { summary: comboSummary })}
            {/if}
          </p>
        </div>
      </Tabs.Content>

      <Tabs.Content value="tap-hold">
        <div class="flex flex-col gap-4">
          <div class="grid place-items-center pt-2 text-base">
            <div class="flex">
              <div class="flex flex-col items-center text-center">
                <div class="text-muted-foreground">{t("dialog.tap")}</div>
                <div
                  class={cn(
                    "rounded-md p-0.5",
                    binding === "tap" && "ring-2 ring-ring",
                  )}
                  style={unitToStyle()}
                >
                  {#if tapKeycode !== null}
                    <KeycodeButton
                      keycode={tapKeycode}
                      onclick={() => arm("tap")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        clearField("tap")
                      }}
                    />
                  {:else}
                    <KeyButton
                      class="border-dashed font-normal text-muted-foreground"
                      onclick={() => arm("tap")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        arm("tap")
                      }}
                    >
                      <span>{t("dialog.assign")}</span>
                    </KeyButton>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col items-center text-center">
                <div class="text-muted-foreground">{t("dialog.hold")}</div>
                <div
                  class={cn(
                    "rounded-md p-0.5",
                    binding === "hold" && "ring-2 ring-ring",
                  )}
                  style={unitToStyle()}
                >
                  {#if holdKeycode !== null}
                    <KeycodeButton
                      keycode={holdKeycode}
                      onclick={() => arm("hold")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        clearField("hold")
                      }}
                    />
                  {:else}
                    <KeyButton
                      class="border-dashed font-normal text-muted-foreground"
                      onclick={() => arm("hold")}
                      oncontextmenu={(e) => {
                        e.preventDefault()
                        arm("hold")
                      }}
                    >
                      <span>{t("dialog.assign")}</span>
                    </KeyButton>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          <div class="h-56">
            <FixedScrollArea class="py-1">
              <KeycodeAccordion onKeycodeSelected={selectBinding} />
            </FixedScrollArea>
          </div>
          <Switch
            bind:checked={holdOnOtherKeyPress}
            description={t("advkeys.tapHold.holdOnOtherKeyPressDescription")}
            id="modtap-hold-on-other-key-press"
            title={t("advkeys.tapHold.holdOnOtherKeyPressTitle")}
          />
        </div>
      </Tabs.Content>
    </Tabs.Root>
    <Dialog.Footer>
      <Dialog.Close>
        {#snippet child({ props })}
          <Button size="sm" variant="outline" {...props}
            >{t("dialog.cancel")}</Button
          >
        {/snippet}
      </Dialog.Close>
      {#if tab === "key"}
        <Button
          disabled={baseKeycode === null}
          onclick={() => void applyCombo()}
          size="sm"
        >
          {t("dialog.apply")}
        </Button>
      {:else}
        <Button disabled={!canApply} onclick={() => void apply()} size="sm"
          >{t("dialog.apply")}</Button
        >
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
