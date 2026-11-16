import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { checkUi, parsePartialJson, showUiTool, uiPrompt } from "@/registry/aimy/lib/generative-ui"
import { AIMY_UI, GenerativeUI } from "@/registry/aimy/ui/generative-ui"
import { a11yViolations } from "../a11y"

const ANSWER = {
  type: "Widget",
  props: { title: "This week's calls", icon: "chart", meta: "Mon to Fri" },
  children: [
    {
      type: "StatTiles",
      props: {
        items: [
          { label: "Calls", value: "42", sub: "8 more than a usual week", tone: "ok" },
          { label: "Meetings set", value: "5", sub: "3 short of the target of 8", tone: "warn" },
        ],
      },
    },
    { type: "Actions", props: { buttons: [{ label: "Open the call list", action: "open-calls", primary: true }] } },
  ],
}

describe("generative UI: checking", () => {
  it("keeps what the catalogue allows and names the rest", () => {
    const { node, problems } = checkUi(
      { type: "Stack", props: {}, children: [ANSWER, { type: "Iframe", props: { src: "x" } }, { type: "Text", props: { text: "Hi", onClick: "alert(1)" } }] },
      AIMY_UI
    )
    expect(node?.children?.map((c) => c.type)).toEqual(["Widget", "Text"])
    expect(node?.children?.[1]?.props).toEqual({ text: "Hi" })
    expect(problems).toEqual([
      "ui(Stack).children[1]: there is no part called Iframe; use one of " + Object.keys(AIMY_UI).join(", "),
      "ui(Stack).children[2](Text).onClick: not a prop of this part, left out",
    ])
  })

  it("refuses a figure without what it means", () => {
    const { node, problems } = checkUi({ type: "StatTiles", props: { items: [{ label: "Calls", value: "42" }] } }, AIMY_UI)
    expect(node?.props.items).toEqual([])
    expect(problems[0]).toMatch(/sub: is needed \(What it means/)
  })

  it("coerces numbers given as text and checks enums", () => {
    const { node, problems } = checkUi({ type: "Target", props: { value: "40", target: 100, unit: "pounds" } }, AIMY_UI)
    expect(node?.props).toEqual({ value: 40, target: 100 })
    expect(problems).toEqual(["ui(Target).unit: should be one of count, percent, money"])
  })
})

describe("generative UI: streaming", () => {
  it("parses JSON at every point of the way", () => {
    const text = JSON.stringify(ANSWER)
    let parsed = 0
    for (let i = 1; i <= text.length; i++) if (parsePartialJson(text.slice(0, i)) !== undefined) parsed++
    expect(parsed).toBeGreaterThan(text.length * 0.9)
    expect(parsePartialJson('{"type":"Text","props":{"text":"Hel')).toEqual({ type: "Text", props: { text: "Hel" } })
    expect(parsePartialJson('{"type":"Text","props":{"te')).toEqual({ type: "Text", props: {} })
    expect(parsePartialJson('{"a":[1,2,')).toEqual({ a: [1, 2] })
    expect(parsePartialJson('{"a":tr')).toEqual({})
    expect(parsePartialJson("no json yet")).toBeUndefined()
  })

  it("draws whole parts as they arrive and stays quiet about the rest", () => {
    const text = JSON.stringify(ANSWER)
    const cut = text.indexOf("Meetings set") + 4
    const onProblems = vi.fn()
    const { rerender } = render(<GenerativeUI stream={text.slice(0, cut)} onProblems={onProblems} />)
    expect(screen.getByText("This week's calls")).toBeInTheDocument()
    expect(screen.getByText("8 more than a usual week")).toBeInTheDocument()
    expect(screen.queryByText("Open the call list")).not.toBeInTheDocument()
    expect(onProblems).not.toHaveBeenCalled()
    rerender(<GenerativeUI spec={text} onProblems={onProblems} />)
    expect(screen.getByRole("button", { name: "Open the call list" })).toBeInTheDocument()
    expect(onProblems).toHaveBeenCalledWith([])
  })
})

describe("generative UI: drawing", () => {
  it("draws library parts, accessibly, and buttons call onAction", async () => {
    const onAction = vi.fn()
    const { container } = render(<GenerativeUI spec={ANSWER} onAction={onAction} />)
    expect(screen.getByText("3 short of the target of 8")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Open the call list" }))
    expect(onAction).toHaveBeenCalledWith("open-calls", undefined)
    expect(await a11yViolations(container)).toEqual([])
  })

  it("draws a table from rows and columns", () => {
    render(
      <GenerativeUI
        spec={{
          type: "Table",
          props: {
            label: "Deals closing this month",
            columns: [{ key: "name", header: "Deal" }, { key: "value", header: "Value", end: true }],
            rows: [{ name: "Kestrel renewal", value: "$42k" }, { name: "Atlas expansion", value: "$18k" }],
          },
        }}
      />
    )
    expect(screen.getByText("Kestrel renewal")).toBeInTheDocument()
    expect(screen.getByText("$18k")).toBeInTheDocument()
  })
})

describe("generative UI: for the model", () => {
  it("writes a prompt and a show_ui tool from the catalogue", () => {
    const prompt = uiPrompt(AIMY_UI)
    expect(prompt).toContain("Every number says what it means")
    expect(prompt).toContain("- StatTiles: Up to four figures side by side")
    const tool = showUiTool(AIMY_UI)
    expect(tool.name).toBe("show_ui")
    expect(tool.input_schema.required).toEqual(["ui"])
    const defs = tool.input_schema.$defs as { node: { anyOf: { properties: { type: { const: string } } }[] } }
    expect(defs.node.anyOf.map((n) => n.properties.type.const)).toEqual(Object.keys(AIMY_UI))
  })
})
