"use client"

import { Children, useEffect, useRef } from "react"
import { bindDrag, clamp } from "@/lib/behaviors"
import { useControllable } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// Side by side (or stacked) panels with a handle between each pair, for a
// list beside its detail or a document beside AiMY. The handle is a 1px
// hairline that widens to a brand line on hover, drag and focus. Drag it, or
// focus it and use the arrows (Shift for ten), Home and End for a panel's
// smallest and largest. Sizes are percentages that always add up to 100.

type ResizablePanelsProps = {
  children: React.ReactNode
  direction?: "horizontal" | "vertical"
  /** Starting sizes in percent, one per panel. Default: equal. */
  defaultSizes?: number[]
  sizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  /** Smallest size in percent, one per panel (or one for all). Default 10. */
  min?: number | number[]
  /** Names each handle for screen readers, from the panel before it: "List". */
  labels?: string[]
  className?: string
}

export function ResizablePanels({ children, direction = "horizontal", defaultSizes, sizes: sizesProp, onSizesChange, min = 10, labels, className }: ResizablePanelsProps) {
  const panels = Children.toArray(children)
  const n = panels.length
  const [held, setSizes] = useControllable<number[]>({
    value: sizesProp,
    defaultValue: defaultSizes ?? panels.map(() => 100 / n),
    onChange: onSizesChange,
  })
  // A panel that comes or goes re-splits the room (defaultSizes when they fit the new count), so
  // the sizes always cover 100% and no panel opens at 0.
  const sizes = held.length === n ? held : defaultSizes?.length === n ? defaultSizes : panels.map(() => 100 / n)
  const minOf = (i: number) => (Array.isArray(min) ? (min[i] ?? 10) : min)
  const root = useRef<HTMLDivElement>(null)
  const horizontal = direction === "horizontal"

  /** Moves the handle after panel i by delta percent, inside both panels' minimums. */
  const shift = (base: number[], i: number, delta: number) => {
    const a = base[i] ?? 0
    const b = base[i + 1] ?? 0
    const d = clamp(delta, minOf(i) - a, b - minOf(i + 1))
    const next = base.slice()
    next[i] = a + d
    next[i + 1] = b - d
    return next
  }

  const latest = useRef({ sizes, setSizes, shift, horizontal })
  useEffect(() => {
    latest.current = { sizes, setSizes, shift, horizontal }
  })
  useEffect(() => {
    const el = root.current
    if (!el) return
    let index = -1
    let start: number[] = []
    return bindDrag(el, {
      threshold: 0,
      filter: (e) => !!(e.target as Element).closest("[data-resize-handle]"),
      onPress: (e) => {
        index = Number((e.target as Element).closest<HTMLElement>("[data-resize-handle]")?.dataset.resizeHandle)
        start = latest.current.sizes
      },
      onMove: (info) => {
        const r = el.getBoundingClientRect()
        const total = latest.current.horizontal ? r.width : r.height
        // Right to left, the first panel is on the right: moving the handle left grows it.
        const flip = latest.current.horizontal && getComputedStyle(el).direction === "rtl" ? -1 : 1
        const px = latest.current.horizontal ? info.delta.x * flip : info.delta.y
        latest.current.setSizes(latest.current.shift(start, index, (px / (total || 1)) * 100))
      },
      onStart: () => el.setAttribute("data-dragging", ""),
      onEnd: () => el.removeAttribute("data-dragging"),
      onCancel: () => {
        el.removeAttribute("data-dragging")
        latest.current.setSizes(start)
      },
    })
  }, [])

  return (
    <div ref={root} data-slot="resizable-panels" data-direction={direction} className={cn("group/panels flex min-h-0 min-w-0", horizontal ? "flex-row" : "flex-col", className)}>
      {panels.map((panel, i) => (
        <PanelAndHandle
          key={i}
          i={i}
          last={i === n - 1}
          size={sizes[i] ?? 0}
          horizontal={horizontal}
          label={labels?.[i] ?? `Panel ${i + 1}`}
          min={minOf(i)}
          max={(sizes[i] ?? 0) + (sizes[i + 1] ?? 0) - minOf(i + 1)}
          onKey={(e) => {
            const back = horizontal ? "ArrowLeft" : "ArrowUp"
            const fwd = horizontal ? "ArrowRight" : "ArrowDown"
            const step = e.shiftKey ? 10 : 1
            const map: Record<string, number> = { [back]: -step, [fwd]: step, Home: -100, End: 100 }
            // Right to left, ArrowLeft grows the panel before the handle, as the page reads.
            const rtl = horizontal && getComputedStyle(e.currentTarget).direction === "rtl"
            const key = rtl && (e.key === "ArrowLeft" || e.key === "ArrowRight") ? (e.key === "ArrowLeft" ? "ArrowRight" : "ArrowLeft") : e.key
            const d = map[key]
            if (d === undefined) return
            e.preventDefault()
            setSizes(shift(sizes, i, d))
          }}
        >
          {panel}
        </PanelAndHandle>
      ))}
    </div>
  )
}

function PanelAndHandle({
  i,
  last,
  size,
  horizontal,
  label,
  min,
  max,
  onKey,
  children,
}: {
  i: number
  last: boolean
  size: number
  horizontal: boolean
  label: string
  min: number
  max: number
  onKey: (e: React.KeyboardEvent) => void
  children: React.ReactNode
}) {
  return (
    <>
      <div data-slot="resizable-panel" style={{ flexBasis: `${size}%` }} className="min-h-0 min-w-0 shrink grow-0 overflow-auto transition-[flex-basis] duration-(--t-base) ease-out group-data-dragging/panels:transition-none motion-reduce:transition-none">
        {children}
      </div>
      {last ? null : (
        <div
          role="separator"
          tabIndex={0}
          data-resize-handle={i}
          aria-orientation={horizontal ? "vertical" : "horizontal"}
          aria-label={`Resize ${label}`}
          aria-valuenow={Math.round(size)}
          aria-valuemin={Math.round(min)}
          aria-valuemax={Math.round(max)}
          onKeyDown={onKey}
          className={cn(
            "group/handle relative shrink-0 touch-none outline-none",
            horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
            // A wider hit area than the line it draws.
            horizontal ? "before:absolute before:inset-y-0 before:-inset-x-1.5" : "before:absolute before:inset-x-0 before:-inset-y-1.5"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute bg-hairline transition-[background-color,transform] duration-(--t-fast) ease-out",
              "group-hover/handle:bg-brand group-focus-visible/handle:bg-brand group-active/handle:bg-brand",
              horizontal ? "inset-y-0 start-0 w-px group-hover/handle:scale-x-[3] group-focus-visible/handle:scale-x-[3]" : "inset-x-0 top-0 h-px group-hover/handle:scale-y-[3] group-focus-visible/handle:scale-y-[3]"
            )}
          />
        </div>
      )}
    </>
  )
}
