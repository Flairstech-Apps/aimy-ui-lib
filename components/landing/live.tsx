"use client"

import { RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { CodeBlock } from "@/components/docs/page"
import type { VoicePhase } from "@/registry/aimy/hooks/use-voice"
import type { Source } from "@/registry/aimy/lib/ai-types"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { AgentSteps, type AgentStep } from "@/registry/aimy/ui/agent-steps"
import { Button } from "@/registry/aimy/ui/button"
import { Citation } from "@/registry/aimy/ui/citation"
import { Composer } from "@/registry/aimy/ui/composer"
import { SourceList } from "@/registry/aimy/ui/source-list"
import { Message } from "@/registry/aimy/ui/message"
import { Orb } from "@/registry/aimy/ui/orb"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { Suggestion } from "@/registry/aimy/ui/suggestion"
import { ThinkingIndicator } from "@/registry/aimy/ui/thinking"

/** True while the element is on screen, so canvases and loops rest when it is not. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, inView] as const
}

const ASKED = "Who needs a call back today?"
const ANSWERS: [RegExp, string][] = [
  [
    /meet|diary|calendar/i,
    "Three meetings today. The 2pm with Northwind Freight is the one to prepare for: they asked about the annual price last time.",
  ],
  [
    /price|pricing|quote/i,
    "Quote the annual plan per seat and for the year, never per month. Above 100 seats, the account owner can agree up to 10%.",
  ],
]
const DEFAULT_ANSWER =
  "Two contacts are due today. Youssef Amin asked for a call after 3pm, and Dana Whitfield is waiting on the pricing reply, which is drafted."

const PHASE_WORDS: Record<VoicePhase, string> = {
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  muted: "Muted",
  error: "Something went wrong",
}

/** The hero's voice panel: ask, and the orb thinks, then speaks while the answer streams in. */
export function VoicePanel() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [phase, setPhase] = useState<VoicePhase>("listening")
  const [level, setLevel] = useState(0)
  const [question, setQuestion] = useState("")
  const [shown, setShown] = useState("")
  const timers = useRef<number[]>([])
  const played = useRef(false)

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

  const ask = useCallback((q: string) => {
    clear()
    const answer = ANSWERS.find(([re]) => re.test(q))?.[1] ?? DEFAULT_ANSWER
    setQuestion(q)
    setShown("")
    setPhase("thinking")
    const words = answer.split(" ")
    later(1600, () => {
      setPhase("speaking")
      words.forEach((_, i) => later(i * 70, () => setShown(words.slice(0, i + 1).join(" "))))
      later(words.length * 70 + 900, () => setPhase("listening"))
    })
  }, [])

  // Plays once, the first time the panel comes into view.
  useEffect(() => {
    if (!inView || played.current) return
    played.current = true
    const t = window.setTimeout(() => ask(ASKED), 900)
    return () => window.clearTimeout(t)
  }, [inView, ask])

  // A voice that rises and falls while the orb listens.
  useEffect(() => {
    if (!inView || phase !== "listening") return
    const t = window.setInterval(() => setLevel(0.15 + 0.35 * Math.abs(Math.sin(Date.now() / 650))), 140)
    return () => window.clearInterval(t)
  }, [inView, phase])

  useEffect(() => () => clear(), [])

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center gap-5 rounded-2xl border border-hairline bg-card/70 p-6 shadow-lg backdrop-blur-md phone:p-8"
    >
      <div className="size-56 phone:size-64">
        <Orb phase={phase} level={phase === "listening" ? level : 0} running={inView} />
      </div>
      <p aria-live="polite" className="text-xs font-semibold text-ink-secondary">
        {PHASE_WORDS[phase]}
      </p>
      <div className="flex min-h-[7.5rem] w-full flex-col gap-2">
        {question ? <p className="text-meta text-ink-secondary">You asked: {question}</p> : null}
        {phase === "thinking" ? (
          <ThinkingIndicator label={["Reading your contacts", "Checking the diary"]} variant="bare" />
        ) : shown ? (
          <StreamingText text={shown} streaming={phase === "speaking"} className="text-body text-ink" />
        ) : (
          <p className="text-body text-ink-secondary">Ask about your day, your contacts or a price.</p>
        )}
      </div>
      <Composer
        className="w-full"
        placeholder="Ask AiMY"
        dictate={false}
        generating={phase === "thinking" || phase === "speaking"}
        onStop={() => {
          clear()
          setPhase("listening")
        }}
        onSubmit={(q) => ask(q.trim() || ASKED)}
        onVoice={() => {
          clear()
          setQuestion("")
          setShown("")
          setPhase("listening")
          later(2400, () => ask(ASKED))
        }}
      />
    </div>
  )
}

/** A short exchange: a question, and AiMY answering in the thread. */
export function ConversationCard() {
  return (
    <div className="flex flex-col gap-4">
      <Message speaker="user" author={{ name: "Engy Hassan" }}>
        Is Dana Whitfield ready for the pricing call?
      </Message>
      <Message speaker="aimy">
        Mostly. She has the annual quote, but not the 100-seat discount. I drafted that part for you to check.
      </Message>
    </div>
  )
}

const RUN: { label: string; secs: number; result?: string }[] = [
  { label: "Reading what you asked for", secs: 0.9 },
  { label: "Finding logistics firms in Leeds", secs: 1.6, result: "42 came back" },
  { label: "Checking them against your contacts", secs: 1.2, result: "6 you already have" },
  { label: "Putting the list together", secs: 1.0 },
]
const ENDS = RUN.map((_, i) => RUN.slice(0, i + 1).reduce((t, r) => t + r.secs, 0))
const TOTAL = ENDS[ENDS.length - 1] ?? 0

/** Agent steps running live, again every few seconds while on screen. */
export function AgentLoop() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = performance.now()
    const t = window.setInterval(() => {
      const s = (performance.now() - start) / 1000
      if (s > TOTAL + 3) start = performance.now()
      setElapsed(Math.min(s, TOTAL))
    }, 100)
    return () => window.clearInterval(t)
  }, [inView])
  const steps: AgentStep[] = RUN.map((r, i) => ({
    label: r.label,
    result: r.result,
    state: elapsed >= ENDS[i]! ? "done" : elapsed >= ENDS[i]! - r.secs ? "live" : "wait",
  }))
  return (
    <div ref={ref}>
      <AgentSteps
        live={elapsed < TOTAL}
        title="Building “Leeds logistics”"
        doneTitle="Built"
        seconds={elapsed}
        steps={steps}
      />
    </div>
  )
}

const S1: Source = {
  id: "s1",
  title: "Refunds on annual plans",
  status: "current",
  type: "Policy",
  connector: "Confluence",
  passage: "Customers on an annual plan can ask for a refund within 30 days of renewal.",
}
const S2: Source = {
  id: "s2",
  title: "Billing FAQ",
  status: "current",
  type: "Article",
  connector: "Zendesk",
  passage: "Any support lead can approve a refund under £500.",
}

/** An answer that shows where each claim came from. */
export function GroundedCard() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-ink">
        Yes, within 30 days of renewal
        <Citation n={1} source={S1} onFlag={() => {}} />. A support lead can approve it under £500
        <Citation n={2} source={S2} onFlag={() => {}} />.
      </p>
      <SourceList sources={[S1, S2]} />
    </div>
  )
}

/** AiMY proposes; a person accepts, edits or rejects; an accepted change keeps its Undo. */
export function LiveProposal() {
  const [round, setRound] = useState(0)
  const [open, setOpen] = useState(true)
  // Suggestion says Applied or Rejected in its own toast; Applied carries the Undo.
  return open ? (
    <Suggestion
      key={round}
      title="Make the per-seat rule plainer"
      before="Quote it per seat and for the year, never per month."
      after="Give the price per seat for the year. Don't give a monthly figure."
      onAccept={() => setOpen(false)}
      onReject={() => setOpen(false)}
      onUndo={() => setOpen(true)}
    />
  ) : (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-hairline p-6">
      <p className="text-body text-ink">Done. An accepted change keeps its Undo in the toast.</p>
      <Button
        onClick={() => {
          setRound((r) => r + 1)
          setOpen(true)
        }}
      >
        <RotateCcw aria-hidden="true" />
        Show the proposal again
      </Button>
    </div>
  )
}

const WAYS = {
  copy: {
    code: 'npx shadcn@latest add @aimy/button\n\n<Button variant="brand">Prepare me for it</Button>',
    words: "Copy components into an app on Tailwind v4. The code is yours to change.",
  },
  package: {
    code: 'npm install @flairstech-aimy/ui\n\nimport { Button } from "@flairstech-aimy/ui"\nimport "@flairstech-aimy/ui/styles.css"',
    words: "Import the compiled package in any React app. Versioned, so you choose when to upgrade.",
  },
  tokens: {
    code: '@import "@flairstech-aimy/tokens";\n\n.cta { background: var(--brand); }',
    words: "Take only the colours, type, spacing and motion, as CSS variables, in any page.",
  },
} as const

/** The live result beside its code, for each way in. */
export function Ways() {
  const [way, setWay] = useState<keyof typeof WAYS>("copy")
  return (
    <div className="grid overflow-hidden rounded-2xl border border-hairline column:grid-cols-2">
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 bg-body p-8">
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="brand">
            <AimyMark title="" />
            Prepare me for it
          </Button>
          <Button>Snooze a week</Button>
        </div>
        <Button variant="accent">
          <AimyMark title="" />
          Fill them in
        </Button>
      </div>
      <div data-theme="dark" className="flex min-w-0 flex-col gap-4 border-hairline bg-code p-6 column:border-l">
        <Segmented
          label="Way in"
          value={way}
          onValueChange={(v) => setWay(v as keyof typeof WAYS)}
          options={[
            { value: "copy", label: "Copy components" },
            { value: "package", label: "Package" },
            { value: "tokens", label: "Tokens" },
          ]}
        />
        <p className="text-meta text-ink-secondary">{WAYS[way].words}</p>
        <CodeBlock key={way}>{WAYS[way].code}</CodeBlock>
      </div>
    </div>
  )
}
