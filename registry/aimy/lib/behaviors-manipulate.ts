// Moving and resizing: free objects moved by pointer or keyboard, boxes
// resized from edges and corners, swipe actions behind a row, press-and-hold
// and repeat, a two-axis pad, ranges on tracks (time on a calendar, segments
// on a timeline) and trying a value before choosing it.

import { type Cleanup, type Point, announce, clamp, cleanups, createStore, on, tokenMs } from "./behaviors-core"
import { bindDrag } from "./behaviors-drag"
import { rubberBand } from "./behaviors-motion"

type KeyEvent = { key: string; shiftKey?: boolean; preventDefault(): void }

const arrows: Record<string, Point> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } }

export const moveMessage = (label: string, p: Point) => `${label} moved to ${Math.round(p.x)}, ${Math.round(p.y)}.`
export const resizeMessage = (label: string, size: { width: number; height: number }) =>
  `${label} resized to ${Math.round(size.width)} by ${Math.round(size.height)}.`

// ── Move ────────────────────────────────────────────────────

export type MoveOptions = {
  position: Point
  /** Keep the object inside these bounds (its own size included). */
  bounds?: () => { minX: number; minY: number; maxX: number; maxY: number }
  /** Arrow step; Shift moves ten. Default 1. Snaps to it on pointer too when snap is true. */
  step?: number
  snap?: boolean
  label?: string
  onChange?: (p: Point) => void
  onCommit?: (p: Point) => void
}

/** A freely placed object (a note on a canvas, a widget on a board). */
export function createMove(options: MoveOptions) {
  const store = createStore<{ position: Point; moving: boolean }>({ position: options.position, moving: false })
  const step = options.step ?? 1
  const fit = (p: Point): Point => {
    const s = options.snap ? { x: Math.round(p.x / step) * step, y: Math.round(p.y / step) * step } : p
    const b = options.bounds?.()
    return b ? { x: clamp(s.x, b.minX, b.maxX), y: clamp(s.y, b.minY, b.maxY) } : s
  }
  const set = (p: Point) => {
    store.set({ position: fit(p) })
    options.onChange?.(store.get().position)
  }
  let origin: Point = options.position
  return {
    ...store,
    set,
    /** Binds the pointer to a handle (or the object itself). */
    bind(handle: HTMLElement): Cleanup {
      return bindDrag(handle, {
        onStart: () => {
          origin = store.get().position
          store.set({ moving: true })
        },
        onMove: (i) => set({ x: origin.x + i.delta.x, y: origin.y + i.delta.y }),
        onEnd: () => {
          store.set({ moving: false })
          options.onCommit?.(store.get().position)
        },
        onCancel: () => {
          store.set({ moving: false })
          set(origin)
        },
      })
    },
    onKeyDown(e: KeyEvent) {
      const d = arrows[e.key]
      if (!d) return false
      e.preventDefault()
      const n = e.shiftKey ? step * 10 : step
      const p = store.get().position
      set({ x: p.x + d.x * n, y: p.y + d.y * n })
      options.onCommit?.(store.get().position)
      if (options.label) announce(moveMessage(options.label, store.get().position))
      return true
    },
  }
}

// ── Resize ──────────────────────────────────────────────────

export type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"
export type Box = { x: number; y: number; width: number; height: number }

export type ResizeOptions = {
  box: Box
  min?: { width: number; height: number }
  max?: { width: number; height: number }
  step?: number
  /** Keep width / height constant. */
  aspect?: number
  label?: string
  onChange?: (box: Box) => void
  onCommit?: (box: Box) => void
}

/** Applies an edge drag to a box, respecting min, max and aspect. */
export function resizeBox(box: Box, edge: Edge, d: Point, o: Pick<ResizeOptions, "min" | "max" | "aspect"> = {}): Box {
  const min = o.min ?? { width: 16, height: 16 }
  const max = o.max ?? { width: Infinity, height: Infinity }
  let { x, y, width, height } = box
  if (edge.includes("e")) width = clamp(box.width + d.x, min.width, max.width)
  if (edge.includes("w")) {
    width = clamp(box.width - d.x, min.width, max.width)
    x = box.x + box.width - width
  }
  if (edge.includes("s")) height = clamp(box.height + d.y, min.height, max.height)
  if (edge.includes("n")) {
    height = clamp(box.height - d.y, min.height, max.height)
    y = box.y + box.height - height
  }
  if (o.aspect) {
    if (edge === "n" || edge === "s") width = height * o.aspect
    else height = width / o.aspect
    if (edge.includes("n")) y = box.y + box.height - height
    if (edge.includes("w")) x = box.x + box.width - width
  }
  return { x, y, width, height }
}

/** Resizes a box from handles on its edges and corners; arrows resize a focused handle. */
export function createResize(options: ResizeOptions) {
  const store = createStore<{ box: Box; edge: Edge | null }>({ box: options.box, edge: null })
  let origin = options.box
  const set = (box: Box) => {
    store.set({ box })
    options.onChange?.(box)
  }
  return {
    ...store,
    set,
    bindHandle(handle: HTMLElement, edge: Edge): Cleanup {
      return bindDrag(handle, {
        threshold: 0,
        onStart: () => {
          origin = store.get().box
          store.set({ edge })
        },
        onMove: (i) => set(resizeBox(origin, edge, i.delta, options)),
        onEnd: () => {
          store.set({ edge: null })
          options.onCommit?.(store.get().box)
        },
        onCancel: () => {
          store.set({ edge: null })
          set(origin)
        },
      })
    },
    onKeyDown(edge: Edge, e: KeyEvent) {
      const d = arrows[e.key]
      if (!d) return false
      e.preventDefault()
      const n = (options.step ?? 1) * (e.shiftKey ? 10 : 1)
      set(resizeBox(store.get().box, edge, { x: d.x * n, y: d.y * n }, options))
      options.onCommit?.(store.get().box)
      if (options.label) announce(resizeMessage(options.label, store.get().box))
      return true
    },
  }
}

// ── Swipe actions ───────────────────────────────────────────

export type SwipeSide = "leading" | "trailing"

/**
 * A row that slides to reveal actions behind it (archive, snooze). Release
 * past half the actions' width, or a quick flick, opens it; past the full
 * swipe distance runs the first action at once. Pointer only: the same
 * actions must also be in the row's menu for keyboard and screen readers.
 */
export function createSwipeActions(
  row: HTMLElement,
  options: { leading?: number; trailing?: number; fullSwipe?: boolean; onAction?: (side: SwipeSide) => void }
) {
  const store = createStore<{ offset: number; open: SwipeSide | null; swiping: boolean }>({ offset: 0, open: null, swiping: false })
  let start = 0
  const lead = options.leading ?? 0
  const trail = options.trailing ?? 0
  const width = () => row.getBoundingClientRect().width || 1

  const off = bindDrag(row, {
    threshold: 8,
    onStart: () => {
      start = store.get().offset
      store.set({ swiping: true })
    },
    onMove: (i) => {
      if (Math.abs(i.delta.y) > Math.abs(i.delta.x) && !store.get().offset) return
      const raw = start + i.delta.x
      const limit = raw > 0 ? (options.fullSwipe ? width() : lead) : options.fullSwipe ? width() : trail
      const over = Math.abs(raw) - limit
      const offset = over > 0 ? Math.sign(raw) * (limit + rubberBand(over, width())) : raw
      store.set({ offset: raw > 0 && !lead ? 0 : raw < 0 && !trail ? 0 : offset })
    },
    onEnd: (i) => {
      const o = store.get().offset
      const side: SwipeSide = o > 0 ? "leading" : "trailing"
      const size = side === "leading" ? lead : trail
      const flick = Math.abs(i.velocity.x) > 0.5 && Math.sign(i.velocity.x) === Math.sign(o)
      if (options.fullSwipe && Math.abs(o) > width() * 0.6) {
        store.set({ offset: 0, open: null, swiping: false })
        options.onAction?.(side)
        return
      }
      const open = size > 0 && (Math.abs(o) > size / 2 || flick)
      store.set({ offset: open ? Math.sign(o) * size : 0, open: open ? side : null, swiping: false })
    },
    onCancel: () => store.set({ offset: 0, open: null, swiping: false }),
  })
  return { ...store, close: () => store.set({ offset: 0, open: null }), destroy: off }
}

// ── Hold and repeat ─────────────────────────────────────────

/** Runs once the press is held (delete by holding); optionally repeats while held. */
export function bindHold(el: HTMLElement, options: { onHold: () => void; delay?: number; repeat?: number; onProgress?: (p: number) => void }): Cleanup {
  let timer: ReturnType<typeof setTimeout> | undefined
  let tick: ReturnType<typeof setInterval> | undefined
  let frame = 0
  const stop = () => {
    clearTimeout(timer)
    clearInterval(tick)
    cancelAnimationFrame(frame)
    options.onProgress?.(0)
  }
  const start = (e: PointerEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent && (e.repeat || (e.key !== " " && e.key !== "Enter"))) return
    const delay = options.delay ?? tokenMs("--duration-very-slow", 600)
    const t0 = performance.now()
    const loop = () => {
      options.onProgress?.(Math.min(1, (performance.now() - t0) / delay))
      frame = requestAnimationFrame(loop)
    }
    if (options.onProgress) frame = requestAnimationFrame(loop)
    timer = setTimeout(() => {
      cancelAnimationFrame(frame)
      options.onHold()
      if (options.repeat) tick = setInterval(options.onHold, options.repeat)
    }, delay)
  }
  const c = cleanups()
  c.add(on(el, "pointerdown", start))
  c.add(on(el, "keydown", start))
  for (const t of ["pointerup", "pointerleave", "pointercancel", "keyup", "blur"] as const) c.add(on(el, t, stop))
  c.add(stop)
  return c.run
}

/** Steps once on press, then keeps stepping while held (a stepper's plus and minus). */
export function bindRepeat(el: HTMLElement, options: { onStep: () => void; delay?: number; interval?: number }): Cleanup {
  let timer: ReturnType<typeof setTimeout> | undefined
  let tick: ReturnType<typeof setInterval> | undefined
  const stop = () => {
    clearTimeout(timer)
    clearInterval(tick)
  }
  const start = (e: PointerEvent) => {
    if (e.button !== 0) return
    options.onStep()
    timer = setTimeout(() => (tick = setInterval(options.onStep, options.interval ?? 60)), options.delay ?? tokenMs("--duration-slow", 400))
  }
  const c = cleanups()
  c.add(on(el, "pointerdown", start))
  for (const t of ["pointerup", "pointerleave", "pointercancel"] as const) c.add(on(el, t, stop))
  // Keyboard: the browser's own key repeat does the repeating.
  c.add(
    on(el, "keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        options.onStep()
      }
    })
  )
  c.add(stop)
  return c.run
}

// ── Area (two-axis pad) ─────────────────────────────────────

/** Picks a value on two axes, each 0 to 1 (a colour's saturation and brightness, a priority matrix). */
export function createArea(options: { value: Point; step?: number; onChange?: (v: Point) => void; onCommit?: (v: Point) => void }) {
  const store = createStore<{ value: Point }>({ value: options.value })
  const set = (v: Point) => {
    store.set({ value: { x: clamp(v.x, 0, 1), y: clamp(v.y, 0, 1) } })
    options.onChange?.(store.get().value)
  }
  return {
    ...store,
    set,
    bind(pad: HTMLElement): Cleanup {
      const at = (p: Point) => {
        const r = pad.getBoundingClientRect()
        set({ x: (p.x - r.left) / (r.width || 1), y: (p.y - r.top) / (r.height || 1) })
      }
      const c = cleanups()
      c.add(on(pad, "pointerdown", (e) => at({ x: e.clientX, y: e.clientY })))
      c.add(
        bindDrag(pad, {
          threshold: 0,
          onMove: (i) => at(i.point),
          onEnd: () => options.onCommit?.(store.get().value),
        })
      )
      return c.run
    },
    onKeyDown(e: KeyEvent) {
      const d = arrows[e.key]
      if (!d) return false
      e.preventDefault()
      const n = (options.step ?? 0.01) * (e.shiftKey ? 10 : 1)
      const v = store.get().value
      set({ x: v.x + d.x * n, y: v.y + d.y * n })
      options.onCommit?.(store.get().value)
      return true
    },
  }
}

// ── Spans on tracks ─────────────────────────────────────────

export type Span = { id: string; track: string; start: number; end: number }

/** Whether a range fits on its track without overlapping another span. */
export function isSpanFree(spans: readonly Span[], candidate: Span): boolean {
  return !spans.some((s) => s.id !== candidate.id && s.track === candidate.track && s.start < candidate.end && candidate.start < s.end)
}

/** Places overlapping spans into lanes, first fit (meetings side by side in a day). */
export function stackSpans<T extends { start: number; end: number }>(spans: readonly T[]): { span: T; lane: number; lanes: number }[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end)
  const out: { span: T; lane: number; lanes: number }[] = []
  let group: typeof out = []
  let groupEnd = -Infinity
  const ends: number[] = []
  const flush = () => {
    const lanes = Math.max(1, ...group.map((g) => g.lane + 1))
    for (const g of group) g.lanes = lanes
    out.push(...group)
    group = []
    ends.length = 0
  }
  for (const s of sorted) {
    if (s.start >= groupEnd) flush()
    let lane = ends.findIndex((e) => e <= s.start)
    if (lane < 0) lane = ends.length
    ends[lane] = s.end
    group.push({ span: s, lane, lanes: 1 })
    groupEnd = Math.max(groupEnd, s.end)
  }
  flush()
  return out
}

export const spansMessage = (label: string, s: Span, format: (n: number) => string = String) =>
  `${label}, ${format(s.start)} to ${format(s.end)}.`

export type SpansOptions = {
  spans: () => Span[]
  /** Smallest unit the pointer snaps to (15 minutes, one day). */
  step: number
  /** Shortest span. Default one step. */
  min?: number
  /** Value at a point on a track (minutes from the track's start, say). */
  valueAt: (track: HTMLElement, p: Point) => number
  allowOverlap?: boolean
  label?: (s: Span) => string
  format?: (n: number) => string
  onChange: (spans: Span[]) => void
  onCreate?: (span: Span) => void
}

/**
 * Draw a new span by dragging on an empty track, move a span by its body,
 * resize it by its start or end handle; arrows move a focused span by one
 * step and Shift+arrows change its end.
 */
export function createSpans(options: SpansOptions) {
  const store = createStore<{ draft: Span | null; active: string | null }>({ draft: null, active: null })
  const snap = (n: number) => Math.round(n / options.step) * options.step
  const min = options.min ?? options.step
  const replace = (s: Span) => {
    const all = options.spans()
    if (!options.allowOverlap && !isSpanFree(all, s)) return false
    options.onChange(all.map((x) => (x.id === s.id ? s : x)))
    return true
  }
  let newId = 0
  return {
    ...store,
    /** Binds drawing on an empty track. */
    bindTrack(track: HTMLElement, trackId: string): Cleanup {
      let from = 0
      return bindDrag(track, {
        filter: (e) => e.target === track,
        onStart: (i) => {
          from = snap(options.valueAt(track, i.start))
        },
        onMove: (i) => {
          const to = snap(options.valueAt(track, i.point))
          const draft = { id: `new-${++newId}`, track: trackId, start: Math.min(from, to), end: Math.max(from, to, Math.min(from, to) + min) }
          store.set({ draft })
        },
        onEnd: () => {
          const d = store.get().draft
          store.set({ draft: null })
          if (d && (options.allowOverlap || isSpanFree(options.spans(), d))) options.onCreate?.(d)
        },
        onCancel: () => store.set({ draft: null }),
      })
    },
    /** Binds a span's body (move) or one of its edges (resize). */
    bindSpan(el: HTMLElement, id: string, part: "body" | "start" | "end" = "body"): Cleanup {
      let origin: Span | undefined
      let track: HTMLElement | null = null
      return bindDrag(el, {
        filter: (e) => part !== "body" || !(e.target as Element).closest("[data-span-edge]"),
        onStart: () => {
          origin = options.spans().find((s) => s.id === id)
          track = el.closest<HTMLElement>("[data-span-track]")
          store.set({ active: id })
        },
        onMove: (i) => {
          if (!origin || !track) return
          const d = snap(options.valueAt(track, i.point) - options.valueAt(track, i.start))
          const s =
            part === "body"
              ? { ...origin, start: origin.start + d, end: origin.end + d }
              : part === "start"
                ? { ...origin, start: Math.min(origin.start + d, origin.end - min) }
                : { ...origin, end: Math.max(origin.end + d, origin.start + min) }
          replace(s)
        },
        onEnd: () => store.set({ active: null }),
        onCancel: () => {
          if (origin) replace(origin)
          store.set({ active: null })
        },
      })
    },
    onKeyDown(id: string, e: KeyEvent) {
      const s = options.spans().find((x) => x.id === id)
      const d = ({ ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 } as Record<string, number>)[e.key]
      if (!s || !d) return false
      e.preventDefault()
      const n = d * options.step
      const next = e.shiftKey ? { ...s, end: Math.max(s.start + min, s.end + n) } : { ...s, start: s.start + n, end: s.end + n }
      if (replace(next)) announce(spansMessage(options.label?.(next) ?? "Range", next, options.format))
      return true
    },
  }
}

// ── Preview ─────────────────────────────────────────────────

/** Tries a value before choosing it (hovering a theme, scrubbing a date), then commits or reverts. */
export function createPreview<T>(options: { value: T; onCommit?: (v: T) => void }) {
  const store = createStore<{ value: T; preview: T | undefined }>({ value: options.value, preview: undefined })
  return {
    ...store,
    shown: () => {
      const s = store.get()
      return s.preview === undefined ? s.value : s.preview
    },
    try: (v: T) => store.set({ preview: v }),
    revert: () => store.set({ preview: undefined }),
    commit(v?: T) {
      const s = store.get()
      const value = v === undefined ? (s.preview === undefined ? s.value : s.preview) : v
      store.set({ value, preview: undefined })
      options.onCommit?.(value)
    },
    /** The parent's value changed (controlled). */
    sync: (value: T) => store.set({ value }),
  }
}
