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
  import CommitSlider from "$lib/components/commit-slider.svelte"
  import FixedScrollArea from "$lib/components/fixed-scroll-area.svelte"
  import LayerSelect from "$lib/components/layer-select.svelte"
  import Switch from "$lib/components/switch.svelte"
  import { Button } from "$lib/components/ui/button"
  import * as Select from "$lib/components/ui/select"
  import { t } from "$lib/i18n.svelte"
  import { keyboardContext } from "$lib/keyboard"
  import {
    defaultPointingConfig,
    defaultPointingSideConfig,
    HMK_POINTING_CONFIG_MIN_VERSION,
    HMK_POINTING_CONFIG_V2_VERSION,
    HMK_POINTING_CONFIG_V3_VERSION,
    HMK_POINTING_SCROLL_LAYER_OFF,
    HMK_POINTING_SIDE_LEFT,
    HMK_POINTING_SIDE_RIGHT,
    type HMK_PointingSideConfig,
  } from "$lib/libhmk/commands/pointing-config"
  import { cn, displayVersion, type WithoutChildren } from "$lib/utils"
  import { toast } from "svelte-sonner"
  import type { HTMLAttributes } from "svelte/elements"
  import { pointingQueryContext } from "../queries/pointing-query.svelte"
  import PointingFigure from "./pointing-figure.svelte"

  const {
    class: className,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> = $props()

  const keyboard = keyboardContext.get()
  const {
    version,
    metadata: { numLayers },
  } = keyboard

  const pointingQuery = pointingQueryContext.get()
  const { current: result, error: resultError } = $derived(pointingQuery.result)
  const { error: leftError } = $derived(pointingQuery.left)
  const { error: rightError } = $derived(pointingQuery.right)
  const queryError = $derived(resultError ?? leftError ?? rightError)
  const config = $derived(result?.config)

  const extendedAvailable = version >= HMK_POINTING_CONFIG_V2_VERSION
  const sideAvailable = version >= HMK_POINTING_CONFIG_V3_VERSION
  const pointingAvailable = version >= HMK_POINTING_CONFIG_MIN_VERSION

  const left = $derived(pointingQuery.left.current)
  const right = $derived(pointingQuery.right.current)
  const leftConfig = $derived(left?.config)
  const rightConfig = $derived(right?.config)
  // While a side result is still loading, keep its card visible (disabled)
  // so dual hardware previews both halves without layout shift.
  const showLeft = $derived(left === undefined || left.supported)
  const showRight = $derived(right === undefined || right.supported)

  function orientOf(side: number | null) {
    if (side === null) return config
    return side === HMK_POINTING_SIDE_LEFT ? leftConfig : rightConfig
  }

  function setOrient(
    side: number | null,
    patch: Partial<HMK_PointingSideConfig>,
  ) {
    if (side === null) {
      if (config) void pointingQuery.set({ data: { ...config, ...patch } })
      return
    }
    const sideCfg = side === HMK_POINTING_SIDE_LEFT ? leftConfig : rightConfig
    if (sideCfg)
      void pointingQuery.setSide({ side, data: { ...sideCfg, ...patch } })
  }

  function orientTitle(side: number | null) {
    if (side === null) return t("pointing.orientationTitle")
    return t(
      side === HMK_POINTING_SIDE_LEFT
        ? "pointing.orientationLeftTitle"
        : "pointing.orientationRightTitle",
    )
  }

  function orientDescription(side: number | null) {
    if (side === null) return t("pointing.orientationDescription")
    return t("pointing.orientationSideDescription", {
      side: t(
        side === HMK_POINTING_SIDE_LEFT
          ? "pointing.leftSide"
          : "pointing.rightSide",
      ),
    })
  }

  const scrollLayer = $derived(
    config?.scrollLayer ?? defaultPointingConfig.scrollLayer,
  )
  const scrollLayerActive = $derived(
    scrollLayer !== HMK_POINTING_SCROLL_LAYER_OFF,
  )
  const autoMouseLayerEnabled = $derived(
    config?.autoMouseLayerEnabled ??
      defaultPointingConfig.autoMouseLayerEnabled,
  )
  const autoMouseLayer = $derived(
    config?.autoMouseLayer ?? defaultPointingConfig.autoMouseLayer,
  )

  // Auto mouse and scroll cannot use the same layer: while the pointing
  // device moves, both behaviors would target the same layer.
  const layerConflict = $derived(
    autoMouseLayerEnabled &&
      scrollLayerActive &&
      autoMouseLayer === scrollLayer,
  )

  function reportLayerConflict() {
    toast.error(t("pointing.layerConflict"))
  }

  function scrollLayerLabel(layer: number) {
    return layer === HMK_POINTING_SCROLL_LAYER_OFF
      ? t("pointing.disabled")
      : t("pointing.layer", { layer })
  }

  function snapAxisLabel(axis: number) {
    return axis === 1
      ? t("pointing.xAxis")
      : axis === 2
        ? t("pointing.yAxis")
        : t("pointing.disabled")
  }
</script>

<div
  class={cn("mx-auto flex size-full max-w-6xl flex-col", className)}
  {...props}
>
  {#snippet orientationCard(side: number | null)}
    {@const orient = orientOf(side)}
    {@const orientKey = side ?? "global"}
    <div
      class="grid content-start gap-2.5 rounded-lg border bg-card p-3 shadow-sm"
    >
      <div class="grid">
        <span class="text-[13px] leading-tight font-semibold"
          >{orientTitle(side)}</span
        >
        <span class="text-xs leading-snug text-muted-foreground">
          {orientDescription(side)}
        </span>
      </div>
      <div class="flex items-start gap-2">
        <CommitSlider
          bind:committed={
            () => orient?.rotationDeg ?? defaultPointingSideConfig.rotationDeg,
            (v) => setOrient(side, { rotationDeg: v })
          }
          class="min-w-0 flex-1"
          description={t("pointing.rotationDescription")}
          disabled={!orient}
          display={(v) => `${v}°`}
          max={359}
          min={0}
          step={1}
          title={t("pointing.sensorRotation")}
        />
        <PointingFigure
          figure="rotation"
          angle={orient?.rotationDeg ?? defaultPointingSideConfig.rotationDeg}
        />
      </div>
      <div class="flex items-start gap-2">
        <Switch
          bind:checked={
            () => orient?.invertX ?? defaultPointingSideConfig.invertX,
            (v) => setOrient(side, { invertX: v })
          }
          class="min-w-0 flex-1"
          description={t("pointing.invertXDescription")}
          disabled={!orient}
          id={`pointing-invert-x-${orientKey}`}
          title={t("pointing.invertX")}
        />
        <PointingFigure
          figure="invert-x"
          on={orient?.invertX ?? defaultPointingSideConfig.invertX}
        />
      </div>
      <div class="flex items-start gap-2">
        <Switch
          bind:checked={
            () => orient?.invertY ?? defaultPointingSideConfig.invertY,
            (v) => setOrient(side, { invertY: v })
          }
          class="min-w-0 flex-1"
          description={t("pointing.invertYDescription")}
          disabled={!orient}
          id={`pointing-invert-y-${orientKey}`}
          title={t("pointing.invertY")}
        />
        <PointingFigure
          figure="invert-y"
          on={orient?.invertY ?? defaultPointingSideConfig.invertY}
        />
      </div>
      <div class="flex items-start gap-2">
        <Switch
          bind:checked={
            () => orient?.swapAxes ?? defaultPointingSideConfig.swapAxes,
            (v) => setOrient(side, { swapAxes: v })
          }
          class="min-w-0 flex-1"
          description={t("pointing.swapAxesDescription")}
          disabled={!orient}
          id={`pointing-swap-axes-${orientKey}`}
          title={t("pointing.swapAxes")}
        />
        <PointingFigure
          figure="swap"
          on={orient?.swapAxes ?? defaultPointingSideConfig.swapAxes}
        />
      </div>
    </div>
  {/snippet}
  <FixedScrollArea class="flex flex-col gap-2.5 p-3">
    <div class="flex flex-wrap items-baseline gap-x-2 text-wrap">
      <span class="text-sm font-semibold">{t("pointing.title")}</span>
      <span class="text-xs text-muted-foreground">
        {t("pointing.description")}
      </span>
    </div>
    {#if !pointingAvailable}
      <div class="grid gap-1.5 rounded-lg border bg-card p-3 text-sm shadow-sm">
        <span class="font-semibold">{t("pointing.firmwareRequired")}</span>
        <span class="text-muted-foreground">
          {t("pointing.firmwareRequiredDescription", {
            min: displayVersion(HMK_POINTING_CONFIG_MIN_VERSION),
            version: displayVersion(version),
          })}
        </span>
      </div>
    {:else if queryError && !result}
      <div class="grid gap-1.5 rounded-lg border bg-card p-3 text-sm shadow-sm">
        <span class="font-semibold">{t("pointing.loadFailed")}</span>
        <span class="text-muted-foreground">{queryError.message}</span>
        <div>
          <Button
            onclick={() => {
              pointingQuery.result.refetch()
              pointingQuery.left.refetch()
              pointingQuery.right.refetch()
            }}
            size="sm"
            variant="outline"
          >
            {t("pointing.retry")}
          </Button>
        </div>
      </div>
    {:else if result && !result.supported}
      <div class="grid gap-1.5 rounded-lg border bg-card p-3 text-sm shadow-sm">
        <span class="font-semibold">{t("pointing.noDevice")}</span>
        <span class="text-muted-foreground">
          {t("pointing.noDeviceDescription")}
        </span>
      </div>
    {:else}
      <div
        class="grid items-stretch gap-2.5 text-sm xl:grid-cols-2 2xl:grid-cols-3 [&_p.text-sm]:text-xs [&_p.text-sm]:leading-snug [&_span.text-muted-foreground]:text-xs [&_span.text-muted-foreground]:leading-snug"
      >
        <div
          class="grid content-start gap-2.5 rounded-lg border bg-card p-3 shadow-sm"
        >
          <div class="grid">
            <span class="text-[13px] leading-tight font-semibold"
              >{t("pointing.deviceTitle")}</span
            >
            <span class="text-xs leading-snug text-muted-foreground">
              {t("pointing.deviceDescription")}
            </span>
          </div>
          <Switch
            bind:checked={
              () => config?.enabled ?? defaultPointingConfig.enabled,
              (v) =>
                config && pointingQuery.set({ data: { ...config, enabled: v } })
            }
            description={t("pointing.enabledDescription")}
            disabled={!config}
            id="pointing-enabled"
            title={t("pointing.enabled")}
          />
          <div class="flex items-start gap-2">
            <CommitSlider
              bind:committed={
                () => config?.cpi ?? defaultPointingConfig.cpi,
                (v) =>
                  config && pointingQuery.set({ data: { ...config, cpi: v } })
              }
              class="min-w-0 flex-1"
              description={t("pointing.cpiDescription")}
              disabled={!config}
              display={(v) => String(v)}
              max={3200}
              min={200}
              step={200}
              title="CPI"
            />
            <PointingFigure figure="cpi" />
          </div>
        </div>
        {#if layerConflict}
          <div
            class="grid gap-1 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm shadow-sm xl:col-span-2 2xl:col-span-3"
          >
            <span
              class="text-[13px] leading-tight font-semibold text-destructive"
              >{t("pointing.conflictTitle")}</span
            >
            <span class="text-xs leading-snug text-muted-foreground">
              {t("pointing.conflictDescription")}
            </span>
          </div>
        {/if}
        <div
          class="grid content-start gap-2.5 rounded-lg border bg-card p-3 shadow-sm"
        >
          <div class="grid">
            <span class="text-[13px] leading-tight font-semibold"
              >{t("pointing.autoMouseTitle")}</span
            >
            <span class="text-xs leading-snug text-muted-foreground">
              {t("pointing.autoMouseDescription")}
            </span>
          </div>
          <div class="flex items-start gap-2">
            <Switch
              bind:checked={
                () =>
                  config?.autoMouseLayerEnabled ??
                  defaultPointingConfig.autoMouseLayerEnabled,
                (v) => {
                  if (!config) return
                  if (
                    v &&
                    scrollLayerActive &&
                    config.autoMouseLayer === scrollLayer
                  ) {
                    reportLayerConflict()
                    return
                  }
                  void pointingQuery.set({
                    data: { ...config, autoMouseLayerEnabled: v },
                  })
                }
              }
              class="min-w-0 flex-1"
              description={t("pointing.enableAutoMouseDescription")}
              disabled={!config}
              id="pointing-auto-mouse-layer"
              title={t("pointing.enableAutoMouse")}
            />
            <PointingFigure figure="auto-mouse" on={autoMouseLayerEnabled} />
          </div>
          <div class="flex items-center justify-between gap-3">
            <div class="grid text-wrap">
              <span class="text-[13px] leading-tight font-semibold"
                >{t("pointing.targetLayer")}</span
              >
              <span class="text-xs leading-snug text-muted-foreground">
                {t("pointing.targetLayerDescription")}
              </span>
            </div>
            <LayerSelect
              disabled={!config}
              layer={autoMouseLayer}
              onLayerChange={(layer) => {
                if (!config) return
                if (
                  config.autoMouseLayerEnabled &&
                  scrollLayerActive &&
                  layer === scrollLayer
                ) {
                  reportLayerConflict()
                  return
                }
                void pointingQuery.set({
                  data: { ...config, autoMouseLayer: layer },
                })
              }}
            />
          </div>
        </div>
        {#if extendedAvailable}
          {#if sideAvailable}
            {#if showLeft}
              {@render orientationCard(HMK_POINTING_SIDE_LEFT)}
            {/if}
            {#if showRight}
              {@render orientationCard(HMK_POINTING_SIDE_RIGHT)}
            {/if}
          {:else}
            {@render orientationCard(null)}
          {/if}
          <div
            class="grid content-start gap-2.5 rounded-lg border bg-card p-3 shadow-sm"
          >
            <div class="grid">
              <span class="text-[13px] leading-tight font-semibold"
                >{t("pointing.scrollTitle")}</span
              >
              <span class="text-xs leading-snug text-muted-foreground">
                {t("pointing.scrollDescription")}
              </span>
            </div>
            <Switch
              bind:checked={
                () =>
                  config?.invertScroll ?? defaultPointingConfig.invertScroll,
                (v) =>
                  config &&
                  pointingQuery.set({
                    data: { ...config, invertScroll: v },
                  })
              }
              description={t("pointing.invertScrollDescription")}
              disabled={!config}
              id="pointing-invert-scroll"
              title={t("pointing.invertScroll")}
            />
            <div class="flex items-start gap-2">
              <div class="grid min-w-0 flex-1 gap-1">
                <div class="grid text-wrap">
                  <span class="text-[13px] leading-tight font-semibold"
                    >{t("pointing.scrollLayer")}</span
                  >
                  <span class="text-xs leading-snug text-muted-foreground">
                    {t("pointing.scrollLayerDescription")}
                  </span>
                </div>
                <Select.Root
                  bind:value={
                    () => String(scrollLayer),
                    (v) => {
                      if (!config) return
                      const next = Number(v)
                      if (
                        config.autoMouseLayerEnabled &&
                        next !== HMK_POINTING_SCROLL_LAYER_OFF &&
                        next === config.autoMouseLayer
                      ) {
                        reportLayerConflict()
                        return
                      }
                      void pointingQuery.set({
                        data: { ...config, scrollLayer: next },
                      })
                    }
                  }
                  disabled={!config}
                  type="single"
                >
                  <Select.Trigger class="w-36" size="sm">
                    <span>
                      {scrollLayerLabel(
                        config?.scrollLayer ?? HMK_POINTING_SCROLL_LAYER_OFF,
                      )}
                    </span>
                  </Select.Trigger>
                  <Select.Content class="w-[var(--bits-select-anchor-width)]">
                    <Select.Item value={String(HMK_POINTING_SCROLL_LAYER_OFF)}>
                      {t("pointing.disabled")}
                    </Select.Item>
                    {#each { length: numLayers }, layer (layer)}
                      <Select.Item value={String(layer)}>
                        {t("pointing.layer", { layer })}
                      </Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              </div>
              <PointingFigure
                class="self-center"
                figure="scroll"
                on={config?.invertScroll ?? defaultPointingConfig.invertScroll}
              />
            </div>
            <CommitSlider
              bind:committed={
                () =>
                  config?.scrollDivisor ?? defaultPointingConfig.scrollDivisor,
                (v) =>
                  config &&
                  pointingQuery.set({
                    data: { ...config, scrollDivisor: v },
                  })
              }
              description={t("pointing.scrollDivisorDescription")}
              disabled={!config}
              display={(v) => String(v)}
              max={255}
              min={1}
              step={1}
              title={t("pointing.scrollDivisor")}
            />
          </div>
          <div
            class="grid content-start gap-2.5 rounded-lg border bg-card p-3 shadow-sm"
          >
            <div class="grid">
              <span class="text-[13px] leading-tight font-semibold"
                >{t("pointing.axisSnapping")}</span
              >
              <span class="text-xs leading-snug text-muted-foreground">
                {t("pointing.axisSnappingDescription")}
              </span>
            </div>
            <div class="flex items-start gap-2">
              <div class="grid min-w-0 flex-1 gap-1">
                <div class="grid text-wrap">
                  <span class="text-[13px] leading-tight font-semibold"
                    >{t("pointing.snapAxis")}</span
                  >
                  <span class="text-xs leading-snug text-muted-foreground">
                    {t("pointing.snapAxisDescription")}
                  </span>
                </div>
                <Select.Root
                  bind:value={
                    () =>
                      String(
                        config?.snapAxis ?? defaultPointingConfig.snapAxis,
                      ),
                    (v) =>
                      config &&
                      pointingQuery.set({
                        data: { ...config, snapAxis: Number(v) },
                      })
                  }
                  disabled={!config}
                  type="single"
                >
                  <Select.Trigger class="w-36" size="sm">
                    <span>{snapAxisLabel(config?.snapAxis ?? 0)}</span>
                  </Select.Trigger>
                  <Select.Content class="w-[var(--bits-select-anchor-width)]">
                    <Select.Item value="0">{t("pointing.disabled")}</Select.Item
                    >
                    <Select.Item value="1">{t("pointing.xAxis")}</Select.Item>
                    <Select.Item value="2">{t("pointing.yAxis")}</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
              <PointingFigure
                class="self-center"
                figure="snap"
                axis={config?.snapAxis ?? defaultPointingConfig.snapAxis}
              />
            </div>
            <CommitSlider
              bind:committed={
                () =>
                  config?.snapThreshold ?? defaultPointingConfig.snapThreshold,
                (v) =>
                  config &&
                  pointingQuery.set({
                    data: { ...config, snapThreshold: v },
                  })
              }
              description={t("pointing.snapThresholdDescription")}
              disabled={!config || config.snapAxis === 0}
              display={(v) => `${v}%`}
              max={100}
              min={0}
              step={1}
              title={t("pointing.snapThreshold")}
            />
          </div>
        {:else}
          <div
            class="grid gap-1 rounded-lg border bg-card p-3 text-sm shadow-sm xl:col-span-2 2xl:col-span-3"
          >
            <span class="font-semibold"
              >{t("pointing.extendedUnavailable")}</span
            >
            <span class="text-muted-foreground">
              {t("pointing.extendedUnavailableDescription", {
                version: displayVersion(version),
                min: displayVersion(HMK_POINTING_CONFIG_V2_VERSION),
              })}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </FixedScrollArea>
</div>
