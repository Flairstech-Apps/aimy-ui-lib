// Canvas: a viewport that pans and zooms (wheel, pinch, drag on the ground,
// keyboard) and converts between screen and canvas coordinates, and
// connecting ports (a flow's steps, a workflow's nodes) by pointer or
// keyboard, with what a screen reader hears at each step.

import { type Cleanup, type Point, announce, clamp, cleanups, createStore, on } from "./behaviors-core"
import { bindDrag } from "./behaviors-drag"

export type ViewportState = { x: number; y: number; zoom: number }

export type ViewportOptions = {
  initial?: Partial<ViewportState>
  minZoom?: number
  maxZoom?: number
  /** Keyboard pan step in screen pixels. Default 40. */
  panStep?: number
  onChange?: (v: ViewportState) => void
}

/**
 * Pans and zooms a canvas. x and y are the screen offset of the canvas
 * origin; a canvas point p is drawn at p * zoom + (x, y). Ctrl+wheel or a
 * pinch zooms at the pointer; wheel pans; dragging the ground pans; + and -
 * zoom, 0 resets, the arrows pan.
 */
export function createViewport(options: ViewportOptions = {}) {
  const min = options.minZoom ?? 0.1
  const max = options.maxZoom ?? 4
  const store = createStore<ViewportState>({ x: 0, y: 0, zoom: 1, ...options.initial })
  const set = (v: Partial<ViewportState>) => {
    store.set(v)
    options.onChange?.(store.get())
  }
  const toCanvas = (p: Point): Point => {
    const { x, y, zoom } = store.get()
    return { x: (p.x - x) / zoom, y: (p.y - y) / zoom }
  }
  const toScreen = (p: Point): Point => {
    const { x, y, zoom } = store.get()
    return { x: p.x * zoom + x, y: p.y * zoom + y }
  }
  /** Zooms keeping the screen point `at` still. */
  const zoomAt = (zoom: number, at: Point) => {
    const z = clamp(zoom, min, max)
    const c = toCanvas(at)
    set({ zoom: z, x: at.x - c.x * z, y: at.y - c.y * z })
  }
  let el: HTMLElement | null = null
  const centre = (): Point => {
    const r = el?.getBoundingClientRect()
    return r ? { x: r.width / 2, y: r.height / 2 } : { x: 0, y: 0 }
  }
  const local = (e: { clientX: number; clientY: number }): Point => {
    const r = el!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  return {
    ...store,
    set,
    toCanvas,
    toScreen,
    zoomAt,
    zoomIn: () => zoomAt(store.get().zoom * 1.25, centre()),
    zoomOut: () => zoomAt(store.get().zoom / 1.25, centre()),
    reset: () => set({ x: 0, y: 0, zoom: 1 }),
    /** Fits a canvas rect in the viewport with padding. */
    fit(rect: { x: number; y: number; width: number; height: number }, padding = 32) {
      const r = el?.getBoundingClientRect()
      if (!r || !rect.width || !rect.height) return
      const zoom = clamp(Math.min((r.width - padding * 2) / rect.width, (r.height - padding * 2) / rect.height), min, max)
      set({ zoom, x: r.width / 2 - (rect.x + rect.width / 2) * zoom, y: r.height / 2 - (rect.y + rect.height / 2) * zoom })
    },
    bind(viewport: HTMLElement): Cleanup {
      el = viewport
      const c = cleanups()
      c.add(
        on(viewport, "wheel", (e) => {
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) zoomAt(store.get().zoom * Math.exp(-e.deltaY * 0.01), local(e))
          else {
            const v = store.get()
            set({ x: v.x - e.deltaX, y: v.y - e.deltaY })
          }
        }, { passive: false })
      )
      // Two pointers pinch.
      const pts = new Map<number, Point>()
      let pinch: { d: number; zoom: number } | null = null
      c.add(on(viewport, "pointerdown", (e) => void pts.set(e.pointerId, local(e))))
      c.add(
        on(viewport, "pointermove", (e) => {
          if (!pts.has(e.pointerId)) return
          pts.set(e.pointerId, local(e))
          if (pts.size !== 2) return
          const [a, b] = [...pts.values()] as [Point, Point]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (!pinch) pinch = { d, zoom: store.get().zoom }
          else zoomAt(pinch.zoom * (d / pinch.d), { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
        })
      )
      const lift = (e: PointerEvent) => {
        pts.delete(e.pointerId)
        if (pts.size < 2) pinch = null
      }
      c.add(on(viewport, "pointerup", lift))
      c.add(on(viewport, "pointercancel", lift))
      // Drag on the ground (not on a node) pans.
      let origin = store.get()
      c.add(
        bindDrag(viewport, {
          filter: (e) => (e.target === viewport || (e.target as Element).hasAttribute?.("data-canvas-ground")) && pts.size <= 1,
          onStart: () => (origin = store.get()),
          onMove: (i) => {
            if (pts.size > 1) return
            set({ x: origin.x + i.delta.x, y: origin.y + i.delta.y })
          },
        })
      )
      c.add(
        on(viewport, "keydown", (e) => {
          if (e.target !== viewport) return
          const step = (options.panStep ?? 40) * (e.shiftKey ? 4 : 1)
          const v = store.get()
          const map: Record<string, () => void> = {
            "+": () => zoomAt(v.zoom * 1.25, centre()),
            "=": () => zoomAt(v.zoom * 1.25, centre()),
            "-": () => zoomAt(v.zoom / 1.25, centre()),
            "0": () => set({ x: 0, y: 0, zoom: 1 }),
            ArrowLeft: () => set({ x: v.x + step }),
            ArrowRight: () => set({ x: v.x - step }),
            ArrowUp: () => set({ y: v.y + step }),
            ArrowDown: () => set({ y: v.y - step }),
          }
          const fn = map[e.key]
          if (!fn) return
          e.preventDefault()
          fn()
        })
      )
      c.add(() => (el = null))
      return c.run
    },
  }
}

// ── Connect ─────────────────────────────────────────────────

export type Port = { id: string; node: string; kind: "in" | "out"; label: string }

export type ConnectPhase = "start" | "target" | "connect" | "cancel" | "blocked"

export function connectMessage(phase: ConnectPhase, from: Port, to?: Port): string {
  switch (phase) {
    case "start":
      return `Connecting from ${from.label}. Use the arrow keys to choose where it goes, Enter to connect, Escape to cancel.`
    case "target":
      return `To ${to?.label ?? "nothing"}.`
    case "connect":
      return `Connected ${from.label} to ${to?.label ?? ""}.`
    case "blocked":
      return `${from.label} can't connect to ${to?.label ?? "that"}.`
    case "cancel":
      return "Connection cancelled."
  }
}

/**
 * Connects an output port to an input port. Pointer: drag from a port, the
 * state's pointer drives the line, release over a port connects. Keyboard:
 * Enter on a port starts, arrows pick among the ports that can accept it,
 * Enter connects, Escape cancels.
 */
export function createConnect(options: {
  ports: () => (Port & { el: HTMLElement })[]
  canConnect?: (from: Port, to: Port) => boolean
  onConnect: (from: Port, to: Port) => void
}) {
  const store = createStore<{ from: string | null; over: string | null; pointer: Point | null }>({ from: null, over: null, pointer: null })
  const can = (a: Port, b: Port) => a.kind !== b.kind && a.node !== b.node && (options.canConnect?.(a, b) ?? true)
  const port = (id: string | null) => options.ports().find((p) => p.id === id)
  const targets = () => {
    const f = port(store.get().from)
    return f ? options.ports().filter((p) => can(f, p)) : []
  }
  const finish = () => {
    const f = port(store.get().from)
    const t = port(store.get().over)
    store.set({ from: null, over: null, pointer: null })
    if (!f) return
    if (t && can(f, t)) {
      const [out, inn] = f.kind === "out" ? [f, t] : [t, f]
      options.onConnect(out, inn)
      announce(connectMessage("connect", out, inn))
    } else if (t) announce(connectMessage("blocked", f, t))
  }
  const portAt = (p: Point) =>
    options.ports().find((x) => {
      const r = x.el.getBoundingClientRect()
      return p.x >= r.left - 6 && p.x <= r.right + 6 && p.y >= r.top - 6 && p.y <= r.bottom + 6
    })

  return {
    ...store,
    targets,
    bindPort(el: HTMLElement, id: string): Cleanup {
      return bindDrag(el, {
        onStart: () => store.set({ from: id, over: null }),
        onMove: (i) => {
          const over = portAt(i.point)
          store.set({ pointer: i.point, over: over && over.id !== id ? over.id : null })
        },
        onEnd: finish,
        onCancel: () => store.set({ from: null, over: null, pointer: null }),
      })
    },
    onKeyDown(id: string, e: { key: string; preventDefault(): void }) {
      const s = store.get()
      if (e.key === "Enter") {
        e.preventDefault()
        if (!s.from) {
          const f = port(id)
          if (!f) return true
          const first = options.ports().find((p) => can(f, p))
          store.set({ from: id, over: first?.id ?? null })
          announce(connectMessage("start", f) + (first ? ` ${connectMessage("target", f, first)}` : ""))
        } else finish()
        return true
      }
      if (!s.from) return false
      if (e.key === "Escape") {
        e.preventDefault()
        store.set({ from: null, over: null, pointer: null })
        announce(connectMessage("cancel", port(s.from)!))
        return true
      }
      const d = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key]
      if (!d) return false
      e.preventDefault()
      const list = targets()
      if (!list.length) return true
      const at = list.findIndex((p) => p.id === s.over)
      const next = list[(at + d + list.length) % list.length]!
      store.set({ over: next.id })
      announce(connectMessage("target", port(s.from)!, next))
      return true
    },
  }
}
