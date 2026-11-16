// Selection: one or many items, ranges with Shift, toggles with Ctrl or Cmd,
// a lasso drawn with the pointer, and rectangular cell ranges with copy and
// paste as text a spreadsheet understands.

import { type Point, type Rect, type Store, cleanups, createStore, intersects, rectOf } from "./behaviors-core"
import { bindDrag } from "./behaviors-drag"

// ── Selection ───────────────────────────────────────────────

export type SelectionMode = "single" | "multiple"

export type SelectionState<K> = { selected: ReadonlySet<K>; anchor: K | null }

export type SelectionOptions<K> = {
  mode?: SelectionMode
  selected?: Iterable<K>
  /** Called with the new selection after every change. */
  onChange?: (selected: Set<K>) => void
  /** Keys that can't be selected. */
  disabled?: (key: K) => boolean
}

export type Selection<K> = Store<SelectionState<K>> & {
  isSelected(key: K): boolean
  /** Selects only this key. */
  select(key: K): void
  toggle(key: K): void
  /** Selects from the anchor to this key, in the given order. */
  extendTo(key: K, order: readonly K[]): void
  selectAll(keys: readonly K[]): void
  clear(): void
  replace(keys: Iterable<K>): void
  /** Click semantics: plain selects, Ctrl or Cmd toggles, Shift extends. */
  press(key: K, e: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }, order: readonly K[]): void
}

export function createSelection<K>(options: SelectionOptions<K> = {}): Selection<K> {
  const mode = options.mode ?? "single"
  const ok = (k: K) => !options.disabled?.(k)
  const store = createStore<SelectionState<K>>({ selected: new Set(options.selected ?? []), anchor: null })
  const commit = (selected: Set<K>, anchor: K | null) => {
    store.set({ selected, anchor })
    options.onChange?.(new Set(selected))
  }
  const api: Selection<K> = {
    ...store,
    isSelected: (k) => store.get().selected.has(k),
    select(k) {
      if (ok(k)) commit(new Set([k]), k)
    },
    toggle(k) {
      if (!ok(k)) return
      if (mode === "single") return commit(store.get().selected.has(k) ? new Set() : new Set([k]), k)
      const next = new Set(store.get().selected)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      commit(next, k)
    },
    extendTo(k, order) {
      if (mode === "single") return api.select(k)
      const anchor = store.get().anchor ?? k
      const a = order.indexOf(anchor)
      const b = order.indexOf(k)
      if (a < 0 || b < 0) return api.select(k)
      const [lo, hi] = a < b ? [a, b] : [b, a]
      commit(new Set(order.slice(lo, hi + 1).filter(ok)), anchor)
    },
    selectAll(keys) {
      if (mode === "multiple") commit(new Set(keys.filter(ok)), store.get().anchor)
    },
    clear: () => commit(new Set(), null),
    replace: (keys) => commit(new Set(Array.from(keys).filter(ok)), store.get().anchor),
    press(k, e, order) {
      if (e.shiftKey) api.extendTo(k, order)
      else if (e.ctrlKey || e.metaKey) api.toggle(k)
      else api.select(k)
    },
  }
  return api
}

// ── Lasso ───────────────────────────────────────────────────

export type LassoOptions<K> = {
  /** The selectable items and their elements. */
  items: () => { key: K; el: Element }[]
  onChange: (keys: K[], additive: boolean) => void
}

/**
 * Drag on the container's empty ground to draw a rectangle; every item it
 * touches is selected. Shift or Ctrl keeps the earlier selection. The rect is
 * in the container's own coordinates so a part can draw it.
 */
export function createLasso<K>(container: HTMLElement, options: LassoOptions<K>) {
  const store = createStore<{ rect: Rect | null }>({ rect: null })
  let start: Point = { x: 0, y: 0 }
  let additive = false

  const local = (p: Point): Point => {
    const r = container.getBoundingClientRect()
    return { x: p.x - r.left + container.scrollLeft, y: p.y - r.top + container.scrollTop }
  }

  const stop = bindDrag(container, {
    filter: (e) => e.target === container || (e.target as Element).hasAttribute?.("data-lasso-ground"),
    onStart(info, e) {
      additive = e.shiftKey || e.ctrlKey || e.metaKey
      start = local(info.start)
    },
    onMove(info) {
      const p = local(info.point)
      const rect = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), width: Math.abs(p.x - start.x), height: Math.abs(p.y - start.y) }
      store.set({ rect })
      const box = container.getBoundingClientRect()
      const screen = { ...rect, x: rect.x + box.left - container.scrollLeft, y: rect.y + box.top - container.scrollTop }
      options.onChange(
        options.items().filter((i) => intersects(rectOf(i.el), screen)).map((i) => i.key),
        additive
      )
    },
    onEnd: () => store.set({ rect: null }),
    onCancel: () => store.set({ rect: null }),
  })
  return { ...store, destroy: stop }
}

// ── Cell ranges ─────────────────────────────────────────────

export type Cell = { row: number; col: number }
export type CellRange = { anchor: Cell; focus: Cell }

export const rangeBounds = (r: CellRange) => ({
  top: Math.min(r.anchor.row, r.focus.row),
  bottom: Math.max(r.anchor.row, r.focus.row),
  left: Math.min(r.anchor.col, r.focus.col),
  right: Math.max(r.anchor.col, r.focus.col),
})

export const inRange = (r: CellRange | null, row: number, col: number) => {
  if (!r) return false
  const b = rangeBounds(r)
  return row >= b.top && row <= b.bottom && col >= b.left && col <= b.right
}

/** A rectangle of grid cells: click sets the anchor, Shift+click or Shift+arrows extends it. */
export function createCellRange(options: { rows: () => number; cols: () => number; onChange?: (r: CellRange | null) => void }) {
  const store = createStore<{ range: CellRange | null }>({ range: null })
  const clampCell = (c: Cell): Cell => ({
    row: Math.max(0, Math.min(options.rows() - 1, c.row)),
    col: Math.max(0, Math.min(options.cols() - 1, c.col)),
  })
  const set = (range: CellRange | null) => {
    store.set({ range })
    options.onChange?.(range)
  }
  return {
    ...store,
    start: (c: Cell) => set({ anchor: clampCell(c), focus: clampCell(c) }),
    extend(c: Cell) {
      const r = store.get().range
      set({ anchor: r?.anchor ?? clampCell(c), focus: clampCell(c) })
    },
    /** Shift+arrow handling; returns true when the key extended the range. */
    onKeyDown(e: { key: string; shiftKey: boolean }) {
      const r = store.get().range
      if (!e.shiftKey || !r) return false
      const d = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, [number, number]>)[e.key]
      if (!d) return false
      set({ anchor: r.anchor, focus: clampCell({ row: r.focus.row + d[0], col: r.focus.col + d[1] }) })
      return true
    },
    contains: (row: number, col: number) => inRange(store.get().range, row, col),
    clear: () => set(null),
  }
}

/** The cells that joined or left the range, so only those re-render. */
export function byCellRange(prev: CellRange | null, next: CellRange | null): Cell[] {
  const out: Cell[] = []
  const all = [prev, next].filter(Boolean) as CellRange[]
  if (!all.length) return out
  const b = all.map(rangeBounds)
  const top = Math.min(...b.map((x) => x.top))
  const bottom = Math.max(...b.map((x) => x.bottom))
  const left = Math.min(...b.map((x) => x.left))
  const right = Math.max(...b.map((x) => x.right))
  for (let row = top; row <= bottom; row++)
    for (let col = left; col <= right; col++) if (inRange(prev, row, col) !== inRange(next, row, col)) out.push({ row, col })
  return out
}

const colName = (c: number) => {
  let s = ""
  for (let n = c + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

/** What a screen reader hears when a range changes: "3 rows by 2 columns selected, B2 to C4". */
export function cellRangeMessage(r: CellRange | null): string {
  if (!r) return "Selection cleared"
  const b = rangeBounds(r)
  const rows = b.bottom - b.top + 1
  const cols = b.right - b.left + 1
  const from = `${colName(b.left)}${b.top + 1}`
  const to = `${colName(b.right)}${b.bottom + 1}`
  if (rows === 1 && cols === 1) return `${from} selected`
  return `${rows} ${rows === 1 ? "row" : "rows"} by ${cols} ${cols === 1 ? "column" : "columns"} selected, ${from} to ${to}`
}

/** Cells to tab-separated text, quoting values with tabs, quotes or line breaks (pastes into a spreadsheet). */
export function cellsToText(rows: readonly (readonly unknown[])[]): string {
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v)
    return /[\t\n\r"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return rows.map((r) => r.map(cell).join("\t")).join("\n")
}

/** Pasted text (from a spreadsheet or a table) to rows of cell values. */
export function textToCells(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  const src = text.replace(/\r\n?/g, "\n").replace(/\n$/, "")
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"' && cell === "") quoted = true
    else if (ch === "\t") {
      row.push(cell)
      cell = ""
    } else if (ch === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else cell += ch
  }
  row.push(cell)
  rows.push(row)
  return rows
}

/** Wires Ctrl+C and Ctrl+V on an element to a grid's cells. */
export function bindCellClipboard(el: HTMLElement, options: { copy: () => string | null; paste: (cells: string[][]) => void }) {
  const c = cleanups()
  const copy = (e: ClipboardEvent) => {
    const text = options.copy()
    if (text == null || !e.clipboardData) return
    e.preventDefault()
    e.clipboardData.setData("text/plain", text)
  }
  const paste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text/plain")
    if (!text) return
    e.preventDefault()
    options.paste(textToCells(text))
  }
  el.addEventListener("copy", copy)
  el.addEventListener("paste", paste)
  c.add(() => el.removeEventListener("copy", copy))
  c.add(() => el.removeEventListener("paste", paste))
  return c.run
}
