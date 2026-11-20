"use client"

import { GripVertical } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { type Rect, arrayMove, bindDrag, createAutoScroll, reducedMotion, tokenEase, tokenMs } from "@/lib/behaviors"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
import { useFlip, useIsoLayoutEffect, useReorder } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// A list people put in their own order: steps of a plan, a pipeline's
// stages, the columns of a table. Each row has a grip. Drag it: the row
// lifts and follows the pointer, the others glide aside to make room, and on
// release it settles into its place. Or focus the grip and press Space, move
// with the arrows (Home and End jump), Space to drop, Escape to put it back;
// the row glides with each step, and every step is announced.

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

type Drag = {
  rects: Rect[]
  gap: number
  phase: "dragging" | "settling"
  /** The order when the drag began: the rows keep their places until the new order arrives. */
  order: string
  from: number
  to: number
}

/** How far each row moves aside while row `from` is held over slot `to`. */
function shiftFor(i: number, from: number, to: number, size: number): number {
  if (from < to && i > from && i <= to) return -size
  if (from > to && i >= to && i < from) return size
  return 0
}

/** Where the held row's slot is, relative to where it started. */
function slotOffset(rects: Rect[], gap: number, from: number, to: number): number {
  let d = 0
  if (to > from) for (let i = from + 1; i <= to; i++) d += rects[i]!.height + gap
  else for (let i = to; i < from; i++) d -= rects[i]!.height + gap
  return d
}

export function SortableList<T>({ items, getKey, getLabel, onReorder, renderItem, label, className, agent }: SortableListProps<T>) {
  // One hint per list, by an id of its own: keys made the id, so two lists with the same keys
  // clashed, and a key with a space pointed at nothing.
  const hintId = useId()
  const list = useRef<HTMLOListElement | null>(null)
  const reorder = useReorder({
    count: () => items.length,
    label: (i) => getLabel(items[i]!),
    onReorder: (from, to) => onReorder(arrayMove(items, from, to)),
  })
  const [listEl, setListEl] = useState<HTMLOListElement | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
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
  const itemsKey = items.map(getKey).join("\u0000")
  // A pointer drag keeps the DOM still and moves rows with transforms, until
  // the new order arrives from the parent (it may land a render after the
  // drop, so the rows hold their places until then).
  const holding = drag !== null && (drag.phase === "dragging" || drag.order === itemsKey)
  const heldFrom = drag?.phase === "settling" ? drag.from : reorder.from
  const heldTo = drag?.phase === "settling" ? drag.to : reorder.to
  const moving = holding ? heldFrom : reorder.from
  // The keyboard moves the row through the list itself, and FLIP glides it.
  const shown = !holding && reorder.from !== null && reorder.to !== null ? arrayMove(items, reorder.from, reorder.to) : items
  const flipRef = useFlip<HTMLOListElement>(shown.map(getKey).join("\u0000"), { enabled: !holding })

  // React moves the row's node as the order changes; keep focus on its grip.
  useEffect(() => {
    if (reorder.mode !== "keyboard" || moving === null) return
    const grip = list.current?.querySelector<HTMLElement>(`[data-sortable-grip="${moving}"]`)
    if (grip && document.activeElement !== grip) grip.focus({ preventScroll: true })
  }, [reorder.mode, reorder.to, moving])

  // After a drop commits the new order, the held row's own transform goes
  // before the frame is painted, so nothing jumps.
  useIsoLayoutEffect(() => {
    if (drag?.phase !== "settling" || drag.order === itemsKey) return
    for (const li of Array.from(list.current?.children ?? [])) (li as HTMLElement).style.transform = ""
    setDrag(null)
  })

  // One pointer listener for every grip, bound once.
  const { pointer } = reorder
  const latest = useRef({ drag, to: reorder.to, itemsKey })
  useIsoLayoutEffect(() => {
    latest.current = { drag, to: reorder.to, itemsKey }
  })
  useEffect(() => {
    const el = list.current
    if (!el) return
    const scroller = el.closest<HTMLElement>("[data-scroll],.page-scroll") ?? document.scrollingElement
    const auto = scroller instanceof HTMLElement ? createAutoScroll(scroller) : null
    let from = -1
    let held: HTMLElement | null = null
    let rects: Rect[] = []
    let gap = 0
    const off = bindDrag(el, {
      filter: (e) => !!(e.target as Element).closest("[data-sortable-grip]") && latest.current.drag === null,
      onPress: (e) => (from = Number((e.target as Element).closest<HTMLElement>("[data-sortable-grip]")?.dataset.sortableGrip)),
      onStart: () => {
        rects = Array.from(el.children).map((c) => {
          const r = c.getBoundingClientRect()
          return { x: r.left, y: r.top, width: r.width, height: r.height }
        })
        gap = parseFloat(getComputedStyle(el).rowGap) || 0
        held = el.children[from] as HTMLElement
        setDrag({ rects, gap, phase: "dragging", order: latest.current.itemsKey, from, to: from })
        pointer.start(from)
      },
      onMove: (info) => {
        auto?.update(info.point)
        if (held) held.style.transform = `translate3d(0, ${info.delta.y}px, 0) scale(1.02)`
        // Where the held row's middle is decides its slot.
        const r = rects[from]
        if (r) pointer.move({ x: info.point.x, y: r.y + r.height / 2 + info.delta.y }, rects)
      },
      onEnd: () => {
        auto?.stop()
        const to = latest.current.to ?? from
        const target = slotOffset(rects, gap, from, to)
        const finish = () => {
          pointer.end()
          // Dropped where it started: nothing new arrives, so let go here.
          if (to === from) {
            if (held) held.style.transform = ""
            setDrag(null)
          }
        }
        setDrag({ rects, gap, phase: "settling", order: latest.current.itemsKey, from, to })
        if (!held || reducedMotion() || typeof held.animate !== "function") return finish()
        const a = held.animate([{ transform: held.style.transform }, { transform: `translate3d(0, ${target}px, 0) scale(1)` }], {
          duration: tokenMs("--duration-fast", 250),
          easing: tokenEase("--ease-smooth-out"),
          fill: "forwards",
        })
        a.onfinish = () => {
          held!.style.transform = `translate3d(0, ${target}px, 0)`
          a.cancel()
          finish()
        }
      },
      onCancel: () => {
        auto?.stop()
        if (held) held.style.transform = ""
        pointer.cancel()
        setDrag(null)
      },
    })
    return () => {
      auto?.stop()
      off()
    }
  }, [pointer])

  const heldSize = drag && heldFrom !== null ? (drag.rects[heldFrom]?.height ?? 0) + drag.gap : 0

  return (
    <ol
      ref={(node) => {
        list.current = node
        flipRef(node)
        setListEl(node)
      }}
      aria-label={label}
      data-slot="sortable-list"
      className={cn("flex flex-col gap-1", className)}
    >
      {shown.map((item) => {
        const i = items.indexOf(item)
        const lifted = i === moving
        const name = getLabel(item)
        const shift = holding && heldFrom !== null && heldTo !== null && !lifted ? shiftFor(i, heldFrom, heldTo, heldSize) : 0
        return (
          <li
            key={getKey(item)}
            data-flip={getKey(item)}
            data-lifted={lifted ? "" : undefined}
            style={shift ? { transform: `translate3d(0, ${shift}px, 0)` } : undefined}
            className={cn(
              "relative flex items-center gap-2 rounded-lg border bg-card py-1.5 pr-3 pl-1.5 text-xs text-ink",
              "transition-[box-shadow,border-color,background-color,scale] duration-(--t-fast) ease-out",
              // Rows making room glide; the held row follows the pointer exactly.
              holding && !lifted && drag?.phase === "dragging" && "transition-[transform,box-shadow,border-color,background-color] duration-(--t-base)",
              lifted ? "z-10 border-brand bg-raised shadow-lg" : "border-edge",
              lifted && reorder.mode === "keyboard" && "scale-[1.01]"
            )}
          >
            <button
              type="button"
              data-sortable-grip={i}
              aria-label={`Move ${name}`}
              aria-pressed={lifted}
              aria-describedby={hintId}
              onKeyDown={(e) => reorder.onKeyDown(i, e)}
              className={cn(
                "grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-ink-secondary",
                "transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink active:cursor-grabbing",
                lifted && "bg-w07 text-ink"
              )}
            >
              <GripVertical aria-hidden="true" strokeWidth={2} className="size-4" />
            </button>
            {i === 0 ? (
              <span id={hintId} hidden>
                Space to pick up, the arrows to move, Space to drop, Escape to cancel.
              </span>
            ) : null}
            <div className="min-w-0 flex-1">{renderItem(item)}</div>
          </li>
        )
      })}
    </ol>
  )
}
