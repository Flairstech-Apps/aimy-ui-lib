// Popups and layers: placing a panel beside its control and flipping it
// when there's no room, a stack of layers where Escape and a press outside
// close only the topmost, layers that stay usable over a modal (toasts),
// locking the page's scroll and hiding the page from screen readers behind
// a modal. These replace what the parts took from Radix.

import { type Cleanup, cleanups, isBrowser, on } from "./behaviors-core"

// ── Position ────────────────────────────────────────────────

export type Side = "top" | "right" | "bottom" | "left"
export type Align = "start" | "center" | "end"

export type PositionOptions = {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  /** Space kept clear of the window's edges. Default 8. */
  collisionPadding?: number
  /** Flip to the other side and shift along the edge to stay on screen. Default true. */
  avoidCollisions?: boolean
}

export type Placement = {
  x: number
  y: number
  side: Side
  align: Align
  /** Room left between the anchor and the window's edge on the chosen side. */
  availableWidth: number
  availableHeight: number
  anchorWidth: number
  anchorHeight: number
  transformOrigin: string
}

type R = { top: number; left: number; width: number; height: number }

const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" }

/**
 * Where a floating panel goes beside an anchor, in viewport coordinates
 * (use position: fixed). Pure, so it can be tested without a browser.
 */
export function computePosition(anchor: R, floating: { width: number; height: number }, viewport: { width: number; height: number }, o: PositionOptions = {}): Placement {
  const pad = o.collisionPadding ?? 8
  const offset = o.sideOffset ?? 0
  const alignOffset = o.alignOffset ?? 0
  let side = o.side ?? "bottom"
  const align = o.align ?? "center"
  const vertical = (s: Side) => s === "top" || s === "bottom"

  const room = (s: Side) =>
    s === "bottom"
      ? viewport.height - (anchor.top + anchor.height) - offset - pad
      : s === "top"
        ? anchor.top - offset - pad
        : s === "right"
          ? viewport.width - (anchor.left + anchor.width) - offset - pad
          : anchor.left - offset - pad

  if (o.avoidCollisions !== false) {
    const need = vertical(side) ? floating.height : floating.width
    if (room(side) < need && room(opposite[side]) > room(side)) side = opposite[side]
  }

  let x: number
  let y: number
  if (vertical(side)) {
    y = side === "bottom" ? anchor.top + anchor.height + offset : anchor.top - offset - floating.height
    x = align === "start" ? anchor.left + alignOffset : align === "end" ? anchor.left + anchor.width - floating.width - alignOffset : anchor.left + anchor.width / 2 - floating.width / 2
  } else {
    x = side === "right" ? anchor.left + anchor.width + offset : anchor.left - offset - floating.width
    y = align === "start" ? anchor.top + alignOffset : align === "end" ? anchor.top + anchor.height - floating.height - alignOffset : anchor.top + anchor.height / 2 - floating.height / 2
  }

  if (o.avoidCollisions !== false) {
    // Shift along the edge to stay inside the window.
    if (vertical(side)) x = Math.max(pad, Math.min(x, viewport.width - pad - floating.width))
    else y = Math.max(pad, Math.min(y, viewport.height - pad - floating.height))
  }

  const ax = anchor.left + anchor.width / 2 - x
  const ay = anchor.top + anchor.height / 2 - y
  const transformOrigin = vertical(side) ? `${Math.round(ax)}px ${side === "bottom" ? "0px" : `${floating.height}px`}` : `${side === "right" ? "0px" : `${floating.width}px`} ${Math.round(ay)}px`

  return {
    x: Math.round(x),
    y: Math.round(y),
    side,
    align,
    availableHeight: Math.max(0, vertical(side) ? room(side) : viewport.height - pad * 2),
    availableWidth: Math.max(0, vertical(side) ? viewport.width - pad * 2 : room(side)),
    anchorWidth: anchor.width,
    anchorHeight: anchor.height,
    transformOrigin,
  }
}

/** Measures and places; returns the placement. */
export function position(anchor: Element, floating: HTMLElement, options: PositionOptions = {}): Placement {
  const a = anchor.getBoundingClientRect()
  const p = computePosition(
    { top: a.top, left: a.left, width: a.width, height: a.height },
    { width: floating.offsetWidth, height: floating.offsetHeight },
    { width: document.documentElement.clientWidth || window.innerWidth, height: window.innerHeight },
    options
  )
  return p
}

/** Calls update whenever the anchor or panel could have moved: scroll anywhere, resize, either changing size. */
export function autoUpdate(anchor: Element, floating: HTMLElement, update: () => void): Cleanup {
  const c = cleanups()
  let frame = 0
  const schedule = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(update)
  }
  c.add(on(window, "scroll", schedule, { capture: true, passive: true }))
  c.add(on(window, "resize", schedule))
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(schedule)
    ro.observe(anchor)
    ro.observe(floating)
    c.add(() => ro.disconnect())
  }
  c.add(() => cancelAnimationFrame(frame))
  update()
  return c.run
}

// ── Layers ──────────────────────────────────────────────────

export type DismissReason = "escape" | "outside-press" | "focus-outside"

export const isDismissal = (reason: unknown): reason is DismissReason =>
  reason === "escape" || reason === "outside-press" || reason === "focus-outside"

/** The event an outside press or outside focus hands to its handler; preventDefault() keeps the layer open. */
export type OutsideEvent = CustomEvent<{ originalEvent: PointerEvent | FocusEvent }>

export type LayerOptions = {
  onDismiss: (reason: DismissReason) => void
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  onPointerDownOutside?: (e: OutsideEvent) => void
  onFocusOutside?: (e: OutsideEvent) => void
  /** Same event for both, like Radix's onInteractOutside. */
  onInteractOutside?: (e: OutsideEvent) => void
  /** Elements that count as inside (the trigger, so pressing it toggles instead of closing and reopening). */
  branches?: () => (Element | null | undefined)[]
  /** Close when focus moves outside. Default false (popovers that hold fields stay open). */
  dismissOnFocusOutside?: boolean
}

type Layer = { el: HTMLElement; o: LayerOptions }

const layers: Layer[] = []
let release: Cleanup | null = null

const persistent = (t: Element) => !!t.closest("[data-aimy-persistent]")

function inside(layer: Layer, t: Node): boolean {
  if (layer.el.contains(t)) return true
  return (layer.o.branches?.() ?? []).some((b) => b?.contains(t))
}

function outside(layer: Layer, original: PointerEvent | FocusEvent, reason: DismissReason, handler?: (e: OutsideEvent) => void) {
  const ce = new CustomEvent("aimy.layer.outside", { cancelable: true, detail: { originalEvent: original } }) as OutsideEvent
  ;(original.target ?? document).dispatchEvent(ce)
  handler?.(ce)
  if (!ce.defaultPrevented) layer.o.onInteractOutside?.(ce)
  if (!ce.defaultPrevented) layer.o.onDismiss(reason)
}

function install() {
  const c = cleanups()
  c.add(
    on(document, "keydown", (e) => {
      if (e.key !== "Escape" || e.defaultPrevented) return
      const top = layers[layers.length - 1]
      if (!top) return
      top.o.onEscapeKeyDown?.(e)
      if (e.defaultPrevented) return
      e.preventDefault()
      top.o.onDismiss("escape")
    })
  )
  c.add(
    on(document, "pointerdown", (e) => {
      const top = layers[layers.length - 1]
      const t = e.target as Element | null
      if (!top || !t || persistent(t)) return
      // Inside the top layer, or inside any layer above it: nothing to do.
      if (inside(top, t)) return
      outside(top, e, "outside-press", top.o.onPointerDownOutside)
    }, true)
  )
  c.add(
    on(document, "focusin", (e) => {
      const top = layers[layers.length - 1]
      const t = e.target as Element | null
      if (!top?.o.dismissOnFocusOutside || !t || persistent(t) || inside(top, t)) return
      outside(top, e, "focus-outside", top.o.onFocusOutside)
    })
  )
  return c.run
}

/**
 * Registers a floating element as a layer. Escape and a press outside reach
 * only the topmost layer, so closing a menu inside a dialog leaves the
 * dialog open.
 */
export function bindLayer(el: HTMLElement, options: LayerOptions): Cleanup {
  const layer: Layer = { el, o: options }
  layers.push(layer)
  el.setAttribute("data-aimy-layer", "")
  if (!release) release = install()
  return () => {
    const i = layers.indexOf(layer)
    if (i >= 0) layers.splice(i, 1)
    el.removeAttribute("data-aimy-layer")
    if (!layers.length && release) {
      release()
      release = null
    }
  }
}

/** True while el is the topmost layer. */
export const isTopLayer = (el: HTMLElement) => layers[layers.length - 1]?.el === el

/**
 * Keeps an element usable over every layer, modal ones included: pressing
 * a toast doesn't close a dialog, and a focus trap lets focus into it.
 */
export function bindPersistentLayer(el: HTMLElement): Cleanup {
  el.setAttribute("data-aimy-persistent", "")
  return () => el.removeAttribute("data-aimy-persistent")
}

export function supportsTopLayer(): boolean {
  return isBrowser && typeof HTMLElement.prototype.showPopover === "function"
}

// ── Modal helpers ───────────────────────────────────────────

let locks = 0
let saved: { overflow: string; paddingRight: string } | null = null

/** Stops the page behind a modal from scrolling, without the layout jumping where the scrollbar was. */
export function lockScroll(): Cleanup {
  if (!isBrowser) return () => {}
  if (locks++ === 0) {
    const body = document.body
    const bar = window.innerWidth - document.documentElement.clientWidth
    saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
    body.style.overflow = "hidden"
    if (bar > 0) body.style.paddingRight = `calc(${getComputedStyle(body).paddingRight} + ${bar}px)`
    body.setAttribute("data-scroll-locked", "")
  }
  let done = false
  return () => {
    if (done) return
    done = true
    if (--locks === 0 && saved) {
      document.body.style.overflow = saved.overflow
      document.body.style.paddingRight = saved.paddingRight
      document.body.removeAttribute("data-scroll-locked")
      saved = null
    }
  }
}

const hiddenCount = new WeakMap<Element, number>()

/**
 * Hides everything outside the modal from screen readers (aria-hidden on
 * the page's other branches), so the reader stays in the dialog. Live
 * regions and persistent layers stay audible.
 */
export function hideOthers(keep: Element | Element[]): Cleanup {
  if (!isBrowser) return () => {}
  const keeps = Array.isArray(keep) ? keep : [keep]
  const touched: Element[] = []
  const skip = (el: Element) =>
    keeps.some((k) => el.contains(k) || k.contains(el)) ||
    el.matches("script,style,[aria-live],[data-aimy-persistent],[data-slot=announcer]") ||
    !!el.querySelector("[aria-live],[data-aimy-persistent]")
  const walk = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (keeps.some((k) => child.contains(k)) && !keeps.includes(child)) walk(child)
      else if (!skip(child)) {
        const n = hiddenCount.get(child) ?? 0
        if (n === 0) child.setAttribute("data-aimy-was-hidden", child.getAttribute("aria-hidden") ?? "")
        hiddenCount.set(child, n + 1)
        child.setAttribute("aria-hidden", "true")
        touched.push(child)
      }
    }
  }
  walk(document.body)
  return () => {
    for (const el of touched) {
      const n = (hiddenCount.get(el) ?? 1) - 1
      hiddenCount.set(el, n)
      if (n === 0) {
        const was = el.getAttribute("data-aimy-was-hidden")
        if (was) el.setAttribute("aria-hidden", was)
        else el.removeAttribute("aria-hidden")
        el.removeAttribute("data-aimy-was-hidden")
      }
    }
  }
}
