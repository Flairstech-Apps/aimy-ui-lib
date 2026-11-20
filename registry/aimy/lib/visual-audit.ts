// The visual audit: measures what a person sees on a rendered page, not what the code says. Run it in a
// real browser (Playwright, Claude in Chrome, the browser's console); jsdom has no layout. Each problem
// is a sentence with the element and the pixels measured, so a review can say "the icon sits 3px high"
// rather than "check alignment".
//
//   import { visualProblems } from "@flairstech-aimy/ui/testing"
//   const problems = visualProblems(document.querySelector("main")!)
//
// What it checks, from AiMY's standing rules:
// - An icon beside text is centred on the capitals (not on the line box, which reads as low). A mark
//   as tall as the capitals then has its top on theirs.
// - Pills and buttons in one row share a height and a centre.
// - Cards, tiles and columns in a stack or grid share their edges.
// - Text sits on a shared baseline with the text beside it in a row.
// - Nothing spills out of its box or makes the page scroll sideways; nothing is cut without an ellipsis.
// - No text under 12px, no target under 24px, no text under 4.5:1 contrast (3:1 when large).

export type VisualProblem = {
  kind: "icon" | "row" | "edges" | "baseline" | "overflow" | "page-width" | "text-size" | "target" | "contrast" | "cut"
  /** "fix" breaks a rule; "check" needs a person's eye (it may be on purpose). */
  severity: "fix" | "check"
  message: string
  /** A short CSS path to the element. */
  where: string
  element: Element
  /** What was measured, in CSS pixels or a ratio. */
  measured: Record<string, number>
}

export type VisualAuditOptions = {
  /** How far off counts, in CSS px. 1 by default; the Claude browser pane draws text a pixel or two off, so confirm small ones in a real browser. */
  tolerance?: number
  /** Which checks to run. All by default. */
  checks?: VisualProblem["kind"][]
  /** At most this many problems (the rest are summarised). 200 by default. */
  limit?: number
}

const round = (n: number) => Math.round(n * 10) / 10

function where(el: Element): string {
  const parts: string[] = []
  let e: Element | null = el
  while (e && e !== document.body && parts.length < 4) {
    const slot = e.getAttribute("data-slot")
    const id = e.id && !/^(_|:r|«)/.test(e.id) ? `#${e.id}` : ""
    const cls = typeof e.className === "string" ? e.className.split(/\s+/).filter((c) => c && !c.includes(":") && !c.includes("[")).slice(0, 2) : []
    parts.unshift(slot ? `[data-slot=${slot}]` : `${e.tagName.toLowerCase()}${id}${cls.length ? `.${cls.join(".")}` : ""}`)
    if (slot || id) break
    e = e.parentElement
  }
  return parts.join(" > ")
}

function visible(el: Element): boolean {
  const r = el.getBoundingClientRect()
  if (r.width < 1 || r.height < 1) return false
  const s = getComputedStyle(el)
  return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05 && !el.closest("[aria-hidden=true][inert], [hidden]")
}

// ── Font metrics: where the capitals and the baseline are in a line ──

const ctx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null
const metricsCache = new Map<string, { ascent: number; descent: number; cap: number }>()
function fontMetrics(s: CSSStyleDeclaration) {
  const font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
  let m = metricsCache.get(font)
  if (!m && ctx) {
    ctx.font = font
    const h = ctx.measureText("H")
    const any = ctx.measureText("Hg")
    m = { ascent: any.fontBoundingBoxAscent, descent: any.fontBoundingBoxDescent, cap: h.actualBoundingBoxAscent }
    metricsCache.set(font, m)
  }
  return m ?? { ascent: parseFloat(s.fontSize) * 0.9, descent: parseFloat(s.fontSize) * 0.25, cap: parseFloat(s.fontSize) * 0.7 }
}

/** The first line of text in el: its baseline and the top of its capitals, in viewport px. */
function firstLine(el: Element): { baseline: number; capTop: number; cap: number; size: number } | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) })
  const node = walker.nextNode() as Text | null
  if (!node?.parentElement || !visible(node.parentElement)) return null
  const range = document.createRange()
  const start = node.textContent!.search(/\S/)
  range.setStart(node, start)
  range.setEnd(node, start + 1)
  const rect = range.getClientRects()[0]
  if (!rect) return null
  const s = getComputedStyle(node.parentElement)
  const m = fontMetrics(s)
  // A text range's box is the font's content area: ascent above the baseline, descent below.
  const contentH = m.ascent + m.descent
  const baseline = rect.top + (rect.height - contentH) / 2 + m.ascent
  return { baseline, capTop: baseline - m.cap, cap: m.cap, size: parseFloat(s.fontSize) }
}

/** The drawn bounds of an svg icon (its paths, not its box), in viewport px. */
function drawn(svg: SVGSVGElement): DOMRect | null {
  try {
    const box = svg.getBoundingClientRect()
    const bb = svg.getBBox()
    const vb = svg.viewBox.baseVal
    if (!vb || !vb.width || !vb.height || !bb.height) return box
    // The default preserveAspectRatio (xMidYMid meet): one scale for both axes, the content centred in
    // the box, so a mark whose viewBox isn't the box's shape is letterboxed.
    const par = svg.getAttribute("preserveAspectRatio") ?? ""
    let sx = box.width / vb.width
    let sy = box.height / vb.height
    let ox = 0
    let oy = 0
    if (!par.startsWith("none")) {
      const k = par.includes("slice") ? Math.max(sx, sy) : Math.min(sx, sy)
      ox = (box.width - vb.width * k) / 2
      oy = (box.height - vb.height * k) / 2
      sx = sy = k
    }
    return new DOMRect(box.left + ox + (bb.x - vb.x) * sx, box.top + oy + (bb.y - vb.y) * sy, bb.width * sx, bb.height * sy)
  } catch {
    return null
  }
}

// ── Colour ──

function parseColor(c: string): [number, number, number, number] | null {
  const m = /rgba?\(([^)]+)\)/.exec(c)
  if (!m) return null
  const p = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1]
}
const lum = ([r, g, b]: number[]) => {
  const f = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!)
}
/** The colour behind el, blending translucent grounds up the tree; null when an image or gradient is in the way. */
function groundOf(el: Element): [number, number, number] | null {
  const layers: [number, number, number, number][] = []
  for (let e: Element | null = el; e; e = e.parentElement) {
    const s = getComputedStyle(e)
    if (s.backgroundImage && s.backgroundImage !== "none") return null
    const c = parseColor(s.backgroundColor)
    if (c && c[3] > 0) {
      layers.push(c)
      if (c[3] >= 1) break
    }
  }
  let out: [number, number, number] = [255, 255, 255]
  for (const [r, g, b, a] of layers.reverse()) out = [out[0] * (1 - a) + r * a, out[1] * (1 - a) + g * a, out[2] * (1 - a) + b * a]
  return out
}

// ── The checks ──

/** The area a pointer can hit: the box, grown by an ::after that parts use to widen a small control's target. */
function hitArea(el: Element) {
  const r = el.getBoundingClientRect()
  const a = getComputedStyle(el, "::after")
  if (a.content === "none" || a.position !== "absolute") return { width: r.width, height: r.height }
  const px = (v: string) => (v.endsWith("px") ? Math.min(0, parseFloat(v)) : 0)
  return { width: r.width - px(a.left) - px(a.right), height: r.height - px(a.top) - px(a.bottom) }
}

/** How far el's in-flow content (text and boxes; not pseudo-elements, not badges placed on purpose) reaches past its edges. */
function spill(el: Element) {
  const r = el.getBoundingClientRect()
  let left = Infinity
  let right = -Infinity
  for (const n of Array.from(el.childNodes)) {
    let c: DOMRect | null = null
    if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) {
      const range = document.createRange()
      range.selectNodeContents(n)
      c = range.getBoundingClientRect()
    } else if (n instanceof Element && !/absolute|fixed/.test(getComputedStyle(n).position)) c = n.getBoundingClientRect()
    if (c && c.width) {
      left = Math.min(left, c.left)
      right = Math.max(right, c.right)
    }
  }
  return right > left ? Math.max(right - r.right, r.left - left) : 0
}

const INTERACTIVE = "button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=checkbox], [role=switch], [role=radio], [role=option], [role=menuitem], [role=treeitem], [role=slider]"
const PILLISH = "button, [role=button], [data-slot=chip], [data-slot=tag], [data-slot=button], [data-slot=select-trigger], [data-slot=count-badge], a[data-slot=link]"

export function visualProblems(root: Element = document.body, options: VisualAuditOptions = {}): VisualProblem[] {
  const tol = options.tolerance ?? 1
  const on = (k: VisualProblem["kind"]) => !options.checks || options.checks.includes(k)
  const out: VisualProblem[] = []
  const add = (p: Omit<VisualProblem, "where">) => out.push({ ...p, where: where(p.element) })
  const all = Array.from(root.querySelectorAll("*")).filter(visible)

  // Icons beside text.
  if (on("icon"))
    for (const svg of root.querySelectorAll<SVGSVGElement>("svg")) {
      if (!visible(svg)) continue
      const box = svg.getBoundingClientRect()
      if (box.width > 40 || box.height > 40) continue
      const row = svg.closest("button, a, label, li, p, span, div")
      if (!row) continue
      // The words the icon names: not a count badge, a status or anything placed on top on purpose.
      const isLabel = (e: Element) =>
        e !== svg && !svg.contains(e) && !e.contains(svg) && !e.closest("[data-slot=count-badge], [role=status], .sr-only") && !/absolute|fixed/.test(getComputedStyle(e).position) && !!firstLine(e)
      const textEl = Array.from(row.querySelectorAll("*")).find(isLabel) ?? (row.textContent?.trim() && isLabel(row) ? row : null)
      const line = textEl ? firstLine(textEl) : null
      const d = drawn(svg)
      if (!line || !d) continue
      // Only when the icon sits beside the text, on its first line: it overlaps the line's height and
      // is to one side of the words. An icon stacked above or below its words is a different layout.
      const rect = textEl!.getBoundingClientRect()
      const overlaps = d.bottom > line.capTop - 2 && d.top < line.baseline + 2
      const beside = box.right <= rect.left + 2 || box.left >= rect.right - 2
      if (!overlaps || !beside || rect.left > box.right + 48 || box.left > rect.right + 48) continue
      // Centre to centre on the capitals: for a mark as tall as them that is top to top, and a chevron
      // or a larger icon reads as centred.
      const small = Math.abs(d.height - line.cap) <= line.cap * 0.2
      const off = d.top + d.height / 2 - (line.capTop + line.cap / 2)
      if (Math.abs(off) > tol + 0.5)
        add({
          kind: "icon",
          severity: "fix",
          element: svg,
          message: small
            ? `A mark's top sits ${round(Math.abs(off))}px ${off > 0 ? "below" : "above"} the capitals' top beside it.`
            : `An icon sits ${round(Math.abs(off))}px ${off > 0 ? "low" : "high"} against the capitals beside it (centre to centre).`,
          measured: { offset: round(off), iconTop: round(d.top), iconHeight: round(d.height), capTop: round(line.capTop), capHeight: round(line.cap) },
        })
    }

  // Rows: pills and buttons side by side share a height and a centre; text beside text shares a baseline.
  if (on("row") || on("baseline"))
    for (const parent of all) {
      const s = getComputedStyle(parent)
      if (!/flex|grid/.test(s.display) || (s.display.includes("flex") && s.flexDirection.startsWith("column"))) continue
      // Placed on purpose (a badge, a control set inside another) is not part of the row.
      const kids = Array.from(parent.children).filter((k) => visible(k) && !/absolute|fixed/.test(getComputedStyle(k).position))
      if (kids.length < 2) continue
      const pills = kids.filter((k) => k.matches(PILLISH))
      if (on("row") && pills.length >= 2) {
        const rects = pills.map((p) => p.getBoundingClientRect())
        // Only those on the same line (a wrapping row has several).
        const top = rects[0]!.top
        const same = rects.map((r, i) => [r, pills[i]!] as const).filter(([r]) => Math.abs(r.top - top) < r.height)
        if (same.length >= 2) {
          const hs = same.map(([r]) => r.height)
          const cs = same.map(([r]) => r.top + r.height / 2)
          const hSpread = Math.max(...hs) - Math.min(...hs)
          const cSpread = Math.max(...cs) - Math.min(...cs)
          // A big spread is usually sizes shown on purpose (a size demo, a primary beside a small link).
          if (hSpread > tol)
            add({ kind: "row", severity: hSpread <= 8 ? "fix" : "check", element: parent, message: `Pills or buttons in one row differ in height by ${round(hSpread)}px (${hs.map(round).join(", ")}).`, measured: { spread: round(hSpread) } })
          else if (cSpread > tol)
            add({ kind: "row", severity: "fix", element: parent, message: `Pills or buttons in one row sit off each other's centre by ${round(cSpread)}px.`, measured: { spread: round(cSpread) } })
        }
      }
      if (on("baseline") && s.alignItems !== "baseline" && !s.alignItems.includes("last")) {
        const texts = kids.filter((k) => !k.matches(PILLISH) && k.children.length === 0 && k.textContent?.trim())
        const lines = texts.map((t) => [t, firstLine(t)] as const).filter((x): x is readonly [Element, NonNullable<ReturnType<typeof firstLine>>] => !!x[1])
        for (let i = 1; i < lines.length; i++) {
          const [a, la] = lines[i - 1]!
          const [, lb] = lines[i]!
          const ra = a.getBoundingClientRect()
          const rb = lines[i]![0].getBoundingClientRect()
          if (Math.abs(ra.top - rb.top) > Math.max(ra.height, rb.height)) continue
          const off = lb.baseline - la.baseline
          if (Math.abs(off) > tol + 0.5)
            add({ kind: "baseline", severity: "check", element: parent, message: `Text beside text sits ${round(Math.abs(off))}px off a shared baseline.`, measured: { offset: round(off) } })
        }
      }
    }

  // Edges: cards and tiles in a stack or a grid share their edges.
  if (on("edges"))
    for (const parent of all) {
      const s = getComputedStyle(parent)
      const kids = Array.from(parent.children).filter(visible)
      if (kids.length < 2) continue
      if (s.display.includes("flex") && s.flexDirection.startsWith("column") && s.alignItems !== "center") {
        const ls = kids.map((k) => k.getBoundingClientRect().left)
        const spread = Math.max(...ls) - Math.min(...ls)
        if (spread > tol && spread < 40)
          add({ kind: "edges", severity: "check", element: parent, message: `Items stacked in one column start ${round(spread)}px apart; their edges don't line up.`, measured: { spread: round(spread) } })
      }
      if (s.display.includes("grid")) {
        const rects = kids.map((k) => k.getBoundingClientRect())
        const rows = new Map<number, DOMRect[]>()
        for (const r of rects) rows.set(Math.round(r.top), [...(rows.get(Math.round(r.top)) ?? []), r])
        const heights = [...rows.values()].filter((r) => r.length > 1).map((row) => Math.max(...row.map((r) => r.height)) - Math.min(...row.map((r) => r.height)))
        const worst = Math.max(0, ...heights)
        if (worst > tol && kids.every((k) => /card|tile|widget/i.test(`${k.getAttribute("data-slot")} ${k.className}`)))
          add({ kind: "edges", severity: "check", element: parent, message: `Cards in one row of a grid end at different heights (up to ${round(worst)}px apart).`, measured: { spread: round(worst) } })
      }
    }

  // Overflow and cut text.
  if (on("overflow") || on("cut"))
    for (const el of all) {
      if (el instanceof SVGElement) continue
      const s = getComputedStyle(el)
      if (el.scrollWidth - el.clientWidth <= tol || el.clientWidth === 0) continue
      const over = spill(el)
      if (over <= tol) continue
      const scrolls = /auto|scroll/.test(s.overflowX)
      if (scrolls) continue
      if (s.overflowX === "visible" && on("overflow"))
        add({ kind: "overflow", severity: "fix", element: el, message: `Content spills ${round(over)}px out of its box.`, measured: { over: round(over), width: round(el.clientWidth) } })
      else if (s.textOverflow !== "ellipsis" && !el.closest("[data-slot=deck], .dk-stage") && on("cut") && el.textContent?.trim())
        add({ kind: "cut", severity: "check", element: el, message: `Content is cut ${round(over)}px with no ellipsis; check nothing a person needs is hidden.`, measured: { over: round(over) } })
      else if (s.textOverflow === "ellipsis" && on("cut") && !el.closest("[title], [aria-label]") && !el.getAttribute("title"))
        add({ kind: "cut", severity: "check", element: el, message: "Text ends in an ellipsis with no title or label carrying it whole.", measured: { over: round(over) } })
    }
  if (on("page-width") && root === document.body) {
    const over = document.documentElement.scrollWidth - window.innerWidth
    if (over > tol) add({ kind: "page-width", severity: "fix", element: document.documentElement, message: `The page scrolls sideways by ${round(over)}px at ${window.innerWidth}px wide.`, measured: { over: round(over), width: window.innerWidth } })
  }

  // Text size, targets and contrast.
  for (const el of all) {
    const own = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
    const s = getComputedStyle(el)
    const size = parseFloat(s.fontSize)
    if (own && on("text-size") && size < 12 && !el.closest("[aria-hidden=true], .sr-only, [data-slot=deck]"))
      add({ kind: "text-size", severity: "fix", element: el, message: `Text is ${round(size)}px; the floor is 12px.`, measured: { size: round(size) } })
    if (on("target") && el.matches(INTERACTIVE) && !el.closest("p, li > a:only-child") && s.display !== "inline") {
      const r = hitArea(el)
      // 2.5.8 lets a small target pass when nothing else is near it, so this one asks for a look.
      if (r.width < 24 || r.height < 24)
        add({ kind: "target", severity: "check", element: el, message: `A control's target is ${round(r.width)}×${round(r.height)}px; a pointer target is at least 24×24 unless nothing else is within reach.`, measured: { width: round(r.width), height: round(r.height) } })
    }
    if (own && on("contrast") && !el.closest("[aria-hidden=true], .sr-only, [disabled], [aria-disabled=true]")) {
      const fg = parseColor(s.color)
      const bg = groundOf(el)
      if (!fg || !bg) continue
      const mixed = [fg[0] * fg[3] + bg[0] * (1 - fg[3]), fg[1] * fg[3] + bg[1] * (1 - fg[3]), fg[2] * fg[3] + bg[2] * (1 - fg[3])]
      const [hi, lo] = [lum(mixed), lum(bg)].sort((a, b) => b - a)
      const ratio = (hi! + 0.05) / (lo! + 0.05)
      const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700)
      const need = large ? 3 : 4.5
      if (ratio < need)
        add({ kind: "contrast", severity: "fix", element: el, message: `Text contrast is ${round(ratio)}:1; it needs ${need}:1 here.`, measured: { ratio: round(ratio), need } })
    }
  }

  const limit = options.limit ?? 200
  const order: Record<VisualProblem["severity"], number> = { fix: 0, check: 1 }
  out.sort((a, b) => order[a.severity] - order[b.severity])
  return out.slice(0, limit)
}

/** The problems as lines for a report or a failing test. */
export const describeVisualProblems = (problems: VisualProblem[]) => problems.map((p) => `${p.severity === "fix" ? "Fix" : "Check"}: ${p.message} (${p.where})`)
