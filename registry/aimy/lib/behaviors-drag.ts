// Drag and drop: a pointer drag with capture, a threshold and Escape to
// cancel; reordering lists, grids and trees by pointer or keyboard; moving
// items between lists; a drag preview; edge auto-scroll; and the sentences a
// screen reader hears at each step. Every drag has a keyboard path: pick up
// with Space, move with the arrows, drop with Space, cancel with Escape.

import { type Cleanup, type Point, type Rect, announce, cleanups, createStore, on, rectOf } from "./behaviors-core"

/** Pixels a pointer moves before a press becomes a drag. */
export const dragThreshold = 3

export type DragInfo = {
  start: Point
  point: Point
  delta: Point
  /** Pixels per millisecond, from the last few moves. */
  velocity: Point
}

export type DragOptions = {
  /** Only start on presses this returns true for (a handle, empty ground). */
  filter?: (e: PointerEvent) => boolean
  threshold?: number
  onPress?: (e: PointerEvent) => void
  onStart?: (info: DragInfo, e: PointerEvent) => void
  onMove?: (info: DragInfo, e: PointerEvent) => void
  onEnd?: (info: DragInfo, e: PointerEvent) => void
  onCancel?: () => void
  /** Mouse button that drags. Default 0 (primary). */
  button?: number
}

/**
 * Tracks one pointer from press to release. Below the threshold it is still
 * a click; past it the pointer is captured, text selection is held off, and
 * Escape cancels.
 */
export function bindDrag(el: HTMLElement, options: DragOptions): Cleanup {
  const threshold = options.threshold ?? dragThreshold
  let id: number | null = null
  let dragging = false
  let start: Point = { x: 0, y: 0 }
  let trail: { x: number; y: number; t: number }[] = []
  let release: Cleanup | null = null
  let suppress = false

  const info = (e: PointerEvent): DragInfo => {
    const point = { x: e.clientX, y: e.clientY }
    trail.push({ ...point, t: e.timeStamp || performance.now() })
    if (trail.length > 5) trail.shift()
    const a = trail[0]!
    const b = trail[trail.length - 1]!
    const dt = Math.max(1, b.t - a.t)
    return { start, point, delta: { x: point.x - start.x, y: point.y - start.y }, velocity: { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt } }
  }

  const end = () => {
    if (id !== null && el.hasPointerCapture?.(id)) el.releasePointerCapture(id)
    id = null
    dragging = false
    trail = []
    release?.()
    release = null
  }

  const down = (e: PointerEvent) => {
    if (id !== null || e.button !== (options.button ?? 0)) return
    if (options.filter && !options.filter(e)) return
    id = e.pointerId
    start = { x: e.clientX, y: e.clientY }
    trail = [{ ...start, t: e.timeStamp || performance.now() }]
    options.onPress?.(e)
    const c = cleanups()
    c.add(on(window, "pointermove", move))
    c.add(on(window, "pointerup", up))
    c.add(on(window, "pointercancel", cancel))
    c.add(
      on(window, "keydown", (k) => {
        if (k.key === "Escape" && dragging) {
          k.preventDefault()
          k.stopPropagation()
          cancel()
        }
      }, true)
    )
    release = c.run
  }

  const move = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    const i = info(e)
    if (!dragging) {
      if (Math.hypot(i.delta.x, i.delta.y) < threshold) return
      dragging = true
      el.setPointerCapture?.(e.pointerId)
      options.onStart?.(i, e)
    }
    e.preventDefault()
    options.onMove?.(i, e)
  }

  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    const was = dragging
    const i = info(e)
    end()
    if (was) {
      suppress = true // a drag past the threshold must not also click
      options.onEnd?.(i, e)
    }
  }

  const cancel = () => {
    const was = dragging
    end()
    if (was) options.onCancel?.()
  }

  const click = (e: MouseEvent) => {
    if (!suppress) return
    e.preventDefault()
    e.stopPropagation()
    suppress = false
  }

  el.addEventListener("pointerdown", down)
  el.addEventListener("click", click, true)
  return () => {
    el.removeEventListener("pointerdown", down)
    el.removeEventListener("click", click, true)
    end()
  }
}

// ── Messages ────────────────────────────────────────────────

export type ReorderPhase = "grab" | "move" | "drop" | "cancel"

/** "Picked up Budget. Position 2 of 5. Use the arrow keys to move, Space to drop, Escape to cancel." */
export function reorderMessage(phase: ReorderPhase, label: string, position: number, total: number): string {
  switch (phase) {
    case "grab":
      return `Picked up ${label}. Position ${position} of ${total}. Use the arrow keys to move, Space to drop, Escape to cancel.`
    case "move":
      return `${label}, position ${position} of ${total}.`
    case "drop":
      return `Dropped ${label} at position ${position} of ${total}.`
    case "cancel":
      return `Move cancelled. ${label} is back at position ${position} of ${total}.`
  }
}

export function treeReorderMessage(phase: ReorderPhase, label: string, where: { parent: string | null; position: number; total: number }) {
  const place = `${where.parent ? `in ${where.parent}` : "at the top level"}, position ${where.position} of ${where.total}`
  switch (phase) {
    case "grab":
      return `Picked up ${label}, ${place}. Up and Down move it, Right puts it inside the item above, Left moves it out. Space drops, Escape cancels.`
    case "move":
      return `${label}, ${place}.`
    case "drop":
      return `Dropped ${label} ${place}.`
    case "cancel":
      return `Move cancelled. ${label} is back ${place}.`
  }
}

export function transferMessage(label: string, to: string, position: number, total: number) {
  return `Moved ${label} to ${to}, position ${position} of ${total}.`
}

// ── Reorder ─────────────────────────────────────────────────

export type ReorderOptions = {
  count: () => number
  /** Label for item i, for announcements. */
  label: (index: number) => string
  /** Commit a move. Called once, on drop. */
  onReorder: (from: number, to: number) => void
  orientation?: "vertical" | "horizontal" | "grid"
  /** Items per row, for a grid (Up and Down jump a row). */
  columns?: () => number
}

export type ReorderState = { from: number | null; to: number | null; mode: "pointer" | "keyboard" | null }

/** Where an item dropped at a point lands, from the items' rects. */
export function dropIndex(rects: Rect[], point: Point, orientation: "vertical" | "horizontal" | "grid" = "vertical"): number {
  let best = 0
  let bestD = Infinity
  rects.forEach((r, i) => {
    const cx = r.x + r.width / 2
    const cy = r.y + r.height / 2
    const d = orientation === "vertical" ? Math.abs(point.y - cy) : orientation === "horizontal" ? Math.abs(point.x - cx) : Math.hypot(point.x - cx, point.y - cy)
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return best
}

/**
 * Reorders a list or grid. Pointer: call pointer.start, pointer.move with
 * the item rects, pointer.end. Keyboard: onKeyDown on the item handles
 * Space to pick up and drop, the arrows to move, Escape to cancel. The
 * state says where the item would land, so a part can draw the gap.
 */
export function createReorder(options: ReorderOptions) {
  const store = createStore<ReorderState>({ from: null, to: null, mode: null })
  const orientation = options.orientation ?? "vertical"
  const say = (phase: ReorderPhase) => {
    const { from, to } = store.get()
    if (from === null || to === null) return
    announce(reorderMessage(phase, options.label(from), (phase === "cancel" ? from : to) + 1, options.count()))
  }
  const drop = () => {
    const { from, to } = store.get()
    if (from !== null && to !== null) {
      say("drop")
      if (from !== to) options.onReorder(from, to)
    }
    store.set({ from: null, to: null, mode: null })
  }
  const cancel = () => {
    say("cancel")
    store.set({ from: null, to: null, mode: null })
  }

  return {
    ...store,
    grab(index: number, mode: "pointer" | "keyboard" = "keyboard") {
      store.set({ from: index, to: index, mode })
      if (mode === "keyboard") say("grab")
    },
    moveTo(index: number) {
      const s = store.get()
      if (s.from === null) return
      const to = Math.max(0, Math.min(options.count() - 1, index))
      if (to === s.to) return
      store.set({ to })
      if (s.mode === "keyboard") say("move")
    },
    drop,
    cancel,
    pointer: {
      start: (index: number) => store.set({ from: index, to: index, mode: "pointer" }),
      move: (point: Point, rects: Rect[]) => {
        if (store.get().from === null) return
        store.set({ to: dropIndex(rects, point, orientation) })
      },
      end: drop,
      cancel,
    },
    /** Keyboard model for an item's handle. Returns true when it used the key. */
    onKeyDown(index: number, e: { key: string; preventDefault(): void }) {
      const s = store.get()
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (s.from === null) this.grab(index)
        else drop()
        return true
      }
      if (s.from === null || s.to === null) return false
      if (e.key === "Escape") {
        e.preventDefault()
        cancel()
        return true
      }
      const cols = orientation === "grid" ? options.columns?.() ?? 1 : 1
      const steps: Record<string, number> =
        orientation === "horizontal"
          ? { ArrowLeft: -1, ArrowRight: 1 }
          : orientation === "grid"
            ? { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }
            : { ArrowUp: -1, ArrowDown: 1 }
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault()
        this.moveTo(e.key === "Home" ? 0 : options.count() - 1)
        return true
      }
      const step = steps[e.key]
      if (step === undefined) return false
      e.preventDefault()
      this.moveTo(s.to + step)
      return true
    },
  }
}

/** Moves one item in an array (what onReorder usually does). */
export function arrayMove<T>(list: readonly T[], from: number, to: number): T[] {
  const out = list.slice()
  const [item] = out.splice(from, 1)
  if (item !== undefined) out.splice(to, 0, item)
  return out
}

// ── Tree reorder ────────────────────────────────────────────

export type TreeRow = { id: string; level: number; label: string }

/** The first row index after a row's subtree (its descendants are the rows between). */
export function subtreeEnd(rows: readonly { level: number }[], index: number): number {
  const level = rows[index]?.level ?? 0
  let i = index + 1
  while (i < rows.length && rows[i]!.level > level) i++
  return i
}

export type TreeDrop = { parent: string | null; index: number }

/**
 * Reorders and nests tree rows (flattened, visible order, with levels).
 * A drop is "before row i at level L"; the parent is the nearest row above
 * at level L-1. A row can't be dropped inside its own subtree.
 */
export function createTreeReorder(options: {
  rows: () => TreeRow[]
  onMove: (id: string, to: TreeDrop) => void
}) {
  const store = createStore<{ id: string | null; at: number | null; level: number | null; origin: { at: number; level: number } | null }>({
    id: null,
    at: null,
    level: null,
    origin: null,
  })

  /** Allowed levels for a gap before row `at`, excluding the dragged subtree. */
  function levels(rows: TreeRow[], at: number): [number, number] {
    const above = rows[at - 1]
    const below = rows[at]
    const max = above ? above.level + 1 : 0
    const min = below ? below.level : 0
    return [Math.min(min, max), max]
  }

  function view(): TreeRow[] {
    const rows = options.rows()
    const id = store.get().id
    const i = rows.findIndex((r) => r.id === id)
    if (i < 0) return rows
    return [...rows.slice(0, i), ...rows.slice(subtreeEnd(rows, i))]
  }

  function where(): TreeDrop & { label: string | null; position: number; total: number } {
    const rows = view()
    const { at, level } = store.get()
    if (at === null || level === null) return { parent: null, index: 0, label: null, position: 1, total: 1 }
    let p = at - 1
    while (p >= 0 && rows[p]!.level >= level) p--
    const parent = p >= 0 ? rows[p]! : null
    let index = 0
    let total = 0
    for (let i = p + 1; i < rows.length && rows[i]!.level >= level; i++) {
      if (rows[i]!.level !== level) continue
      if (i < at) index++
      total++
    }
    return { parent: parent?.id ?? null, index, label: parent?.label ?? null, position: index + 1, total: total + 1 }
  }

  const say = (phase: ReorderPhase) => {
    const row = options.rows().find((r) => r.id === store.get().id)
    if (!row) return
    const w = where()
    announce(treeReorderMessage(phase, row.label, { parent: w.label, position: w.position, total: w.total }))
  }

  const api = {
    ...store,
    where,
    grab(id: string) {
      const rows = options.rows()
      const i = rows.findIndex((r) => r.id === id)
      if (i < 0) return
      store.set({ id, at: i, level: rows[i]!.level, origin: { at: i, level: rows[i]!.level } })
      say("grab")
    },
    /** Moves the gap by one row (Up or Down). */
    step(delta: number) {
      const s = store.get()
      if (s.at === null || s.level === null) return
      const rows = view()
      const at = Math.max(0, Math.min(rows.length, s.at + delta))
      const [lo, hi] = levels(rows, at)
      store.set({ at, level: Math.max(lo, Math.min(hi, s.level)) })
      say("move")
    },
    /** Nests deeper (Right) or shallower (Left). */
    indent(delta: number) {
      const s = store.get()
      if (s.at === null || s.level === null) return
      const [lo, hi] = levels(view(), s.at)
      const level = Math.max(lo, Math.min(hi, s.level + delta))
      if (level === s.level) return
      store.set({ level })
      say("move")
    },
    /** Pointer: the gap nearest the point; x past the row's indent nests. */
    pointer(point: Point, rowRects: Rect[], indent: number) {
      const rows = view()
      if (!rowRects.length) return
      let at = rows.length
      for (let i = 0; i < rowRects.length; i++) {
        const r = rowRects[i]!
        if (point.y < r.y + r.height / 2) {
          at = i
          break
        }
      }
      const [lo, hi] = levels(rows, at)
      const left = rowRects[0]!.x
      const want = Math.round((point.x - left) / indent)
      store.set({ at, level: Math.max(lo, Math.min(hi, want)) })
    },
    drop() {
      const s = store.get()
      if (s.id !== null && s.at !== null) {
        say("drop")
        const w = where()
        options.onMove(s.id, { parent: w.parent, index: w.index })
      }
      store.set({ id: null, at: null, level: null, origin: null })
    },
    cancel() {
      const s = store.get()
      if (s.origin) store.set({ at: s.origin.at, level: s.origin.level })
      say("cancel")
      store.set({ id: null, at: null, level: null, origin: null })
    },
    onKeyDown(id: string, e: { key: string; preventDefault(): void }) {
      const s = store.get()
      if (e.key === " ") {
        e.preventDefault()
        if (s.id === null) api.grab(id)
        else api.drop()
        return true
      }
      if (s.id === null) return false
      const map: Record<string, () => void> = {
        ArrowUp: () => api.step(-1),
        ArrowDown: () => api.step(1),
        ArrowRight: () => api.indent(1),
        ArrowLeft: () => api.indent(-1),
        Escape: () => api.cancel(),
        Enter: () => api.drop(),
      }
      const fn = map[e.key]
      if (!fn) return false
      e.preventDefault()
      fn()
      return true
    },
  }
  return api
}

// ── Transfer between lists ──────────────────────────────────

/**
 * Moves items within or between named lists (a backlog and a sprint, people
 * in and out of a group). Lists are plain arrays you own; this returns the
 * next lists and says what happened.
 */
export function createTransfer<K>(options: {
  lists: () => Record<string, readonly K[]>
  label: (key: K) => string
  /** A list's name as people say it ("Sprint 12"). */
  listName?: (list: string) => string
  onChange: (lists: Record<string, K[]>) => void
}) {
  const find = (key: K) => {
    for (const [name, items] of Object.entries(options.lists())) {
      const i = items.indexOf(key)
      if (i >= 0) return { name, index: i }
    }
    return null
  }
  function move(keys: readonly K[], to: string, index?: number) {
    const lists = Object.fromEntries(Object.entries(options.lists()).map(([n, l]) => [n, l.filter((k) => !keys.includes(k))]))
    const target = lists[to] ?? (lists[to] = [])
    const at = Math.max(0, Math.min(target.length, index ?? target.length))
    target.splice(at, 0, ...keys)
    options.onChange(lists)
    const first = keys[0]
    if (first !== undefined) {
      const label = keys.length === 1 ? options.label(first) : `${keys.length} items`
      announce(transferMessage(label, options.listName?.(to) ?? to, at + 1, target.length))
    }
  }
  return {
    find,
    move,
    /** Moves to the next or previous list, keeping the position when it can. */
    shift(key: K, direction: 1 | -1) {
      const from = find(key)
      if (!from) return
      const names = Object.keys(options.lists())
      const to = names[names.indexOf(from.name) + direction]
      if (to) move([key], to, from.index)
    },
  }
}

// ── Preview, auto-scroll, draft ─────────────────────────────

/** A copy of the dragged element that follows the pointer above the page. */
export function bindDragPreview(source: HTMLElement, at: Point) {
  const r = source.getBoundingClientRect()
  const ghost = source.cloneNode(true) as HTMLElement
  const offset = { x: at.x - r.left, y: at.y - r.top }
  ghost.setAttribute("aria-hidden", "true")
  ghost.removeAttribute("id")
  ghost.setAttribute("data-slot", "drag-preview")
  Object.assign(ghost.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${r.width}px`,
    height: `${r.height}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "2147483000",
    transform: `translate(${r.left}px, ${r.top}px)`,
  })
  document.body.appendChild(ghost)
  return {
    el: ghost,
    move(p: Point) {
      ghost.style.transform = `translate(${p.x - offset.x}px, ${p.y - offset.y}px)`
    },
    destroy: () => ghost.remove(),
  }
}

/** Scrolls a container while a drag holds the pointer near its edge; faster nearer the edge. */
export function createAutoScroll(container: HTMLElement, options: { edge?: number; speed?: number } = {}) {
  const edge = options.edge ?? 48
  const speed = options.speed ?? 16
  let frame = 0
  let v = { x: 0, y: 0 }
  const tick = () => {
    if (!v.x && !v.y) {
      frame = 0
      return
    }
    container.scrollBy(v.x, v.y)
    frame = requestAnimationFrame(tick)
  }
  return {
    update(p: Point) {
      const r = rectOf(container)
      const f = (d: number) => (d < edge ? (1 - Math.max(0, d) / edge) * speed : 0)
      v = { x: f(p.x - r.x) * -1 + f(r.x + r.width - p.x), y: f(p.y - r.y) * -1 + f(r.y + r.height - p.y) }
      if ((v.x || v.y) && !frame) frame = requestAnimationFrame(tick)
    },
    stop() {
      v = { x: 0, y: 0 }
      cancelAnimationFrame(frame)
      frame = 0
    },
  }
}

/**
 * Keeps a dropped draft on screen until the controlled value catches up, so
 * an item doesn't jump back for a frame while the parent saves.
 */
export function settleDraft<T>(draft: T | undefined, value: T, equal: (a: T, b: T) => boolean = Object.is): { shown: T; settled: boolean } {
  if (draft === undefined) return { shown: value, settled: true }
  return equal(draft, value) ? { shown: value, settled: true } : { shown: draft, settled: false }
}
