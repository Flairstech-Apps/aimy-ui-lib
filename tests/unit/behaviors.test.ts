import { afterEach, describe, expect, it, vi } from "vitest"
import {
  arrayMove,
  bindLayer,
  byCellRange,
  cellRangeMessage,
  cellsToText,
  computePosition,
  createCellRange,
  createConnect,
  createFocusRecovery,
  createFocusTrap,
  createInlineEdit,
  createListbox,
  createMove,
  createPreference,
  createPreview,
  createReorder,
  createRovingFocus,
  createSelection,
  createSpans,
  createStore,
  createTransfer,
  createTreeCollection,
  createTreeNavigation,
  createTreeReorder,
  createTypeahead,
  createViewport,
  dropIndex,
  hideOthers,
  inputHints,
  isSpanFree,
  lockScroll,
  nearestInDirection,
  preferencesScript,
  projectDistance,
  reorderMessage,
  resizeBox,
  rubberBand,
  sectorOf,
  settleDraft,
  solveSpring,
  stackSpans,
  subtreeEnd,
  textToCells,
  toggleTreeChecked,
  treeCheckedStates,
  treeDataNodes,
  treeFromPaths,
  visibleTreeRows,
} from "@/lib/behaviors"
import { ariaProblems, press, singleTabStopProblems, tab, typeKeys } from "@/registry/aimy/lib/behaviors-testing"

function html(markup: string) {
  const root = document.createElement("div")
  root.innerHTML = markup
  document.body.appendChild(root)
  return root
}

afterEach(() => {
  document.body.innerHTML = ""
  vi.useRealTimers()
})

describe("store", () => {
  it("notifies only on change", () => {
    const s = createStore({ a: 1, b: 2 })
    const fn = vi.fn()
    s.subscribe(fn)
    s.set({ a: 1 })
    expect(fn).not.toHaveBeenCalled()
    s.set((st) => ({ a: st.a + 1 }))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(s.get()).toEqual({ a: 2, b: 2 })
  })
})

describe("focus and keys", () => {
  it("roving focus gives one Tab stop and moves with the arrows, Home and End", () => {
    const root = html(`<div role="toolbar"><button>A</button><button>B</button><button aria-disabled="true">C</button><button>D</button></div>`)
    const bar = root.firstElementChild as HTMLElement
    const items = () => Array.from(bar.querySelectorAll("button"))
    createRovingFocus(bar, { items, orientation: "horizontal" })
    expect(singleTabStopProblems(bar)).toEqual([])
    items()[0]!.focus()
    press("ArrowRight")
    expect(document.activeElement?.textContent).toBe("B")
    press("ArrowRight") // skips the disabled C
    expect(document.activeElement?.textContent).toBe("D")
    press("ArrowRight") // loops
    expect(document.activeElement?.textContent).toBe("A")
    press("End")
    expect(document.activeElement?.textContent).toBe("D")
    expect(items()[3]!.tabIndex).toBe(0)
    expect(items()[0]!.tabIndex).toBe(-1)
  })

  it("focus trap keeps Tab inside and returns focus on release", () => {
    const root = html(`<button id="out">Open</button><div id="d"><input id="f" /><button id="ok">OK</button></div>`)
    const opener = root.querySelector<HTMLElement>("#out")!
    opener.focus()
    const release = createFocusTrap(root.querySelector("#d")!)
    expect(document.activeElement?.id).toBe("f")
    root.querySelector<HTMLElement>("#ok")!.focus()
    tab()
    expect(document.activeElement?.id).toBe("f")
    tab(true)
    expect(document.activeElement?.id).toBe("ok")
    release()
    expect(document.activeElement).toBe(opener)
  })

  it("focus trap lets onMountFocus keep focus where it is", () => {
    const root = html(`<button id="out">Open</button><div id="d"><input id="f" /></div>`)
    root.querySelector<HTMLElement>("#out")!.focus()
    const release = createFocusTrap(root.querySelector("#d")!, { onMountFocus: (e) => e.preventDefault() })
    expect(document.activeElement?.id).toBe("out")
    release()
  })

  it("typeahead jumps by letters and cycles on a repeated letter", () => {
    vi.useFakeTimers()
    const items = ["Apple", "Banana", "Blueberry", "Cherry"]
    let at = "Apple"
    const t = createTypeahead({ items: () => items, text: (i) => i, current: () => at, onMatch: (i) => (at = i) })
    t.key("b")
    expect(at).toBe("Banana")
    t.key("b")
    expect(at).toBe("Blueberry")
    vi.advanceTimersByTime(1000)
    t.key("c")
    t.key("h")
    expect(at).toBe("Cherry")
  })

  it("focus recovery moves focus to the item that took the removed one's place", async () => {
    const root = html(`<ul><li tabindex="0">A</li><li tabindex="0">B</li><li tabindex="0">C</li></ul>`)
    const ul = root.firstElementChild as HTMLElement
    createFocusRecovery(ul, () => Array.from(ul.children) as HTMLElement[])
    const b = ul.children[1] as HTMLElement
    b.focus()
    b.remove()
    await new Promise((r) => setTimeout(r, 0))
    expect(document.activeElement?.textContent).toBe("C")
  })

  it("finds the nearest item in a direction", () => {
    const at = (x: number, y: number) => {
      const el = document.createElement("div")
      el.getBoundingClientRect = () => ({ left: x, top: y, width: 10, height: 10, x, y, right: x + 10, bottom: y + 10, toJSON() {} }) as DOMRect
      return el
    }
    const right = at(100, 0)
    const diag = at(60, 80)
    expect(nearestInDirection({ x: 0, y: 0, width: 10, height: 10 }, [right, diag], "right")).toBe(right)
    expect(nearestInDirection({ x: 0, y: 0, width: 10, height: 10 }, [right, diag], "down")).toBe(diag)
  })

  it("gives fields the right keyboard", () => {
    expect(inputHints("email")).toMatchObject({ type: "email", inputMode: "email", autoComplete: "email" })
    expect(inputHints("code")).toMatchObject({ autoComplete: "one-time-code", inputMode: "numeric" })
  })
})

describe("selection", () => {
  it("selects, toggles and extends ranges like a file list", () => {
    const order = ["a", "b", "c", "d", "e"]
    const s = createSelection<string>({ mode: "multiple" })
    s.press("b", {}, order)
    s.press("d", { shiftKey: true }, order)
    expect([...s.get().selected]).toEqual(["b", "c", "d"])
    s.press("a", { metaKey: true }, order)
    expect(s.isSelected("a")).toBe(true)
    s.press("e", {}, order)
    expect([...s.get().selected]).toEqual(["e"])
  })

  it("cell ranges extend with Shift+arrows and say their size", () => {
    const r = createCellRange({ rows: () => 10, cols: () => 5 })
    r.start({ row: 1, col: 1 })
    r.onKeyDown({ key: "ArrowDown", shiftKey: true })
    r.onKeyDown({ key: "ArrowRight", shiftKey: true })
    expect(r.contains(2, 2)).toBe(true)
    expect(cellRangeMessage(r.get().range)).toBe("2 rows by 2 columns selected, B2 to C3")
    expect(byCellRange({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } }, { anchor: { row: 0, col: 0 }, focus: { row: 0, col: 1 } })).toEqual([{ row: 0, col: 1 }])
  })

  it("copies and pastes cells as spreadsheet text", () => {
    const rows = [["Name", "Note"], ["Ada", 'says "hi"\tthere']]
    expect(textToCells(cellsToText(rows))).toEqual(rows)
    expect(textToCells("a\tb\r\nc\td\r\n")).toEqual([["a", "b"], ["c", "d"]])
  })
})

describe("drag and drop", () => {
  it("reorders by keyboard and says each step", () => {
    const list = ["Plan", "Build", "Ship"]
    const onReorder = vi.fn()
    const r = createReorder({ count: () => list.length, label: (i) => list[i]!, onReorder })
    const e = { key: " ", preventDefault() {} }
    r.onKeyDown(0, e)
    r.onKeyDown(0, { ...e, key: "ArrowDown" })
    r.onKeyDown(0, { ...e, key: "ArrowDown" })
    r.onKeyDown(0, e)
    expect(onReorder).toHaveBeenCalledWith(0, 2)
    expect(arrayMove(list, 0, 2)).toEqual(["Build", "Ship", "Plan"])
    expect(reorderMessage("drop", "Plan", 3, 3)).toBe("Dropped Plan at position 3 of 3.")
  })

  it("cancelling a keyboard move commits nothing", () => {
    const onReorder = vi.fn()
    const r = createReorder({ count: () => 3, label: () => "x", onReorder })
    r.grab(1)
    r.moveTo(2)
    r.cancel()
    expect(onReorder).not.toHaveBeenCalled()
    expect(r.get().from).toBeNull()
  })

  it("finds the drop index from rects", () => {
    const rects = [0, 40, 80].map((y) => ({ x: 0, y, width: 100, height: 40 }))
    expect(dropIndex(rects, { x: 10, y: 95 })).toBe(2)
  })

  it("nests and un-nests tree rows by keyboard, never inside itself", () => {
    const rows = [
      { id: "a", level: 0, label: "A" },
      { id: "a1", level: 1, label: "A1" },
      { id: "b", level: 0, label: "B" },
    ]
    expect(subtreeEnd(rows, 0)).toBe(2)
    const onMove = vi.fn()
    const t = createTreeReorder({ rows: () => rows, onMove })
    t.grab("b")
    t.indent(1) // B into A, after A1
    t.drop()
    expect(onMove).toHaveBeenCalledWith("b", { parent: "a", index: 1 })
    const t2 = createTreeReorder({ rows: () => rows, onMove })
    t2.grab("a")
    t2.step(1) // the gap skips A's own subtree
    t2.indent(1)
    t2.drop()
    expect(onMove).toHaveBeenLastCalledWith("a", { parent: "b", index: 0 })
  })

  it("transfers items between lists", () => {
    let lists: Record<string, string[]> = { backlog: ["x", "y"], sprint: ["z"] }
    const t = createTransfer<string>({ lists: () => lists, label: (k) => k, onChange: (l) => (lists = l) })
    t.shift("y", 1)
    expect(lists).toEqual({ backlog: ["x"], sprint: ["z", "y"] })
    t.move(["z"], "backlog", 0)
    expect(lists.backlog).toEqual(["z", "x"])
  })

  it("keeps a draft until the value catches up", () => {
    expect(settleDraft([2, 1], [1, 2], (a, b) => a.join() === b.join())).toEqual({ shown: [2, 1], settled: false })
    expect(settleDraft(undefined, 5)).toEqual({ shown: 5, settled: true })
  })
})

describe("move and resize", () => {
  it("moves with the arrows inside bounds", () => {
    const m = createMove({ position: { x: 5, y: 5 }, step: 10, bounds: () => ({ minX: 0, minY: 0, maxX: 100, maxY: 100 }) })
    m.onKeyDown({ key: "ArrowLeft", preventDefault() {} })
    expect(m.get().position).toEqual({ x: 0, y: 5 })
    m.onKeyDown({ key: "ArrowDown", shiftKey: true, preventDefault() {} })
    expect(m.get().position).toEqual({ x: 0, y: 100 })
  })

  it("resizes from any edge within min and max", () => {
    const box = { x: 100, y: 100, width: 200, height: 100 }
    expect(resizeBox(box, "w", { x: 50, y: 0 })).toEqual({ x: 150, y: 100, width: 150, height: 100 })
    expect(resizeBox(box, "se", { x: -500, y: 0 }, { min: { width: 40, height: 40 } }).width).toBe(40)
    expect(resizeBox(box, "e", { x: 100, y: 0 }, { aspect: 2 })).toMatchObject({ width: 300, height: 150 })
  })

  it("stacks overlapping spans into lanes and refuses overlaps", () => {
    const spans = [
      { id: "1", track: "t", start: 0, end: 60 },
      { id: "2", track: "t", start: 30, end: 90 },
      { id: "3", track: "t", start: 120, end: 150 },
    ]
    const lanes = stackSpans(spans)
    expect(lanes.find((l) => l.span.id === "2")).toMatchObject({ lane: 1, lanes: 2 })
    expect(lanes.find((l) => l.span.id === "3")).toMatchObject({ lane: 0, lanes: 1 })
    expect(isSpanFree(spans, { id: "n", track: "t", start: 90, end: 120 })).toBe(true)
    expect(isSpanFree(spans, { id: "n", track: "t", start: 50, end: 70 })).toBe(false)
  })

  it("moves a span by keyboard in steps", () => {
    let spans = [{ id: "a", track: "t", start: 0, end: 30 }]
    const s = createSpans({ spans: () => spans, step: 15, valueAt: () => 0, onChange: (v) => (spans = v) })
    s.onKeyDown("a", { key: "ArrowRight", preventDefault() {} })
    expect(spans[0]).toMatchObject({ start: 15, end: 45 })
    s.onKeyDown("a", { key: "ArrowRight", shiftKey: true, preventDefault() {} })
    expect(spans[0]).toMatchObject({ start: 15, end: 60 })
  })

  it("previews a value and reverts", () => {
    const onCommit = vi.fn()
    const p = createPreview({ value: "dark", onCommit })
    p.try("light")
    expect(p.shown()).toBe("light")
    p.revert()
    expect(p.shown()).toBe("dark")
    p.try("light")
    p.commit()
    expect(onCommit).toHaveBeenCalledWith("light")
  })
})

describe("lists", () => {
  const people = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Katherine Johnson"]

  it("filters, highlights and selects", () => {
    const onSelect = vi.fn()
    const l = createListbox({ items: () => people, key: (p) => p, text: (p) => p, onSelect })
    l.setQuery("a")
    expect(l.get().highlighted).toBe("Ada Lovelace")
    l.setQuery("hop gra")
    expect(l.visible()).toEqual(["Grace Hopper"])
    l.onKeyDown({ key: "Enter", preventDefault() {} }, true)
    expect(onSelect).toHaveBeenCalledWith("Grace Hopper")
  })

  it("moves with the arrows and stops at the ends", () => {
    const l = createListbox({ items: () => people, key: (p) => p, text: (p) => p })
    const k = (key: string) => l.onKeyDown({ key, preventDefault() {} })
    k("ArrowDown")
    expect(l.get().highlighted).toBe("Ada Lovelace")
    k("End")
    k("ArrowDown")
    expect(l.get().highlighted).toBe("Katherine Johnson")
    k("g")
    expect(l.get().highlighted).toBe("Grace Hopper")
  })

  it("inline edit validates, saves on Enter and puts back on Escape", async () => {
    const onCommit = vi.fn()
    const e = createInlineEdit({ value: "Q4 plan", onCommit, validate: (d) => (d.trim() ? null : "A name is needed.") })
    e.start()
    e.change("")
    await e.commit()
    expect(e.get().error).toBe("A name is needed.")
    e.change("Q4 review")
    e.onKeyDown({ key: "Enter", preventDefault() {} })
    await Promise.resolve()
    expect(onCommit).toHaveBeenCalledWith("Q4 review")
    e.start()
    e.change("nope")
    e.onKeyDown({ key: "Escape", preventDefault() {} })
    expect(e.get()).toMatchObject({ editing: false, draft: "Q4 plan" })
  })
})

describe("trees", () => {
  const data = [
    { id: "src", children: [{ id: "app", children: [{ id: "page" }, { id: "layout" }] }, { id: "lib" }] },
    { id: "readme" },
  ] as { id: string; children?: { id: string; children?: { id: string }[] }[] }[]
  type N = { id: string; children?: N[] }
  const { nodes, roots } = treeDataNodes<N>(data, (n) => n.id, (n) => n.children)
  const tree = createTreeCollection(nodes, roots)

  it("knows parents, levels and visible rows", () => {
    expect(tree.parent("page")?.id).toBe("app")
    expect(tree.ancestors("page").map((n) => n.id)).toEqual(["src", "app"])
    const rows = visibleTreeRows(tree, new Set(["src"]))
    expect(rows.map((r) => r.id)).toEqual(["src", "app", "lib", "readme"])
    expect(rows[1]).toMatchObject({ level: 2, posInSet: 1, setSize: 2, expanded: false })
  })

  it("rolls checks up to parents", () => {
    let checked = toggleTreeChecked(tree, new Set(), "page")
    expect(treeCheckedStates(tree, checked).get("src")).toBe("mixed")
    checked = toggleTreeChecked(tree, checked, "src")
    expect(treeCheckedStates(tree, checked).get("src")).toBe("checked")
    checked = toggleTreeChecked(tree, checked, "app")
    expect(treeCheckedStates(tree, checked).get("app")).toBe("unchecked")
  })

  it("builds a tree from paths, folders first", () => {
    const t = treeFromPaths(["src/b.ts", "src/app/page.tsx", "a.md"])
    expect(t.map((n) => n.name)).toEqual(["src", "a.md"])
    expect(t[0]!.children.map((n) => n.name)).toEqual(["app", "b.ts"])
  })

  it("follows the tree keyboard model", () => {
    let expanded = new Set<string>()
    let focused = "src"
    const nav = createTreeNavigation({
      tree: () => tree,
      rows: () => visibleTreeRows(tree, expanded),
      focused: () => focused,
      text: (id) => id,
      onFocus: (id) => (focused = id),
      onExpand: (id, open) => {
        expanded = new Set(expanded)
        if (open) expanded.add(id)
        else expanded.delete(id)
      },
    })
    const k = (key: string) => nav.onKeyDown({ key, preventDefault() {} })
    k("ArrowRight")
    expect(expanded.has("src")).toBe(true)
    k("ArrowRight")
    expect(focused).toBe("app")
    k("ArrowLeft")
    expect(focused).toBe("src")
    k("ArrowLeft")
    expect(expanded.has("src")).toBe(false)
    k("r")
    expect(focused).toBe("readme")
  })
})

describe("motion maths", () => {
  it("springs settle on their target", () => {
    expect(solveSpring({}, 0, 100, 5000).value).toBe(100)
    expect(solveSpring({ damping: 5 }, 0, 100, 100).value).not.toBe(100)
  })
  it("rubber-bands and projects", () => {
    expect(rubberBand(1000, 300)).toBeLessThan(300)
    expect(rubberBand(-50, 300)).toBeLessThan(0)
    expect(projectDistance(1)).toBeCloseTo(499, 0)
  })
  it("finds a radial sector", () => {
    expect(sectorOf(0, -50, 4)).toBe(0) // up
    expect(sectorOf(50, 0, 4)).toBe(1) // right
    expect(sectorOf(2, 2, 4)).toBe(-1) // dead zone
  })
})

describe("layers", () => {
  it("flips to the side with room and reports what is left", () => {
    const p = computePosition({ top: 700, left: 10, width: 100, height: 30 }, { width: 200, height: 300 }, { width: 1000, height: 800 }, { side: "bottom", align: "start", sideOffset: 6 })
    expect(p.side).toBe("top")
    expect(p.y).toBe(700 - 6 - 300)
    expect(p.availableHeight).toBe(700 - 6 - 8)
  })

  it("shifts along the edge to stay on screen", () => {
    const p = computePosition({ top: 10, left: 950, width: 40, height: 20 }, { width: 200, height: 100 }, { width: 1000, height: 800 }, { align: "start" })
    expect(p.x).toBe(1000 - 8 - 200)
  })

  it("Escape closes only the topmost layer", () => {
    const a = html(`<div>a</div>`)
    const b = html(`<div>b</div>`)
    const da = vi.fn()
    const db = vi.fn()
    const offA = bindLayer(a, { onDismiss: da })
    const offB = bindLayer(b, { onDismiss: db })
    press("Escape", document.body)
    expect(db).toHaveBeenCalledWith("escape")
    expect(da).not.toHaveBeenCalled()
    offB()
    press("Escape", document.body)
    expect(da).toHaveBeenCalledWith("escape")
    offA()
  })

  it("a press outside closes, inside or on a branch doesn't, and handlers can keep it open", () => {
    const layer = html(`<div id="l"><button>in</button></div>`)
    const trigger = html(`<button>trigger</button>`)
    const away = html(`<p>away</p>`)
    const onDismiss = vi.fn()
    let keep = true
    const off = bindLayer(layer, { onDismiss, branches: () => [trigger], onInteractOutside: (e) => keep && e.preventDefault() })
    const down = (el: Element) => el.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))
    down(layer.querySelector("button")!)
    down(trigger)
    down(away)
    expect(onDismiss).not.toHaveBeenCalled()
    keep = false
    down(away)
    expect(onDismiss).toHaveBeenCalledWith("outside-press")
    off()
  })

  it("hides the page from screen readers and locks scroll, then puts both back", () => {
    const page = html(`<main>page</main>`)
    const modal = html(`<div role="dialog" aria-label="x">m</div>`)
    const show = hideOthers(modal)
    const unlock = lockScroll()
    expect(page.getAttribute("aria-hidden")).toBe("true")
    expect(modal.getAttribute("aria-hidden")).toBeNull()
    expect(document.body.style.overflow).toBe("hidden")
    show()
    unlock()
    expect(page.getAttribute("aria-hidden")).toBeNull()
    expect(document.body.style.overflow).toBe("")
  })
})

describe("preferences", () => {
  it("saves a choice and mirrors it to <html>", () => {
    const p = createPreference({ key: "aimy-test-density", values: ["comfy", "compact"] as const, default: "comfy", attribute: "data-density" })
    p.set("compact")
    expect(localStorage.getItem("aimy-test-density")).toBe("compact")
    expect(document.documentElement.getAttribute("data-density")).toBe("compact")
    p.set("huge" as "comfy")
    expect(p.value()).toBe("compact")
    p.destroy()
  })
  it("writes a pre-paint script", () => {
    localStorage.setItem("aimy-test-d2", "compact")
    new Function(preferencesScript([{ key: "aimy-test-d2", attribute: "data-d2", values: ["comfy", "compact"], default: "comfy" }]))()
    expect(document.documentElement.getAttribute("data-d2")).toBe("compact")
  })
})

describe("canvas", () => {
  it("zooms about a point and converts coordinates", () => {
    const v = createViewport()
    v.zoomAt(2, { x: 100, y: 100 })
    expect(v.toScreen(v.toCanvas({ x: 37, y: 12 }))).toEqual({ x: 37, y: 12 })
    expect(v.toScreen({ x: 100, y: 100 })).toEqual({ x: 100, y: 100 })
    expect(v.get().zoom).toBe(2)
  })

  it("connects ports by keyboard", () => {
    const el = () => document.createElement("span")
    const ports = [
      { id: "o1", node: "a", kind: "out" as const, label: "Draft out", el: el() },
      { id: "i1", node: "b", kind: "in" as const, label: "Review in", el: el() },
      { id: "i2", node: "a", kind: "in" as const, label: "Draft in", el: el() },
    ]
    const onConnect = vi.fn()
    const c = createConnect({ ports: () => ports, onConnect })
    const k = (key: string) => c.onKeyDown("o1", { key, preventDefault() {} })
    k("Enter")
    expect(c.targets().map((p) => p.id)).toEqual(["i1"]) // not its own node
    k("Enter")
    expect(onConnect).toHaveBeenCalledWith(expect.objectContaining({ id: "o1" }), expect.objectContaining({ id: "i1" }))
  })
})

describe("testing kit", () => {
  it("reports missing ARIA in plain words", () => {
    const root = html(`<div role="dialog"></div><div role="listbox"><div role="option">A</div></div><div role="combobox" aria-expanded="true"></div>`)
    expect(ariaProblems(root)).toEqual([
      "A dialog has no name (aria-labelledby or aria-label).",
      "An open combobox doesn't point at its list (aria-controls).",
      'Option "A" doesn\'t say whether it is chosen (aria-selected).',
    ])
  })
  it("types keys", () => {
    const input = html(`<input />`).querySelector("input")!
    const seen: string[] = []
    input.addEventListener("keydown", (e) => seen.push(e.key))
    input.focus()
    typeKeys("ab")
    expect(seen).toEqual(["a", "b"])
  })
})
