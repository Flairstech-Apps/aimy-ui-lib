import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Composer } from "@/registry/aimy/ui/composer"
import { NOTE_STEPS, NoteTaker, NoteTakerConsent, type NoteItem } from "@/registry/aimy/ui/note-taker"
import { VoiceStage } from "@/registry/aimy/ui/voice-stage"
import { a11yViolations } from "../a11y"

type W = Record<string, unknown>

describe("Composer: the record option and the voice button", () => {
  afterEach(() => {
    delete (window as unknown as W).webkitSpeechRecognition
  })

  it("says why it can't dictate, in the field's place, and gives the field back", async () => {
    render(<Composer onSubmit={() => {}} />)
    await userEvent.click(screen.getByRole("button", { name: "Dictate" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Voice needs Chrome, Edge or Safari.")
    await userEvent.click(screen.getByRole("button", { name: "Close this message" }))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeVisible()
  })

  it("records, then keep puts the words in the field after what was typed", async () => {
    class FakeRec {
      onresult: ((e: unknown) => void) | null = null
      start() {
        setTimeout(() =>
          this.onresult?.({
            resultIndex: 0,
            results: [Object.assign([{ transcript: "call Dana" }], { isFinal: true })],
          })
        )
      }
      abort() {}
    }
    ;(window as unknown as W).webkitSpeechRecognition = FakeRec
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => [] }) },
    })
    render(<Composer onSubmit={() => {}} />)
    await userEvent.type(screen.getByRole("textbox"), "Please")
    await userEvent.click(screen.getByRole("button", { name: "Dictate" }))
    expect(screen.getByRole("timer", { name: "Dictating for" })).toHaveTextContent("0:00")
    expect(screen.getByRole("button", { name: "Dictate" })).toHaveAttribute("aria-pressed", "true")
    await act(async () => new Promise((r) => setTimeout(r, 20)))
    await userEvent.click(screen.getByRole("button", { name: "Use what I said" }))
    expect(screen.getByRole("textbox")).toHaveValue("Please call Dana")
  })

  it("cancel drops what was said", async () => {
    ;(window as unknown as W).webkitSpeechRecognition = class {
      start() {}
      abort() {}
    }
    render(<Composer onSubmit={() => {}} />)
    await userEvent.click(screen.getByRole("button", { name: "Dictate" }))
    await userEvent.click(screen.getByRole("button", { name: "Cancel dictation" }))
    expect(screen.getByRole("textbox")).toHaveValue("")
    expect(screen.queryByRole("timer")).not.toBeInTheDocument()
  })

  it("is the voice button while empty, and send once there is text", async () => {
    const onVoice = vi.fn()
    const onSubmit = vi.fn()
    render(<Composer onSubmit={onSubmit} onVoice={onVoice} />)
    await userEvent.click(screen.getByRole("button", { name: "Start a voice session" }))
    expect(onVoice).toHaveBeenCalledOnce()
    await userEvent.type(screen.getByRole("textbox"), "Who is due?")
    await userEvent.click(screen.getByRole("button", { name: "Send" }))
    expect(onSubmit).toHaveBeenCalledWith("Who is due?")
  })
})

describe("VoiceStage", () => {
  const base = { open: true, onEnd: () => {}, onMute: () => {}, onInterrupt: () => {} }

  it("says each phase in words, and the orb interrupts only while answering", () => {
    const { rerender } = render(<VoiceStage {...base} phase="listening" heard="which contacts" />)
    expect(screen.getByRole("dialog", { name: "Voice conversation with AiMY" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Listeningwhich contacts")
    expect(screen.getByRole("button", { name: "Interrupt AiMY" })).toBeDisabled()
    rerender(<VoiceStage {...base} phase="speaking" heard="Tap the circle to interrupt" />)
    expect(screen.getByRole("status")).toHaveTextContent("Answering")
    expect(screen.getByRole("button", { name: "Interrupt AiMY" })).toBeEnabled()
    rerender(<VoiceStage {...base} phase="muted" />)
    expect(screen.getByRole("button", { name: "Unmute" })).toHaveAttribute("aria-pressed", "true")
  })

  it("starts on End, and an error leaves only Close", () => {
    const { rerender } = render(<VoiceStage {...base} phase="connecting" />)
    expect(screen.getByRole("button", { name: "End the voice session" })).toHaveFocus()
    expect(screen.getByRole("button", { name: "Mute" })).toBeDisabled()
    rerender(<VoiceStage {...base} phase="error" error="No microphone was found." />)
    expect(screen.getByRole("status")).toHaveTextContent("No microphone was found.")
    expect(screen.queryByRole("button", { name: /mute/i })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    expect(screen.queryByRole("timer")).not.toBeInTheDocument()
  })

  it("offers meeting notes, and shows the consent in the state's place", async () => {
    const onTakeNotes = vi.fn()
    const onStart = vi.fn()
    const { rerender } = render(<VoiceStage {...base} phase="listening" onTakeNotes={onTakeNotes} />)
    await userEvent.click(screen.getByRole("button", { name: "Take meeting notes" }))
    expect(onTakeNotes).toHaveBeenCalledOnce()
    rerender(
      <VoiceStage
        {...base}
        phase="listening"
        asking={<NoteTakerConsent meeting="Upland weekly check-in" onStart={onStart} onNotNow={() => {}} />}
      />
    )
    expect(screen.getByRole("group", { name: "Take notes in this meeting?" })).toHaveTextContent("AiMY hears only you")
    expect(screen.getByRole("button", { name: "Start taking notes" })).toHaveFocus()
    await userEvent.click(screen.getByRole("button", { name: "Start taking notes" }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it("has no axe violations", async () => {
    render(<VoiceStage {...base} phase="listening" />)
    expect(await a11yViolations(document.body)).toEqual([])
  })
})

describe("NoteTaker", () => {
  const items: NoteItem[] = [
    { type: "line", id: "l0", at: 48, text: "About half of last week’s tickets never came in." },
    { type: "mine", id: "m0", at: 60, text: "Dana: agents noticed" },
  ]
  const base = { meeting: "Upland weekly check-in", seconds: 75, items, onSend: () => {}, onEnd: () => {} }

  it("opens from the orb, says it is taking notes, and ends on request", async () => {
    const onEnd = vi.fn()
    render(<NoteTaker {...base} phase="live" onEnd={onEnd} />)
    const orb = screen.getByRole("button", { name: "Open the meeting notes" })
    expect(orb).toHaveAttribute("aria-expanded", "false")
    expect(orb).toHaveTextContent("Listening to you")
    await userEvent.click(orb)
    expect(orb).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("dialog", { name: "Meeting notes" })).toHaveTextContent("Taking notes1:15")
    await userEvent.click(screen.getByRole("button", { name: "End notes" }))
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it("asks on Transcription and notes on Notes, keeping each draft", async () => {
    const onSend = vi.fn()
    render(<NoteTaker {...base} phase="live" defaultView="card" onSend={onSend} />)
    await userEvent.type(screen.getByRole("textbox", { name: "Ask AiMY about this meeting" }), "half typed")
    await userEvent.click(screen.getByRole("tab", { name: "Notes" }))
    const note = screen.getByRole("textbox", { name: "Note what others say or decide" })
    expect(note).toHaveValue("")
    await userEvent.type(note, "Priya sends the labels{Enter}")
    expect(onSend).toHaveBeenCalledWith("Priya sends the labels", "notes")
    await userEvent.click(screen.getByRole("tab", { name: "Transcription" }))
    expect(screen.getByRole("textbox", { name: "Ask AiMY about this meeting" })).toHaveValue("half typed")
    await userEvent.click(screen.getByRole("button", { name: "Recap so far" }))
    expect(onSend).toHaveBeenLastCalledWith("Recap so far", "chat")
  })

  it("ticks the steps off after the meeting, then shows the notes", () => {
    const steps = NOTE_STEPS.map((s, i) => ({
      ...s,
      state: i === 0 ? ("done" as const) : i === 1 ? ("run" as const) : ("wait" as const),
    }))
    const { rerender } = render(
      <NoteTaker
        {...base}
        phase="writing"
        defaultView="card"
        steps={steps}
        items={[...items, { type: "steps", id: "s" }]}
      />
    )
    expect(screen.getByRole("list", { name: "Writing the notes" })).toHaveTextContent(
      "Recording processedAnalyzing what was saidSummarizing"
    )
    expect(screen.queryByRole("button", { name: "End notes" })).not.toBeInTheDocument()
    rerender(
      <NoteTaker
        {...base}
        phase="ready"
        defaultView="card"
        steps={steps.map((s) => ({ ...s, state: "done" as const }))}
        items={[...items, { type: "steps", id: "s" }, { type: "result", id: "r" }]}
        summary={{
          text: "The rule gets split by Thursday.",
          decided: ["Split the rule."],
          todos: [{ text: "Split it", when: "Thursday" }],
        }}
        onMakeTasks={() => {}}
      />
    )
    expect(screen.getByText("Notes ready")).toBeInTheDocument()
    expect(screen.getByText("The rule gets split by Thursday.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Make 1 tasks" })).toBeInTheDocument()
  })

  it("keeps the transcript safe when the summary fails, and tries again", async () => {
    const onRetry = vi.fn()
    render(
      <NoteTaker
        {...base}
        phase="failed"
        defaultView="card"
        items={[...items, { type: "fail", id: "f" }]}
        onRetry={onRetry}
      />
    )
    expect(screen.getByText("Notes not written")).toBeInTheDocument()
    expect(
      screen.getByText("The recording and the transcript are safe. Nothing was sent to anyone.")
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("can be closed only after the meeting", () => {
    const { rerender } = render(<NoteTaker {...base} phase="live" onClose={() => {}} />)
    expect(screen.queryByRole("button", { name: "Close the meeting notes" })).not.toBeInTheDocument()
    rerender(<NoteTaker {...base} phase="short" onClose={() => {}} />)
    expect(screen.getAllByRole("button", { name: "Close the meeting notes" }).length).toBeGreaterThan(0)
  })
})

describe("Composer attachments, inside the bar", () => {
  it("removes a file after its row collapses", async () => {
    const onRemove = vi.fn()
    render(
      <Composer
        variant="canvas"
        onSubmit={() => {}}
        onAttach={() => {}}
        attachments={[{ id: "a", name: "pricing.pdf", note: "48 KB · not uploaded" }]}
        onRemoveAttachment={onRemove}
      />
    )
    expect(screen.getByText("48 KB · not uploaded")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove pricing.pdf" }))
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("a"))
  })
})
