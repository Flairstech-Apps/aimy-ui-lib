"use client"

import { GripVertical } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { arrayMove, bindDrag, createAutoScroll, rectOf } from "@/lib/behaviors"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
import { useReorder } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// A list people put in their own order: steps of a plan, a pipeline's
// stages, the columns of a table. Each row has a grip. Drag it, or focus it
// and press Space, move with the arrows (Home and End jump), Space to drop,
// Escape to put it back; every step is announced. The row being moved lifts
// (raised ground, brand edge, a shadow) and the others make room as it goes.

type SortableListProps<T> = {
  items: T[]
  /** A stable key per item. */
  getKey: (item: T) => string
  /** The item's name, for the grip's label and the announcements. */
  getLabel: (item: T) => string
  /** Called once, on drop, with the items in their new order. */
  onReorder: (items: T[]) => void
  renderItem: (item: T) => React.ReactNode
  /** Names the list for screen readers: "Plan steps". */
  label: string
  className?: string
  /** Shows this part to AiMY under this id (inside an AgentProvider), so it can read it and act on it. */
  agent?: string
}

export function SortableList<T>({ items, getKey, getLabel, onReorder, renderItem, label, className, agent }: SortableListProps<T>) {
  const list = useRef<HTMLOListElement>(null)
  const reorder = useReorder({
    count: () => items.length,
    label: (i) => getLabel(items[i]!),
    onReorder: (from, to) => onReorder(arrayMove(items, from, to)),
  })
  const [listEl, setListEl] = useState<HTMLOListElement | null>(null)
  useAgentSurface(
    agent,
    {
      kind: "ordered list",
      label,
      state: () => ({ order: items.map(getLabel) }),
      actions: {
        move: {
          description: "Move an item to a position",
          keywords: "reorder order first last up down",
          params: {
            item: { type: "string", description: "The item's name", enum: items.map(getLabel) },
            position: { type: "number", description: `Its new position, 1 to ${items.length}` },
          },
          say: (p) => `moved ${p.item} to position ${p.position}`,
          run: (p) => {
            const from = items.findIndex((x) => getLabel(x) === p.item)
            const to = Math.max(0, Math.min(items.length - 1, Math.round(Number(p.position)) - 1))
            if (from < 0) return
            const prev = items
            onReorder(arrayMove(items, from, to))
            return () => onReorder(prev)
          },
        },
      },
    },
    listEl
  )
  const moving = reorder.from
  const shown = reorder.from !== null && reorder.to !== null ? arrayMove(items, reorder.from, reorder.to) : items

  // React moves the row's node as the order changes; keep focus on its grip.
  useEffect(() => {
    if (reorder.mode !== "keyboard" || moving === null) return
    const grip = list.current?.querySelector<HTMLElement>(`[data-sortable-grip="${moving}"]`)
    if (grip && document.activeElement !== grip) grip.focus({ preventScroll: true })
  }, [reorder.mode, reorder.to, moving])

  // One pointer listener for every grip, bound once.
  const { pointer } = reorder
  useEffect(() => {
    const el = list.current
    if (!el) return
    const scroller = el.closest<HTMLElement>("[data-scroll],.page-scroll") ?? document.scrollingElement
    const auto = scroller instanceof HTMLElement ? createAutoScroll(scroller) : null
    let from = -1
    const off = bindDrag(el, {
      filter: (e) => !!(e.target as Element).closest("[data-sortable-grip]"),
      onPress: (e) => (from = Number((e.target as Element).closest<HTMLElement>("[data-sortable-grip]")?.dataset.sortableGrip)),
      onStart: () => pointer.start(from),
      onMove: (info) => {
        auto?.update(info.point)
        pointer.move(info.point, Array.from(el.children).map(rectOf))
      },
      onEnd: () => {
        auto?.stop()
        pointer.end()
      },
      onCancel: () => {
        auto?.stop()
        pointer.cancel()
      },
    })
    return () => {
      auto?.stop()
      off()
    }
  }, [pointer])

  return (
    <ol
      ref={(node) => {
        list.current = node
        setListEl(node)
      }}
      aria-label={label}
      data-slot="sortable-list" className={cn("flex flex-col gap-1", className)}>
      {shown.map((item) => {
        const i = items.indexOf(item)
        const lifted = i === moving
        const name = getLabel(item)
        return (
          <li
            key={getKey(item)}
            className={cn(
              "flex items-center gap-2 rounded-lg border bg-card py-1.5 pr-3 pl-1.5 text-xs text-ink",
              "transition-[box-shadow,border-color,background-color] duration-(--t-fast) ease-out",
              lifted ? "border-brand bg-raised shadow-lg" : "border-edge"
            )}
          >
            <button
              type="button"
              data-sortable-grip={i}
              aria-label={`Move ${name}`}
              aria-pressed={lifted}
              aria-describedby={`${getKey(item)}-sort-hint`}
              onKeyDown={(e) => reorder.onKeyDown(i, e)}
              className={cn(
                "grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-ink-secondary",
                "transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink active:cursor-grabbing"
              )}
            >
              <GripVertical aria-hidden="true" strokeWidth={2} className="size-4" />
            </button>
            <span id={`${getKey(item)}-sort-hint`} hidden>
              Space to pick up, the arrows to move, Space to drop, Escape to cancel.
            </span>
            <div className="min-w-0 flex-1">{renderItem(item)}</div>
          </li>
        )
      })}
    </ol>
  )
}
