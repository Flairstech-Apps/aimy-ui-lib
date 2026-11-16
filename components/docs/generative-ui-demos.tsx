"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { uiPrompt } from "@/lib/generative-ui"
import { Button } from "@/registry/aimy/ui/button"
import { AIMY_UI, GenerativeUI } from "@/registry/aimy/ui/generative-ui"
import { Message } from "@/registry/aimy/ui/message"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { toast } from "@/registry/aimy/ui/toast"

// Answers a model could give, as show_ui specs. The demo streams each one in
// a few characters at a time, the way a reply arrives.
const ANSWERS: Record<string, { ask: string; spec: unknown }> = {
  week: {
    ask: "How did my team do this week?",
    spec: {
      type: "Widget",
      props: { title: "Your team this week", icon: "chart", meta: "10 to 14 Nov" },
      children: [
        {
          type: "StatTiles",
          props: {
            items: [
              { label: "Calls", value: "214", sub: "31 more than a usual week", tone: "ok" },
              { label: "Meetings set", value: "9", sub: "3 short of the 12 the plan needs", tone: "warn" },
              { label: "Replies", value: "18%", sub: "Same as last week" },
            ],
          },
        },
        { type: "Trend", props: { title: "Meetings set per week", labels: ["W42", "W43", "W44", "W45", "W46"], values: [11, 13, 10, 12, 9], previous: [8, 9, 10, 9, 11], goal: { value: 12, label: "Plan" } } },
        { type: "Text", props: { text: "Calls are up but fewer turn into meetings: most of the gap is follow-ups after a first call." } },
        { type: "Actions", props: { buttons: [{ label: "See who needs a follow-up", action: "follow-ups", primary: true }] } },
      ],
    },
  },
  accounts: {
    ask: "Which accounts should I call first?",
    spec: {
      type: "Stack",
      props: {},
      children: [
        {
          type: "Ranked",
          props: {
            label: "Accounts to call first",
            items: [
              { id: "k", title: "Kestrel Logistics", details: "Renewal in 12 days", reason: "Opened the pricing page three times since Monday", match: 92 },
              { id: "a", title: "Atlas Energy", details: "Expansion, $18k", reason: "Asked for a call on Monday", match: 85 },
              { id: "h", title: "Harbor Health", details: "New, 3,100 people", reason: "Same size and sector as your last two wins", match: 71 },
            ],
          },
        },
        { type: "Actions", props: { buttons: [{ label: "Add all three to today", action: "plan-calls", primary: true }] } },
      ],
    },
  },
  pipeline: {
    ask: "Where is the pipeline against target?",
    spec: {
      type: "Columns",
      props: { count: 2 },
      children: [
        { type: "Widget", props: { title: "Q4 target", icon: "money" }, children: [{ type: "Target", props: { value: 412000, target: 600000, forecast: 548000, unit: "money" } }] },
        {
          type: "Widget",
          props: { title: "Open deals by stage", icon: "table" },
          children: [
            {
              type: "Donut",
              props: {
                label: "Open deals by stage",
                parts: [
                  { key: "new", label: "New", value: 14, tone: "neutral" },
                  { key: "qual", label: "Qualified", value: 9, tone: "accent" },
                  { key: "prop", label: "Proposal sent", value: 5, tone: "warn" },
                ],
                center: { value: "28", label: "open" },
              },
            },
          ],
        },
      ],
    },
  },
}

export function GenerativeUIDemo() {
  const [which, setWhich] = useState("week")
  const [text, setText] = useState("")
  const [done, setDone] = useState(false)
  const [problems, setProblems] = useState<string[]>([])
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const play = useCallback((key: string) => {
    clearInterval(timer.current)
    const full = JSON.stringify(ANSWERS[key]!.spec)
    let at = 0
    setDone(false)
    setText("")
    timer.current = setInterval(() => {
      at = Math.min(full.length, at + 9)
      setText(full.slice(0, at))
      if (at >= full.length) {
        clearInterval(timer.current)
        setDone(true)
      }
    }, 30)
  }, [])
  useEffect(() => {
    const start = setTimeout(() => play("week"), 0)
    return () => {
      clearTimeout(start)
      clearInterval(timer.current)
    }
  }, [play])

  const answer = ANSWERS[which]!
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Question"
          value={which}
          onValueChange={(v) => {
            setWhich(v)
            play(v)
          }}
          options={[
            { value: "week", label: "This week" },
            { value: "accounts", label: "Who to call" },
            { value: "pipeline", label: "Pipeline" },
          ]}
        />
        <Button size="sm" onClick={() => play(which)}>
          Stream it again
        </Button>
      </div>
      <Message speaker="user">{answer.ask}</Message>
      <Message speaker="aimy" status={done ? "done" : "streaming"}>
        <GenerativeUI stream={done ? undefined : text} spec={done ? text : undefined} onAction={(a) => toast(`The app would run “${a}” here`)} onProblems={setProblems} />
      </Message>
      <p className="text-xs text-ink-secondary">{done ? (problems.length ? `Left out: ${problems.join("; ")}` : "Every part checked against the catalogue: nothing left out.") : `${text.length} characters so far; each part draws when it is whole.`}</p>
    </div>
  )
}

export function PromptPreview() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button size="sm" onClick={() => setOpen(!open)}>
        {open ? "Hide the prompt" : "Show the prompt the model gets"}
      </Button>
      {open ? <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-raised p-3 font-mono text-2xs whitespace-pre-wrap text-ink-secondary">{uiPrompt(AIMY_UI)}</pre> : null}
    </div>
  )
}
