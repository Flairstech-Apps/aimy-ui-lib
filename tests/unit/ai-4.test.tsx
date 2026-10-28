import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AimyNote } from "@/registry/aimy/ui/aimy-note"
import { AuditTrail } from "@/registry/aimy/ui/audit-trail"
import { AskPolicy, Autonomy } from "@/registry/aimy/ui/autonomy"
import { BriefingActions } from "@/registry/aimy/ui/briefing"
import { Composer } from "@/registry/aimy/ui/composer"
import { DecisionZone } from "@/registry/aimy/ui/decision-zone"
import { MemoryList } from "@/registry/aimy/ui/memory-list"
import { MemoryPanel } from "@/registry/aimy/ui/memory-panel"
import { Peek } from "@/registry/aimy/ui/peek"
import { SetScopeBar } from "@/registry/aimy/ui/set-scope-bar"
import { StepList } from "@/registry/aimy/ui/step-list"
import { toast, Toaster } from "@/registry/aimy/ui/toast"
import { UsageSummary } from "@/registry/aimy/ui/usage"
import { a11yViolations } from "../a11y"

afterEach(() => act(() => toast.dismiss()))

describe("the gap list", () => {
  it("states the scope and clears it", async () => {
    const onClear = vi.fn()
    render(<SetScopeBar count={18} scope="of 240 cards" onClear={onClear} />)
    expect(screen.getByRole("region", { name: "Selection" })).toHaveTextContent("18 selectedof 240 cards")
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(onClear).toHaveBeenCalledOnce()
  })
  it("says revert or irreversible on every entry", async () => {
    const onRevert = vi.fn()
    render(
      <AuditTrail
        entries={[
          { id: "1", tone: "ai", action: "18 tickets reassigned", who: "AiMY", time: "06:14", onRevert },
          { id: "2", action: "Retention set to 7 years", who: "Rami", time: "Mar 14", irreversible: true },
        ]}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Revert: 18 tickets reassigned" }))
    expect(onRevert).toHaveBeenCalledOnce()
    expect(screen.getByText("Irreversible")).toBeInTheDocument()
  })
  it("decides in place, says what was decided, and undoes", async () => {
    const onAccept = vi.fn()
    const onUndo = vi.fn()
    render(
      <DecisionZone
        prompt="Apply the revised SLA?"
        onAccept={onAccept}
        onEdit={() => {}}
        onReject={() => {}}
        onUndo={onUndo}
        accepted={{ prompt: "Revised SLA applied." }}
        rejected={{ prompt: "Rejected." }}
      />
    )
    expect(screen.getByText("Awaiting you")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Accept" }))
    expect(onAccept).toHaveBeenCalledOnce()
    expect(screen.getByText("Revised SLA applied.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(onUndo).toHaveBeenCalledOnce()
    expect(screen.getByText("Apply the revised SLA?")).toBeInTheDocument()
  })
  it("lists steps with their state", () => {
    render(
      <StepList
        steps={[
          { label: "Searched", meta: "3 matches · 1.2s", state: "done" },
          { label: "Propose", state: "pending" },
        ]}
      />
    )
    expect(screen.getByText("3 matches · 1.2s")).toBeInTheDocument()
    expect(screen.getByText(", pending")).toBeInTheDocument()
  })
})

describe("Peek", () => {
  it("answers, tucks away with the grip or Escape, and opens the canvas", async () => {
    const onOpenCanvas = vi.fn()
    const onDismiss = vi.fn()
    const { container } = render(
      <div>
        <Peek status="answered" onOpenCanvas={onOpenCanvas} onDismiss={onDismiss}>
          Two contacts are due today.
        </Peek>
      </div>
    )
    const grip = screen.getByRole("button", { name: "Put this answer away" })
    await userEvent.click(grip)
    expect(container.querySelector(".aimy-peek")).toHaveClass("is-shut")
    await userEvent.click(screen.getByRole("button", { name: "Bring this answer back" }))
    await userEvent.click(screen.getByRole("button", { name: /Two contacts are due today/ }))
    expect(onOpenCanvas).toHaveBeenCalledOnce()
    await userEvent.keyboard("{Escape}")
    expect(container.querySelector(".aimy-peek")).toHaveClass("is-shut")
    await userEvent.click(screen.getByRole("button", { name: "Dismiss this answer" }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
  it("thinks before it answers", () => {
    render(<Peek status="thinking" thinkingLabel="Reading the record…" onOpenCanvas={() => {}} onDismiss={() => {}} />)
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Reading the record…")
  })
})

describe("memory", () => {
  it("forgets one line with Undo, and always offers to answer without it", async () => {
    const onForget = vi.fn()
    const onDrop = vi.fn()
    render(
      <>
        <MemoryPanel
          lines={[{ id: "1", who: "You", what: "asked about refunds" }]}
          onForget={onForget}
          onDrop={onDrop}
        />
        <Toaster />
      </>
    )
    await userEvent.click(screen.getByRole("button", { name: "Forget: You asked about refunds" }))
    expect(onForget).toHaveBeenCalledOnce()
    expect(screen.getByText("Forgotten")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Answer without it" }))
    expect(onDrop).toHaveBeenCalledOnce()
  })
  it("asks once, in place, before forgetting everything", async () => {
    const onForget = vi.fn()
    render(
      <MemoryList
        title="What AiMY remembers"
        facts={[
          { id: "1", text: "Prefers calls after 3pm", from: "From a call" },
          { id: "2", text: "Reports to Lina", from: "From LinkedIn" },
        ]}
        onForget={onForget}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Forget all of it" }))
    expect(onForget).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Yes, forget them" }))
    expect(onForget).toHaveBeenCalledWith(["1", "2"])
  })
})

describe("relationship", () => {
  it("marks an AiMY note as AiMY's, with its source", () => {
    render(<AimyNote from="the last call">The number is not theirs.</AimyNote>)
    expect(screen.getByText("AiMY:")).toBeInTheDocument()
    expect(screen.getByText("the last call")).toBeInTheDocument()
  })
  it("dismisses with a reason in one click, and acknowledges", async () => {
    const onDismiss = vi.fn()
    render(<BriefingActions onAcknowledge={() => {}} onDismiss={onDismiss} />)
    const dismiss = screen.getByRole("button", { name: "Dismiss" })
    await userEvent.click(dismiss)
    expect(dismiss).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(screen.getByRole("button", { name: "Already handling" }))
    expect(onDismiss).toHaveBeenCalledWith("Already handling")
    await userEvent.click(screen.getByRole("button", { name: "Acknowledge" }))
    expect(screen.getByRole("button", { name: "Acknowledged" })).toHaveAttribute("aria-pressed", "true")
  })
  it("sets how much AiMY does without asking, and locks what always asks", async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    render(
      <>
        <Autonomy title="Moving contacts" value="ask" onValueChange={onValueChange} />
        <AskPolicy
          items={[
            { id: "log", label: "Logging calls", value: "ask" },
            { id: "score", label: "Changing scores", value: "ask", locked: "it changes scoring" },
          ]}
          onChange={onChange}
        />
      </>
    )
    await userEvent.click(screen.getByRole("radio", { name: "Do it, then tell me" }))
    expect(onValueChange).toHaveBeenCalledWith("tell")
    await userEvent.click(screen.getByRole("radio", { name: "Just do it" }))
    expect(onChange).toHaveBeenCalledWith("log", "act")
    expect(screen.getByText(/Always asks · it changes scoring/)).toBeInTheDocument()
  })
  it("shows usage on the composer's mark", async () => {
    render(
      <Composer
        onSubmit={() => {}}
        usage={{
          fill: 0.67,
          tone: "warn",
          label: "Your usage: 67%",
          content: (
            <UsageSummary
              groups={[
                { title: "October", rows: [{ label: "Chats", used: 336, of: 300, note: "36 past your share" }] },
              ]}
            />
          ),
        }}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Your usage: 67%" }))
    expect(screen.getByRole("meter", { name: "Chats" })).toHaveAttribute("aria-valuenow", "336")
    expect(screen.getByText("36 past your share")).toBeInTheDocument()
  })
  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <AimyNote from="the last call">The number is not theirs.</AimyNote>
        <SetScopeBar count={3} scope="of 10" onClear={() => {}} />
        <StepList steps={[{ label: "Searched", state: "done" }]} />
      </div>
    )
    expect(await a11yViolations(container)).toEqual([])
  })
})
