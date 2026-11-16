// The kernel every AiMY behaviour is built on: a small store, an announcer
// for screen readers, and a few DOM helpers. Plain TypeScript with no
// framework, so a behaviour can be unit-tested on its own and wrapped by the
// React hooks in behaviors-react.ts. The shape follows UI SDK's
// (vercel-labs/ui, Apache-2.0): behaviours are created, bound to elements,
// and return a cleanup.

export type Cleanup = () => void

export type Listener<T> = (state: T, prev: T) => void

/** A tiny observable state holder. Behaviours keep their state in one. */
export type Store<T> = {
  get(): T
  set(patch: Partial<T> | ((state: T) => Partial<T>)): void
  subscribe(listener: Listener<T>): Cleanup
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<Listener<T>>()
  return {
    get: () => state,
    set(patch) {
      const next = typeof patch === "function" ? patch(state) : patch
      let changed = false
      for (const k in next) {
        if (!Object.is(next[k], state[k])) {
          changed = true
          break
        }
      }
      if (!changed) return
      const prev = state
      state = { ...state, ...next }
      for (const l of listeners) l(state, prev)
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const isBrowser = typeof window !== "undefined" && typeof document !== "undefined"

/** Adds a listener and returns the function that removes it. */
export function on<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean
): Cleanup
export function on<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  fn: (e: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean
): Cleanup
export function on<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  fn: (e: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean
): Cleanup
export function on(target: EventTarget, type: string, fn: (e: Event) => void, options?: AddEventListenerOptions | boolean): Cleanup {
  target.addEventListener(type, fn, options)
  return () => target.removeEventListener(type, fn, options)
}

/** Runs every cleanup once, last added first. */
export function cleanups(): { add(fn: Cleanup | void | undefined): void; run: Cleanup } {
  const list: Cleanup[] = []
  return {
    add: (fn) => {
      if (fn) list.push(fn)
    },
    run: () => {
      while (list.length) list.pop()?.()
    },
  }
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function reducedMotion(): boolean {
  return isBrowser && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Reads a motion token (--duration-*, --t-*) as milliseconds, so behaviours
 * time themselves from the same values as the CSS. Falls back when the token
 * is missing (a test, or a page without the tokens).
 */
export function tokenMs(name: string, fallback: number): number {
  if (!isBrowser) return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return fallback
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return fallback
  return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : n
}

/** Reads an easing token (--ease-smooth-out, --ease-spring) for the Web Animations API. */
export function tokenEase(name: string, fallback = "ease-out"): string {
  if (!isBrowser) return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

// ── Announcer ───────────────────────────────────────────────
// One polite and one assertive live region, created on first use. Drag,
// reorder, resize and the like say what happened in plain English.

const regions: Partial<Record<"polite" | "assertive", HTMLElement>> = {}

function region(politeness: "polite" | "assertive") {
  let el = regions[politeness]
  if (el?.isConnected) return el
  el = document.createElement("div")
  el.setAttribute("aria-live", politeness)
  el.setAttribute("aria-atomic", "true")
  el.setAttribute("data-slot", "announcer")
  el.style.cssText =
    "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0"
  document.body.appendChild(el)
  regions[politeness] = el
  return el
}

/** Says a message to screen readers without moving focus. */
export function announce(message: string, politeness: "polite" | "assertive" = "polite") {
  if (!isBrowser || !message) return
  const el = region(politeness)
  // Clear first so the same words said twice are read twice.
  el.textContent = ""
  requestAnimationFrame(() => {
    el.textContent = message
  })
}

/** Reads the current text of the announcer (for tests). */
export function lastAnnouncement(politeness: "polite" | "assertive" = "polite"): string {
  return regions[politeness]?.textContent ?? ""
}

/** Ids that stay stable for the life of the page. */
let uid = 0
export const nextId = (prefix = "aimy") => `${prefix}-${++uid}`

export type Point = { x: number; y: number }
export type Rect = { x: number; y: number; width: number; height: number }

export const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, width: r.width, height: r.height }
}

export const intersects = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y

export const isRtl = (el: Element) => getComputedStyle(el).direction === "rtl"
