import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrictMode, useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { createAgentBridge } from "@/registry/aimy/lib/behaviors-agent"
import { AgentContext, useCommand } from "@/registry/aimy/lib/behaviors-agent-react"
import { createOptimistic } from "@/registry/aimy/lib/behaviors-feedback"
import { useColorScheme } from "@/registry/aimy/lib/behaviors-react"
import { checkUi } from "@/registry/aimy/lib/generative-ui"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { DatePicker } from "@/registry/aimy/ui/date-picker"
import { cleanHtml } from "@/registry/aimy/ui/doc-editor"
import { Field } from "@/registry/aimy/ui/field"
import { AIMY_UI } from "@/registry/aimy/ui/generative-ui"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Input } from "@/registry/aimy/ui/input"
import { Segmented } from "@/registry/aimy/ui/segmented"

// Fixes from the second audit (20 Nov): security, forms, server rendering and leaks.

// jsdom has no ResizeObserver; Radix's radio group uses it inside a form.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

describe("AI surfaces", () => {
  it("a model naming a prototype key gets 'no such part', not a crash", () => {
    for (const type of ["constructor", "__proto__", "toString"]) {
      const r = checkUi({ type }, AIMY_UI)
      expect(r.problems.join(" ")).toMatch(/no part called/)
    }
  })

  it("an app command asks before AiMY runs it, unless the app says it is safe", async () => {
    const approve = vi.fn(async () => false)
    const bridge = createAgentBridge({ approve })
    const ran = vi.fn()
    function Cmd() {
      useCommand("deals", { group: "Deals", label: "Delete the deal", run: ran })
      return null
    }
    render(
      <AgentContext value={bridge}>
        <Cmd />
      </AgentContext>
    )
    const r = await bridge.act({ surface: "deals", action: "run" })
    expect(approve).toHaveBeenCalled()
    expect(ran).not.toHaveBeenCalled()
    expect(r.ok).toBe(false)
  })

  it("something that can't be undone asks the person too", async () => {
    const approve = vi.fn(async () => false)
    const bridge = createAgentBridge({ approve })
    const run = vi.fn()
    bridge.register({ id: "mail", kind: "button", label: "Mail", state: () => null, actions: { send: { description: "Send the email", undoable: false, run } } })
    await bridge.act({ surface: "mail", action: "send" }, {}, { by: "person" })
    expect(approve).toHaveBeenCalled()
    expect(run).not.toHaveBeenCalled()
  })

  it("refuses a tool name two parts share, and drops params nobody declared", async () => {
    const bridge = createAgentBridge()
    const a = vi.fn()
    const b = vi.fn()
    bridge.register({ id: "deal.title", kind: "x", label: "A", state: () => null, actions: { set: { description: "Set", params: { to: { type: "string", description: "To" } }, run: a } } })
    bridge.register({ id: "deal_title", kind: "x", label: "B", state: () => null, actions: { set: { description: "Set", run: b } } })
    const r = await bridge.act("deal_title__set", {})
    expect(r.ok).toBe(false)
    expect(a).not.toHaveBeenCalled()
    expect(b).not.toHaveBeenCalled()
    await bridge.act({ surface: "deal.title", action: "set" }, { to: "Q4", evil: "x" })
    expect(a).toHaveBeenCalledWith({ to: "Q4" })
  })

  it("does nothing when the part left the screen while the person decided", async () => {
    let off = () => {}
    const run = vi.fn()
    const bridge = createAgentBridge({
      approve: async () => {
        off()
        return true
      },
    })
    off = bridge.register({ id: "deal", kind: "x", label: "Deal", state: () => null, actions: { close: { description: "Close", undoable: false, run } } })
    const r = await bridge.act({ surface: "deal", action: "close" })
    expect(r.ok).toBe(false)
    expect(run).not.toHaveBeenCalled()
  })
})

describe("agent bridge: several steps and finding", () => {
  it("does several actions in one call and stops at the first refusal", async () => {
    let owner = ""
    let stage = ""
    const bridge = createAgentBridge({ approve: async () => false })
    bridge.register({ id: "owner", kind: "select", label: "Owner", state: () => owner, actions: { choose: { description: "Choose", params: { who: { type: "string", description: "Owner", enum: ["Dana", "Rami"] } }, run: (p) => void (owner = String(p.who)) } } })
    bridge.register({ id: "stage", kind: "select", label: "Stage", state: () => stage, actions: { set: { description: "Set", params: { to: { type: "string", description: "Stage" } }, run: (p) => void (stage = String(p.to)) } } })
    bridge.register({ id: "deal", kind: "x", label: "Deal", state: () => null, actions: { close: { description: "Close", undoable: false, run: () => {} } } })
    const ok = await bridge.act("do_steps", { steps: [{ tool: "owner__choose", input: { who: "Rami" } }, { tool: "stage__set", input: { to: "Won" } }] })
    expect(ok.ok).toBe(true)
    expect([owner, stage]).toEqual(["Rami", "Won"])
    const stopped = await bridge.act("do_steps", { steps: [{ tool: "deal__close" }, { tool: "owner__choose", input: { who: "Dana" } }] })
    expect(stopped.ok).toBe(false)
    expect(stopped.message).toMatch(/Stopped at step 1 of 2/)
    expect(owner).toBe("Rami")
  })

  it("finds a field's choices by words without opening anything", async () => {
    const bridge = createAgentBridge()
    bridge.register({ id: "company", kind: "combobox", label: "Company", state: () => null, actions: { choose: { description: "Choose", params: { name: { type: "string", description: "Company", enum: ["Atlas Energy", "Kestrel Logistics", "Atlas Foods"] } }, run: () => {} } } })
    const r = await bridge.act("find", { words: "atlas" })
    expect(r.ok && (r.state as { options?: string[] }[])[0]?.options).toEqual(["Atlas Energy", "Atlas Foods"])
  })
})

describe("DocEditor", () => {
  it("keeps the editor's tags and drops anything that could run", () => {
    const box = document.createElement("div")
    box.append(...cleanHtml(`<p onclick="x()">Hi <b>there</b></p><img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">bad</a><a href="https://flairstech.com">ok</a><custom-tag>kept text</custom-tag>`))
    expect(box.innerHTML).toBe(`<p>Hi <b>there</b></p><a rel="noopener noreferrer">bad</a><a href="https://flairstech.com" rel="noopener noreferrer">ok</a>kept text`)
  })
})

describe("forms", () => {
  it("InlineEdit leaves focus where the person tabbed to", async () => {
    function Form() {
      const [v, setV] = useState("Q4 plan")
      return (
        <>
          <InlineEdit label="Name" value={v} onSave={setV} />
          <input aria-label="Next" />
        </>
      )
    }
    render(<Form />)
    await userEvent.click(screen.getByRole("button", { name: /Name/ }))
    await userEvent.tab()
    expect(screen.getByRole("textbox", { name: "Next" })).toHaveFocus()
  })

  it("Combobox: clearing the text and leaving clears the choice", async () => {
    const onValueChange = vi.fn()
    render(<Combobox label="Product" options={[{ value: "a", label: "Atlas" }, { value: "b", label: "Beacon" }]} defaultValue="a" onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "Product" })
    await userEvent.click(input)
    await userEvent.clear(input)
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(input).toHaveValue("")
  })

  it("Combobox: Enter that confirms an input method's characters doesn't pick", () => {
    const onValueChange = vi.fn()
    render(<Combobox label="Product" options={[{ value: "a", label: "Atlas" }]} onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "Product" })
    act(() => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 229, bubbles: true })))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("DatePicker without a value holds its own range, and reports only whole ranges", async () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Created" onValueChange={onValueChange} disableFuture={false} />)
    await userEvent.click(screen.getByRole("button", { name: /Created/ }))
    const days = screen.getAllByRole("gridcell").map((c) => c.querySelector("button")!).filter(Boolean)
    await userEvent.click(days[10]!)
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.click(days[12]!)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]![0].to).toBeInstanceOf(Date)
    expect(screen.getByRole("button", { name: /Created: \d/ })).toBeInTheDocument()
  })

  it("Field: the error is read out, required is exposed, and the label reaches an Input given its own id", () => {
    render(
      <Field label="Email" error="Add an email address.">
        <Input id="mine" />
      </Field>
    )
    const input = screen.getByRole("textbox", { name: "Email" })
    expect(input).toHaveAttribute("aria-required", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Add an email address.")
  })

  it("Segmented sends its choice with a form", () => {
    const { container } = render(
      <form>
        <Segmented label="Show" name="show" options={[{ value: "all", label: "All" }, { value: "mine", label: "Mine" }]} />
      </form>
    )
    expect(new FormData(container.querySelector("form")!).get("show")).toBe("all")
  })

  it("an older save that lands counts, so a newer failure goes back to it", async () => {
    let finish: ((ok: boolean) => void)[] = []
    const o = createOptimistic<string>({ value: "O", save: () => new Promise((res, rej) => finish.push((ok) => (ok ? res(null) : rej(new Error("no"))))) })
    o.set("A")
    o.set("B")
    const [a, b] = finish
    a!(true)
    await Promise.resolve()
    b!(false)
    await new Promise((r) => setTimeout(r, 0))
    expect(o.get().shown).toBe("A")
    finish = []
  })
})

describe("server rendering and StrictMode", () => {
  it("the theme toggle still changes the page after StrictMode's remount", () => {
    function Toggle() {
      const c = useColorScheme({ key: "t-scheme" })
      return (
        <button type="button" onClick={c.toggle}>
          {c.scheme}
        </button>
      )
    }
    render(
      <StrictMode>
        <Toggle />
      </StrictMode>
    )
    const b = screen.getByRole("button")
    const before = b.textContent
    act(() => b.click())
    expect(b.textContent).not.toBe(before)
    expect(document.documentElement.getAttribute("data-theme")).toBe(b.textContent)
    localStorage.removeItem("t-scheme")
  })
})
