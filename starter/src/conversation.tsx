import { useEffect, useRef, useState } from "react"
import { Canvas } from "@/components/canvas"
import { Composer } from "@/components/composer"
import { Message } from "@/components/message"
import { ResponseActions } from "@/components/response-actions"
import { StreamingText } from "@/components/streaming-text"
import { Suggestions } from "@/components/suggestions"
import type { Basis, Rating, Turn } from "@/lib/ai-types"

// The Briefing to Canvas wiring: ask from the float bar, and the AiMY Canvas
// opens over the page with the thread. `answer` is a stand-in that streams a
// fixed sentence; replace it with your product's stream (SignalR, the Vercel
// AI SDK, fetch with a reader) mapped to the same Turn shape.
async function* answer(question: string) {
  const text = `This is where your product's answer to “${question}” streams in. Replace answer() in src/conversation.tsx with your backend.`
  const words = text.split(" ")
  await new Promise((r) => setTimeout(r, 1200))
  for (let n = 3; n < words.length + 3; n += 3) {
    yield words.slice(0, n).join(" ")
    await new Promise((r) => setTimeout(r, 120))
  }
}

export function useConversation() {
  const [turns, setTurns] = useState<Turn[]>([])
  const stopped = useRef(false)
  const busy = turns.at(-1)?.status === "thinking" || turns.at(-1)?.status === "streaming"
  const patchLast = (p: Partial<Turn>) => setTurns((ts) => ts.map((t, i) => (i === ts.length - 1 ? { ...t, ...p } : t)))

  const ask = async (q: string) => {
    stopped.current = false
    const id = String(Date.now())
    setTurns((ts) => [
      ...ts,
      { id: `${id}-q`, speaker: "user", text: q },
      { id: `${id}-a`, speaker: "aimy", text: "", status: "thinking" },
    ])
    let last = ""
    for await (const so of answer(q)) {
      if (stopped.current) return
      last = so
      patchLast({ text: so, status: "streaming" })
    }
    patchLast({ text: last, status: "done" })
  }

  const stop = () => {
    stopped.current = true
    setTurns((ts) =>
      ts.flatMap((t, i) => {
        if (i !== ts.length - 1) return [t]
        if (t.status === "thinking") return []
        return [{ ...t, status: "stopped" as const }]
      })
    )
  }

  useEffect(
    () => () => {
      stopped.current = true
    },
    []
  )
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
      composer={<Composer variant="canvas" onSubmit={ask} generating={busy} onStop={stop} />}
    >
      {turns.length === 0 ? (
        <Suggestions className="mt-auto" items={["What needs me today?", "What changed this week?"]} onPick={ask} />
      ) : (
        turns.map((t, i) => {
          const settled = t.status === "done" || t.status === "stopped"
          return (
            <Message
              key={t.id}
              speaker={t.speaker}
              status={t.status}
              author={{ name: me }}
              thinkingLabel={["Reading", "Composing the answer"]}
              after={
                t.speaker === "aimy" && settled ? (
                  <ResponseActions
                    text={t.text}
                    onRetry={() => ask(turns[i - 1]?.text ?? "")}
                    rating={i === turns.length - 1 ? rating : null}
                    onRate={setRating}
                  />
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
