import { render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { createAgentBridge } from "@/registry/aimy/lib/behaviors-agent"
import { AgentContext } from "@/registry/aimy/lib/behaviors-agent-react"
import { Checkbox } from "@/registry/aimy/ui/checkbox"
import { DatePicker } from "@/registry/aimy/ui/date-picker"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Switch } from "@/registry/aimy/ui/switch"
import { Tab, TabPanel, Tabs, TabsList } from "@/registry/aimy/ui/tabs"
import { Textarea } from "@/registry/aimy/ui/textarea"

// Every field can join the agent bridge (20 Nov): AiMY reads it, fills it, and each change can be undone.

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const setup = () => createAgentBridge()

describe("fields on the agent bridge", () => {
  it("Input and Textarea: AiMY writes a value a controlled field hears, and undo puts it back", async () => {
    const bridge = setup()
    const onChange = vi.fn()
    function Form() {
      const [name, setName] = useState("Kestrel")
      return (
        <>
          <Field label="Company">
            <Input agent="company" value={name} onChange={(e) => (onChange(e.target.value), setName(e.target.value))} />
          </Field>
          <Field label="Note">
            <Textarea agent="note" defaultValue="" />
          </Field>
          <Field label="Password">
            <Input agent="secret" type="password" defaultValue="hunter2" />
          </Field>
        </>
      )
    }
    render(
      <AgentContext value={bridge}>
        <Form />
      </AgentContext>
    )
    await waitFor(() => expect(bridge.snapshot().map((s) => s.id)).toEqual(["company", "note"]))
    expect(bridge.snapshot()[0]).toMatchObject({ label: "Company", state: { value: "Kestrel" } })
    await bridge.act("company__write", { text: "Atlas Energy" })
    expect(onChange).toHaveBeenLastCalledWith("Atlas Energy")
    expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Atlas Energy")
    await bridge.undoLast()
    expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Kestrel")
  })

  it("Checkbox and Switch: AiMY turns them on and off", async () => {
    const bridge = setup()
    render(
      <AgentContext value={bridge}>
        <Checkbox agent="terms" label="Terms" />
        <Switch agent="notify" label="Tell me" />
      </AgentContext>
    )
    await waitFor(() => expect(bridge.snapshot()).toHaveLength(2))
    await bridge.act("terms__set", { on: true })
    await bridge.act("notify__set", { on: true })
    expect(screen.getByRole("checkbox", { name: "Terms" })).toBeChecked()
    expect(screen.getByRole("switch", { name: "Tell me" })).toBeChecked()
    await bridge.undoLast()
    expect(screen.getByRole("switch", { name: "Tell me" })).not.toBeChecked()
  })

  it("Segmented and Tabs: AiMY chooses by the names people see", async () => {
    const bridge = setup()
    render(
      <AgentContext value={bridge}>
        <Segmented agent="show" label="Show" options={[{ value: "all", label: "All" }, { value: "mine", label: "Mine" }]} />
        <Tabs agent="views" defaultValue="a">
          <TabsList>
            <Tab value="a">Overview</Tab>
            <Tab value="b">Calls</Tab>
          </TabsList>
          <TabPanel value="a">One</TabPanel>
          <TabPanel value="b">Two</TabPanel>
        </Tabs>
      </AgentContext>
    )
    await waitFor(() => expect(bridge.snapshot()).toHaveLength(2))
    await bridge.act("show__choose", { option: "Mine" })
    await waitFor(() => expect(screen.getByRole("radio", { name: "Mine" })).toBeChecked())
    expect(bridge.snapshot().find((s) => s.id === "views")?.state).toEqual({ open: "Overview", tabs: ["Overview", "Calls"] })
    await bridge.act("views__open", { tab: "Calls" })
    await waitFor(() => expect(screen.getByRole("tab", { name: "Calls" })).toHaveAttribute("aria-selected", "true"))
  })

  it("DatePicker: AiMY sets a range, refuses a backwards one, and clears", async () => {
    const bridge = setup()
    const onValueChange = vi.fn()
    render(
      <AgentContext value={bridge}>
        <DatePicker agent="created" label="Created" onValueChange={onValueChange} />
      </AgentContext>
    )
    await waitFor(() => expect(bridge.snapshot()).toHaveLength(1))
    const ok = await bridge.act("created__set", { from: "2026-11-01", to: "2026-11-07" })
    expect(ok.ok).toBe(true)
    await waitFor(() => expect(bridge.snapshot()[0]?.state).toMatchObject({ from: "2026-11-01", to: "2026-11-07" }))
    const bad = await bridge.act("created__set", { from: "2026-11-07", to: "2026-11-01" })
    expect(bad.ok).toBe(false)
    await bridge.act("created__clear")
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })
})
