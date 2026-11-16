// Lists: a listbox that highlights with the arrows and filters as you type
// (the heart of Select, Combobox and Menu), a virtualizer for long lists, a
// chat log that follows new messages until the reader scrolls up, a
// wheel-style picker, and editing a value in place.

import { type Cleanup, cleanups, clamp, createStore, on } from "./behaviors-core"
import { createTypeahead } from "./behaviors-focus"

type Key = { key: string; preventDefault(): void; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean }

// ── Listbox ─────────────────────────────────────────────────

export type ListboxOptions<T> = {
  items: () => readonly T[]
  key: (item: T) => string
  text: (item: T) => string
  disabled?: (item: T) => boolean
  /** Match an item to the query. Default: every word of the query appears in the text. Return null to turn filtering off. */
  filter?: ((item: T, query: string) => boolean) | null
  /** Wrap from last to first. Default false (a listbox stops at the ends). */
  loop?: boolean
  /** Rows a Page Up or Page Down moves. Default 10. */
  pageSize?: number
  onSelect?: (item: T) => void
  /** Called when the highlight moves, so the part can scroll it into view. */
  onHighlight?: (key: string | null) => void
}

export type ListboxState = { query: string; highlighted: string | null }

export const matchWords = (text: string, query: string) => {
  const t = text.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => t.includes(w))
}

/**
 * Highlight model for a list of options with focus staying on one element
 * (the input, or the list itself) and aria-activedescendant pointing at the
 * highlighted option. Keys: arrows, Home, End, Page Up and Down, Enter to
 * choose; letters type ahead when there is no input, or filter when there is.
 */
export function createListbox<T>(options: ListboxOptions<T>) {
  const store = createStore<ListboxState>({ query: "", highlighted: null })
  const filter = options.filter === undefined ? (i: T, q: string) => matchWords(options.text(i), q) : options.filter
  const enabled = (i: T) => !options.disabled?.(i)

  const visible = (): T[] => {
    const q = store.get().query.trim()
    const all = options.items()
    return q && filter ? all.filter((i) => filter(i, q)) : [...all]
  }
  const highlight = (key: string | null) => {
    store.set({ highlighted: key })
    options.onHighlight?.(key)
  }
  const byKey = (k: string | null) => (k === null ? undefined : options.items().find((i) => options.key(i) === k))

  function step(delta: number | "first" | "last") {
    const list = visible().filter(enabled)
    if (!list.length) return highlight(null)
    if (delta === "first") return highlight(options.key(list[0]!))
    if (delta === "last") return highlight(options.key(list[list.length - 1]!))
    const at = list.findIndex((i) => options.key(i) === store.get().highlighted)
    let next = at < 0 ? (delta > 0 ? 0 : list.length - 1) : at + delta
    next = options.loop ? (next + list.length) % list.length : clamp(next, 0, list.length - 1)
    highlight(options.key(list[next]!))
  }

  const typeahead = createTypeahead<T>({
    items: () => visible().filter(enabled),
    text: options.text,
    current: () => byKey(store.get().highlighted),
    onMatch: (i) => highlight(options.key(i)),
  })

  const api = {
    ...store,
    visible,
    highlight,
    highlighted: () => byKey(store.get().highlighted),
    next: () => step(1),
    prev: () => step(-1),
    first: () => step("first"),
    last: () => step("last"),
    setQuery(query: string) {
      store.set({ query })
      // Keep the highlight when it still shows; otherwise the first match.
      const list = visible().filter(enabled)
      const keep = list.find((i) => options.key(i) === store.get().highlighted)
      highlight(keep ? options.key(keep) : list[0] ? options.key(list[0]) : null)
    },
    select(item?: T) {
      const i = item ?? api.highlighted()
      if (i !== undefined && enabled(i)) options.onSelect?.(i)
    },
    /** @param hasInput true when focus is in a text field (letters filter instead of typing ahead). */
    onKeyDown(e: Key, hasInput = false): boolean {
      const page = options.pageSize ?? 10
      const map: Record<string, () => void> = {
        ArrowDown: () => step(1),
        ArrowUp: () => step(-1),
        PageDown: () => step(page),
        PageUp: () => step(-page),
        Enter: () => api.select(),
      }
      if (!hasInput) {
        map.Home = () => step("first")
        map.End = () => step("last")
        map[" "] = () => api.select()
      }
      const fn = map[e.key]
      if (fn && !(e.key === " " && typeahead.active())) {
        e.preventDefault()
        fn()
        return true
      }
      if (!hasInput && typeahead.onKeyDown({ key: e.key, ctrlKey: !!e.ctrlKey, metaKey: !!e.metaKey, altKey: !!e.altKey, preventDefault: () => e.preventDefault() }))
        return true
      return false
    },
    destroy: () => typeahead.destroy(),
  }
  return api
}

// ── Virtualizer ─────────────────────────────────────────────

export type VirtualItem = { index: number; start: number; size: number }

export type VirtualizerOptions = {
  count: number
  /** Estimated size of an item before it is measured. */
  estimate: number | ((index: number) => number)
  /** Items rendered beyond the visible ones on each side. Default 4. */
  overscan?: number
  horizontal?: boolean
  gap?: number
  paddingStart?: number
  paddingEnd?: number
}

export type VirtualState = { items: VirtualItem[]; total: number; offset: number; viewport: number }

/**
 * Works out which rows of a long list to render and where. Items measure
 * themselves (measure(index, size)) and the offsets update. Bind it to the
 * scrolling element.
 */
export function createVirtualizer(initial: VirtualizerOptions) {
  let o = initial
  const sizes = new Map<number, number>()
  const store = createStore<VirtualState>({ items: [], total: 0, offset: 0, viewport: 0 })
  let el: HTMLElement | null = null

  const sizeOf = (i: number) => sizes.get(i) ?? (typeof o.estimate === "function" ? o.estimate(i) : o.estimate)
  const starts = () => {
    const out = new Array<number>(o.count)
    let at = o.paddingStart ?? 0
    for (let i = 0; i < o.count; i++) {
      out[i] = at
      at += sizeOf(i) + (i < o.count - 1 ? o.gap ?? 0 : 0)
    }
    return { out, total: at + (o.paddingEnd ?? 0) }
  }

  function compute() {
    const { out, total } = starts()
    const { offset, viewport } = store.get()
    const overscan = o.overscan ?? 4
    // Binary search for the first item that ends after the offset.
    let lo = 0
    let hi = o.count - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (out[mid]! + sizeOf(mid) <= offset) lo = mid + 1
      else hi = mid
    }
    let end = lo
    while (end < o.count - 1 && out[end]! < offset + viewport) end++
    const from = Math.max(0, lo - overscan)
    const to = Math.min(o.count - 1, end + overscan)
    const items: VirtualItem[] = []
    for (let i = from; i <= to && o.count > 0; i++) items.push({ index: i, start: out[i]!, size: sizeOf(i) })
    store.set({ items, total })
  }

  const read = () => {
    if (!el) return
    store.set({ offset: o.horizontal ? el.scrollLeft : el.scrollTop, viewport: o.horizontal ? el.clientWidth : el.clientHeight })
    compute()
  }

  return {
    ...store,
    setOptions(next: Partial<VirtualizerOptions>) {
      o = { ...o, ...next }
      compute()
    },
    measure(index: number, size: number) {
      if (sizes.get(index) === size) return
      sizes.set(index, size)
      compute()
    },
    bind(scroller: HTMLElement): Cleanup {
      el = scroller
      const c = cleanups()
      c.add(on(scroller, "scroll", read, { passive: true }))
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(read)
        ro.observe(scroller)
        c.add(() => ro.disconnect())
      }
      read()
      c.add(() => (el = null))
      return c.run
    },
    scrollToIndex(index: number, align: "start" | "center" | "end" | "nearest" = "nearest") {
      if (!el) return
      const { out } = starts()
      const start = out[clamp(index, 0, o.count - 1)] ?? 0
      const size = sizeOf(index)
      const { offset, viewport } = store.get()
      let to = offset
      if (align === "start") to = start
      else if (align === "end") to = start + size - viewport
      else if (align === "center") to = start + size / 2 - viewport / 2
      else if (start < offset) to = start
      else if (start + size > offset + viewport) to = start + size - viewport
      if (o.horizontal) el.scrollLeft = to
      else el.scrollTop = to
      read()
    },
  }
}

// ── Stick to bottom ─────────────────────────────────────────

/**
 * A log or chat that follows new content while the reader is at the bottom,
 * and stops following the moment they scroll up to read. Scrolling back to
 * the bottom (or scrollToBottom) resumes it.
 */
export function createStickToBottom(options: { threshold?: number } = {}) {
  const threshold = options.threshold ?? 24
  const store = createStore<{ atBottom: boolean; following: boolean }>({ atBottom: true, following: true })
  let el: HTMLElement | null = null
  let programmatic = false

  const isAtBottom = (s: HTMLElement) => s.scrollHeight - s.scrollTop - s.clientHeight <= threshold

  const toBottom = (smooth = false) => {
    if (!el) return
    programmatic = true
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" })
    store.set({ atBottom: true, following: true })
    requestAnimationFrame(() => (programmatic = false))
  }

  return {
    ...store,
    scrollToBottom: toBottom,
    bind(scroller: HTMLElement, content?: HTMLElement): Cleanup {
      el = scroller
      const c = cleanups()
      c.add(
        on(scroller, "scroll", () => {
          const at = isAtBottom(scroller)
          store.set(programmatic ? { atBottom: at } : { atBottom: at, following: at })
        }, { passive: true })
      )
      // Wheel or touch upwards is the reader's intent even before the scroll lands.
      c.add(
        on(scroller, "wheel", (e) => {
          if (e.deltaY < 0) store.set({ following: false })
        }, { passive: true })
      )
      const follow = () => {
        if (store.get().following) toBottom()
        else store.set({ atBottom: isAtBottom(scroller) })
      }
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(follow)
        ro.observe(content ?? scroller.firstElementChild ?? scroller)
        c.add(() => ro.disconnect())
      }
      const mo = new MutationObserver(follow)
      mo.observe(content ?? scroller, { childList: true, subtree: true, characterData: true })
      c.add(() => mo.disconnect())
      toBottom()
      c.add(() => (el = null))
      return c.run
    },
  }
}

// ── Scroll picker ───────────────────────────────────────────

/**
 * A wheel-style list (hours, minutes) that picks the option at its centre
 * when scrolling settles. Pair it with CSS scroll-snap. Arrows step by one.
 */
export function bindScrollPicker(el: HTMLElement, options: { items: () => HTMLElement[]; onPick: (index: number) => void }) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let last = -1
  const nearest = () => {
    const r = el.getBoundingClientRect()
    const mid = r.top + r.height / 2
    let best = -1
    let d = Infinity
    options.items().forEach((item, i) => {
      const b = item.getBoundingClientRect()
      const dist = Math.abs(b.top + b.height / 2 - mid)
      if (dist < d) {
        d = dist
        best = i
      }
    })
    return best
  }
  const settle = () => {
    const i = nearest()
    if (i >= 0 && i !== last) {
      last = i
      options.onPick(i)
    }
  }
  const scrollTo = (i: number, smooth = true) => {
    const item = options.items()[i]
    if (!item) return
    el.scrollTo({ top: item.offsetTop - el.clientHeight / 2 + item.offsetHeight / 2, behavior: smooth ? "smooth" : "auto" })
  }
  const c = cleanups()
  const hasScrollEnd = "onscrollend" in el
  if (hasScrollEnd) c.add(on(el, "scrollend" as "scroll", settle))
  else
    c.add(
      on(el, "scroll", () => {
        clearTimeout(timer)
        timer = setTimeout(settle, 120)
      }, { passive: true })
    )
  c.add(
    on(el, "keydown", (e) => {
      const d = ({ ArrowUp: -1, ArrowDown: 1 } as Record<string, number>)[e.key]
      if (!d) return
      e.preventDefault()
      const i = clamp((last < 0 ? nearest() : last) + d, 0, options.items().length - 1)
      scrollTo(i)
      last = i
      options.onPick(i)
    })
  )
  c.add(() => clearTimeout(timer))
  return { scrollTo, destroy: c.run }
}

// ── Inline edit ─────────────────────────────────────────────

export type InlineEditOptions = {
  value: string
  /** Return an error sentence to block the commit, or null. */
  validate?: (draft: string) => string | null
  /** Save. A rejected promise keeps the field open with the error. */
  onCommit: (value: string) => void | Promise<void>
  onCancel?: () => void
}

export type InlineEditState = {
  editing: boolean
  draft: string
  error: string | null
  saving: boolean
  /** The value shown at rest while it saves (optimistic), or null. */
  pending: string | null
}

/** Click (or Enter) to edit; Enter or leaving the field saves; Escape puts it back. */
export function createInlineEdit(options: InlineEditOptions) {
  let o = options
  const store = createStore<InlineEditState>({ editing: false, draft: options.value, error: null, saving: false, pending: null })
  const api = {
    ...store,
    setOptions: (next: Partial<InlineEditOptions>) => {
      o = { ...o, ...next }
      if (!store.get().editing) store.set({ draft: o.value })
    },
    start: () => store.set({ editing: true, draft: o.value, error: null }),
    change: (draft: string) => store.set({ draft, error: null }),
    async commit() {
      const { draft, editing } = store.get()
      if (!editing) return
      if (draft === o.value) return store.set({ editing: false, error: null })
      const error = o.validate?.(draft) ?? null
      if (error) return store.set({ error })
      // Optimistic: the new value shows at once and saves behind; if the
      // save fails, the field opens again with what was typed and why.
      const result = o.onCommit(draft)
      if (!result || typeof (result as Promise<void>).then !== "function") return store.set({ editing: false, error: null })
      store.set({ editing: false, saving: true, pending: draft })
      try {
        await result
        store.set({ saving: false, pending: null })
      } catch (e) {
        store.set({ editing: true, saving: false, pending: null, draft, error: e instanceof Error ? e.message : "Couldn't save. Try again." })
      }
    },
    cancel() {
      store.set({ editing: false, draft: o.value, error: null })
      o.onCancel?.()
    },
    onKeyDown(e: Key, multiline = false) {
      if (e.key === "Escape") {
        e.preventDefault()
        api.cancel()
        return true
      }
      if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        void api.commit()
        return true
      }
      return false
    },
  }
  return api
}
