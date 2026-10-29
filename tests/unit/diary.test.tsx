import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Canvas } from "@/registry/aimy/ui/canvas"
import { Diary, DiaryLoop, type DiaryEntry } from "@/registry/aimy/ui/diary"
import { NoteTaker } from "@/registry/aimy/ui/note-taker"
import { a11yViolations } from "../a11y"

const open = vi.fn()
const ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    date: "2026-10-28",
    time: "10:30",
    kind: "demo",
    who: "Dana Whitfield",
    what: "Pricing",
    set: "you",
    onOpen: open,
  },
  { id: "2", date: "2026-10-28", kind: "owed", who: "Harbour Foods", what: "Proposal due" },
  { id: "3", date: "2026-10-30", time: "10:00", kind: "meeting", who: "Kestrel Logistics" },
  { id: "4", date: "2026-11-04", time: "14:00", kind: "demo", who: "Brightline Retail" },
]

describe("Diary", () => {
  it("draws a Monday-first month, marks today, and lists the day beside it", async () => {
    const { container } = render(<Diary today="2026-10-28" entries={ENTRIES} onAdd={() => {}} />)
    const grid = screen.getByRole("grid", { name: "October 2026" })
    // October 2026 starts on a Thursday: 3 days of September lead, 35 cells.
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(35)
    const today = within(grid).getByRole("gridcell", { name: "Wednesday 28 October, 2 things" })
    expect(today).toHaveAttribute("aria-current", "date")
    expect(today).toHaveAttribute("aria-selected", "true")
    expect(today).toHaveAttribute("tabindex", "0")
    expect(screen.getByText(/Today, 28 October/)).toBeInTheDocument()
    expect(screen.getByText("all day")).toBeInTheDocument()
    expect(screen.getByText(/· you set the time/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /10:30 Demo Dana Whitfield/ }))
    expect(open).toHaveBeenCalledOnce()
    expect(screen.getByText("Next in the diary")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Kestrel Logistics/ })).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("says what an empty day is for, and moves by keys across months", () => {
    render(<Diary today="2026-10-28" entries={ENTRIES} />)
    const cell = (name: RegExp) => screen.getByRole("gridcell", { name })
    fireEvent.keyDown(cell(/28 October/), { key: "ArrowRight" })
    expect(cell(/29 October/)).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText(/Nothing in the diary/)).toBeInTheDocument()
    expect(cell(/29 October/)).toHaveAccessibleName("Thursday 29 October, nothing on")
    fireEvent.keyDown(cell(/29 October/), { key: "ArrowDown" })
    expect(cell(/^Thursday 5 November/)).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument()
    fireEvent.keyDown(cell(/^Thursday 5 November/), { key: "PageUp" })
    expect(cell(/^Monday 5 October/)).toHaveAttribute("aria-selected", "true")
    fireEvent.keyDown(cell(/^Monday 5 October/), { key: "End" })
    expect(cell(/11 October/)).toHaveAttribute("aria-selected", "true")
  })

  it("steps the month with its buttons and comes home with Today", async () => {
    render(<Diary today="2026-10-28" entries={ENTRIES} />)
    await userEvent.click(screen.getByRole("button", { name: "The month after" }))
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeInTheDocument()
  })
})

describe("DiaryLoop", () => {
  it("lists what nobody wrote up, each a press from saying how it went", async () => {
    const write = vi.fn()
    render(
      <DiaryLoop
        rows={[{ id: "a", when: "Thu 23 Oct", who: "Peter Foster", what: "Signed the pilot", onClick: write }]}
      />
    )
    expect(screen.getByRole("region", { name: "Missing details" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /Peter Foster .*Say how it went/ }))
    expect(write).toHaveBeenCalledOnce()
  })
})

describe("NoteTaker in the canvas", () => {
  it("lays the meeting out full height with its tabs, and goes back to the widget", async () => {
    const back = vi.fn()
    const { container } = render(
      <Canvas
        open
        title="Upland weekly check-in"
        meeting={
          <NoteTaker
            layout="canvas"
            meeting="Upland weekly check-in"
            phase="live"
            seconds={412}
            items={[{ id: "l1", type: "line", at: 48, text: "Half of last week's tickets never came in." }]}
            onSend={() => {}}
            onEnd={() => {}}
            onBack={back}
          />
        }
      />
    )
    expect(document.querySelector(".nt-cv")).toBeInTheDocument()
    // The meeting takes the canvas in place of the thread.
    expect(screen.queryByRole("log", { name: "Conversation" })).toBeNull()
    expect(screen.getByRole("tab", { name: "Transcription" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("6:52")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Back to the meeting" }))
    expect(back).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole("tab", { name: "Notes" }))
    expect(screen.getByText(/Write one in the bar below/)).toBeInTheDocument()
    expect(container).toBeTruthy()
  })
})
