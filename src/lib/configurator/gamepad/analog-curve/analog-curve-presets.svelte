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
  import { Button } from "$lib/components/ui/button"
  import { analogCurvePresets } from "$lib/configurator/lib/gamepad"
  import { gamepadQueryContext } from "$lib/configurator/queries/gamepad-query.svelte"
  import { t } from "$lib/i18n.svelte"
  import { HMK_MAX_DISTANCE, HMK_MIN_DISTANCE } from "$lib/libhmk"

  const gamepadQuery = gamepadQueryContext.get()
  const { current: options } = $derived(gamepadQuery.gamepadOptions)

  function presetLabel(name: string): string {
    switch (name) {
      case "Aggressive":
        return t("gamepad.analogCurve.presetAggressive")
      case "Slow":
        return t("gamepad.analogCurve.presetSlow")
      case "Smooth":
        return t("gamepad.analogCurve.presetSmooth")
      case "Step":
        return t("gamepad.analogCurve.presetStep")
      case "Instant":
        return t("gamepad.analogCurve.presetInstant")
      case "Digital":
        return t("gamepad.analogCurve.presetDigital")
      case "Linear":
      default:
        return t("gamepad.analogCurve.presetLinear")
    }
  }
</script>

<div class="flex flex-wrap gap-2">
  {#each analogCurvePresets as { name, curve } (name)}
    <Button
      class="size-24 flex-col"
      disabled={!options}
      onclick={() =>
        options &&
        gamepadQuery.setOptions({ data: { ...options, analogCurve: curve } })}
      size="icon"
      variant="outline"
    >
      <svg
        class="size-10"
        preserveAspectRatio="none"
        viewBox="{HMK_MIN_DISTANCE} 0 {HMK_MAX_DISTANCE - HMK_MIN_DISTANCE} 255"
      >
        <polygon
          class="fill-primary/30"
          points={[
            ...curve.map(({ x, y }) => `${x},${255 - y}`),
            `${curve[3].x},255`,
            `${curve[0].x},255`,
          ].join(",")}
        />
        <polyline
          class="fill-none stroke-primary stroke-3"
          points={curve.map(({ x, y }) => `${x},${255 - y}`).join(",")}
          vector-effect="non-scaling-stroke"
        />
      </svg>
      {presetLabel(name)}
    </Button>
  {/each}
</div>
