"use client"

import { useEffect, useRef, useState } from "react"
import { useVoiceSession, type VoicePhase } from "@/registry/aimy/hooks/use-voice"
import { Button } from "@/registry/aimy/ui/button"
import { Composer } from "@/registry/aimy/ui/composer"
import {
  NOTE_STEPS,
  NoteTaker,
  NoteTakerConsent,
  type MeetingSummary,
  type NoteItem,
  type NotePhase,
  type NoteStep,
  type NoteView,
} from "@/registry/aimy/ui/note-taker"
import { Orb } from "@/registry/aimy/ui/orb"
import { toast } from "@/registry/aimy/ui/toast"
import { VoiceStage } from "@/registry/aimy/ui/voice-stage"

const PHASES: VoicePhase[] = ["connecting", "listening", "thinking", "speaking", "muted", "error"]

export function OrbDemo() {
  const [level, setLevel] = useState(0)
  // A voice that rises and falls, so listening shows what your voice does.
  useEffect(() => {
    const t = window.setInterval(() => setLevel(0.25 + 0.5 * Math.abs(Math.sin(Date.now() / 700))), 140)
    return () => window.clearInterval(t)
  }, [])
  return (
    <div className="grid grid-cols-3 gap-4">
      {PHASES.map((p) => (
        <figure key={p} className="flex flex-col items-center gap-1">
          <div className="size-36">
            <Orb phase={p} level={p === "listening" ? level : 0} />
          </div>
          <figcaption className="text-xs font-semibold text-ink-secondary">{p}</figcaption>
        </figure>
      ))}
    </div>
  )
}

const ANSWER =
  "Two contacts are due today. Youssef Amin asked for a call after 3pm, and Dana Whitfield is waiting on the pricing reply, which is drafted."

/** A live session: the real microphone, speech recognition and speech. */
export function VoiceLiveDemo() {
  const v = useVoiceSession({ ask: () => new Promise((r) => window.setTimeout(() => r(ANSWER), 1200)) })
  return (
    <div className="flex flex-col gap-4">
      <Composer onSubmit={(q) => toast(`Asked: ${q}`)} onVoice={v.start} />
      <p className="text-xs text-ink-secondary">
        With the box empty, the round button starts a voice session. Your browser asks for the microphone first. Type
        something and it is send again; the mic beside it dictates into the box.
      </p>
      <VoiceStage
        open={v.active}
        phase={v.phase}
        heard={v.heard}
        error={v.error}
        level={v.level}
        seconds={v.seconds}
        onEnd={v.end}
        onMute={v.toggleMute}
        onInterrupt={v.interrupt}
      />
    </div>
  )
}

const HEARD: Partial<Record<VoicePhase, string>> = {
  listening: "which of my contacts are due today",
  thinking: "Which of my contacts are due today?",
}

/** Each state of the stage, without a microphone. */
export function VoiceStatesDemo() {
  const [open, setOpen] = useState<VoicePhase | null>(null)
  const [muted, setMuted] = useState(false)
  const phase = open === "listening" && muted ? "muted" : open
  return (
    <div className="flex flex-wrap gap-2">
      {PHASES.map((p) => (
        <Button
          key={p}
          size="sm"
          onClick={() => {
            setMuted(p === "muted")
            setOpen(p === "muted" ? "listening" : p)
          }}
        >
          {p === "error" ? "Microphone blocked" : p[0]!.toUpperCase() + p.slice(1)}
        </Button>
      ))}
      <VoiceStage
        open={!!phase}
        phase={phase ?? "listening"}
        heard={phase === "speaking" ? "Tap the circle to interrupt" : (HEARD[phase ?? "listening"] ?? "")}
        error="The microphone is blocked. Allow it from the address bar, then try again."
        level={phase === "listening" ? 0.4 : 0}
        seconds={42}
        onEnd={() => setOpen(null)}
        onMute={() => setMuted((m) => !m)}
        onInterrupt={() => setOpen("listening")}
        onTakeNotes={() => toast("Opens the note taker's consent", { sub: "See Note taker" })}
      />
    </div>
  )
}

/* ── The meeting, as Knowledge's fixture plays it ───────────────────────── */
const MEETING = "Upland weekly check-in"
const LINES = [
  "Got it. So about half of last week’s tickets never came into AiMY.",
  "Right, the merge tag rule. It skips merged tickets, which is correct, but it catches the parent ticket too.",
  "We can split it: skip the merged ticket, keep the parent. I can have that ready by Thursday.",
  "Yes, once the rule is split I’ll re-sync the last two weeks. That’s about two thousand tickets, under an hour.",
  "On the focus fields, Product is mapped already. Plan isn’t, because Freshdesk sends it as a code.",
  "I need the labels for those codes. Priya, could you send me the list?",
  "Six plans and two retired. Thanks, I’ll map the four live ones.",
]
const AT = [48, 96, 151, 205, 318, 352, 401]
const SUMMARY: MeetingSummary = {
  text: "The Freshdesk sync dropped parent tickets because the merge tag rule matched them too. The rule gets split by Thursday, then 14 days are re-synced. Plan needs labels before it can be a focus field, and Upland wants a value note before the November renewal.",
  decided: [
    "Split the merge tag rule: skip merged tickets, keep the parent.",
    "Re-sync the last 14 days once the rule is split.",
    "Next check-in Tuesday 27 Oct, same time.",
  ],
  todos: [
    { text: "Split the merge tag rule", when: "Thursday 22 Oct" },
    { text: "Re-sync the last 14 days", when: "Friday 23 Oct, after the split" },
    { text: "Map the four live Plan codes", when: "When the Plan labels arrive" },
  ],
}

const SUBS = (said: number, noted: number, secs: number) => [
  `${Math.floor(secs / 60)} min ${secs % 60} s, ${said} things you said`,
  `${noted ? `With your ${noted} ${noted === 1 ? "note" : "notes"}: ` : ""}3 decisions, 3 to-dos for you, 1 thing you’re waiting on`,
  "Posted below and in Notes",
]

type Jump = "live-fold" | "live-card" | "writing" | "ready" | "short" | "failed"

function useMeeting() {
  const [phase, setPhase] = useState<NotePhase | null>(null)
  const [view, setView] = useState<NoteView>("fold")
  const [items, setItems] = useState<NoteItem[]>([])
  const [steps, setSteps] = useState<NoteStep[]>([])
  const [secs, setSecs] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [endedBy, setEndedBy] = useState<"you" | "calendar">("you")
  const [mount, setMount] = useState(0)
  const t = useRef<number[]>([])
  const n = useRef(0)
  const now = useRef({ secs: 0, items: [] as NoteItem[] })
  useEffect(() => {
    now.current = { secs, items }
  })
  const clear = () => {
    t.current.forEach(window.clearTimeout)
    t.current = []
  }
  const later = (fn: () => void, ms: number) => t.current.push(window.setTimeout(fn, ms))

  useEffect(() => {
    if (phase !== "live") return
    const i = window.setInterval(() => setSecs((s) => s + 1), 1000)
    return () => window.clearInterval(i)
  }, [phase])
  useEffect(() => clear, [])

  const say = (k: number) => {
    if (k >= LINES.length) return
    later(
      () => {
        n.current = k + 1
        setSpeaking(true)
        setItems((its) => [...its, { type: "line", id: `l${k}`, at: now.current.secs, text: LINES[k]! }])
        later(() => setSpeaking(false), LINES[k]!.split(" ").length * 150 + 300)
        say(k + 1)
      },
      k === 0 ? 1500 : LINES[k - 1]!.split(" ").length * 150 + 1300
    )
  }

  const runSteps = (fail: boolean, said: number, noted: number, at: number) => {
    const subs = SUBS(said, noted, at)
    const base = NOTE_STEPS.map((s, i) => ({
      ...s,
      sub: subs[i],
      state: (i === 0 ? "run" : "wait") as NoteStep["state"],
    }))
    setSteps(base)
    const step = (i: number) =>
      later(() => {
        if (fail && i === 2) {
          setSteps((ss) => ss.map((s, j) => (j === 2 ? { ...s, state: "fail" } : s)))
          setPhase("failed")
          setItems((its) => [...its, { type: "fail", id: "fail" }])
          return
        }
        setSteps((ss) =>
          ss.map((s, j) => (j === i ? { ...s, state: "done" } : j === i + 1 ? { ...s, state: "run" } : s))
        )
        if (i < 2) step(i + 1)
        else {
          setPhase("ready")
          setItems((its) => [...its, { type: "result", id: "result" }])
        }
      }, 2600)
    step(0)
  }

  const end = (by: "you" | "calendar", fail = false) => {
    clear()
    setSpeaking(false)
    setEndedBy(by)
    setView("card")
    const { secs: at, items: its } = now.current
    if (at < 30) {
      setPhase("short")
      setItems([...its, { type: "short", id: "short" }])
      return
    }
    setPhase("writing")
    runSteps(fail, its.filter((i) => i.type === "line").length, its.filter((i) => i.type === "mine").length, at)
    setItems([...its, { type: "steps", id: "steps" }])
  }

  const jump = (j: Jump | "start") => {
    clear()
    setMount((m) => m + 1)
    const said = j === "start" || j === "short" ? 0 : j.startsWith("live") ? 4 : LINES.length
    n.current = said
    const its: NoteItem[] = LINES.slice(0, said).map((x, i) => ({ type: "line", id: `l${i}`, at: AT[i]!, text: x }))
    if (said > 2)
      its.splice(2, 0, {
        type: "mine",
        id: "m1",
        at: 128,
        text: "Dana: agents noticed the parent tickets were missing",
      })
    if (j === "short") its.push({ type: "line", id: "l0", at: 12, text: LINES[0]! })
    setItems(its)
    setSecs(j === "short" ? 22 : said ? AT[said - 1]! + 10 : 0)
    setSteps([])
    setPhase("live")
    setView(j === "live-fold" || j === "start" ? "fold" : "card")
    if (j === "start" || j.startsWith("live")) say(said)
    if (j === "writing" || j === "ready") later(() => end("calendar"), 50)
    if (j === "failed") later(() => end("calendar", true), 50)
    if (j === "short") later(() => end("you"), 50)
  }

  const send = (text: string, tab: "chat" | "notes") => {
    const id = String(Date.now())
    if (tab === "notes") setItems((its) => [...its, { type: "mine", id, at: secs, text }])
    else
      setItems((its) => [
        ...its,
        {
          type: "ask",
          id,
          question: text,
          answer:
            n.current > 2
              ? "From what you said: the merge tag rule drops parent tickets. You’ll split it by Thursday, then re-sync the last 14 days."
              : "You haven’t said much yet. So far it’s about tickets missing from the Freshdesk sync.",
        },
      ])
  }

  const retry = () => {
    setItems((its) => its.filter((i) => i.type !== "fail"))
    setPhase("writing")
    setSteps((ss) => ss.map((s, j) => (j === 2 ? { ...s, state: "run" } : s)))
    later(() => {
      setSteps((ss) => ss.map((s) => ({ ...s, state: "done" })))
      setPhase("ready")
      setItems((its) => [...its, { type: "result", id: "result" }])
    }, 2600)
  }

  return {
    phase,
    view,
    setView,
    items,
    steps,
    secs,
    speaking,
    endedBy,
    mount,
    jump,
    end,
    send,
    retry,
    off: () => {
      clear()
      setPhase(null)
    },
  }
}

export function NoteTakerDemo() {
  const m = useMeeting()
  const [stage, setStage] = useState<"off" | "voice" | "asking">("off")
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="brand" size="sm" onClick={() => setStage("voice")}>
          Start from a voice session
        </Button>
        {(
          [
            ["live-fold", "Taking notes, folded"],
            ["live-card", "Taking notes, open"],
            ["writing", "Writing the notes"],
            ["ready", "Notes ready"],
            ["short", "Too short"],
            ["failed", "Notes not written"],
          ] as [Jump, string][]
        ).map(([j, label]) => (
          <Button key={j} size="sm" onClick={() => m.jump(j)}>
            {label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-ink-secondary">
        The orb sits in the bottom right of the window. Drag it; press it to open the card.
      </p>
      <VoiceStage
        open={stage !== "off"}
        phase="listening"
        heard=""
        seconds={8}
        onEnd={() => setStage("off")}
        onTakeNotes={() => setStage("asking")}
        asking={
          stage === "asking" ? (
            <NoteTakerConsent
              meeting={MEETING}
              onNotNow={() => setStage("voice")}
              onStart={() => {
                setStage("off")
                m.jump("start")
                toast("AiMY is taking notes", { sub: "It hears only you. Let the others know it is on." })
              }}
            />
          ) : undefined
        }
      />
      {m.phase ? (
        <NoteTaker
          key={m.mount}
          meeting={MEETING}
          phase={m.phase}
          view={m.view}
          onViewChange={m.setView}
          seconds={m.secs}
          speaking={m.speaking}
          endedBy={m.endedBy}
          items={m.items}
          steps={m.steps}
          summary={SUMMARY}
          onSend={m.send}
          onEnd={() => m.end("you")}
          onRetry={m.retry}
          onClose={() => {
            m.off()
            toast("Meeting notes closed", { sub: "They are under the bell, and in the canvas under Today" })
          }}
          onOpenDocument={() =>
            toast("Saved as a Meeting notes document", { sub: "Linked to Upland, with the full transcript" })
          }
          onMakeTasks={() => toast("3 tasks made", { sub: "Each with its date", onUndo: () => {} })}
        />
      ) : null}
    </div>
  )
}
