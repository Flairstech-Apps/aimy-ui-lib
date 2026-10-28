import { useEffect, useRef, useState } from "react"
import { Canvas } from "@/components/canvas"
import { Composer } from "@/components/composer"
import { Message } from "@/components/message"
import { Reasoning } from "@/components/reasoning"
import { ResponseActions } from "@/components/response-actions"
import { StreamingText } from "@/components/streaming-text"
import { Suggestions } from "@/components/suggestions"
import type { Basis, Rating, Turn } from "@/lib/ai-types"

// The demo's conversation: AiMY thinks, then streams a canned answer. A real
// product maps its stream (SignalR here, or the Vercel AI SDK) to the same
// Turn shape and hands it to the same components.
const ANSWERS: Record<string, string> = {
  draft:
    "Here is the reply to Dana. Hi Dana, thanks for asking about the annual plan. For 140 people it comes to £18,400 a year, with the first month free. I can take you through it on a call this week if that helps. Best, Engy",
  due: "Two contacts are due today. Youssef Amin at Harbour Foods asked for a call after 3pm. Dana Whitfield at Kestrel Logistics is waiting on the pricing reply, which is drafted.",
}

const answerFor = (q: string) => (/draft|reply|dana/i.test(q) ? ANSWERS.draft! : ANSWERS.due!)

export function useConversation() {
  const [turns, setTurns] = useState<Turn[]>([])
  const timer = useRef<number | undefined>(undefined)
  const busy = turns.at(-1)?.status === "thinking" || turns.at(-1)?.status === "streaming"

  const patchLast = (p: Partial<Turn>) => setTurns((ts) => ts.map((t, i) => (i === ts.length - 1 ? { ...t, ...p } : t)))

  const ask = (q: string) => {
    window.clearInterval(timer.current)
    const id = String(Date.now())
    setTurns((ts) => [
      ...ts,
      { id: `${id}-q`, speaker: "user", text: q },
      { id: `${id}-a`, speaker: "aimy", text: "", status: "thinking" },
    ])
    const words = answerFor(q).split(" ")
    let n = 0
    window.setTimeout(() => {
      timer.current = window.setInterval(() => {
        n += 3
        patchLast({ text: words.slice(0, n).join(" "), status: n >= words.length ? "done" : "streaming" })
        if (n >= words.length) window.clearInterval(timer.current)
      }, 180)
    }, 2400)
  }

  const stop = () => {
    window.clearInterval(timer.current)
    setTurns((ts) =>
      ts.flatMap((t, i) => {
        if (i !== ts.length - 1) return [t]
        if (t.status === "thinking") return []
        return [{ ...t, status: "stopped" as const }]
      })
    )
  }

  useEffect(() => () => window.clearInterval(timer.current), [])
  return { turns, busy, ask, stop }
}

type AimyCanvasProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  basis: Basis
  me: string
  conversation: ReturnType<typeof useConversation>
}

export function AimyCanvas({ open, onOpenChange, basis, me, conversation }: AimyCanvasProps) {
  const { turns, busy, ask, stop } = conversation
  const [rating, setRating] = useState<Rating>(null)
  return (
    <Canvas
      open={open}
      onOpenChange={onOpenChange}
      basis={basis}
      chats={
        <nav aria-label="Earlier chats" className="flex flex-col gap-1 text-xs">
          {["Who is due today?", "Pricing for Kestrel", "Calls that went to voicemail"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => ask(c)}
              className="rounded-md px-2 py-1.5 text-left text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w05 hover:text-ink"
            >
              {c}
            </button>
          ))}
        </nav>
      }
      composer={<Composer variant="canvas" onSubmit={ask} generating={busy} onStop={stop} />}
    >
      {turns.length === 0 ? (
        <Suggestions
          className="mt-auto"
          items={["Who is due today?", "Draft the reply to Dana", "When do people actually answer?"]}
          onPick={ask}
        />
      ) : (
        turns.map((t, i) => {
          const settled = t.status === "done" || t.status === "stopped"
          const last = i === turns.length - 1
          return (
            <Message
              key={t.id}
              speaker={t.speaker}
              status={t.status}
              author={{ name: me }}
              thinkingLabel={["Reading your contacts", "Checking the last call for each", "Composing the answer"]}
              after={
                t.speaker === "aimy" && settled ? (
                  <>
                    <ResponseActions
                      text={t.text}
                      onRetry={() => ask(turns[i - 1]?.text ?? "")}
                      sources={2}
                      rating={last ? rating : null}
                      onRate={setRating}
                    />
                    {t.status === "done" ? (
                      <Reasoning
                        steps={[
                          {
                            what: "Read your contacts due today",
                            why: "You asked about today, so AiMY started there.",
                          },
                          {
                            what: "Checked the last call and email for each",
                            why: "A contact who already replied isn't due.",
                          },
                        ]}
                      />
                    ) : null}
                    {last && t.status === "done" ? (
                      <Suggestions
                        variant="follow"
                        items={["Draft the reply to Dana", "When does Youssef usually answer?"]}
                        onPick={ask}
                      />
                    ) : null}
                  </>
                ) : null
              }
            >
              {t.speaker === "aimy" ? <StreamingText text={t.text} streaming={t.status === "streaming"} /> : t.text}
            </Message>
          )
        })
      )}
    </Canvas>
  )
}
