import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Sales' windowed list (.b-vlist, bdr.js 24698-24905): the host is as tall as
// the whole list and only the rows near the view exist, about thirty at a
// time whatever the list holds. The row height is measured, not guessed: one
// row is laid out out of sight and its height is what every row gets, again
// whenever the window resizes. It scrolls with whatever scrolls around it
// (the nearest scrolling ancestor, or the page). Positioning only: the row's
// own content decides what it looks like, and a hairline sits between every
// row. A `cursor` row is tinted and kept in view, with room under it.
//
//   <VirtualList label="Queue" items={people} rowKey={(p) => p.id}
//     renderRow={(p) => <QueueRow person={p} />} cursor={at} />

type VirtualListProps<T> = {
  items: T[]
  rowKey: (item: T) => string
  renderRow: (item: T, index: number) => React.ReactNode
  /** Names the list for screen readers. */
  label: string
  /** Rows drawn beyond the view at each end. */
  overscan?: number
  /** The index of the row the keyboard is on. */
  cursor?: number
  /** Shown when there are no items. */
  empty?: React.ReactNode
  className?: string
}

const scrollerOf = (el: HTMLElement | null): HTMLElement | null => {
  for (let p = el?.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY
    if (o === "auto" || o === "scroll") return p
  }
  return null
}

export function VirtualList<T>({
  items,
  rowKey,
  renderRow,
  label,
  overscan = 8,
  cursor,
  empty,
  className,
}: VirtualListProps<T>) {
  const host = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLDivElement>(null)
  const [rowH, setRowH] = useState(0)
  const [range, setRange] = useState<[number, number]>([0, 30])

  // The row height: the probe row, measured whenever its size changes.
  useEffect(() => {
    const el = probe.current
    if (!el) return
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight) setRowH(el.offsetHeight)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [items.length])

  // The window: which rows are near the view, read on scroll (once a frame).
  useEffect(() => {
    const el = host.current
    if (!el || !rowH) return
    const scroller = scrollerOf(el)
    let frame = 0
    const read = () => {
      frame = 0
      const top = el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0)
      const vh = scroller ? scroller.clientHeight : window.innerHeight || 700
      const first = Math.max(0, Math.floor(-top / rowH) - overscan)
      const last = Math.min(items.length, Math.ceil((vh - top) / rowH) + overscan)
      setRange((r) => (r[0] === first && r[1] === last ? r : [first, last]))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    frame = requestAnimationFrame(read)
    const target: HTMLElement | Window = scroller ?? window
    target.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      target.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [rowH, items.length, overscan])

  // Keep the cursor row in view, scrolling only when it is not wholly there.
  useEffect(() => {
    const el = host.current
    if (!el || !rowH || cursor === undefined || cursor < 0) return
    const scroller = scrollerOf(el)
    const view = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight }
    const rowTop = el.getBoundingClientRect().top + cursor * rowH
    const room = 96
    let by = 0
    if (rowTop < view.top) by = rowTop - view.top
    else if (rowTop + rowH > view.bottom - room) by = rowTop + rowH - (view.bottom - room)
    if (by) (scroller ?? window).scrollBy({ top: by })
  }, [cursor, rowH])

  if (!items.length) return empty ? <>{empty}</> : null
  const [first, last] = range
  return (
    <div
      ref={host}
      className={cn("b-vlist", className)}
      style={{ height: rowH ? items.length * rowH : undefined }}
      role="list"
      aria-label={label}
      data-slot="virtual-list"
    >
      {/* One row laid out out of sight: its height is every row's height. */}
      <div
        ref={(node) => {
          probe.current = node
          // Measured once on mount too, so a list in a hidden tab is not empty until it resizes.
          if (node?.offsetHeight && node.offsetHeight !== rowH) setRowH(node.offsetHeight)
        }}
        className="b-vrow is-first"
        aria-hidden="true"
        style={{ visibility: "hidden", position: "absolute" }}
        inert
      >
        {renderRow(items[0] as T, 0)}
      </div>
      {rowH
        ? items.slice(first, last).map((item, j) => {
            const i = first + j
            return (
              <div
                key={rowKey(item)}
                role="listitem"
                aria-setsize={items.length}
                aria-posinset={i + 1}
                className={cn("b-vrow", i === 0 && "is-first", i === cursor && "is-cursor")}
                style={{ height: rowH, transform: `translateY(${i * rowH}px)` }}
              >
                {renderRow(item, i)}
              </div>
            )
          })
        : null}
    </div>
  )
}
