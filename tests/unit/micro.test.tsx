import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Brief, BriefFigure, BriefHead, BriefLines, BriefLink, BriefNext, DayBrief } from "@/registry/aimy/ui/brief"
import { NotificationBell } from "@/registry/aimy/ui/notification-bell"
import { UsageLimit } from "@/registry/aimy/ui/usage-limit"
import { a11yViolations } from "../a11y"

describe("NotificationBell", () => {
  afterEach(() => vi.useRealTimers())

  it("names the count, and says nothing extra at zero", () => {
    const { rerender } = render(<NotificationBell count={3} />)
    expect(screen.getByRole("button", { name: "Notifications, 3 unread" })).toBeInTheDocument()
    rerender(<NotificationBell count={0} />)
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument()
  })

  it("rings and says what finished on a new ping, then lets both go", () => {
    vi.useFakeTimers()
    render(<NotificationBell count={1} ping={{ id: 1, text: "Recording processed" }} />)
    act(() => vi.advanceTimersByTime(40))
    const bell = screen.getByRole("button")
    expect(bell).toHaveClass("is-ringing")
    expect(screen.getByRole("status")).toHaveTextContent("Recording processed")
    expect(screen.getByRole("status")).toHaveClass("is-on")
    act(() => vi.advanceTimersByTime(600))
    expect(bell).not.toHaveClass("is-ringing")
    act(() => vi.advanceTimersByTime(800))
    expect(screen.getByRole("status")).not.toHaveClass("is-on")
  })

  it("stays still while its panel is open", () => {
    vi.useFakeTimers()
    render(<NotificationBell count={1} open ping={{ id: 1, text: "Analysis done" }} />)
    act(() => vi.advanceTimersByTime(100))
    expect(screen.getByRole("button")).not.toHaveClass("is-ringing")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("marks a failure", () => {
    vi.useFakeTimers()
    render(<NotificationBell count={0} ping={{ id: 2, text: "Notes not written", fail: true }} />)
    act(() => vi.advanceTimersByTime(40))
    expect(screen.getByRole("status")).toHaveClass("is-fail")
  })
})

describe("Brief", () => {
  it("is Sales' Today: a named region, linked numbers, labelled starts", async () => {
    const open = vi.fn()
    const next = vi.fn()
    const { container } = render(
      <DayBrief
        date="28 Oct"
        lines={[
          <>
            <BriefLink onClick={open}>4 callbacks</BriefLink> are past the day they asked for.
          </>,
        ]}
        starts={[
          { label: "Call the next one", n: 107, why: "Amelia Taylor is top of the queue", onClick: next },
          { label: "Find leads", why: "describe who to look for", onClick: () => {} },
        ]}
      />
    )
    expect(screen.getByRole("region", { name: "Today" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument()
    expect(screen.getByText("28 Oct")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "4 callbacks" }))
    expect(open).toHaveBeenCalledOnce()
    const starts = screen.getByRole("group", { name: "Start" })
    expect(starts.querySelectorAll("button")).toHaveLength(2)
    await userEvent.click(screen.getByRole("button", { name: /Call the next one/ }))
    expect(next).toHaveBeenCalledOnce()
    expect(screen.getByText("107")).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("takes the other products' forms", () => {
    const { container } = render(
      <>
        <Brief ground="accent" label="Campaign">
          <BriefHead size="label" title="AiMY on this campaign" />
          <BriefFigure n="12" of="of 40">
            people have been called twice with no answer.
          </BriefFigure>
        </Brief>
        <Brief ground="plain" compact label="Greeting">
          <BriefLines lines={["Good morning."]} />
          <BriefNext>
            <span>What changed recently?</span>
          </BriefNext>
        </Brief>
      </>
    )
    expect(screen.getByRole("region", { name: "Campaign" })).toHaveClass("slv", "is-accent")
    expect(screen.getByRole("region", { name: "Greeting" })).toHaveClass("is-plain", "is-compact")
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    expect(container.querySelector(".s-lead-n")).toHaveTextContent("12")
    expect(screen.getByText("Worth asking")).toBeInTheDocument()
  })
})

describe("UsageLimit", () => {
  it("says past the share without blocking", () => {
    render(<UsageLimit state="past" what="chats" detail="36 chats past your share." />)
    expect(screen.getByText("Past your share")).toBeInTheDocument()
    expect(screen.getByText("36 chats past your share. You can keep going.")).toBeInTheDocument()
  })

  it("says when a limit starts again and what still works", () => {
    render(<UsageLimit state="reached" what="chats" resets="1 November" stillWorks="Filters still work." />)
    expect(
      screen.getByText("You've used all your chats for now. They start again on 1 November. Filters still work.")
    ).toBeInTheDocument()
  })

  it("says who can turn a stop back on", () => {
    render(<UsageLimit state="stopped" what="chats" action={<button type="button">Ask your admin</button>} />)
    expect(screen.getByText("Stopped")).toBeInTheDocument()
    expect(
      screen.getByText("An admin has stopped your chats. Ask your admin to turn them back on.")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ask your admin" })).toBeInTheDocument()
  })
})
