import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HoverCard } from "@/registry/aimy/ui/hover-card"

function Mark({ onAct = () => {} }: { onAct?: () => void }) {
  return (
    <HoverCard title="Left the company" lines={["14% of everyone"]} action={{ label: "Remove their access", onClick: onAct }}>
      <span tabIndex={0} aria-label="Left the company: 4" data-testid="mark" />
    </HoverCard>
  )
}

const card = () => screen.queryByRole("dialog")

describe("HoverCard", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("opens after the pointer rests on the mark, not at once", () => {
    render(<Mark />)
    fireEvent.pointerEnter(screen.getByTestId("mark"), { pointerType: "mouse" })
    expect(card()).toBeNull()
    act(() => vi.advanceTimersByTime(130))
    expect(card()).toBeInTheDocument()
    expect(screen.getByText("14% of everyone")).toBeInTheDocument()
  })

  it("stays open while the pointer moves from the mark into the card, and closes after leaving both", () => {
    render(<Mark />)
    const mark = screen.getByTestId("mark")
    fireEvent.pointerEnter(mark, { pointerType: "mouse" })
    act(() => vi.advanceTimersByTime(130))
    fireEvent.pointerLeave(mark, { pointerType: "mouse" })
    act(() => vi.advanceTimersByTime(100))
    fireEvent.pointerEnter(card()!, { pointerType: "mouse" })
    act(() => vi.advanceTimersByTime(500))
    expect(card()).toBeInTheDocument()
    fireEvent.pointerLeave(card()!, { pointerType: "mouse" })
    act(() => vi.advanceTimersByTime(250))
    expect(card()).toBeNull()
  })

  it("never takes focus on its own, and Tab from the mark reaches its action", () => {
    const onAct = vi.fn()
    render(<Mark onAct={onAct} />)
    const mark = screen.getByTestId("mark")
    act(() => mark.focus())
    act(() => vi.advanceTimersByTime(130))
    expect(card()).toBeInTheDocument()
    expect(mark).toHaveFocus()
    expect(mark).toHaveAttribute("aria-describedby", card()!.id)
    fireEvent.keyDown(mark, { key: "Tab" })
    const button = screen.getByRole("button", { name: "Remove their access" })
    expect(button).toHaveFocus()
    fireEvent.click(button)
    expect(onAct).toHaveBeenCalledOnce()
    act(() => vi.advanceTimersByTime(300))
    expect(card()).toBeNull()
  })

  it("Escape on the mark closes it", () => {
    render(<Mark />)
    const mark = screen.getByTestId("mark")
    act(() => mark.focus())
    act(() => vi.advanceTimersByTime(130))
    fireEvent.keyDown(mark, { key: "Escape" })
    act(() => vi.advanceTimersByTime(300))
    expect(card()).toBeNull()
  })

  it("opens on a tap at once, with no hover delay", () => {
    render(<Mark />)
    const mark = screen.getByTestId("mark")
    fireEvent.pointerDown(mark, { pointerType: "touch" })
    fireEvent.click(mark)
    expect(card()).toBeInTheDocument()
  })
})
