import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { Source } from "@/registry/aimy/lib/ai-types"
import { Citation } from "@/registry/aimy/ui/citation"
import { Composer } from "@/registry/aimy/ui/composer"
import { Confidence } from "@/registry/aimy/ui/confidence"
import { Score } from "@/registry/aimy/ui/score"
import { SourceList } from "@/registry/aimy/ui/source-list"
import { toast, Toaster } from "@/registry/aimy/ui/toast"
import { DisclosureAction, TrustDisclosure } from "@/registry/aimy/ui/trust-disclosure"
import { TrustState } from "@/registry/aimy/ui/trust-state"
import { a11yViolations } from "../a11y"

const doc: Source = {
  id: "1",
  title: "Refund policy: EU customers",
  status: "outdated",
  passage: "Customers in the EU may cancel within 14 days.",
  type: "Policy",
  connector: "Confluence",
  collection: "Billing",
}

describe("TrustState", () => {
  it("says the status in words, with why in the title", () => {
    render(<TrustState status="outdated" />)
    const s = screen.getByText("Out of date")
    expect(s.closest("[data-slot=trust-state]")).toHaveAttribute("title", "The source changed after our copy.")
  })
  it("says a superseded source is not in answers, and marks a status set by hand", () => {
    render(<TrustState status="superseded" setByHand />)
    expect(screen.getByText("Not in answers")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "set by hand" })).toBeInTheDocument()
  })
})

describe("Citation", () => {
  afterEach(() => act(() => toast.dismiss()))

  it("opens its preview on focus, with the passage and where it came from", async () => {
    render(
      <p>
        Not once activated
        <Citation n={1} source={doc} />.
      </p>
    )
    const chip = screen.getByRole("button", { name: "Source 1: Refund policy: EU customers" })
    act(() => chip.focus())
    expect(await screen.findByText("“Customers in the EU may cancel within 14 days.”")).toBeInTheDocument()
    expect(screen.getByText("Policy · Confluence · Billing")).toBeInTheDocument()
    expect(chip).toHaveAttribute("aria-expanded", "true")
  })

  it("flags one citation and says feedback is per citation", async () => {
    const onFlag = vi.fn()
    render(
      <>
        <Citation n={1} source={doc} onFlag={onFlag} />
        <Toaster />
      </>
    )
    await userEvent.click(screen.getByRole("button", { name: /Source 1/ }))
    await userEvent.click(screen.getByRole("button", { name: "Flag" }))
    expect(onFlag).toHaveBeenCalledWith(doc)
    expect(screen.getByText("Feedback is captured per citation, not per answer")).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    render(<Citation n={1} source={doc} />)
    await userEvent.click(screen.getByRole("button", { name: /Source 1/ }))
    expect(screen.getByText("Policy · Confluence · Billing")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByText("Policy · Confluence · Billing")).not.toBeInTheDocument()
  })
})

describe("SourceList", () => {
  it("numbers rows in order and opens a document", async () => {
    const onOpen = vi.fn()
    render(<SourceList sources={[doc, { ...doc, id: "2", title: "FAQ", status: "current" }]} onOpen={onOpen} />)
    const rows = screen.getAllByRole("button")
    expect(rows[1]).toHaveTextContent("2PolicyFAQConfluenceNo issues")
    await userEvent.click(rows[0]!)
    expect(onOpen).toHaveBeenCalledWith(doc)
  })
  it("captions the drawer", () => {
    render(<SourceList variant="drawer" sources={[doc]} />)
    expect(screen.getByRole("region", { name: "What this answer stands on" })).toBeInTheDocument()
  })
})

describe("TrustDisclosure", () => {
  it("never stays silent when nothing grounded the answer", async () => {
    const raise = vi.fn()
    const { container } = render(
      <TrustDisclosure
        exclusion
        rows={[{ tone: "none", children: "0 sources matched." }]}
        actions={<DisclosureAction onClick={raise}>Raise it as a coverage gap →</DisclosureAction>}
      />
    )
    expect(screen.getByRole("note", { name: "What this answer is grounded on" })).toHaveTextContent(
      "0 sources matched."
    )
    expect(container.querySelector(".has-exclusion")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Raise it as a coverage gap →" }))
    expect(raise).toHaveBeenCalledOnce()
  })
})

describe("Confidence and Score", () => {
  it("says what limits a fact, and offers to check again", async () => {
    const onCheckAgain = vi.fn()
    render(
      <Confidence level="old" group="Company" source="on LinkedIn" checkedIn="March 2025" onCheckAgain={onCheckAgain} />
    )
    const badge = screen.getByRole("button", { name: "May be out of date, Company" })
    expect(badge).toHaveAccessibleDescription(/Last checked on LinkedIn in March 2025, over a year ago/)
    await userEvent.click(screen.getByRole("button", { name: "Check again" }))
    expect(onCheckAgain).toHaveBeenCalledOnce()
  })
  it("names what is missing", () => {
    render(<Confidence level="gap" group="Contact" missing={["a direct line", "an email", "a title"]} />)
    expect(screen.getByRole("tooltip")).toHaveTextContent("AiMY has not found a direct line, an email and a title yet.")
  })
  it("reads a score as words", () => {
    render(<Score value={62} label="Fit" />)
    expect(screen.getByRole("img", { name: "Fit 62 out of 100, medium" })).toBeInTheDocument()
  })
  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Confidence level="ok" group="Role" when="3 weeks ago" source="on LinkedIn" />
        <Score value={86} label="Fit" />
        <TrustState status="current" />
      </div>
    )
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Composer while AiMY is unavailable", () => {
  it("says what still works, keeps the question, and sends it when AiMY is back", async () => {
    const onSubmit = vi.fn()
    const { rerender } = render(
      <Composer onSubmit={onSubmit} unavailable="AiMY is unavailable — the filters still work" />
    )
    const box = screen.getByRole("textbox")
    expect(box).toHaveAttribute("placeholder", "AiMY is unavailable — the filters still work")
    await userEvent.type(box, "Who is due?{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    expect(box).toHaveValue("Who is due?")
    expect(screen.getByRole("button", { name: "Sends when AiMY is back" })).toBeInTheDocument()
    rerender(<Composer onSubmit={onSubmit} />)
    expect(onSubmit).toHaveBeenCalledWith("Who is due?")
    expect(screen.getByRole("textbox")).toHaveValue("")
  })
  it("does not start a voice session while down", () => {
    const onVoice = vi.fn()
    render(<Composer onSubmit={() => {}} onVoice={onVoice} unavailable="AiMY is unavailable" />)
    fireEvent.click(screen.getByRole("button", { name: "AiMY is unavailable" }))
    expect(onVoice).not.toHaveBeenCalled()
  })
})
