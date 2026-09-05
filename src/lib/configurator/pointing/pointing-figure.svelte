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
  import { t } from "$lib/i18n.svelte"
  import { cn, type WithoutChildren } from "$lib/utils"
  import type { HTMLAttributes } from "svelte/elements"

  export type PointingFigureKind =
    | "cpi"
    | "rotation"
    | "invert-x"
    | "invert-y"
    | "swap"
    | "scroll"
    | "snap"
    | "auto-mouse"

  const labels: Record<PointingFigureKind, string> = $derived({
    cpi: t("pointing.figureCpi"),
    rotation: t("pointing.figureRotation"),
    "invert-x": t("pointing.figureInvertX"),
    "invert-y": t("pointing.figureInvertY"),
    swap: t("pointing.figureSwap"),
    scroll: t("pointing.figureScroll"),
    snap: t("pointing.figureSnap"),
    "auto-mouse": t("pointing.figureAutoMouse"),
  })

  let {
    class: className,
    figure,
    angle = 0,
    on = false,
    axis = 0,
    ...props
  }: WithoutChildren<HTMLAttributes<HTMLDivElement>> & {
    /** Which setting this figure illustrates. */
    figure: PointingFigureKind
    /** Sensor rotation in degrees (rotation figure only). */
    angle?: number
    /** Whether the option is enabled (direction / emphasis figures). */
    on?: boolean
    /** Snapped axis: 0 disabled, 1 X, 2 Y (snap figure only). */
    axis?: number
  } = $props()
</script>

<div
  aria-label={labels[figure]}
  class={cn(
    "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40 p-1 text-muted-foreground",
    className,
  )}
  role="img"
  {...props}
>
  {#if figure === "cpi"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <circle cx="18" cy="32" r="11" />
      <circle
        cx="18"
        cy="32"
        r="3"
        class="text-primary"
        fill="currentColor"
        stroke="none"
      />
      <path d="M36 22h20" opacity="0.45" stroke-dasharray="3 4" />
      <path d="M36 42h20" opacity="0.45" stroke-dasharray="3 4" />
      <path d="M36 32h30" class="text-primary" />
      <path d="M59 25l9 7-9 7" class="text-primary" />
    </svg>
  {:else if figure === "rotation"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <path d="M48 8v48" opacity="0.4" stroke-dasharray="3 4" />
      <path d="M24 32h48" opacity="0.4" stroke-dasharray="3 4" />
      <g transform={`rotate(${angle} 48 32)`}>
        <path d="M48 50V16" class="text-primary" />
        <path d="M41 24l7-9 7 9" class="text-primary" />
      </g>
    </svg>
  {:else if figure === "invert-x"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <path
        d="M14 20h58"
        class={on ? "opacity-35" : "text-primary"}
        stroke-dasharray={on ? "4 4" : undefined}
      />
      <path d="M64 13l10 7-10 7" class={on ? "opacity-35" : "text-primary"} />
      <path
        d="M82 44H24"
        class={on ? "text-primary" : "opacity-35"}
        stroke-dasharray={on ? undefined : "4 4"}
      />
      <path d="M32 37l-10 7 10 7" class={on ? "text-primary" : "opacity-35"} />
      <text
        x="83"
        y="25"
        fill="currentColor"
        font-size="11"
        font-weight="700"
        stroke="none"
      >
        X
      </text>
    </svg>
  {:else if figure === "invert-y"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <path
        d="M34 10v44"
        class={on ? "opacity-35" : "text-primary"}
        stroke-dasharray={on ? "4 4" : undefined}
      />
      <path d="M27 46l7 10 7-10" class={on ? "opacity-35" : "text-primary"} />
      <path
        d="M62 54V10"
        class={on ? "text-primary" : "opacity-35"}
        stroke-dasharray={on ? undefined : "4 4"}
      />
      <path d="M55 18l7-10 7 10" class={on ? "text-primary" : "opacity-35"} />
      <text
        x="66"
        y="60"
        fill="currentColor"
        font-size="11"
        font-weight="700"
        stroke="none"
      >
        Y
      </text>
    </svg>
  {:else if figure === "swap"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <g class={on ? "text-primary" : undefined}>
        <path d="M12 46h58" />
        <path d="M62 39l10 7-10 7" />
        <path d="M28 58V12" />
        <path d="M21 20l7-9 7 9" />
      </g>
      <text
        x={on ? 36 : 76}
        y={on ? 30 : 50}
        fill="currentColor"
        font-size="11"
        font-weight="700"
        stroke="none"
      >
        X
      </text>
      <text
        x={on ? 76 : 36}
        y={on ? 50 : 30}
        fill="currentColor"
        font-size="11"
        font-weight="700"
        stroke="none"
      >
        Y
      </text>
    </svg>
  {:else if figure === "scroll"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <path d="M10 22h32" opacity="0.5" />
      <path d="M10 32h32" opacity="0.5" />
      <path d="M10 42h24" opacity="0.5" />
      {#if on}
        <path d="M50 22v28" class="text-primary" />
        <path d="M43 43l7 8 7-8" class="text-primary" />
      {:else}
        <path d="M50 50V22" class="text-primary" />
        <path d="M43 29l7-8 7 8" class="text-primary" />
      {/if}
      <rect x="62" y="8" width="14" height="48" rx="7" />
      <rect
        x="65"
        y={on ? 34 : 16}
        width="8"
        height="14"
        rx="4"
        class="text-primary"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  {:else if figure === "snap"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      {#if axis === 2}
        <rect
          x="42"
          y="6"
          width="12"
          height="52"
          rx="2"
          fill="currentColor"
          opacity="0.15"
          stroke="none"
        />
        <path d="M28 8l18 48" opacity="0.5" stroke-dasharray="4 4" />
        <path d="M48 6v52" class="text-primary" />
      {:else if axis === 1}
        <rect
          x="10"
          y="28"
          width="76"
          height="12"
          rx="2"
          fill="currentColor"
          opacity="0.15"
          stroke="none"
        />
        <path d="M10 18l76 14" opacity="0.5" stroke-dasharray="4 4" />
        <path d="M10 34h76" class="text-primary" />
      {:else}
        <path
          d="M10 44C30 20 60 48 86 26"
          opacity="0.5"
          stroke-dasharray="4 4"
        />
      {/if}
    </svg>
  {:else if figure === "auto-mouse"}
    <svg
      aria-hidden="true"
      class="h-full w-full"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 96 64"
    >
      <circle cx="18" cy="44" r="10" />
      <circle
        cx="18"
        cy="44"
        r="2.5"
        class="text-primary"
        fill="currentColor"
        stroke="none"
      />
      <path d="M30 38c5-6 9-8 14-10" opacity="0.5" stroke-dasharray="3 3" />
      <rect x="48" y="8" width="38" height="15" rx="3" opacity="0.45" />
      <rect
        x="48"
        y="31"
        width="38"
        height="15"
        rx="3"
        class={on ? "text-primary" : undefined}
      />
      <path d="M55 38h15" class={on ? "text-primary" : undefined} />
      <path d="M64 34l8 4-8 4" class={on ? "text-primary" : undefined} />
    </svg>
  {/if}
</div>
