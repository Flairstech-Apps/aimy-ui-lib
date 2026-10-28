import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Canvas } from "@/registry/aimy/ui/canvas"
import { Composer } from "@/registry/aimy/ui/composer"
import { Message } from "@/registry/aimy/ui/message"
import { Reasoning } from "@/registry/aimy/ui/reasoning"
import { ResponseActions } from "@/registry/aimy/ui/response-actions"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { Suggestions } from "@/registry/aimy/ui/suggestions"
import { ThinkingIndicator } from "@/registry/aimy/ui/thinking"
import { toast, Toaster } from "@/registry/aimy/ui/toast"
import { a11yViolations } from "../a11y"

describe("Composer", () => {
  it("sends trimmed text on Enter, then clears; never sends an empty box", async () => {
    const onSubmit = vi.fn()
    render(<Composer onSubmit={onSubmit} />)
    const box = screen.getByRole("textbox")
    await userEvent.type(box, "{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    await userEvent.type(box, "  Who is due today?  {Enter}")
    expect(onSubmit).toHaveBeenCalledWith("Who is due today?")
    expect(box).toHaveValue("")
  })

  it("keeps Shift+Enter for a new line in the canvas", async () => {
    const onSubmit = vi.fn()
    render(<Composer variant="canvas" onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole("textbox"), "Line one{Shift>}{Enter}{/Shift}line two")
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("textbox")).toHaveValue("Line one\nline two")
  })

  it("turns send into stop while generating, and stop keeps the composer", async () => {
    const onStop = vi.fn()
    const onSubmit = vi.fn()
    const { container } = render(<Composer onSubmit={onSubmit} generating onStop={onStop} />)
    expect(container.querySelector(".is-generating > .beam")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Generating…")
    await userEvent.click(screen.getByRole("button", { name: "Stop generating" }))
    expect(onStop).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("shows attached files and removes one by name", async () => {
    const onRemove = vi.fn()
    render(
      <Composer
        variant="canvas"
        onSubmit={() => {}}
        onAttach={() => {}}
        attachments={[{ id: "a", name: "pricing.pdf", note: "48 KB, not uploaded" }]}
        onRemoveAttachment={onRemove}
      />
    )
    expect(screen.getByRole("button", { name: "Attach a file" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove pricing.pdf" }))
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("a"))
  })

  it("has no axe violations", async () => {
    const { container } = render(<Composer onSubmit={() => {}} badge={2} />)
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Message", () => {
  it("shows the think-mark instead of a bubble while thinking", () => {
    render(<Message speaker="aimy" status="thinking" thinkingLabel="Reading the record…" />)
    expect(screen.getByRole("status")).toHaveTextContent("Reading the record…")
  })

  it("keeps a stopped answer's words and says Stopped", () => {
    render(
      <Message speaker="aimy" status="stopped">
        Youssef asked for a call after
      </Message>
    )
    expect(screen.getByText("Youssef asked for a call after")).toBeInTheDocument()
    expect(screen.getByText("Stopped")).toBeInTheDocument()
  })

  it("draws AiMY with its tile and a person with their name", () => {
    const { container } = render(
      <>
        <Message speaker="user" author={{ name: "Engy Hassan" }}>
          Who is due today?
        </Message>
        <Message speaker="aimy">Three contacts.</Message>
      </>
    )
    expect(screen.getByRole("img", { name: "Engy Hassan" })).toBeInTheDocument()
    expect(container.querySelector('[data-speaker="aimy"] [data-slot="aimy-avatar"]')).toBeInTheDocument()
  })
})

describe("StreamingText", () => {
  afterEach(() => vi.useRealTimers())

  it("shows text that was already there at once", () => {
    const { container } = render(<StreamingText text="Three contacts are due" />)
    expect(container.querySelectorAll(".t-stream-w.is-in")).toHaveLength(4)
  })

  it("resolves arriving words one at a time", () => {
    vi.useFakeTimers()
    const { container, rerender } = render(<StreamingText text="" streaming />)
    rerender(<StreamingText text="Three contacts are" streaming />)
    expect(container.querySelectorAll(".is-in")).toHaveLength(0)
    act(() => vi.advanceTimersByTime(60))
    expect(container.querySelectorAll(".is-in")).toHaveLength(1)
    // One word per gap: each resolve schedules the next.
    act(() => vi.advanceTimersByTime(60))
    act(() => vi.advanceTimersByTime(60))
    expect(container.querySelectorAll(".is-in")).toHaveLength(3)
    expect(container.textContent).toBe("Three contacts are")
  })
})

describe("ThinkingIndicator", () => {
  afterEach(() => vi.useRealTimers())

  it("steps through its beats and keeps the last", () => {
    vi.useFakeTimers()
    render(<ThinkingIndicator label={["Searching the corpus", "Reading 3 documents"]} />)
    expect(screen.getByRole("status")).toHaveTextContent("Searching the corpus")
    act(() => vi.advanceTimersByTime(2000))
    act(() => vi.advanceTimersByTime(300))
    const lines = [...document.querySelectorAll(".t-think-text")].map((e) => e.textContent)
    expect(lines).toEqual(["Reading 3 documents"])
    act(() => vi.advanceTimersByTime(5000))
    expect(document.querySelector(".t-think-text")).toHaveTextContent("Reading 3 documents")
  })
})

describe("ResponseActions", () => {
  afterEach(() => act(() => toast.dismiss()))

  it("rates one way at a time, toggles off, and says so", async () => {
    const onRate = vi.fn()
    render(
      <>
        <ResponseActions text="An answer" onRate={onRate} />
        <Toaster />
      </>
    )
    const up = screen.getByRole("button", { name: "Useful" })
    const down = screen.getByRole("button", { name: "Not useful" })
    await userEvent.click(up)
    expect(up).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Marked useful")).toBeInTheDocument()
    await userEvent.click(down)
    expect(up).toHaveAttribute("aria-pressed", "false")
    expect(down).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(down)
    expect(onRate).toHaveBeenLastCalledWith(null)
  })

  it("shows Retry only when it can ask again, and the source count", () => {
    const { rerender } = render(<ResponseActions text="x" />)
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
    rerender(<ResponseActions text="x" onRetry={() => {}} sources={1} />)
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "1 source" })).toHaveAttribute("aria-expanded", "false")
  })
})

describe("Suggestions and Reasoning", () => {
  it("asks the picked question", async () => {
    const onPick = vi.fn()
    render(<Suggestions items={["Who is due today?"]} onPick={onPick} />)
    await userEvent.click(screen.getByRole("button", { name: "Who is due today?" }))
    expect(onPick).toHaveBeenCalledWith("Who is due today?")
  })

  it("folds the steps under How this was answered", async () => {
    render(<Reasoning steps={[{ what: "Read your contacts", why: "You asked who is due" }]} />)
    const toggle = screen.getByRole("button", { name: /How this was answered/ })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("You asked who is due")).toBeInTheDocument()
  })
})

describe("Canvas", () => {
  it("opens as a named dialog with Based on, focuses the composer, and closes on Escape", async () => {
    render(
      <Canvas
        trigger={<button type="button">Open</button>}
        basis={["Kestrel Logistics", "Contact"]}
        composer={<Composer variant="canvas" onSubmit={() => {}} />}
      >
        <p>Thread</p>
      </Canvas>
    )
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    const dialog = screen.getByRole("dialog", { name: "AiMY Canvas" })
    expect(dialog).toHaveTextContent("Based on")
    expect(dialog).toHaveTextContent("Kestrel Logistics")
    expect(screen.getByRole("textbox")).toHaveFocus()
    expect(screen.getByRole("log", { name: "Conversation" })).toHaveTextContent("Thread")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus()
  })
})
