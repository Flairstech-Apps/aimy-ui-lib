import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { checkParams, createAgentBridge } from "@/registry/aimy/lib/behaviors-agent"
import { AgentAsks, AgentLog, AgentProvider } from "@/registry/aimy/ui/agent-bridge"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { Field } from "@/registry/aimy/ui/field"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Select, SelectItem } from "@/registry/aimy/ui/select"
import { SortableList } from "@/registry/aimy/ui/sortable-list"
import { Tree } from "@/registry/aimy/ui/tree"
import { createAgentBridge as make } from "@/lib/behaviors-agent"
import { useAgent } from "@/registry/aimy/lib/behaviors-agent-react"

describe("agent bridge core", () => {
  it("lists surfaces as tools and reads the screen", () => {
    const b = createAgentBridge()
    let v = "a"
    b.register({ id: "owner", kind: "select", label: "Owner", state: () => ({ v }), actions: { choose: { description: "Choose an owner", params: { who: { type: "string", description: "Name", enum: ["a", "b"] } }, run: (p) => void (v = String(p.who)) } } })
    const tools = b.tools()
    expect(tools.map((t) => t.name)).toEqual(["read_screen", "owner__choose"])
    expect(tools[1]!.input_schema).toEqual({ type: "object", properties: { who: { type: "string", description: "Name", enum: ["a", "b"] } }, required: ["who"] })
    expect(b.snapshot()[0]).toMatchObject({ id: "owner", label: "Owner", state: { v: "a" } })
  })

  it("refuses bad input with a sentence, and unknown tools", async () => {
    expect(checkParams({ n: { type: "number", description: "How many" } }, {})).toBe("n is needed: How many")
    expect(checkParams({ s: { type: "string", description: "x", enum: ["a"] } }, { s: "b" })).toBe("s must be one of: a.")
    const b = createAgentBridge()
    expect(await b.act("nothing__here", {})).toMatchObject({ ok: false })
  })

  it("follows the ladder: tell acts with undo, ask waits for approval, irreversible always asks", async () => {
    const approve = vi.fn(async () => false)
    const b = createAgentBridge({ approve, levelFor: (_s, a) => (a === "careful" ? "ask" : undefined) })
    let n = 0
    const el = document.createElement("div")
    document.body.appendChild(el)
    b.register({
      id: "count",
      kind: "counter",
      label: "Count",
      state: () => n,
      element: () => el,
      actions: {
        add: { description: "Add one", say: () => "added one", run: () => ((n += 1), () => void (n -= 1)) },
        careful: { description: "Add ten", run: () => ((n += 10), () => void (n -= 10)) },
        send: { description: "Send it", undoable: false, run: () => void (n = 99) },
      },
    })
    const r = await b.act("count__add")
    expect(r).toMatchObject({ ok: true, message: "AiMY added one in Count.", state: 1 })
    expect(el.hasAttribute("data-agent-acting")).toBe(true)
    await b.undoLast()
    expect(n).toBe(0)
    expect(b.get().activity[0]!.status).toBe("undone")
    expect(await b.act("count__careful")).toMatchObject({ ok: false })
    expect(await b.act("count__send")).toMatchObject({ ok: false })
    expect(approve).toHaveBeenCalledTimes(2)
    expect(n).toBe(0)
    expect(b.get().activity.filter((a) => a.status === "refused")).toHaveLength(2)
  })

  it("offers the tools to the browser's agent through WebMCP when there is one", async () => {
    const provideContext = vi.fn()
    Object.defineProperty(navigator, "modelContext", { value: { provideContext }, configurable: true })
    const b = make()
    b.register({ id: "x", kind: "k", label: "X", state: () => 1, actions: { go: { description: "Go", run: () => () => {} } } })
    const off = b.registerWebMCP()
    const tools = provideContext.mock.calls[0]![0].tools
    expect(tools.map((t: { name: string }) => t.name)).toEqual(["read_screen", "x__go"])
    const out = await tools[1].execute({})
    expect(JSON.parse(out.content[0].text)).toMatchObject({ ok: true })
    off()
    // @ts-expect-error cleaning up the test double
    delete navigator.modelContext
  })
})

describe("parts on the bridge", () => {
  it("AiMY chooses in a Combobox and a Select, renames, reorders and opens a tree; each can be undone", async () => {
    const bridge = make()
    function Page() {
      const [company, setCompany] = useState<string | null>(null)
      const [stage, setStage] = useState("new")
      const [name, setName] = useState("Untitled deal")
      const [steps, setSteps] = useState(["Call", "Proposal", "Contract"])
      return (
        <AgentProvider bridge={bridge}>
          <Field label="Company">
            <Combobox agent="company" options={[{ value: "k", label: "Kestrel Logistics" }, { value: "a", label: "Atlas Energy" }]} value={company} onValueChange={setCompany} />
          </Field>
          <Select agent="stage" label="Stage" value={stage} onValueChange={setStage}>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="won">Won</SelectItem>
          </Select>
          <InlineEdit agent="name" label="Deal name" value={name} onSave={setName} />
          <SortableList agent="steps" label="Steps" items={steps} getKey={(s) => s} getLabel={(s) => s} onReorder={setSteps} renderItem={(s) => s} />
          <Tree agent="files" label="Files" items={[{ id: "f", label: "Folder", children: [{ id: "doc", label: "Doc" }] }]} />
          <AgentLog />
        </AgentProvider>
      )
    }
    render(<Page />)
    expect(bridge.snapshot().map((s) => [s.id, s.label])).toEqual([
      ["company", "Company"],
      ["stage", "Stage"],
      ["name", "Deal name"],
      ["steps", "Steps"],
      ["files", "Files"],
    ])
    await act(() => bridge.act("company__choose", { option: "Atlas Energy" }))
    expect(screen.getByRole("combobox", { name: "Company" })).toHaveValue("Atlas Energy")
    await act(() => bridge.act("stage__choose", { option: "Won" }))
    expect(bridge.snapshot().find((s) => s.id === "stage")!.state).toMatchObject({ chosen: "Won" })
    await act(() => bridge.act("name__set", { value: "Atlas renewal" }))
    expect(screen.getByRole("button", { name: /Deal name: Atlas renewal/ })).toBeInTheDocument()
    await act(() => bridge.act("steps__move", { item: "Contract", position: 1 }))
    expect(bridge.snapshot().find((s) => s.id === "steps")!.state).toEqual({ order: ["Contract", "Call", "Proposal"] })
    await act(() => bridge.act("files__open", { item: "Folder" }))
    expect(screen.getByRole("treeitem", { name: "Doc" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "What AiMY did" })).toHaveTextContent("AiMY chose Atlas Energy in Company.")
    await act(() => bridge.undoLast())
    await act(() => bridge.undoLast())
    expect(bridge.snapshot().find((s) => s.id === "steps")!.state).toEqual({ order: ["Call", "Proposal", "Contract"] })
    expect(await act(() => bridge.act("company__choose", { option: "Nobody" }))).toMatchObject({ ok: false })
  })

  it("an ask waits for the person's answer in AgentAsks", async () => {
    function Page() {
      const [company, setCompany] = useState<string | null>(null)
      return (
        <AgentProvider levelFor={() => "ask"}>
          <Probe />
          <Combobox agent="company" label="Company" options={[{ value: "k", label: "Kestrel Logistics" }]} value={company} onValueChange={setCompany} />
          <AgentAsks />
        </AgentProvider>
      )
    }
    let bridge: ReturnType<typeof make> | null = null
    function Probe() {
      bridge = useAgent()
      return null
    }
    render(<Page />)
    let result: Promise<unknown> = Promise.resolve()
    act(() => {
      result = bridge!.act("company__choose", { option: "Kestrel Logistics" })
    })
    const card = await screen.findByRole("group", { name: "AiMY chose Kestrel Logistics in Company." })
    expect(card).toHaveTextContent("AiMY chose Kestrel Logistics in Company?")
    await userEvent.click(screen.getByRole("button", { name: "Go ahead" }))
    await act(async () => void (await result))
    expect(screen.getByRole("combobox", { name: "Company" })).toHaveValue("Kestrel Logistics")
  })
})
