import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { createAgentBridge } from "@/registry/aimy/lib/behaviors-agent"
import { useCommand } from "@/registry/aimy/lib/behaviors-agent-react"
import { ariaProblems } from "@/registry/aimy/lib/behaviors-testing"
import { AgentLog, AgentProvider } from "@/registry/aimy/ui/agent-bridge"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { CommandBar } from "@/registry/aimy/ui/command-bar"
import { Field } from "@/registry/aimy/ui/field"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Toaster } from "@/registry/aimy/ui/toast"

describe("bridge commands", () => {
  it("turns choice params into one command per choice and asks for free values", async () => {
    const b = createAgentBridge()
    let v = ""
    b.register({
      id: "c",
      kind: "combobox",
      label: "Company",
      state: () => v,
      actions: {
        choose: { description: "Choose", params: { option: { type: "string", description: "x", enum: ["Kestrel", "Atlas"] } }, run: (p) => ((v = String(p.option)), () => void (v = "")) },
        rename: { description: "Rename", params: { to: { type: "string", description: "The new name" } }, run: (p) => void (v = String(p.to)) },
      },
    })
    const cmds = b.commands()
    expect(cmds.map((c) => c.label)).toEqual(["Choose: Kestrel", "Choose: Atlas", "Rename"])
    expect(cmds[2]!.needs).toEqual({ param: "to", description: "The new name", type: "string" })
    expect(await cmds[1]!.run()).toMatchObject({ ok: true, message: "You choose in Company." })
    expect(b.get().activity[0]).toMatchObject({ by: "person", level: "tell" })
    expect((await b.undoLast())?.sentence).toBe("You choose in Company.")
    expect(v).toBe("")
  })
})

function Page({ onAsk, onGo }: { onAsk?: (q: string) => void; onGo?: () => void }) {
  const [company, setCompany] = useState<string | null>("k")
  const [name, setName] = useState("Kestrel Q4")
  return (
    <AgentProvider>
      <Commands onGo={onGo} />
      <Field label="Company">
        <Combobox agent="company" options={[{ value: "k", label: "Kestrel Logistics" }, { value: "a", label: "Atlas Energy" }]} value={company} onValueChange={setCompany} />
      </Field>
      <InlineEdit agent="name" label="Deal name" value={name} onSave={setName} />
      <CommandBar onAsk={onAsk} />
      <AgentLog everyone />
      <Toaster />
    </AgentProvider>
  )
}
function Commands({ onGo }: { onGo?: () => void }) {
  useCommand("go-contacts", { group: "Go to", label: "Contacts", said: "opened Contacts", run: () => onGo?.() })
  return null
}

describe("CommandBar", () => {
  it("opens on Ctrl+K, finds an action by its words and runs it, then Ctrl+Z takes it back", async () => {
    render(<Page />)
    await userEvent.keyboard("{Control>}k{/Control}")
    const input = await screen.findByRole("combobox", { name: "Commands" })
    expect(input).toHaveFocus()
    expect(ariaProblems(document.body)).toEqual([])
    await userEvent.type(input, "atlas")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Choose Atlas Energy"])
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("combobox", { name: "Company" })).toHaveValue("Atlas Energy")
    expect(screen.getByRole("list", { name: "What changed" })).toHaveTextContent("You chose Atlas Energy in Company.")
    // Focus back on the page (not in a field): Ctrl+Z undoes.
    act(() => (document.activeElement as HTMLElement | null)?.blur())
    await userEvent.keyboard("{Control>}z{/Control}")
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Company" })).toHaveValue("Kestrel Logistics"))
  })

  it("asks for a value when an action needs one", async () => {
    render(<Page />)
    await userEvent.keyboard("{Control>}k{/Control}")
    await userEvent.type(screen.getByRole("combobox", { name: "Commands" }), "deal name")
    await userEvent.keyboard("{Enter}")
    const value = await screen.findByRole("combobox", { name: "The new deal name" })
    await userEvent.type(value, "Kestrel renewal{Enter}")
    await waitFor(() => expect(screen.getByRole("button", { name: /Deal name: Kestrel renewal/ })).toBeInTheDocument())
  })

  it("runs app commands, and sends what matches nothing to AiMY", async () => {
    const onAsk = vi.fn()
    const onGo = vi.fn()
    render(<Page onAsk={onAsk} onGo={onGo} />)
    await userEvent.keyboard("{Control>}k{/Control}")
    await userEvent.type(screen.getByRole("combobox", { name: "Commands" }), "contacts")
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(onGo).toHaveBeenCalled())
    await userEvent.keyboard("{Control>}k{/Control}")
    await userEvent.type(screen.getByRole("combobox", { name: "Commands" }), "who should I call")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Ask AiMY: “who should I call”"])
    await userEvent.keyboard("{Enter}")
    expect(onAsk).toHaveBeenCalledWith("who should I call")
  })
})
