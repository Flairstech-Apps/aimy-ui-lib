"use client"

// Live demos for the Behaviours page: each one is a behaviour hook driving
// plain markup, so what you try here is the behaviour itself, not a part.

import { ChevronRight, GripVertical } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  type Span,
  arrayMove,
  bindDrag,
  createTreeCollection,
  stackSpans,
  toggleTreeChecked,
  treeCheckedStates,
  treeDataNodes,
  treeFromPaths,
  type PathItem,
} from "@/lib/behaviors"
import { useInlineEdit, useListbox, useReorder, useResize, useSpans, useStickToBottom, useTreeView, useViewport } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

const box = "rounded-lg border border-edge bg-card p-3"
const hint = "mt-2 text-2xs text-ink-secondary"

// ── Reorder ─────────────────────────────────────────────────

export function ReorderDemo() {
  const [steps, setSteps] = useState(["Read the brief", "Draft the plan", "Agree the scope", "Build it", "Ship it"])
  const list = useRef<HTMLOListElement>(null)
  const reorder = useReorder({ count: () => steps.length, label: (i) => steps[i] ?? "", onReorder: (a, b) => setSteps((s) => arrayMove(s, a, b)) })
  const shown = reorder.from !== null && reorder.to !== null ? arrayMove(steps, reorder.from, reorder.to) : steps
  const moving = reorder.from !== null ? steps[reorder.from] : null

  // One drag listener on the list for every grip, bound once.
  const { pointer } = reorder
  useEffect(() => {
    const el = list.current
    if (!el) return
    let from = -1
    return bindDrag(el, {
      filter: (e) => !!(e.target as Element).closest("[data-grip]"),
      onPress: (e) => (from = Number((e.target as Element).closest<HTMLElement>("[data-grip]")?.dataset.grip)),
      onStart: () => pointer.start(from),
      onMove: (info) => {
        const rects = Array.from(el.children).map((c) => c.getBoundingClientRect())
        pointer.move(info.point, rects.map((r) => ({ x: r.left, y: r.top, width: r.width, height: r.height })))
      },
      onEnd: () => pointer.end(),
      onCancel: () => pointer.cancel(),
    })
  }, [pointer])

  return (
    <div className={box}>
      <ol ref={list} className="flex flex-col gap-1">
        {shown.map((s) => {
          const i = steps.indexOf(s)
          return (
            <li key={s} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-ink", s === moving ? "bg-brand-dim" : "bg-raised")}>
              <button
                data-grip={i}
                type="button"
                aria-label={`Move ${s}`}
                aria-pressed={s === moving}
                onKeyDown={(e) => reorder.onKeyDown(i, e)}
                className="grid size-6 cursor-grab touch-none place-items-center rounded-sm text-ink-secondary hover:bg-w07"
              >
                <GripVertical aria-hidden="true" className="size-3.5" strokeWidth={2} />
              </button>
              {s}
            </li>
          )
        })}
      </ol>
      <p className={hint}>Drag a grip, or focus one and press Space, the arrows, then Space. Escape cancels. Each step is announced.</p>
    </div>
  )
}

// ── Tree ────────────────────────────────────────────────────

const FILES = ["app/page.tsx", "app/layout.tsx", "app/settings/page.tsx", "components/button.tsx", "components/menu.tsx", "lib/behaviors.ts", "README.md"]

export function TreeDemo() {
  const tree = useMemo(() => {
    const { nodes, roots } = treeDataNodes<PathItem>(treeFromPaths(FILES), (n) => n.path, (n) => n.children)
    return createTreeCollection(nodes, roots)
  }, [])
  const [checked, setChecked] = useState<Set<string>>(() => new Set(["components/menu.tsx"]))
  const states = treeCheckedStates(tree, checked)
  const name = (id: string) => tree.get(id)?.data.name ?? id
  const view = useTreeView({ tree, text: name, defaultExpanded: ["app", "components"], onSelect: (id) => setChecked((c) => toggleTreeChecked(tree, c, id)) })
  const root = useRef<HTMLUListElement>(null)
  useEffect(() => {
    if (root.current?.contains(document.activeElement)) root.current.querySelector<HTMLElement>(`[data-id="${view.focused}"]`)?.focus()
  }, [view.focused])

  return (
    <div className={box}>
      <ul ref={root} role="tree" aria-label="Files" aria-multiselectable="true" onKeyDown={view.onKeyDown} className="flex flex-col">
        {view.rows.map((r) => {
          const state = states.get(r.id)
          return (
            <li
              key={r.id}
              role="treeitem"
              data-id={r.id}
              aria-level={r.level}
              aria-posinset={r.posInSet}
              aria-setsize={r.setSize}
              aria-expanded={r.expanded}
              aria-checked={state === "mixed" ? "mixed" : state === "checked"}
              tabIndex={r.id === view.focused ? 0 : -1}
              onFocus={() => view.setFocused(r.id)}
              onClick={() => (r.expanded === undefined ? setChecked((c) => toggleTreeChecked(tree, c, r.id)) : view.toggle(r.id))}
              style={{ paddingInlineStart: `${(r.level - 1) * 16 + 4}px` }}
              className="flex cursor-pointer items-center gap-2 rounded-sm py-1 pr-2 text-xs text-ink outline-offset-[-2px] hover:bg-w05"
            >
              <ChevronRight aria-hidden="true" strokeWidth={2} className={cn("size-3.5 text-ink-secondary transition-transform duration-(--t-fast)", r.expanded && "rotate-90", r.expanded === undefined && "invisible")} />
              <span
                aria-hidden="true"
                className={cn("grid size-3.5 place-items-center rounded-xs border text-[10px] leading-none", state === "unchecked" ? "border-edge-hover" : "border-brand bg-brand text-on-status")}
              >
                {state === "checked" ? "✓" : state === "mixed" ? "–" : ""}
              </span>
              {name(r.id)}
            </li>
          )
        })}
      </ul>
      <p className={hint}>Arrows move; Right opens a folder, Left closes it or goes up; * opens the siblings; letters jump; Space checks, and folders roll up.</p>
    </div>
  )
}

// ── Listbox ─────────────────────────────────────────────────

const PRODUCTS = ["Cloud", "Security", "Data", "Support", "Training", "Hardware", "Networking", "Licensing"]

export function ListboxDemo() {
  const [chosen, setChosen] = useState<string | null>(null)
  const lb = useListbox({ items: () => PRODUCTS, key: (p) => p, text: (p) => p, onSelect: (p) => setChosen(p) })
  const visible = lb.visible()
  return (
    <div className={box}>
      <input
        role="combobox"
        aria-expanded="true"
        aria-controls="bh-products"
        aria-activedescendant={lb.highlighted ? `bh-opt-${lb.highlighted}` : undefined}
        aria-label="Find a product"
        placeholder="Find a product"
        value={lb.query}
        onChange={(e) => lb.setQuery(e.target.value)}
        onKeyDown={(e) => lb.onKeyDown(e, true)}
        className="w-full rounded-md border border-edge bg-raised px-3 py-1.5 text-xs text-ink placeholder:text-ink-placeholder"
      />
      <ul id="bh-products" role="listbox" aria-label="Products" className="mt-2 flex max-h-40 flex-col gap-0.5 overflow-y-auto">
        {visible.map((p) => (
          <li
            key={p}
            id={`bh-opt-${p}`}
            role="option"
            aria-selected={chosen === p}
            onPointerMove={() => lb.highlight(p)}
            onClick={() => lb.select(p)}
            className={cn("cursor-pointer rounded-sm px-2.5 py-1.5 text-xs text-ink", lb.highlighted === p && "bg-w07", chosen === p && "text-ai-ink")}
          >
            {p}
          </li>
        ))}
        {!visible.length ? <li className="px-2.5 py-1.5 text-xs text-ink-secondary">No product has those words.</li> : null}
      </ul>
      <p className={hint}>Focus stays in the field; the arrows move the highlight, Enter chooses. {chosen ? `Chosen: ${chosen}.` : ""}</p>
    </div>
  )
}

// ── Inline edit ─────────────────────────────────────────────

export function InlineEditDemo() {
  const [title, setTitle] = useState("Q4 plan")
  const edit = useInlineEdit({ value: title, onCommit: setTitle, validate: (d) => (d.trim() ? null : "Give it a name.") })
  return (
    <div className={box}>
      {edit.editing ? (
        <div>
          <input
            autoFocus
            aria-label="Name"
            aria-invalid={!!edit.error}
            value={edit.draft}
            onChange={(e) => edit.change(e.target.value)}
            onKeyDown={(e) => edit.onKeyDown(e)}
            onBlur={() => void edit.commit()}
            className="w-full rounded-md border border-brand bg-raised px-2 py-1 text-xl font-bold text-ink"
          />
          {edit.error ? <p className="mt-1 text-2xs text-err-text">{edit.error}</p> : null}
        </div>
      ) : (
        <button type="button" onClick={edit.start} className="rounded-md px-2 py-1 text-left text-xl font-bold text-ink hover:bg-w05">
          {title}
        </button>
      )}
      <p className={hint}>Click to rename. Enter or leaving the field saves; Escape puts it back.</p>
    </div>
  )
}

// ── Spans ───────────────────────────────────────────────────

const DAY = 8 * 60
const at = (m: number) => {
  const t = 9 * 60 + m
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
}

export function SpansDemo() {
  const [spans, setSpans] = useState<Span[]>([
    { id: "a", track: "day", start: 30, end: 120 },
    { id: "b", track: "day", start: 90, end: 180 },
    { id: "c", track: "day", start: 300, end: 360 },
  ])
  const s = useSpans({
    spans: () => spans,
    step: 15,
    min: 30,
    allowOverlap: true,
    valueAt: (track, p) => ((p.x - track.getBoundingClientRect().left) / track.getBoundingClientRect().width) * DAY,
    onChange: setSpans,
    onCreate: (n) => setSpans((all) => [...all, n]),
    label: () => "Meeting",
    format: at,
  })
  const placed = stackSpans(spans)
  return (
    <div className={box}>
      <div ref={s.track("day")} data-span-track="" className="relative h-28 rounded-md bg-raised">
        {placed.map(({ span, lane, lanes }) => (
          <div
            key={span.id}
            ref={s.span(span.id)}
            role="button"
            tabIndex={0}
            aria-label={`Meeting ${at(span.start)} to ${at(span.end)}`}
            onKeyDown={(e) => s.onKeyDown(span.id, e)}
            style={{ left: `${(span.start / DAY) * 100}%`, width: `${((span.end - span.start) / DAY) * 100}%`, top: `${(lane / lanes) * 100}%`, height: `${100 / lanes}%` }}
            className="absolute cursor-grab touch-none p-0.5"
          >
            <div className="relative h-full rounded-sm border border-brand bg-brand-dim px-2 py-1 text-2xs font-semibold text-ink">
              {at(span.start)}–{at(span.end)}
              <span ref={s.span(span.id, "start")} data-span-edge="" className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize" />
              <span ref={s.span(span.id, "end")} data-span-edge="" className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize" />
            </div>
          </div>
        ))}
        {s.draft ? (
          <div
            aria-hidden="true"
            style={{ left: `${(s.draft.start / DAY) * 100}%`, width: `${((s.draft.end - s.draft.start) / DAY) * 100}%` }}
            className="pointer-events-none absolute inset-y-0 rounded-sm border border-dashed border-brand"
          />
        ) : null}
      </div>
      <div className="mt-1 flex justify-between text-2xs text-ink-secondary">
        <span>9:00</span>
        <span>13:00</span>
        <span>17:00</span>
      </div>
      <p className={hint}>Drag on the empty track to add, a meeting to move it, its edges to resize; overlaps share the row. Focused, the arrows move it 15 minutes and Shift+arrows change its end.</p>
    </div>
  )
}

// ── Resize ──────────────────────────────────────────────────

export function ResizeDemo() {
  const r = useResize({ box: { x: 0, y: 0, width: 220, height: 96 }, min: { width: 120, height: 64 }, max: { width: 420, height: 200 }, step: 4, label: "Panel" })
  return (
    <div className={cn(box, "h-60")}>
      <div style={{ width: r.box.width, height: r.box.height }} className="relative rounded-md border border-edge-hover bg-raised p-3 text-xs text-ink">
        {Math.round(r.box.width)} × {Math.round(r.box.height)}
        <span
          ref={r.handle("se")}
          role="slider"
          tabIndex={0}
          aria-label="Resize the panel"
          aria-valuenow={Math.round(r.box.width)}
          aria-valuemin={120}
          aria-valuemax={420}
          onKeyDown={(e) => r.onKeyDown("se", e)}
          className="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none rounded-br-md border-r-2 border-b-2 border-brand"
        />
      </div>
      <p className={hint}>Drag the corner, or focus it and use the arrows (Shift for ten). Each change is announced.</p>
    </div>
  )
}

// ── Canvas ──────────────────────────────────────────────────

export function ViewportDemo() {
  const { ref: viewportRef, x, y, zoom } = useViewport({ minZoom: 0.5, maxZoom: 2.5 })
  const nodes = [
    { x: 40, y: 30, label: "Ask" },
    { x: 220, y: 90, label: "Read the sources" },
    { x: 120, y: 170, label: "Answer" },
  ]
  return (
    <div className={box}>
      <div ref={viewportRef} tabIndex={0} aria-label="Canvas: drag to pan, Ctrl and wheel or + and - to zoom" className="relative h-56 touch-none overflow-hidden rounded-md bg-raised">
        <div data-canvas-ground="" className="absolute inset-0" />
        <div className="pointer-events-none absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}>
          {nodes.map((n) => (
            <div key={n.label} style={{ left: n.x, top: n.y }} className="absolute rounded-md border border-edge bg-card px-3 py-2 text-xs whitespace-nowrap text-ink shadow-md">
              {n.label}
            </div>
          ))}
        </div>
        <span className="absolute right-2 bottom-2 rounded-sm bg-card px-2 py-0.5 text-2xs text-ink-secondary">{Math.round(zoom * 100)}%</span>
      </div>
      <p className={hint}>Drag the ground to pan; Ctrl and the wheel, or a pinch, zooms at the pointer. Focused: arrows pan, + and - zoom, 0 resets.</p>
    </div>
  )
}

// ── Stick to bottom ─────────────────────────────────────────

export function StickDemo() {
  const [lines, setLines] = useState(() => Array.from({ length: 6 }, (_, i) => `Step ${i + 1} done`))
  const { scrollRef, contentRef, following, scrollToBottom } = useStickToBottom()
  return (
    <div className={box}>
      <div ref={scrollRef} role="log" aria-label="Run log" className="h-36 overflow-y-auto rounded-md bg-raised p-2">
        <div ref={contentRef} className="flex flex-col gap-1">
          {lines.map((l) => (
            <p key={l} className="text-xs text-ink">
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setLines((l) => [...l, `Step ${l.length + 1} done`])} className="rounded-pill border border-edge px-3 py-1 text-xs font-semibold text-ink hover:bg-w05">
          Add a line
        </button>
        {!following ? (
          <button type="button" onClick={() => scrollToBottom(true)} className="rounded-pill bg-brand px-3 py-1 text-xs font-semibold text-on-status">
            Jump to the latest
          </button>
        ) : (
          <span className="text-2xs text-ink-secondary">Following new lines</span>
        )}
      </div>
      <p className={hint}>New lines scroll into view until you scroll up to read; then it stops following until you come back down.</p>
    </div>
  )
}
