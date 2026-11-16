// The behaviour testing kit: keys, Tab, pointer drags and ARIA checks for
// unit tests (Vitest or Jest with jsdom). Checks return problems as plain
// sentences, so a failing test says what a keyboard or screen-reader user
// would hit, not "expected 0".

import { tabbables } from "./behaviors-focus"

type Mods = { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }

/** Presses a key on an element (or whatever has focus): keydown, then keyup. Returns false if the keydown was prevented. */
export function press(key: string, target: Element | null = document.activeElement, mods: Mods = {}): boolean {
  const el = target ?? document.body
  const down = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...mods })
  const ok = el.dispatchEvent(down)
  el.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true, ...mods }))
  return ok
}

/** Types characters one key at a time (typeahead, filters). For text fields, set the value with your testing library instead. */
export function typeKeys(text: string, target?: Element | null) {
  for (const ch of text) press(ch, target ?? document.activeElement)
}

/**
 * Presses Tab the way a browser would: the keydown goes to the focused
 * element, and unless something prevented it, focus moves to the next
 * tabbable in the document. jsdom doesn't move focus on Tab by itself.
 */
export function tab(shift = false) {
  const from = document.activeElement ?? document.body
  if (!press("Tab", from, { shiftKey: shift })) return document.activeElement
  if (document.activeElement !== from) return document.activeElement
  const list = tabbables(document.body)
  const i = list.indexOf(from as HTMLElement)
  const next = list[shift ? (i <= 0 ? list.length - 1 : i - 1) : (i + 1) % list.length]
  next?.focus()
  return document.activeElement
}

/** The elements Tab stops on inside root, in order. */
export const tabStops = (root: Element) => tabbables(root)

function pointerEvent(type: string, x: number, y: number, id = 1, buttons = 1) {
  const Ctor = (typeof PointerEvent !== "undefined" ? PointerEvent : MouseEvent) as typeof MouseEvent
  const e = new Ctor(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons })
  if (!("pointerId" in e) || (e as PointerEvent).pointerId !== id) Object.defineProperty(e, "pointerId", { value: id })
  return e
}

/** Sends one pointer event (pointerdown, pointermove, pointerup) at a point. */
export function pointer(type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel", el: Element | Window, x: number, y: number, id = 1) {
  el.dispatchEvent(pointerEvent(type, x, y, id, type === "pointerup" ? 0 : 1))
}

/** Drags from one point to another in steps: down on the element, moves and up on the window. */
export function drag(el: Element, from: { x: number; y: number }, to: { x: number; y: number }, steps = 5) {
  pointer("pointerdown", el, from.x, from.y)
  for (let i = 1; i <= steps; i++) pointer("pointermove", window, from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps)
  pointer("pointerup", window, to.x, to.y)
}

/** Problems if a composite widget has more than one Tab stop (it should have exactly one). */
export function singleTabStopProblems(root: Element, name = "This group"): string[] {
  const n = tabbables(root).length
  return n === 1 ? [] : [`${name} has ${n} Tab stops; a group should have one, with the arrows moving inside it.`]
}

const label = (el: Element) => el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.textContent?.trim()

/**
 * Checks the ARIA a role pattern needs, across everything inside root.
 * Covers dialogs, menus, listboxes, comboboxes, tabs, trees, sliders and
 * switches: the patterns AiMY parts use.
 */
export function ariaProblems(root: Element): string[] {
  const out: string[] = []
  const all = (sel: string) => Array.from(root.querySelectorAll(sel)).concat(root.matches(sel) ? [root] : [])
  for (const d of all('[role="dialog"],[role="alertdialog"]')) {
    if (!d.getAttribute("aria-labelledby") && !d.getAttribute("aria-label")) out.push("A dialog has no name (aria-labelledby or aria-label).")
  }
  for (const c of all('[role="combobox"]')) {
    if (!c.hasAttribute("aria-expanded")) out.push("A combobox doesn't say whether it is open (aria-expanded).")
    if (c.getAttribute("aria-expanded") === "true" && !c.getAttribute("aria-controls")) out.push("An open combobox doesn't point at its list (aria-controls).")
  }
  for (const l of all('[role="listbox"]')) {
    const opts = l.querySelectorAll('[role="option"]')
    if (!opts.length) out.push("A listbox has no options.")
    for (const o of Array.from(opts)) if (!o.hasAttribute("aria-selected")) out.push(`Option "${label(o)}" doesn't say whether it is chosen (aria-selected).`)
    const active = l.getAttribute("aria-activedescendant")
    if (active && !document.getElementById(active)) out.push("A listbox's aria-activedescendant points at nothing.")
  }
  for (const m of all('[role="menu"]')) {
    if (!m.querySelector('[role^="menuitem"]')) out.push("A menu has no items.")
  }
  for (const t of all('[role="tablist"]')) {
    for (const tabEl of Array.from(t.querySelectorAll('[role="tab"]'))) {
      if (!tabEl.hasAttribute("aria-selected")) out.push(`Tab "${label(tabEl)}" doesn't say whether it is selected.`)
      const panel = tabEl.getAttribute("aria-controls")
      if (panel && !document.getElementById(panel)) out.push(`Tab "${label(tabEl)}" controls a panel that isn't there.`)
    }
  }
  for (const item of all('[role="treeitem"]')) {
    if (!item.hasAttribute("aria-level")) out.push(`Tree item "${label(item)}" has no aria-level.`)
  }
  for (const s of all('[role="slider"]')) {
    for (const a of ["aria-valuenow", "aria-valuemin", "aria-valuemax"]) if (!s.hasAttribute(a)) out.push(`A slider has no ${a}.`)
  }
  for (const s of all('[role="switch"],[role="checkbox"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="radio"]')) {
    if (!s.hasAttribute("aria-checked") && !(s instanceof HTMLInputElement)) out.push(`"${label(s)}" (${s.getAttribute("role")}) has no aria-checked.`)
  }
  for (const e of all("[aria-expanded]")) {
    const c = e.getAttribute("aria-controls")
    if (c && e.getAttribute("aria-expanded") === "true" && !document.getElementById(c)) out.push(`"${label(e)}" is expanded but controls nothing on the page.`)
  }
  return out
}

/** Opens with `open`, closes with `close`, and reports where focus went. */
export async function focusReturnProblems(trigger: HTMLElement, open: () => void | Promise<void>, close: () => void | Promise<void>): Promise<string[]> {
  trigger.focus()
  await open()
  const out: string[] = []
  if (document.activeElement === trigger) out.push("Opening left focus on the trigger; it should move into what opened.")
  await close()
  if (document.activeElement !== trigger) out.push(`Closing sent focus to ${document.activeElement?.tagName.toLowerCase() ?? "nothing"}; it should return to the trigger.`)
  return out
}
