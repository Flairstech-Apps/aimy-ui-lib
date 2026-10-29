"use client"

import { useState } from "react"
import { AimyNote } from "@/registry/aimy/ui/aimy-note"
import { Button } from "@/registry/aimy/ui/button"
import { Canvas } from "@/registry/aimy/ui/canvas"
import { Diary, DiaryLoop, type DiaryEntry } from "@/registry/aimy/ui/diary"
import { NoteTaker, type MeetingSummary, type NoteItem, type NotePhase } from "@/registry/aimy/ui/note-taker"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { toast } from "@/registry/aimy/ui/toast"

const open = (what: string) => () => toast(`Opens ${what}`)

/* ── The Diary ────────────────────────────────────────────────────── */
const ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    date: "2026-10-28",
    time: "10:30",
    kind: "demo",
    who: "Dana Whitfield",
    what: "Pricing on the annual plan",
    set: "you",
    onOpen: open("Dana Whitfield"),
  },
  {
    id: "2",
    date: "2026-10-28",
    time: "15:00",
    kind: "callback",
    who: "Youssef Amin",
    what: "Asked for a call after 3pm",
    set: "aimy",
    onOpen: open("Youssef Amin"),
  },
  { id: "3", date: "2026-10-28", kind: "owed", who: "Harbour Foods", what: "Proposal due" },
  {
    id: "4",
    date: "2026-10-23",
    time: "11:00",
    kind: "held",
    who: "Peter Foster",
    what: "Signed the pilot",
    onOpen: open("Peter Foster"),
  },
  {
    id: "5",
    date: "2026-10-21",
    time: "19:30",
    kind: "dinner",
    who: "Northgate Health",
    what: "Dinner with the board",
  },
  {
    id: "6",
    date: "2026-10-14",
    time: "09:00",
    kind: "meeting",
    who: "Ashby Freight",
    what: "Quarterly review",
    onOpen: open("Ashby Freight"),
  },
  {
    id: "7",
    date: "2026-10-30",
    time: "10:00",
    kind: "meeting",
    who: "Kestrel Logistics",
    what: "Annual plan review",
    set: "you",
    onOpen: open("Kestrel Logistics"),
  },
  {
    id: "8",
    date: "2026-11-04",
    time: "14:00",
    kind: "demo",
    who: "Brightline Retail",
    what: "Second demo",
    set: "aimy",
  },
  { id: "9", date: "2026-11-12", kind: "owed", who: "Ashby Freight", what: "Renewal paper due" },
]

export function DiaryDemo() {
  return (
    <div className="flex flex-col gap-4">
      <AimyNote variant="quiet">
        We have sat down <b>6 times</b> since the year opened, the last of them on <b>23 October</b>. Next is{" "}
        <b>30 October</b>, the annual plan review with Kestrel Logistics.
      </AimyNote>
      <Diary
        today="2026-10-28"
        entries={ENTRIES}
        onAdd={() => toast("Add to the diary", { sub: "Tell AiMY who and when; it lands here" })}
        actions={
          <button type="button" className="b-cal-btn is-word" onClick={open("the call log")}>
            Call log <span className="b-cal-btn-n">3</span>
          </button>
        }
      />
      <DiaryLoop
        link={
          <Button size="sm" variant="text" onClick={open("all notes")}>
            Notes
          </Button>
        }
        note={
          <AimyNote variant="quiet">
            Two meetings happened with nothing written about them. A line each is enough.
          </AimyNote>
        }
        rows={[
          {
            id: "a",
            when: "Thu 23 Oct",
            who: "Peter Foster",
            what: "Signed the pilot",
            onClick: open("the note for Peter"),
          },
          {
            id: "b",
            when: "Tue 21 Oct",
            who: "Northgate Health",
            what: "Dinner with the board",
            onClick: open("the note for Northgate"),
          },
        ]}
      />
    </div>
  )
}

/* ── The note taker in the canvas ─────────────────────────────────── */
const LINES = [
  "Got it. So about half of last week’s tickets never came into AiMY.",
  "Right, the merge tag rule. It skips merged tickets, which is correct, but it catches the parent ticket too.",
  "We can split it: skip the merged ticket, keep the parent. I can have that ready by Thursday.",
  "Yes, once the rule is split I’ll re-sync the last two weeks. That’s about two thousand tickets, under an hour.",
]
const LIVE: NoteItem[] = [
  ...LINES.map((text, i) => ({ id: `l${i}`, type: "line" as const, at: 48 + i * 52, text })),
  { id: "m1", type: "mine", at: 230, text: "Priya will send the Plan labels." },
  {
    id: "q1",
    type: "ask",
    question: "What did I promise?",
    answer: "To split the merge tag rule by Thursday, then re-sync the last two weeks.",
  },
]
const SUMMARY: MeetingSummary = {
  text: "The sync dropped parent tickets because the merge tag rule matched them too. The rule gets split by Thursday, then 14 days are re-synced.",
  decided: [
    "Split the merge tag rule: skip merged tickets, keep the parent.",
    "Re-sync the last 14 days once the rule is split.",
  ],
  todos: [
    { text: "Split the merge tag rule", when: "Thursday 22 Oct" },
    { text: "Re-sync the last 14 days", when: "Friday 23 Oct, after the split" },
  ],
}
const READY: NoteItem[] = [...LIVE, { id: "r1", type: "result" }]

export function NoteCanvasDemo() {
  const [phase, setPhase] = useState<NotePhase>("live")
  const [modal, setModal] = useState(false)
  const props = {
    meeting: "Upland weekly check-in",
    phase,
    seconds: 412,
    items: phase === "live" ? LIVE : READY,
    summary: SUMMARY,
    onSend: (t: string) => toast(`Sent: ${t}`),
    onEnd: () => setPhase("ready"),
    onOpenDocument: open("the Meeting notes document"),
    onMakeTasks: () => toast("2 tasks made", { sub: "Each with its date" }),
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Meeting"
          options={[
            { value: "live", label: "Taking notes" },
            { value: "ready", label: "Notes ready" },
          ]}
          value={phase}
          onValueChange={(v) => setPhase(v as NotePhase)}
        />
        <Button size="sm" onClick={() => setModal(true)}>
          Open it in the canvas
        </Button>
      </div>
      <div className="flex h-[36rem] overflow-hidden rounded-xl border border-edge bg-(--panel-bg)">
        <NoteTaker {...props} layout="canvas" onBack={() => toast("Back to the widget beside the page")} />
      </div>
      <Canvas
        open={modal}
        onOpenChange={setModal}
        title="Upland weekly check-in"
        meeting={<NoteTaker {...props} layout="canvas" onBack={() => setModal(false)} />}
      />
    </div>
  )
}
