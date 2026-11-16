// Focus and keys: one Tab stop per group, arrows inside it, typeahead, focus
// that survives the focused item being removed, and focus traps for modal
// layers. Keyboard is a first-class input in every AiMY product; these are
// the shared answers instead of each part writing its own.

import { type Cleanup, type Rect, cleanups, isRtl, on, rectOf, tokenMs } from "./behaviors-core"

const TABBABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable=false])",
  "[tabindex]",
].join(",")

function hiddenByStyle(el: Element, root: Element): boolean {
  for (let n: Element | null = el; n && n !== root.parentElement; n = n.parentElement) {
    if (n.hasAttribute("hidden") || n.hasAttribute("inert")) return true
    const s = getComputedStyle(n)
    if (s.display === "none" || s.visibility === "hidden") return true
  }
  return false
}

/** Everything inside root that Tab can reach, in Tab order. */
export function tabbables(root: Element): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.tabIndex >= 0 && !el.hasAttribute("disabled") && !hiddenByStyle(el, root)
  )
  const positive = all.filter((el) => el.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex)
  return [...positive, ...all.filter((el) => el.tabIndex === 0)]
}

/** Focuses without scrolling the page under the user. */
export function focus(el: HTMLElement | null | undefined, select = false) {
  if (!el) return
  el.focus({ preventScroll: true })
  if (select && el instanceof HTMLInputElement) el.select()
}

// ── Focus trap ──────────────────────────────────────────────

export type FocusTrapOptions = {
  /** Where focus goes on activate. Default: the first field, else the first tabbable, else the container. */
  initialFocus?: HTMLElement | (() => HTMLElement | null | undefined)
  /** Called before focus moves in; preventDefault() keeps focus where it is. */
  onMountFocus?: (e: Event) => void
  /** Called before focus returns; preventDefault() leaves focus alone. */
  onUnmountFocus?: (e: Event) => void
  /** Return focus to what had it before. Default true. */
  returnFocus?: boolean
}

const traps: HTMLElement[] = []

/**
 * Keeps Tab inside the container while it is the topmost trap, and returns
 * focus to where it was when released. Traps stack: a dialog opened from a
 * dialog traps, and closing it hands the trap back.
 */
export function createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}): Cleanup {
  const before = document.activeElement as HTMLElement | null
  traps.push(container)
  const top = () => traps[traps.length - 1] === container

  const mount = new Event("aimy.focus.mount", { cancelable: true })
  options.onMountFocus?.(mount)
  if (!mount.defaultPrevented && !container.contains(document.activeElement)) {
    const pick = typeof options.initialFocus === "function" ? options.initialFocus() : options.initialFocus
    const list = tabbables(container)
    const field = list.find((el) => el.matches("input,textarea,[contenteditable]:not([contenteditable=false])"))
    if (!container.hasAttribute("tabindex")) container.tabIndex = -1
    focus(pick ?? field ?? list[0] ?? container)
  }

  const c = cleanups()
  c.add(
    on(document, "keydown", (e) => {
      if (e.key !== "Tab" || !top() || e.defaultPrevented) return
      const list = tabbables(container)
      if (!list.length) {
        e.preventDefault()
        focus(container)
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === container)) {
        e.preventDefault()
        focus(last)
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        focus(first)
      }
    })
  )
  c.add(
    on(document, "focusin", (e) => {
      if (!top()) return
      const t = e.target as Node | null
      if (t && !container.contains(t) && !(t instanceof Element && t.closest("[data-aimy-persistent]"))) {
        focus(tabbables(container)[0] ?? container)
      }
    })
  )

  return () => {
    c.run()
    const i = traps.lastIndexOf(container)
    if (i >= 0) traps.splice(i, 1)
    const unmount = new Event("aimy.focus.unmount", { cancelable: true })
    options.onUnmountFocus?.(unmount)
    if (options.returnFocus === false || unmount.defaultPrevented) return
    if (before?.isConnected) focus(before)
  }
}

// ── Roving focus ────────────────────────────────────────────

export type Orientation = "horizontal" | "vertical" | "both"

export type RovingFocusOptions = {
  /** The items, in order. Called on every key so the list can change. */
  items: () => HTMLElement[]
  orientation?: Orientation
  /** Wrap from the last item to the first. Default true. */
  loop?: boolean
  /** Moving focus also activates (tabs, radio groups). */
  onMove?: (el: HTMLElement, index: number) => void
  /** Skip items for which this is true (aria-disabled ones by default). */
  skip?: (el: HTMLElement) => boolean
}

/**
 * One Tab stop for the whole group; arrows, Home and End move between items.
 * The item last focused keeps tabindex 0 so Tab comes back to it.
 */
export function createRovingFocus(root: HTMLElement, options: RovingFocusOptions) {
  const { orientation = "vertical", loop = true } = options
  const skip = options.skip ?? ((el: HTMLElement) => el.getAttribute("aria-disabled") === "true" || el.hasAttribute("disabled"))

  const usable = () => options.items().filter((el) => !skip(el))

  function setActive(el: HTMLElement | undefined) {
    const items = options.items()
    if (!el) el = items.find((i) => i.tabIndex === 0) ?? usable()[0]
    for (const i of items) i.tabIndex = i === el ? 0 : -1
  }

  function move(to: HTMLElement | undefined) {
    if (!to) return
    setActive(to)
    focus(to)
    options.onMove?.(to, options.items().indexOf(to))
  }

  function onKey(e: KeyboardEvent) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    const list = usable()
    const at = list.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    const rtl = isRtl(root)
    const next = rtl ? "ArrowLeft" : "ArrowRight"
    const prev = rtl ? "ArrowRight" : "ArrowLeft"
    const keys: Record<string, number | "first" | "last"> = { Home: "first", End: "last" }
    if (orientation !== "horizontal") Object.assign(keys, { ArrowDown: 1, ArrowUp: -1 })
    if (orientation !== "vertical") Object.assign(keys, { [next]: 1, [prev]: -1 })
    const step = keys[e.key]
    if (step === undefined) return
    e.preventDefault()
    if (step === "first") return move(list[0])
    if (step === "last") return move(list[list.length - 1])
    let i = at + step
    if (loop) i = (i + list.length) % list.length
    move(list[Math.max(0, Math.min(list.length - 1, i))])
  }

  setActive(undefined)
  const c = cleanups()
  c.add(on(root, "keydown", onKey))
  c.add(
    on(root, "focusin", (e) => {
      const t = e.target as HTMLElement
      if (options.items().includes(t)) setActive(t)
    })
  )
  return { setActive, move, refresh: () => setActive(undefined), destroy: c.run }
}

// ── Grid focus ──────────────────────────────────────────────

export type GridCell = { row: number; col: number }

export type GridFocusOptions = {
  rows: () => number
  cols: () => number
  /** The cell's element, or null when it isn't rendered (a virtual row). */
  cell: (row: number, col: number) => HTMLElement | null
  /** Called before focusing, so a virtual list can scroll the cell into existence. */
  onMove?: (to: GridCell) => void
  /** Rows a Page Up or Page Down moves. Default 10. */
  pageSize?: number
}

/** Arrows by row and column, Home and End on the row, Ctrl+Home and End on the grid, Page Up and Down. */
export function createGridFocus(root: HTMLElement, options: GridFocusOptions) {
  let at: GridCell = { row: 0, col: 0 }

  function go(to: GridCell) {
    const rows = options.rows()
    const cols = options.cols()
    if (!rows || !cols) return
    const prev = at
    at = { row: Math.max(0, Math.min(rows - 1, to.row)), col: Math.max(0, Math.min(cols - 1, to.col)) }
    options.onMove?.(at)
    const apply = () => {
      const old = options.cell(prev.row, prev.col)
      if (old) old.tabIndex = -1
      const el = options.cell(at.row, at.col)
      if (el) {
        el.tabIndex = 0
        focus(el)
      }
    }
    // A virtual cell may only exist on the next frame.
    if (options.cell(at.row, at.col)) apply()
    else requestAnimationFrame(apply)
  }

  function onKey(e: KeyboardEvent) {
    if (e.defaultPrevented || e.altKey) return
    const page = options.pageSize ?? 10
    const ctrl = e.ctrlKey || e.metaKey
    const rtl = isRtl(root) ? -1 : 1
    const moves: Record<string, GridCell> = {
      ArrowUp: { row: at.row - 1, col: at.col },
      ArrowDown: { row: at.row + 1, col: at.col },
      ArrowLeft: { row: at.row, col: at.col - rtl },
      ArrowRight: { row: at.row, col: at.col + rtl },
      PageUp: { row: at.row - page, col: at.col },
      PageDown: { row: at.row + page, col: at.col },
      Home: ctrl ? { row: 0, col: 0 } : { row: at.row, col: 0 },
      End: ctrl ? { row: Infinity, col: Infinity } : { row: at.row, col: Infinity },
    }
    const to = moves[e.key]
    if (!to) return
    e.preventDefault()
    go(to)
  }

  const c = cleanups()
  c.add(on(root, "keydown", onKey))
  c.add(
    on(root, "focusin", (e) => {
      for (let r = 0; r < options.rows(); r++)
        for (let col = 0; col < options.cols(); col++)
          if (options.cell(r, col) === e.target) {
            at = { row: r, col }
            return
          }
    })
  )
  return { go, get: () => at, destroy: c.run }
}

/** Only the cells focus leaves and enters, for parts that render per cell. */
export function byCell(prev: GridCell, next: GridCell): GridCell[] {
  return prev.row === next.row && prev.col === next.col ? [] : [prev, next]
}

// ── Spatial moves ───────────────────────────────────────────

export type Direction = "up" | "down" | "left" | "right"

/** The nearest candidate in a direction from a rect, by on-screen position. */
export function nearestInDirection<T extends Element>(from: Rect, candidates: T[], dir: Direction): T | undefined {
  const cx = from.x + from.width / 2
  const cy = from.y + from.height / 2
  let best: T | undefined
  let bestScore = Infinity
  for (const el of candidates) {
    const r = rectOf(el)
    const x = r.x + r.width / 2
    const y = r.y + r.height / 2
    const dx = x - cx
    const dy = y - cy
    const ahead = dir === "up" ? dy < -1 : dir === "down" ? dy > 1 : dir === "left" ? dx < -1 : dx > 1
    if (!ahead) continue
    const main = dir === "up" || dir === "down" ? Math.abs(dy) : Math.abs(dx)
    const cross = dir === "up" || dir === "down" ? Math.abs(dx) : Math.abs(dy)
    // Straight ahead beats diagonal: the cross distance counts double.
    const score = main + cross * 2
    if (score < bestScore) {
      bestScore = score
      best = el
    }
  }
  return best
}

/** Moves focus to the nearest item in the arrow's direction (cards, canvases). */
export function spatialMove(from: HTMLElement, candidates: HTMLElement[], key: string): HTMLElement | undefined {
  const dir = ({ ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" } as const)[key as "ArrowUp"]
  if (!dir) return undefined
  const to = nearestInDirection(rectOf(from), candidates.filter((c) => c !== from), dir)
  focus(to)
  return to
}

// ── Typeahead ───────────────────────────────────────────────

export type TypeaheadOptions<T> = {
  items: () => T[]
  text: (item: T) => string
  /** The current item, so repeated letters cycle from it. */
  current?: () => T | undefined
  onMatch: (item: T) => void
  /** How long a pause ends the word. Default --duration-slow, else 500ms. */
  timeout?: number
}

/** Typing letters jumps to the first item that starts with them. Repeating one letter cycles. */
export function createTypeahead<T>(options: TypeaheadOptions<T>) {
  let query = ""
  let timer: ReturnType<typeof setTimeout> | undefined

  function key(char: string): boolean {
    if (char.length !== 1 || (char === " " && !query)) return false
    clearTimeout(timer)
    timer = setTimeout(() => (query = ""), options.timeout ?? tokenMs("--duration-slow", 500))
    query += char.toLowerCase()
    const items = options.items()
    const repeated = query.length > 1 && query.split("").every((c) => c === query[0])
    const search = repeated ? query[0]! : query
    const cur = options.current?.()
    const start = cur ? items.indexOf(cur) : -1
    // A new word or a repeated letter searches from the next item; a longer
    // word keeps matching from the current one.
    const from = Math.max(0, start + (repeated || query.length === 1 ? 1 : 0))
    const order = [...items.slice(from), ...items.slice(0, from)]
    const hit = order.find((i) => options.text(i).trim().toLowerCase().startsWith(search))
    if (hit !== undefined) options.onMatch(hit)
    return true
  }

  return {
    /** Feed a key; returns true when it was a typeahead letter. */
    key,
    onKeyDown(e: KeyboardEvent | { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean; preventDefault(): void }) {
      if (e.ctrlKey || e.metaKey || e.altKey) return false
      const used = key(e.key)
      if (used && e.key === " ") e.preventDefault()
      return used
    },
    /** True mid-word, when Space is part of the search rather than a press. */
    active: () => query !== "",
    reset: () => (query = ""),
    destroy: () => clearTimeout(timer),
  }
}

// ── Focus recovery ──────────────────────────────────────────

/**
 * When the focused item is removed (deleted, filtered out, archived), focus
 * moves to the item that took its place, else the one before, else the root,
 * instead of falling to the page.
 */
export function createFocusRecovery(root: HTMLElement, items: () => HTMLElement[]): Cleanup {
  let last: HTMLElement | null = null
  let index = -1
  const c = cleanups()
  c.add(
    on(root, "focusin", (e) => {
      const t = e.target as HTMLElement
      const list = items()
      const i = list.findIndex((el) => el === t || el.contains(t))
      if (i >= 0) {
        last = list[i]!
        index = i
      }
    })
  )
  const mo = new MutationObserver(() => {
    if (!last || last.isConnected) return
    const active = document.activeElement
    // Something else already has focus: leave it there.
    if (active && active !== document.body) return
    const list = items()
    const to = list[Math.min(index, list.length - 1)]
    last = null
    focus(to ?? root)
  })
  mo.observe(root, { childList: true, subtree: true })
  c.add(() => mo.disconnect())
  return c.run
}

/** Runs a change that moves an element in the DOM and keeps its focus. */
export function keepFocus<T>(el: HTMLElement, change: () => T): T {
  const had = document.activeElement === el
  const out = change()
  if (had && document.activeElement !== el) focus(el)
  return out
}

// ── Input hints ─────────────────────────────────────────────

export type InputKind =
  | "email"
  | "phone"
  | "url"
  | "search"
  | "number"
  | "decimal"
  | "code"
  | "name"
  | "username"
  | "password"
  | "new-password"

/** The on-screen keyboard and autofill for a field, as attributes to spread on the input. */
export function inputHints(kind: InputKind): Record<string, string | boolean> {
  const map: Record<InputKind, Record<string, string | boolean>> = {
    email: { type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "off", spellCheck: false },
    phone: { type: "tel", inputMode: "tel", autoComplete: "tel" },
    url: { type: "url", inputMode: "url", autoComplete: "url", autoCapitalize: "off", spellCheck: false },
    search: { type: "search", inputMode: "search", enterKeyHint: "search", autoComplete: "off" },
    number: { type: "text", inputMode: "numeric", pattern: "[0-9]*", autoComplete: "off" },
    decimal: { type: "text", inputMode: "decimal", autoComplete: "off" },
    code: { type: "text", inputMode: "numeric", autoComplete: "one-time-code", pattern: "[0-9]*" },
    name: { type: "text", autoComplete: "name", autoCapitalize: "words" },
    username: { type: "text", autoComplete: "username", autoCapitalize: "off", spellCheck: false },
    password: { type: "password", autoComplete: "current-password" },
    "new-password": { type: "password", autoComplete: "new-password" },
  }
  return map[kind]
}
