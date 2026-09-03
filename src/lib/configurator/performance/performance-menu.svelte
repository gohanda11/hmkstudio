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
  import DistanceSlider from "$lib/components/distance-slider.svelte"
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import Switch from "$lib/components/switch.svelte"
  import { t } from "$lib/i18n.svelte"
  import {
    DEFAULT_ACTUATION_POINT,
    DEFAULT_RT_SENSITIVITY,
    type HMK_Actuation,
  } from "$lib/libhmk/actuation"
  import { setToIntervals } from "$lib/utils"
  import { performanceStateContext } from "../context.svelte"
  import { actuationQueryContext } from "../queries/actuation-query.svelte"

  const { keys } = $derived(performanceStateContext.get())

  const actuationQuery = actuationQueryContext.get()
  const { current: actuationMap } = $derived(actuationQuery.actuationMap)

  const { disabled, currentActuation, rtEnabled, separatedRT } = $derived.by(
    () => {
      if (keys.size === 0 || !actuationMap) {
        return { disabled: true } as const
      }

      const [firstKey] = keys
      const currentActuation = actuationMap[firstKey]
      return {
        disabled: false,
        currentActuation,
        rtEnabled: currentActuation.rtDown > 0,
        separatedRT: currentActuation.rtUp > 0,
      } as const
    },
  )

  const updateActuation = (f: (actuation: HMK_Actuation) => HMK_Actuation) =>
    !disabled &&
    setToIntervals(keys).map(([offset, len]) =>
      actuationQuery.set({
        offset,
        data: Array(len).fill(f(currentActuation)),
      }),
    )
</script>

<div class="grid size-full grid-cols-[minmax(0,1fr)_24rem]">
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <DistanceSlider
      bind:committed={
        () => currentActuation?.actuationPoint ?? DEFAULT_ACTUATION_POINT,
        (v) =>
          updateActuation((actuation) => ({ ...actuation, actuationPoint: v }))
      }
      description={rtEnabled
        ? t("performance.actuationPointDescriptionRt")
        : t("performance.actuationPointDescription")}
      {disabled}
      title={t("performance.actuationPointTitle")}
    />
    <DistanceSlider
      bind:committed={
        () => currentActuation?.rtDown ?? DEFAULT_RT_SENSITIVITY,
        (v) => updateActuation((actuation) => ({ ...actuation, rtDown: v }))
      }
      description={separatedRT
        ? t("performance.rtPressDescriptionSeparated")
        : t("performance.rtSensitivityDescription")}
      disabled={disabled || !rtEnabled}
      title={separatedRT
        ? t("performance.rtPressTitle")
        : t("performance.rtSensitivityTitle")}
    />
    {#if separatedRT}
      <DistanceSlider
        bind:committed={
          () => currentActuation?.rtUp ?? DEFAULT_RT_SENSITIVITY,
          (v) => updateActuation((actuation) => ({ ...actuation, rtUp: v }))
        }
        description={t("performance.rtReleaseDescription")}
        disabled={disabled || !rtEnabled}
        title={t("performance.rtReleaseTitle")}
      />
    {/if}
  </FixedScrollArea>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <Switch
      bind:checked={
        () => rtEnabled ?? false,
        (v) =>
          updateActuation((actuation) => ({
            ...actuation,
            rtDown: v ? DEFAULT_RT_SENSITIVITY : 0,
            rtUp: 0,
            continuous: false,
          }))
      }
      description={t("performance.enableRtDescription")}
      {disabled}
      id="rapid-trigger"
      title={t("performance.enableRtTitle")}
    />

    <Switch
      bind:checked={
        () => separatedRT ?? false,
        (v) =>
          updateActuation((actuation) => ({
            ...actuation,
            rtUp: v ? DEFAULT_RT_SENSITIVITY : 0,
          }))
      }
      description={t("performance.separateSensitivityDescription")}
      disabled={disabled || !rtEnabled}
      id="separate-rt"
      title={t("performance.separateSensitivityTitle")}
    />
    <Switch
      bind:checked={
        () => currentActuation?.continuous ?? false,
        (v) =>
          updateActuation((actuation) => ({
            ...actuation,
            continuous: v,
          }))
      }
      description={t("performance.continuousDescription")}
      disabled={disabled || !rtEnabled}
      id="continuous-rapid-trigger"
      title={t("performance.continuousTitle")}
    />
  </FixedScrollArea>
</div>
