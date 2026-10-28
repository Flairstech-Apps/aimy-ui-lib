import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Activity } from "@/registry/aimy/ui/activity"
import { AgentSteps } from "@/registry/aimy/ui/agent-steps"
import { ChangeReview } from "@/registry/aimy/ui/change-review"
import { ConflictPair } from "@/registry/aimy/ui/conflict-pair"
import { EntryAction } from "@/registry/aimy/ui/entry-action"
import { Suggestion } from "@/registry/aimy/ui/suggestion"
import { toast, Toaster } from "@/registry/aimy/ui/toast"
import { VersionList } from "@/registry/aimy/ui/version-list"
import { WorkState } from "@/registry/aimy/ui/work-state"
import { a11yViolations } from "../a11y"

describe("WorkState and EntryAction", () => {
  it("says the state in Sales' words, or its own", () => {
    render(
      <>
        <WorkState state="staged" />
        <WorkState state="detected" label="Read off the record" />
      </>
    )
    expect(screen.getByText("Awaiting you")).toHaveAttribute("data-work-state", "staged")
    expect(screen.getByText("Read off the record")).toHaveAttribute("data-work-state", "detected")
  })
  it("declares its mode and marks AiMY's actions", () => {
    const { container } = render(
      <EntryAction mode="investigate" aimy>
        Compare
      </EntryAction>
    )
    expect(screen.getByRole("button", { name: "Compare" })).toHaveAttribute("data-entry-mode", "investigate")
    expect(container.querySelector('[data-slot="aimy-mark"]')).toBeInTheDocument()
  })
})

describe("Suggestion", () => {
  afterEach(() => act(() => toast.dismiss()))

  it("shows the change and applies what was edited", async () => {
    const onAccept = vi.fn()
    render(
      <>
        <Suggestion
          title="Tighten the rule"
          before="30 days."
          after="14 days."
          onAccept={onAccept}
          onReject={() => {}}
        />
        <Toaster />
      </>
    )
    expect(screen.getByText("30 days.").tagName).toBe("DEL")
    const ins = screen.getByText("14 days.")
    expect(ins.tagName).toBe("INS")
    await userEvent.click(screen.getByRole("button", { name: "Edit" }))
    expect(ins).toHaveAttribute("contenteditable", "true")
    ins.textContent = "14 days, unless activated."
    await userEvent.click(screen.getByRole("button", { name: "Accept" }))
    expect(onAccept).toHaveBeenCalledWith("14 days, unless activated.", true)
    expect(screen.getByText("Applied to the document.")).toBeInTheDocument()
    expect(screen.getByText("Filed as a version with AiMY as the author")).toBeInTheDocument()
  })

  it("keeps a rejected change in the trail", async () => {
    const onReject = vi.fn()
    render(<Suggestion after="New text." onAccept={() => {}} onReject={onReject} />)
    expect(screen.getByRole("group", { name: "AiMY drafted this" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Reject" }))
    expect(onReject).toHaveBeenCalledOnce()
    expect(screen.getByText("Rejected. Kept in the trail.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled()
  })
})

describe("AgentSteps", () => {
  it("says what it is doing while live, and how long it took when done", () => {
    const steps = [
      { label: "Asking Apollo", result: "42 people came back", state: "done" as const },
      { label: "Checking them", state: "live" as const },
    ]
    const { rerender } = render(
      <AgentSteps live title="Curating “Leeds”" doneTitle="Curated" seconds={2.34} steps={steps} />
    )
    expect(screen.getByText("Curating “Leeds”")).toBeInTheDocument()
    expect(screen.getByRole("timer")).toHaveTextContent("2.3s")
    expect(screen.getByText(", working")).toBeInTheDocument()
    rerender(
      <AgentSteps
        live={false}
        title="Curating"
        doneTitle="Curated"
        seconds={6}
        steps={steps.map((s) => ({ ...s, state: "done" as const }))}
      />
    )
    expect(screen.getByText("Curated in 6.0s")).toBeInTheDocument()
  })
})

describe("ChangeReview and ConflictPair", () => {
  it("states what it will do, and waits for the typed word", async () => {
    const onConfirm = vi.fn()
    render(
      <ChangeReview
        open
        onOpenChange={() => {}}
        title="Archive documents"
        now="12 documents"
        after="9 archived"
        effects={[{ tone: "skip", children: "3 are already excluded." }]}
        word="archive"
        confirmLabel="Archive"
        danger
        onConfirm={onConfirm}
      />
    )
    const dialog = screen.getByRole("dialog", { name: "Archive documents" })
    expect(dialog).toHaveTextContent("Now12 documents")
    expect(screen.getByRole("region", { name: "What this will do" })).toHaveTextContent(
      "3 are already excluded.Reversible for 24h · logged to the audit trail"
    )
    const go = screen.getByRole("button", { name: "Archive" })
    expect(go).toBeDisabled()
    await userEvent.type(screen.getByRole("textbox", { name: "Type archive to confirm" }), "ARCHIVE")
    expect(go).toBeEnabled()
    await userEvent.click(go)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("offers to make either side the one", async () => {
    const onPick = vi.fn()
    render(
      <ConflictPair
        sides={[
          { source: { id: "a", title: "Policy A", status: "conflicting" }, says: "14 days" },
          { source: { id: "b", title: "FAQ B", status: "conflicting" }, says: "30 days" },
        ]}
        onPick={onPick}
      />
    )
    await userEvent.click(screen.getAllByRole("button", { name: "Make this the one" })[1]!)
    expect(onPick.mock.calls[0]![0].source.title).toBe("FAQ B")
  })
})

describe("VersionList and Activity", () => {
  it("marks AiMY's version and who accepted it", () => {
    render(
      <VersionList
        versions={[
          { id: "2", n: 2, label: "Rewritten", author: "AiMY", how: "accepted by Dana", time: "3 Oct", ai: true },
          { id: "1", n: 1, label: "Imported", author: "A. Mahfouz", time: "21 Sep", current: true },
        ]}
      />
    )
    expect(screen.getByText("Rewritten").closest(".ver-item")).toHaveClass("is-ai")
    expect(screen.getByText(/accepted by Dana/)).toBeInTheDocument()
    expect(screen.getByText("Current")).toBeInTheDocument()
  })

  it("says AiMY when AiMY did it", async () => {
    const onOpen = vi.fn()
    render(
      <Activity
        onOpen={onOpen}
        items={[{ id: "1", subject: "Youssef Amin", outcome: "Moved to Needs reply", by: "aimy", when: "09:15" }]}
      />
    )
    expect(screen.getByText(/· AiMY · 09:15/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Youssef Amin" }))
    expect(onOpen).toHaveBeenCalled()
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <WorkState state="completed" />
        <EntryAction mode="direct">Archive it</EntryAction>
        <Activity
          items={[{ id: "1", subject: "Dana", outcome: "Meeting set", tone: "ok", by: "Engy", when: "10:42" }]}
        />
      </div>
    )
    expect(await a11yViolations(container)).toEqual([])
  })
})
