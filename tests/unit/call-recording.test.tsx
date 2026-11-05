import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { CallRecording } from "@/registry/aimy/ui/call-recording"
import { a11yViolations } from "../a11y"

const heights = (el: HTMLElement) =>
  [...el.querySelectorAll<HTMLElement>("i")].slice(0, 28).map((i) => i.style.height)

describe("CallRecording", () => {
  it("is a toggle named by what it plays and how long it is", async () => {
    const { container } = render(
      <>
        <CallRecording id="c1" seconds={154} />
        <CallRecording id="c2" seconds={23} kind="message" />
      </>
    )
    expect(screen.getByRole("button", { name: "Play the recording of the call, 2:34" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(screen.getByRole("button", { name: "Play the message they left, 0:23" })).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("draws the same waveform for the same id, and a different one for another", () => {
    const a = render(<CallRecording id="c1" seconds={10} />).container
    const b = render(<CallRecording id="c1" seconds={10} />).container
    const c = render(<CallRecording id="c9" seconds={10} />).container
    expect(heights(a)).toHaveLength(28)
    expect(heights(a)).toEqual(heights(b))
    expect(heights(a)).not.toEqual(heights(c))
  })

  it("plays one at a time: starting one stops the other, and pressing it again stops it", async () => {
    render(
      <>
        <CallRecording id="c1" seconds={60} />
        <CallRecording id="c2" seconds={60} kind="message" />
      </>
    )
    const call = screen.getByRole("button", { name: /recording of the call/ })
    const message = screen.getByRole("button", { name: /message they left/ })
    await userEvent.click(call)
    expect(call).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(message)
    expect(message).toHaveAttribute("aria-pressed", "true")
    expect(call).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(message)
    expect(message).toHaveAttribute("aria-pressed", "false")
  })
})
