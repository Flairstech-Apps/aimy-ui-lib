"use client"

import { useEffect, useRef, useState } from "react"
import type { Attachment, Rating, Turn } from "@/registry/aimy/lib/ai-types"
import { Button } from "@/registry/aimy/ui/button"
import { Canvas } from "@/registry/aimy/ui/canvas"
import { Composer } from "@/registry/aimy/ui/composer"
import { Message } from "@/registry/aimy/ui/message"
import { Reasoning } from "@/registry/aimy/ui/reasoning"
import { ResponseActions } from "@/registry/aimy/ui/response-actions"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { Suggestions } from "@/registry/aimy/ui/suggestions"
import { ThinkingIndicator } from "@/registry/aimy/ui/thinking"
import { toast } from "@/registry/aimy/ui/toast"

const ANSWER =
  "Three contacts are due today. Dana Whitfield at Kestrel Logistics asked for pricing on the annual plan, and a reply is drafted. Youssef Amin at Harbour Foods asked for a call after 3pm. Priya Natarajan hasn't answered two emails, so a call is the next step."

const STEPS = [
  {
    what: "Read your contacts due today",
    why: "You asked who is due, so AiMY started from today's list.",
  },
  {
    what: "Checked the last call and email for each",
    why: "A contact who already replied isn't due.",
  },
  {
    what: "Ordered them by what was promised",
    why: "Youssef asked for a time, so he is placed after 3pm.",
  },
]

// A pretend answer: think, then stream the words in, then finish. Stop keeps
// what was written. Real products feed the same Turn shape from their stream.
function useFakeAnswer() {
  const [turns, setTurns] = useState<Turn[]>([])
  const timer = useRef<number | undefined>(undefined)
  const busy = turns.at(-1)?.status === "thinking" || turns.at(-1)?.status === "streaming"

  const patchLast = (p: Partial<Turn>) => setTurns((ts) => ts.map((t, i) => (i === ts.length - 1 ? { ...t, ...p } : t)))

  const ask = (q: string) => {
    window.clearInterval(timer.current)
    const id = String(Date.now())
    setTurns((ts) => [
      ...ts,
      {
        id: `${id}-q`,
        speaker: "user",
        text: q,
        author: { name: "Engy Hassan" },
      },
      { id: `${id}-a`, speaker: "aimy", text: "", status: "thinking" },
    ])
    const words = ANSWER.split(" ")
    let n = 0
    window.setTimeout(() => {
      patchLast({ status: "streaming" })
      timer.current = window.setInterval(() => {
        n += 3
        patchLast({
          text: words.slice(0, n).join(" "),
          status: n >= words.length ? "done" : "streaming",
        })
        if (n >= words.length) window.clearInterval(timer.current)
      }, 180)
    }, 2600)
  }

  const stop = () => {
    window.clearInterval(timer.current)
    setTurns((ts) =>
      ts.flatMap((t, i) => {
        if (i !== ts.length - 1) return [t]
        // Stopped before any words: the thinking turn goes, as in both products.
        if (t.status === "thinking") return []
        return [{ ...t, status: "stopped" as const }]
      })
    )
  }

  useEffect(() => () => window.clearInterval(timer.current), [])
  return { turns, busy, ask, stop, reset: () => setTurns([]) }
}

function Thread({ turns, onAsk }: { turns: Turn[]; onAsk: (q: string) => void }) {
  const [rating, setRating] = useState<Rating>(null)
  const [sources, setSources] = useState(false)
  return (
    <>
      {turns.map((t, i) => {
        const lastAnswer = t.speaker === "aimy" && i === turns.length - 1
        const settled = t.status === "done" || t.status === "stopped"
        return (
          <Message
            key={t.id}
            speaker={t.speaker}
            status={t.status}
            author={t.author}
            thinkingLabel={["Reading your contacts", "Checking the last call for each", "Composing the answer"]}
            after={
              t.speaker === "aimy" && settled ? (
                <>
                  <ResponseActions
                    text={t.text}
                    onRetry={() => onAsk(turns[i - 1]?.text ?? "")}
                    sources={3}
                    sourcesOpen={sources}
                    onSourcesChange={setSources}
                    rating={rating}
                    onRate={setRating}
                  />
                  {t.status === "done" ? <Reasoning steps={STEPS} /> : null}
                  {lastAnswer && t.status === "done" ? (
                    <Suggestions
                      variant="follow"
                      items={["Draft the reply to Dana", "When does Youssef usually answer?"]}
                      onPick={onAsk}
                    />
                  ) : null}
                </>
              ) : null
            }
          >
            {t.speaker === "aimy" ? <StreamingText text={t.text} streaming={t.status === "streaming"} /> : t.text}
          </Message>
        )
      })}
    </>
  )
}

export function ComposerDemo() {
  const [busy, setBusy] = useState(false)
  const [files, setFiles] = useState<Attachment[]>([])
  const timer = useRef<number | undefined>(undefined)
  const go = (q: string) => {
    setBusy(true)
    toast(`Asked: ${q}`)
    timer.current = window.setTimeout(() => setBusy(false), 6000)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <div className="flex flex-col gap-6">
      <Composer
        onSubmit={go}
        generating={busy}
        onStop={() => {
          window.clearTimeout(timer.current)
          setBusy(false)
          toast("Stopped", { sub: "What was written stays." })
        }}
        badge={2}
        onVoice={() => toast("Opens Voice mode", { sub: "See the Voice mode page" })}
      />
      <Composer
        variant="canvas"
        onSubmit={go}
        generating={busy}
        onStop={() => setBusy(false)}
        attachments={files}
        onAttach={(f) =>
          setFiles((fs) => [
            ...fs,
            {
              id: f.name,
              name: f.name,
              note: `${Math.ceil(f.size / 1024)} KB, not uploaded`,
            },
          ])
        }
        onRemoveAttachment={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))}
      />
      <Button className="self-start" onClick={() => setBusy((b) => !b)}>
        {busy ? "Stop the beam" : "Show the beam"}
      </Button>
    </div>
  )
}

export function MessageDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Message speaker="user" author={{ name: "Engy Hassan" }}>
        Who is due today?
      </Message>
      <Message speaker="aimy">
        Three contacts are due today. Dana at Kestrel Logistics asked for pricing, and a reply is drafted.
      </Message>
      <Message speaker="aimy" status="thinking" thinkingLabel="Reading the record…" />
      <Message speaker="aimy" status="stopped">
        Youssef Amin asked for a call after 3pm. His last
      </Message>
    </div>
  )
}

export function StreamDemo() {
  const { turns, ask, reset } = useFakeAnswer()
  const last = turns.at(-1)
  return (
    <div className="flex flex-col gap-4">
      <Button
        className="self-start"
        onClick={() => {
          reset()
          ask("Who is due today?")
        }}
      >
        Stream an answer
      </Button>
      <div className="min-h-[7.5rem] text-body text-ink">
        {last?.status === "thinking" ? (
          <ThinkingIndicator label="Composing the answer" variant="bare" />
        ) : (
          <StreamingText text={last?.text ?? ""} streaming={last?.status === "streaming"} />
        )}
      </div>
    </div>
  )
}

export function ThinkingDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ThinkingIndicator label={["Searching the corpus", "Reading 3 documents", "Checking them against each other"]} />
      <ThinkingIndicator label="Reading the record…" />
      <ThinkingIndicator label="Reading what was said with Dana…" variant="bare" />
    </div>
  )
}

export function ResponseActionsDemo() {
  const [open, setOpen] = useState(false)
  return (
    <Message
      speaker="aimy"
      after={
        <ResponseActions
          text={ANSWER}
          onRetry={() => toast("Asked again")}
          sources={3}
          sourcesOpen={open}
          onSourcesChange={setOpen}
        />
      }
    >
      {ANSWER}
    </Message>
  )
}

export function SuggestionsDemo() {
  const [key, setKey] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <Suggestions
        key={key}
        items={[
          "How many are left to call?",
          "Who is due today?",
          "What happened yesterday?",
          "When do people actually answer?",
        ]}
        onPick={(q) => toast(`Asked: ${q}`)}
      />
      <Suggestions
        variant="follow"
        items={["Draft the reply to Dana", "When does Youssef usually answer?"]}
        onPick={(q) => toast(`Asked: ${q}`)}
      />
      <Button size="sm" className="self-start" onClick={() => setKey((k) => k + 1)}>
        Play the entrance again
      </Button>
    </div>
  )
}

export function ReasoningDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Reasoning steps={STEPS} defaultOpen />
      <Reasoning
        summary="Why AiMY wrote it this way"
        steps={[
          {
            what: "Kept it to three lines",
            why: "Dana's own emails are short.",
          },
          { what: "Named the annual plan", why: "It was her question." },
        ]}
      />
    </div>
  )
}

export function CanvasDemo() {
  const { turns, busy, ask, stop } = useFakeAnswer()
  return (
    <Canvas
      trigger={<Button variant="brand">Open the canvas</Button>}
      basis={["Kestrel Logistics", "Contact", "Spring campaign"]}
      chats={
        <nav className="flex flex-col gap-1 text-xs">
          {["Who is due today?", "Pricing for Kestrel", "Calls that went to voicemail"].map((c) => (
            <button
              key={c}
              type="button"
              className="rounded-md px-2 py-1.5 text-left text-ink-secondary hover:bg-w05 hover:text-ink"
            >
              {c}
            </button>
          ))}
        </nav>
      }
      composer={<Composer variant="canvas" onSubmit={ask} generating={busy} onStop={stop} />}
    >
      {turns.length ? (
        <Thread turns={turns} onAsk={ask} />
      ) : (
        <Suggestions
          items={["How many are left to call?", "Who is due today?", "What happened yesterday?"]}
          onPick={ask}
          className="mt-auto"
        />
      )}
    </Canvas>
  )
}
