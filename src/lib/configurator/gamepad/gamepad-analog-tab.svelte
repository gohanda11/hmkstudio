<script lang="ts">
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import Switch from "$lib/components/switch.svelte"
  import { t } from "$lib/i18n.svelte"
  import { cn, type WithoutChildren } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"
  import { gamepadQueryContext } from "../queries/gamepad-query.svelte"
  import AnalogCurve from "./analog-curve/analog-curve.svelte"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const gamepadQuery = gamepadQueryContext.get()
  const { current: options } = $derived(gamepadQuery.gamepadOptions)
</script>

<div class={cn("grid grid-cols-[minmax(0,1fr)_28rem]", className)} {...props}>
  <FixedScrollArea class="flex flex-col gap-4 p-6 pt-2 pr-4">
    <div class="grid text-sm">
      <span class="font-medium">{t("gamepad.analog.title")}</span>
      <span class="text-muted-foreground">
        {t("gamepad.analog.description")}
      </span>
    </div>
    <AnalogCurve />
  </FixedScrollArea>
  <FixedScrollArea class="flex flex-col gap-4 p-6 pt-2 pl-4">
    <Switch
      bind:checked={
        () => options?.squareJoystick ?? false,
        (v) =>
          options &&
          gamepadQuery.setOptions({
            data: { ...options, squareJoystick: v },
          })
      }
      description={t("gamepad.analog.squareDescription")}
      disabled={!options}
      id="square-joystick"
      title={t("gamepad.analog.squareTitle")}
    />
    <Switch
      bind:checked={
        () => options?.snappyJoystick ?? false,
        (v) =>
          options &&
          gamepadQuery.setOptions({
            data: { ...options, snappyJoystick: v },
          })
      }
      description={t("gamepad.analog.snappyDescription")}
      disabled={!options}
      id="snappy-joystick"
      title={t("gamepad.analog.snappyTitle")}
    />
  </FixedScrollArea>
</div>
