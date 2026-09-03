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
  import { keyboardContext } from "$lib/keyboard"
  import {
    defaultPointingConfig,
    HMK_POINTING_CONFIG_MIN_VERSION,
    HMK_POINTING_CONFIG_V2_VERSION,
    HMK_POINTING_SCROLL_LAYER_OFF,
  } from "$lib/libhmk/commands/pointing-config"
  import { cn, displayVersion, type WithoutChildren } from "$lib/utils"
  import { toast } from "svelte-sonner"
  import type { HTMLAttributes } from "svelte/elements"
  import { pointingQueryContext } from "../queries/pointing-query.svelte"

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
  const { current: result, error: queryError } = $derived(pointingQuery.result)
  const config = $derived(result?.config)

  const extendedAvailable = version >= HMK_POINTING_CONFIG_V2_VERSION
  const pointingAvailable = version >= HMK_POINTING_CONFIG_MIN_VERSION

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
    toast.error(
      "The Auto Mouse Layer and the Scroll Layer cannot be the same layer. Choose a different Auto Mouse Target Layer or Scroll Layer first.",
    )
  }

  function scrollLayerLabel(layer: number) {
    return layer === HMK_POINTING_SCROLL_LAYER_OFF
      ? "Disabled"
      : `Layer ${layer}`
  }

  function snapAxisLabel(axis: number) {
    return axis === 1 ? "X Axis" : axis === 2 ? "Y Axis" : "Disabled"
  }
</script>

<div
  class={cn("mx-auto flex size-full max-w-3xl flex-col", className)}
  {...props}
>
  <FixedScrollArea class="flex flex-col gap-4 p-4">
    <div class="grid text-sm text-wrap">
      <span class="font-semibold">Pointing Device</span>
      <span class="text-muted-foreground">
        Configure the trackball pointing device: pointer speed and direction,
        scrolling, and axis snapping.
      </span>
    </div>
    {#if !pointingAvailable}
      <div class="grid gap-2 rounded-lg border bg-card p-4 text-sm shadow-sm">
        <span class="font-semibold">Firmware Update Required</span>
        <span class="text-muted-foreground">
          Pointing device configuration requires firmware
          {displayVersion(HMK_POINTING_CONFIG_MIN_VERSION)} or later. This keyboard
          is running {displayVersion(version)}. Update the firmware from the
          Settings tab to configure the pointing device.
        </span>
      </div>
    {:else if queryError && !result}
      <div class="grid gap-2 rounded-lg border bg-card p-4 text-sm shadow-sm">
        <span class="font-semibold">Failed to Load Configuration</span>
        <span class="text-muted-foreground">{queryError.message}</span>
        <div>
          <Button
            onclick={() => pointingQuery.result.refetch()}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    {:else if result && !result.supported}
      <div class="grid gap-2 rounded-lg border bg-card p-4 text-sm shadow-sm">
        <span class="font-semibold">No Pointing Device</span>
        <span class="text-muted-foreground">
          This keyboard does not have a pointing device, so there is nothing to
          configure.
        </span>
      </div>
    {:else}
      <div class="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div class="grid text-sm">
          <span class="font-semibold">Pointing Device</span>
          <span class="text-muted-foreground">
            Enable or disable the trackball and set its sensor resolution.
          </span>
        </div>
        <Switch
          bind:checked={
            () => config?.enabled ?? defaultPointingConfig.enabled,
            (v) =>
              config && pointingQuery.set({ data: { ...config, enabled: v } })
          }
          description="Enable the pointing device. When disabled, the sensor is turned off and no cursor movement is reported."
          disabled={!config}
          id="pointing-enabled"
          title="Enabled"
        />
        <CommitSlider
          bind:committed={
            () => config?.cpi ?? defaultPointingConfig.cpi,
            (v) => config && pointingQuery.set({ data: { ...config, cpi: v } })
          }
          description="Sensor resolution in counts per inch (200-3200 in steps of 200). Higher values move the cursor further for the same physical movement."
          disabled={!config}
          display={(v) => String(v)}
          max={3200}
          min={200}
          step={200}
          title="CPI"
        />
      </div>
      {#if layerConflict}
        <div
          class="grid gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm shadow-sm"
        >
          <span class="font-semibold text-destructive">Conflicting Layers</span>
          <span class="text-muted-foreground">
            The Auto Mouse Layer and the Scroll Layer are both set to the same
            layer. Choose a different Auto Mouse Target Layer or Scroll Layer,
            or disable one of them.
          </span>
        </div>
      {/if}
      <div class="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div class="grid text-sm">
          <span class="font-semibold">Auto Mouse Layer</span>
          <span class="text-muted-foreground">
            Dedicate a keymap layer to mouse actions: it is activated while the
            pointing device moves and deactivates when it stops.
          </span>
        </div>
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
          description="Automatically switch to the auto mouse layer while the pointing device is moving."
          disabled={!config}
          id="pointing-auto-mouse-layer"
          title="Enable Auto Mouse Layer"
        />
        <div class="flex items-center justify-between gap-4">
          <div class="grid text-sm text-wrap">
            <span class="font-semibold">Target Layer</span>
            <span class="text-muted-foreground">
              The layer to activate while the pointing device is moving.
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
        <div class="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
          <div class="grid text-sm">
            <span class="font-semibold">Orientation</span>
            <span class="text-muted-foreground">
              Compensate for a tilted sensor and flip the movement axes.
            </span>
          </div>
          <CommitSlider
            bind:committed={
              () => config?.rotationDeg ?? defaultPointingConfig.rotationDeg,
              (v) =>
                config &&
                pointingQuery.set({
                  data: { ...config, rotationDeg: v },
                })
            }
            description="Rotation of the sensor in degrees (0-359). Set this to the angle the sensor is mounted at so the reported movement is rotated back to the keyboard axes."
            disabled={!config}
            display={(v) => `${v}°`}
            max={359}
            min={0}
            step={1}
            title="Sensor Rotation"
          />
          <Switch
            bind:checked={
              () => config?.invertX ?? defaultPointingConfig.invertX,
              (v) =>
                config && pointingQuery.set({ data: { ...config, invertX: v } })
            }
            description="Reverse the horizontal cursor direction."
            disabled={!config}
            id="pointing-invert-x"
            title="Invert X Axis"
          />
          <Switch
            bind:checked={
              () => config?.invertY ?? defaultPointingConfig.invertY,
              (v) =>
                config && pointingQuery.set({ data: { ...config, invertY: v } })
            }
            description="Reverse the vertical cursor direction."
            disabled={!config}
            id="pointing-invert-y"
            title="Invert Y Axis"
          />
          <Switch
            bind:checked={
              () => config?.swapAxes ?? defaultPointingConfig.swapAxes,
              (v) =>
                config &&
                pointingQuery.set({ data: { ...config, swapAxes: v } })
            }
            description="Swap the horizontal and vertical movement axes."
            disabled={!config}
            id="pointing-swap-axes"
            title="Swap Axes"
          />
        </div>
        <div class="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
          <div class="grid text-sm">
            <span class="font-semibold">Scrolling</span>
            <span class="text-muted-foreground">
              Turn pointing movement into scroll wheel ticks on a dedicated
              layer.
            </span>
          </div>
          <Switch
            bind:checked={
              () => config?.invertScroll ?? defaultPointingConfig.invertScroll,
              (v) =>
                config &&
                pointingQuery.set({
                  data: { ...config, invertScroll: v },
                })
            }
            description="Reverse the scroll wheel direction."
            disabled={!config}
            id="pointing-invert-scroll"
            title="Invert Scroll"
          />
          <div class="grid gap-1 text-sm">
            <div class="grid text-wrap">
              <span class="font-semibold">Scroll Layer</span>
              <span class="text-muted-foreground">
                The layer on which pointing movement is sent as scroll wheel
                ticks. Disabled turns scroll mode off entirely.
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
              <Select.Trigger class="w-48" size="sm">
                <span>
                  {scrollLayerLabel(
                    config?.scrollLayer ?? HMK_POINTING_SCROLL_LAYER_OFF,
                  )}
                </span>
              </Select.Trigger>
              <Select.Content class="w-[var(--bits-select-anchor-width)]">
                <Select.Item value={String(HMK_POINTING_SCROLL_LAYER_OFF)}>
                  Disabled
                </Select.Item>
                {#each { length: numLayers }, layer (layer)}
                  <Select.Item value={String(layer)}>
                    Layer {layer}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
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
            description="Raw sensor counts per scroll wheel tick (1-255). Lower values scroll faster."
            disabled={!config}
            display={(v) => String(v)}
            max={255}
            min={1}
            step={1}
            title="Scroll Divisor"
          />
        </div>
        <div class="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
          <div class="grid text-sm">
            <span class="font-semibold">Axis Snapping</span>
            <span class="text-muted-foreground">
              Keep cursor movement on a straight line when moving mostly along
              one axis.
            </span>
          </div>
          <div class="grid gap-1 text-sm">
            <div class="grid text-wrap">
              <span class="font-semibold">Snap Axis</span>
              <span class="text-muted-foreground">
                The axis cursor movement is snapped to while the other axis
                stays within the snap threshold.
              </span>
            </div>
            <Select.Root
              bind:value={
                () =>
                  String(config?.snapAxis ?? defaultPointingConfig.snapAxis),
                (v) =>
                  config &&
                  pointingQuery.set({
                    data: { ...config, snapAxis: Number(v) },
                  })
              }
              disabled={!config}
              type="single"
            >
              <Select.Trigger class="w-48" size="sm">
                <span>{snapAxisLabel(config?.snapAxis ?? 0)}</span>
              </Select.Trigger>
              <Select.Content class="w-[var(--bits-select-anchor-width)]">
                <Select.Item value="0">Disabled</Select.Item>
                <Select.Item value="1">X Axis</Select.Item>
                <Select.Item value="2">Y Axis</Select.Item>
              </Select.Content>
            </Select.Root>
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
            description="Movement of the other axis below this percent of the dominant axis is ignored."
            disabled={!config || config.snapAxis === 0}
            display={(v) => `${v}%`}
            max={100}
            min={0}
            step={1}
            title="Snap Threshold"
          />
        </div>
      {:else}
        <div class="grid gap-2 rounded-lg border bg-card p-4 text-sm shadow-sm">
          <span class="font-semibold">Extended Settings Unavailable</span>
          <span class="text-muted-foreground">
            Firmware {displayVersion(version)} supports only the basic pointing settings
            above. Sensor rotation, axis orientation (invert/swap axes), scrolling
            behavior and axis snapping require firmware
            {displayVersion(HMK_POINTING_CONFIG_V2_VERSION)} or later. Update the
            firmware from the Settings tab to configure these settings.
          </span>
        </div>
      {/if}
    {/if}
  </FixedScrollArea>
</div>
