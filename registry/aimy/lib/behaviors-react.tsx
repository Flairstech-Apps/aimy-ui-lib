"use client"

// React hooks over the AiMY behaviours. Each hook creates its behaviour once,
// keeps it reading your latest options, binds it to the element you hand it
// through the returned ref, re-renders on its state, and cleans up on
// unmount. Production AiMY is React; these are what parts and apps use.

import {
  Children,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import { type Cleanup, type Store, isBrowser } from "./behaviors-core"
import { type FocusTrapOptions, type GridFocusOptions, type RovingFocusOptions, type TypeaheadOptions, createFocusRecovery, createFocusTrap, createGridFocus, createRovingFocus, createTypeahead } from "./behaviors-focus"
import { type CellRange, type LassoOptions, type SelectionOptions, createCellRange, createLasso, createSelection } from "./behaviors-selection"
import { type ReorderOptions, type TreeDrop, type TreeRow, createAutoScroll, createReorder, createTransfer, createTreeReorder } from "./behaviors-drag"
import { type Box, type Edge, type MoveOptions, type ResizeOptions, type SpansOptions, bindHold, bindRepeat, createArea, createMove, createPreview, createResize, createSpans, createSwipeActions } from "./behaviors-manipulate"
import { type InlineEditOptions, type ListboxOptions, type VirtualizerOptions, bindScrollPicker, createInlineEdit, createListbox, createStickToBottom, createVirtualizer, matchWords } from "./behaviors-lists"
import { type TreeCollection, createTreeNavigation, visibleTreeRows } from "./behaviors-tree"
import { animationsDone, bindPanel } from "./behaviors-motion"
import { type LayerOptions, type Placement, type PositionOptions, autoUpdate, bindLayer, bindPersistentLayer, hideOthers, lockScroll, position } from "./behaviors-layers"
import { type ColorSchemeChoice, type PreferenceOptions, createColorScheme, createPointerKind, createPreference } from "./behaviors-prefs"
import { type Port, type ViewportOptions, createConnect, createViewport } from "./behaviors-canvas"

export const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect

/** The latest value, readable from callbacks without re-subscribing. */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useIsoLayoutEffect(() => {
    ref.current = value
  })
  return ref
}

/** A stable function that always calls the latest `fn` (for handlers read in effects and cleanups). */
export function useCallbackRef<A extends unknown[], R>(fn: ((...args: A) => R) | undefined): (...args: A) => R | undefined {
  const ref = useLatest(fn)
  return useCallback((...args: A) => ref.current?.(...args), [ref])
}

/** Runs after the current commit (and React's own focus restore). */
export const afterCommit = (fn: () => void) => void setTimeout(fn, 0)

/** Re-renders on a behaviour's state. */
export function useStore<T>(store: Pick<Store<T>, "get" | "subscribe">): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

/** Creates a value once for the life of the component. */
function useOnce<T>(make: () => T): T {
  const [v] = useState(make)
  return v
}

/**
 * One ref callback per key, the same function on every render, so a bound
 * drag isn't unbound and rebound (and cut short) when the part re-renders.
 */
function useRefCache(make: (key: string) => RefCallback<HTMLElement>) {
  const cache = useOnce(() => new Map<string, RefCallback<HTMLElement>>())
  const latest = useLatest(make)
  return useCallback(
    (key: string) => {
      let fn = cache.get(key)
      if (!fn) {
        fn = latest.current(key)
        cache.set(key, fn)
      }
      return fn
    },
    [cache, latest]
  )
}

/** Calls cleanup when the component unmounts. */
function useDestroy(fn: () => void) {
  const latest = useLatest(fn)
  useEffect(() => () => latest.current(), [latest])
}

/** An element held in state, so binding effects rerun when it mounts. */
export function useElement<T extends HTMLElement = HTMLElement>(): [T | null, RefCallback<T>] {
  const [el, setEl] = useState<T | null>(null)
  return [el, setEl as RefCallback<T>]
}

/** Binds a behaviour to an element while it is mounted (and while `active`). */
export function useBind<T extends HTMLElement>(el: T | null, bind: (el: T) => Cleanup | void, active = true) {
  const latest = useLatest(bind)
  useIsoLayoutEffect(() => {
    if (!el || !active) return
    return latest.current(el) ?? undefined
  }, [el, active, latest])
}

/** Value that can be controlled by a parent (value + onChange) or held here (defaultValue). */
export function useControllable<T>({ value, defaultValue, onChange }: { value?: T; defaultValue: T; onChange?: (v: T) => void }): [T, (v: T) => void] {
  const [own, setOwn] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const latest = useLatest({ current, controlled, onChange })
  const set = useCallback(
    (v: T) => {
      const l = latest.current
      if (!l.controlled) setOwn(v)
      if (!Object.is(v, l.current)) l.onChange?.(v)
    },
    [latest]
  )
  return [current, set]
}

/** Several refs as one. */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups: (() => void)[] = []
    for (const r of refs) {
      if (typeof r === "function") {
        const c = r(node)
        if (typeof c === "function") cleanups.push(c)
      } else if (r) (r as { current: T | null }).current = node
    }
    if (cleanups.length) return () => cleanups.forEach((c) => c())
  }
}

// ── Slot (asChild) ──────────────────────────────────────────

type AnyProps = Record<string, unknown>

/** Merges a part's props onto its one child: handlers both run (the child's first), classes join, styles merge, refs compose. */
export function mergeProps(slot: AnyProps, child: AnyProps): AnyProps {
  const out: AnyProps = { ...slot, ...child }
  for (const k in slot) {
    const s = slot[k]
    const c = child[k]
    if (/^on[A-Z]/.test(k) && typeof s === "function" && typeof c === "function") {
      out[k] = (...args: unknown[]) => {
        ;(c as (...a: unknown[]) => void)(...args)
        const e = args[0] as { defaultPrevented?: boolean } | undefined
        if (!e?.defaultPrevented) (s as (...a: unknown[]) => void)(...args)
      }
    } else if (k === "className" && s && c) out[k] = `${s as string} ${c as string}`
    else if (k === "style" && s && c) out[k] = { ...(s as object), ...(c as object) }
    else if (c === undefined) out[k] = s
  }
  return out
}

/** Renders its one child with the slot's props merged in: the asChild pattern. */
export function Slot({ children, ref, ...props }: AnyProps & { children?: ReactNode; ref?: Ref<HTMLElement> }) {
  const child = Children.only(children)
  if (!isValidElement(child)) return null
  const el = child as ReactElement<AnyProps & { ref?: Ref<HTMLElement> }>
  return cloneElement(el, { ...mergeProps(props, el.props), ref: composeRefs(ref, el.props.ref) })
}

// ── Portal and presence ─────────────────────────────────────

/** False on the server and during hydration, true after: for what only the browser renders. */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

/** Renders into document.body (or a container), after hydration. */
export function Portal({ children, container }: { children?: ReactNode; container?: Element | null }) {
  const mounted = useMounted()
  if (!mounted) return null
  return createPortal(children, container ?? document.body)
}
const noopSubscribe = () => () => {}

/**
 * Keeps a closing element mounted until its exit animation ends, so the
 * transitions.dev close keyframes (keyed off data-state="closed") play.
 * Returns whether to render it and the ref to put on it.
 */
export function usePresence(open: boolean): { present: boolean; ref: RefCallback<HTMLElement>; state: "open" | "closed" } {
  const [present, setPresent] = useState(open)
  const [node, setNode] = useState<HTMLElement | null>(null)
  if (open && !present) setPresent(true)
  useIsoLayoutEffect(() => {
    if (open || !present) return
    if (!node || typeof node.getAnimations !== "function" || !node.getAnimations().length) {
      // Nothing to wait for (no animation, reduced motion, a test).
      setPresent(false)
      return
    }
    let live = true
    animationsDone(node).then(() => live && setPresent(false))
    return () => {
      live = false
    }
  }, [open, present, node])
  return { present, ref: setNode as RefCallback<HTMLElement>, state: open ? "open" : "closed" }
}

// ── Layers and focus ────────────────────────────────────────

export function useLayer(el: HTMLElement | null, active: boolean, options: LayerOptions) {
  const latest = useLatest(options)
  useBind(
    el,
    (node) =>
      bindLayer(node, {
        onDismiss: (r) => latest.current.onDismiss(r),
        onEscapeKeyDown: (e) => latest.current.onEscapeKeyDown?.(e),
        onPointerDownOutside: (e) => latest.current.onPointerDownOutside?.(e),
        onFocusOutside: (e) => latest.current.onFocusOutside?.(e),
        onInteractOutside: (e) => latest.current.onInteractOutside?.(e),
        branches: () => latest.current.branches?.() ?? [],
        dismissOnFocusOutside: options.dismissOnFocusOutside,
      }),
    active
  )
}

export function usePersistentLayer(el: HTMLElement | null) {
  useBind(el, bindPersistentLayer)
}

export function useFocusTrap(el: HTMLElement | null, active: boolean, options: FocusTrapOptions = {}) {
  const latest = useLatest(options)
  useBind(
    el,
    (node) =>
      createFocusTrap(node, {
        initialFocus: () => {
          const i = latest.current.initialFocus
          return typeof i === "function" ? i() : i
        },
        onMountFocus: (e) => latest.current.onMountFocus?.(e),
        onUnmountFocus: (e) => latest.current.onUnmountFocus?.(e),
        returnFocus: latest.current.returnFocus,
        deferReturn: true,
      }),
    active
  )
}

export function useScrollLock(active: boolean) {
  useIsoLayoutEffect(() => (active ? lockScroll() : undefined), [active])
}

export function useHideOthers(el: HTMLElement | null, active: boolean) {
  useBind(el, (node) => hideOthers(node), active)
}

/**
 * Places a floating element beside an anchor and keeps it there. Returns the
 * placement and the style to spread (position fixed, the CSS variables the
 * parts read for available height and the anchor's width).
 */
export function useFloating(anchor: Element | null, floating: HTMLElement | null, open: boolean, options: PositionOptions = {}) {
  const [placement, setPlacement] = useState<Placement | null>(null)
  const latest = useLatest(options)
  useIsoLayoutEffect(() => {
    if (!open || !anchor || !floating) return
    return autoUpdate(anchor, floating, () => {
      const p = position(anchor, floating, latest.current)
      setPlacement((old) =>
        old && old.x === p.x && old.y === p.y && old.side === p.side && old.availableHeight === p.availableHeight && old.anchorWidth === p.anchorWidth ? old : p
      )
    })
  }, [open, anchor, floating, latest])
  const style: React.CSSProperties & Record<string, string | number> = placement
    ? {
        position: "fixed",
        left: 0,
        top: 0,
        transform: `translate(${placement.x}px, ${placement.y}px)`,
        "--available-height": `${placement.availableHeight}px`,
        "--available-width": `${placement.availableWidth}px`,
        "--anchor-width": `${placement.anchorWidth}px`,
        "--anchor-height": `${placement.anchorHeight}px`,
        "--transform-origin": placement.transformOrigin,
      }
    : // Off screen until placed, not hidden: focus can't move into a hidden panel.
      { position: "fixed", left: 0, top: 0, transform: "translate(0, -200%)" }
  return { placement, style }
}

// ── Focus and keys ──────────────────────────────────────────

/** One Tab stop for a group; arrows move. Put the ref on the group. */
export function useRovingFocus(options: Omit<RovingFocusOptions, "items"> & { selector?: string; items?: () => HTMLElement[] }) {
  const [el, ref] = useElement()
  const latest = useLatest(options)
  useBind(el, (root) => {
    const r = createRovingFocus(root, {
      items: () => latest.current.items?.() ?? Array.from(root.querySelectorAll<HTMLElement>(latest.current.selector ?? "[data-roving-item]")),
      orientation: latest.current.orientation,
      loop: latest.current.loop,
      onMove: (e, i) => latest.current.onMove?.(e, i),
      skip: latest.current.skip,
    })
    // Items render after the group: settle the tab stop once they exist.
    const mo = new MutationObserver(() => r.refresh())
    mo.observe(root, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      r.destroy()
    }
  })
  return ref
}

export function useGridFocus(options: GridFocusOptions) {
  const [el, ref] = useElement()
  const latest = useLatest(options)
  useBind(el, (root) =>
    createGridFocus(root, {
      rows: () => latest.current.rows(),
      cols: () => latest.current.cols(),
      cell: (r, c) => latest.current.cell(r, c),
      onMove: (to) => latest.current.onMove?.(to),
      pageSize: latest.current.pageSize,
    }).destroy
  )
  return ref
}

export function useTypeahead<T>(options: TypeaheadOptions<T>) {
  const latest = useLatest(options)
  const t = useOnce(() =>
    createTypeahead<T>({
      items: () => latest.current.items(),
      text: (i) => latest.current.text(i),
      current: () => latest.current.current?.(),
      onMatch: (i) => latest.current.onMatch(i),
      timeout: options.timeout,
    })
  )
  useDestroy(t.destroy)
  return t
}

export function useFocusRecovery(items: (root: HTMLElement) => HTMLElement[]) {
  const [el, ref] = useElement()
  const latest = useLatest(items)
  useBind(el, (root) => createFocusRecovery(root, () => latest.current(root)))
  return ref
}

// ── Selection ───────────────────────────────────────────────

export function useSelection<K>(options: SelectionOptions<K> = {}) {
  const latest = useLatest(options)
  const s = useOnce(() =>
    createSelection<K>({ mode: options.mode, selected: options.selected, onChange: (v) => latest.current.onChange?.(v), disabled: (k) => !!latest.current.disabled?.(k) })
  )
  const state = useStore(s)
  return { ...s, ...state }
}

export function useLasso<K>(options: LassoOptions<K>) {
  const [el, ref] = useElement()
  const latest = useLatest(options)
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  useBind(el, (root) => {
    const l = createLasso<K>(root, { items: () => latest.current.items(), onChange: (k, a) => latest.current.onChange(k, a) })
    const off = l.subscribe((s) => setRect(s.rect))
    return () => {
      off()
      l.destroy()
    }
  })
  return { ref, rect }
}

export function useCellRange(options: { rows: () => number; cols: () => number; onChange?: (r: CellRange | null) => void }) {
  const latest = useLatest(options)
  const r = useOnce(() => createCellRange({ rows: () => latest.current.rows(), cols: () => latest.current.cols(), onChange: (v) => latest.current.onChange?.(v) }))
  const state = useStore(r)
  return { ...r, ...state }
}

// ── Drag and drop ───────────────────────────────────────────

export function useReorder(options: ReorderOptions) {
  const latest = useLatest(options)
  const r = useOnce(() =>
    createReorder({
      count: () => latest.current.count(),
      label: (i) => latest.current.label(i),
      onReorder: (a, b) => latest.current.onReorder(a, b),
      orientation: options.orientation,
      columns: () => latest.current.columns?.() ?? 1,
    })
  )
  const state = useStore(r)
  return { ...r, ...state }
}

export function useTreeReorder(options: { rows: () => TreeRow[]; onMove: (id: string, to: TreeDrop) => void }) {
  const latest = useLatest(options)
  const r = useOnce(() => createTreeReorder({ rows: () => latest.current.rows(), onMove: (id, to) => latest.current.onMove(id, to) }))
  const state = useStore(r)
  return { ...r, ...state }
}

export function useTransfer<K>(options: Parameters<typeof createTransfer<K>>[0]) {
  const latest = useLatest(options)
  return useOnce(() =>
    createTransfer<K>({
      lists: () => latest.current.lists(),
      label: (k) => latest.current.label(k),
      listName: (l) => latest.current.listName?.(l) ?? l,
      onChange: (v) => latest.current.onChange(v),
    })
  )
}

export function useAutoScroll(el: HTMLElement | null) {
  const [scroller, setScroller] = useState<ReturnType<typeof createAutoScroll> | null>(null)
  useIsoLayoutEffect(() => {
    if (!el) return
    const s = createAutoScroll(el)
    setScroller(s)
    return () => s.stop()
  }, [el])
  return scroller
}

// ── Move and resize ─────────────────────────────────────────

export function useMove(options: MoveOptions) {
  const latest = useLatest(options)
  const m = useOnce(() =>
    createMove({ ...options, bounds: () => latest.current.bounds?.() ?? { minX: -Infinity, minY: -Infinity, maxX: Infinity, maxY: Infinity }, onChange: (p) => latest.current.onChange?.(p), onCommit: (p) => latest.current.onCommit?.(p) })
  )
  const [el, ref] = useElement()
  useBind(el, (h) => m.bind(h))
  const state = useStore(m)
  return { ...m, ...state, handleRef: ref }
}

export function useResize(options: ResizeOptions) {
  const latest = useLatest(options)
  const r = useOnce(() => createResize({ ...options, onChange: (b) => latest.current.onChange?.(b), onCommit: (b) => latest.current.onCommit?.(b) }))
  const state = useStore(r)
  /** A ref for each handle: handle("se"). */
  const cached = useRefCache((edge) => (node) => (node ? r.bindHandle(node, edge as Edge) : undefined))
  const handle = (edge: Edge) => cached(edge)
  return { ...r, ...state, handle } as typeof r & { box: Box; edge: Edge | null; handle: typeof handle }
}

export function useSwipeActions(options: Parameters<typeof createSwipeActions>[1]) {
  const [el, ref] = useElement()
  const latest = useLatest(options)
  const [state, setState] = useState({ offset: 0, open: null as "leading" | "trailing" | null, swiping: false })
  const [api, setApi] = useState<{ close(): void; open(side: "leading" | "trailing"): void } | null>(null)
  useBind(el, (row) => {
    const s = createSwipeActions(row, { ...latest.current, onAction: (side) => latest.current.onAction?.(side) })
    const off = s.subscribe(setState)
    setApi({ close: s.close, open: s.open })
    return () => {
      off()
      s.destroy()
    }
  })
  return { ref, ...state, close: () => api?.close(), open: (side: "leading" | "trailing") => api?.open(side) }
}

export function useHold(options: Parameters<typeof bindHold>[1]) {
  const [el, ref] = useElement()
  const latest = useLatest(options)
  useBind(el, (node) => bindHold(node, { ...latest.current, onHold: () => latest.current.onHold(), onProgress: (p) => latest.current.onProgress?.(p) }))
  return ref
}

export function useRepeat(onStep: () => void, timing: { delay?: number; interval?: number } = {}) {
  const [el, ref] = useElement()
  const latest = useLatest(onStep)
  useBind(el, (node) => bindRepeat(node, { onStep: () => latest.current(), ...timing }))
  return ref
}

export function useArea(options: Parameters<typeof createArea>[0]) {
  const latest = useLatest(options)
  const a = useOnce(() => createArea({ ...options, onChange: (v) => latest.current.onChange?.(v), onCommit: (v) => latest.current.onCommit?.(v) }))
  const [el, ref] = useElement()
  useBind(el, (pad) => a.bind(pad))
  const state = useStore(a)
  return { ...a, ...state, ref }
}

export function useSpans(options: SpansOptions) {
  const latest = useLatest(options)
  const s = useOnce(() =>
    createSpans({
      ...options,
      spans: () => latest.current.spans(),
      valueAt: (t, p) => latest.current.valueAt(t, p),
      onChange: (v) => latest.current.onChange(v),
      onCreate: (v) => latest.current.onCreate?.(v),
      label: (v) => latest.current.label?.(v) ?? "Range",
      format: (n) => latest.current.format?.(n) ?? String(n),
    })
  )
  const state = useStore(s)
  const trackRef = useRefCache((id) => (node) => (node ? s.bindTrack(node, id) : undefined))
  const spanRef = useRefCache((key) => {
    const [id = "", part = "body"] = key.split("\u0000")
    return (node) => (node ? s.bindSpan(node, id, part as "body" | "start" | "end") : undefined)
  })
  const track = (id: string) => trackRef(id)
  const span = (id: string, part: "body" | "start" | "end" = "body") => spanRef(`${id}\u0000${part}`)
  return { ...s, ...state, track, span }
}

export function usePreview<T>(value: T, onCommit?: (v: T) => void) {
  const latest = useLatest(onCommit)
  const p = useOnce(() => createPreview<T>({ value, onCommit: (v) => latest.current?.(v) }))
  useIsoLayoutEffect(() => p.sync(value), [p, value])
  const state = useStore(p)
  return { ...p, ...state, shown: state.preview === undefined ? state.value : state.preview }
}

// ── Lists ───────────────────────────────────────────────────

export function useListbox<T>(options: ListboxOptions<T>) {
  const latest = useLatest(options)
  const l = useOnce(() =>
    createListbox<T>({
      items: () => latest.current.items(),
      key: (i) => latest.current.key(i),
      text: (i) => latest.current.text(i),
      disabled: (i) => !!latest.current.disabled?.(i),
      filter: options.filter === null ? null : (i, q) => (latest.current.filter ? latest.current.filter(i, q) : matchWords(latest.current.text(i), q)),
      loop: options.loop,
      pageSize: options.pageSize,
      onSelect: (i) => latest.current.onSelect?.(i),
      onHighlight: (k) => latest.current.onHighlight?.(k),
    })
  )
  useDestroy(l.destroy)
  const state = useStore(l)
  return { ...l, ...state }
}

export function useVirtualizer(options: VirtualizerOptions) {
  const v = useOnce(() => createVirtualizer(options))
  useIsoLayoutEffect(() => v.setOptions(options))
  const [el, ref] = useElement()
  useBind(el, (s) => v.bind(s))
  const state = useStore(v)
  /** Put on each rendered item so it measures itself. */
  const measure = useCallback(
    (index: number): RefCallback<HTMLElement> =>
      (node) => {
        if (!node) return
        const read = () => v.measure(index, options.horizontal ? node.offsetWidth : node.offsetHeight)
        read()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(read)
        ro.observe(node)
        return () => ro.disconnect()
      },
    [v, options.horizontal]
  )
  return { ...v, ...state, scrollRef: ref, measure }
}

export function useStickToBottom(threshold?: number) {
  const s = useOnce(() => createStickToBottom({ threshold }))
  const [el, ref] = useElement()
  const [content, contentRef] = useElement()
  useBind(el, (node) => s.bind(node, content ?? undefined))
  const state = useStore(s)
  return { ...state, scrollToBottom: s.scrollToBottom, scrollRef: ref, contentRef }
}

export function useScrollPicker(options: { onPick: (index: number) => void; selector?: string }) {
  const [el, ref] = useElement()
  const latest = useLatest(options)
  const [api, setApi] = useState<{ scrollTo(i: number, smooth?: boolean): void } | null>(null)
  useBind(el, (node) => {
    const p = bindScrollPicker(node, {
      items: () => Array.from(node.querySelectorAll<HTMLElement>(latest.current.selector ?? "[data-picker-item]")),
      onPick: (i) => latest.current.onPick(i),
    })
    setApi({ scrollTo: p.scrollTo })
    return p.destroy
  })
  return { ref, scrollTo: (i: number, smooth?: boolean) => api?.scrollTo(i, smooth) }
}

export function useInlineEdit(options: InlineEditOptions) {
  const latest = useLatest(options)
  const e = useOnce(() =>
    createInlineEdit({ ...options, validate: (d) => latest.current.validate?.(d) ?? null, onCommit: (v) => latest.current.onCommit(v), onCancel: () => latest.current.onCancel?.() })
  )
  useIsoLayoutEffect(() => e.setOptions({ value: options.value }), [e, options.value])
  const state = useStore(e)
  return { ...e, ...state }
}

// ── Trees ───────────────────────────────────────────────────

/** Expanded state, visible rows and the keyboard model for a tree. */
export function useTreeView<T>(options: {
  tree: TreeCollection<T>
  text: (id: string) => string
  defaultExpanded?: Iterable<string>
  onSelect?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(options.defaultExpanded ?? []))
  const [focused, setFocused] = useState<string | null>(options.tree.roots[0] ?? null)
  const rows = visibleTreeRows(options.tree, expanded)
  const latest = useLatest({ ...options, rows, focused })
  const nav = useOnce(() =>
    createTreeNavigation<T>({
      tree: () => latest.current.tree,
      rows: () => latest.current.rows,
      focused: () => latest.current.focused,
      text: (id) => latest.current.text(id),
      onFocus: setFocused,
      onExpand: (id, open) =>
        setExpanded((s) => {
          const n = new Set(s)
          if (open) n.add(id)
          else n.delete(id)
          return n
        }),
      onSelect: (id) => latest.current.onSelect?.(id),
    })
  )
  useDestroy(nav.destroy)
  const toggle = useCallback(
    (id: string) =>
      setExpanded((s) => {
        const n = new Set(s)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      }),
    []
  )
  return { rows, expanded, focused, setFocused, toggle, setExpanded, onKeyDown: nav.onKeyDown }
}

export function usePanel(open: boolean, options: { findable?: boolean; onReveal?: () => void } = {}) {
  const [el, ref] = useElement()
  const [trigger, triggerRef] = useElement()
  const latest = useLatest(options)
  const [panel, setPanel] = useState<ReturnType<typeof bindPanel> | null>(null)
  useBind(el, (node) => {
    const p = bindPanel(node, { trigger, findable: latest.current.findable, onReveal: () => latest.current.onReveal?.() })
    setPanel(p)
    return p.destroy
  })
  useIsoLayoutEffect(() => panel?.set(open), [panel, open])
  return { ref, triggerRef }
}

// ── Canvas ──────────────────────────────────────────────────

export function useViewport(options: ViewportOptions = {}) {
  const latest = useLatest(options)
  const v = useOnce(() => createViewport({ ...options, onChange: (s) => latest.current.onChange?.(s) }))
  const [el, ref] = useElement()
  useBind(el, (node) => v.bind(node))
  const state = useStore(v)
  return { ...v, ...state, ref }
}

export function useConnect(options: { ports: () => (Port & { el: HTMLElement })[]; canConnect?: (a: Port, b: Port) => boolean; onConnect: (a: Port, b: Port) => void }) {
  const latest = useLatest(options)
  const c = useOnce(() =>
    createConnect({ ports: () => latest.current.ports(), canConnect: (a, b) => latest.current.canConnect?.(a, b) ?? true, onConnect: (a, b) => latest.current.onConnect(a, b) })
  )
  const state = useStore(c)
  const port = useRefCache((id) => (node) => (node ? c.bindPort(node, id) : undefined))
  return { ...c, ...state, port }
}

// ── Preferences ─────────────────────────────────────────────

export function usePreference<T extends string>(options: PreferenceOptions<T>) {
  const p = useOnce(() => createPreference(options))
  useDestroy(p.destroy)
  const { value } = useStore(p)
  return [value, p.set] as const
}

export function useColorScheme(options: { key?: string; default?: ColorSchemeChoice } = {}) {
  const c = useOnce(() => createColorScheme(options))
  useDestroy(c.destroy)
  const state = useStore(c)
  return { ...state, set: c.set, toggle: c.toggle }
}

export function usePointerKind() {
  const p = useOnce(() => createPointerKind())
  useDestroy(p.destroy)
  return useStore(p)
}

