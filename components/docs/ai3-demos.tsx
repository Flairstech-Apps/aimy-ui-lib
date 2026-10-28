"use client"

import { Eye, Scale, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { Source, WorkStateValue } from "@/registry/aimy/lib/ai-types"
import { Activity } from "@/registry/aimy/ui/activity"
import { AgentSteps, type AgentStep } from "@/registry/aimy/ui/agent-steps"
import { Button } from "@/registry/aimy/ui/button"
import { ChangeReview } from "@/registry/aimy/ui/change-review"
import { ConflictPair } from "@/registry/aimy/ui/conflict-pair"
import { EntryAction } from "@/registry/aimy/ui/entry-action"
import { Suggestion } from "@/registry/aimy/ui/suggestion"
import { toast } from "@/registry/aimy/ui/toast"
import { VersionList, type Version } from "@/registry/aimy/ui/version-list"
import { WorkState } from "@/registry/aimy/ui/work-state"

const STATES: WorkStateValue[] = ["detected", "recommended", "drafted", "staged", "completed", "failed"]

export function WorkStateDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STATES.map((s) => (
          <WorkState key={s} state={s} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
        With its own words: <WorkState state="detected" label="Read off the record" />
        <WorkState state="drafted" label="AiMY placed it" />
      </div>
    </div>
  )
}

export function EntryActionDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <EntryAction
        mode="direct"
        icon={<Eye aria-hidden="true" />}
        onClick={() => toast("Archived", { onUndo: () => {} })}
      >
        Archive it
      </EntryAction>
      <EntryAction mode="review" icon={<Scale aria-hidden="true" />} onClick={() => toast("Opens the proposal")}>
        Re-sync
      </EntryAction>
      <EntryAction mode="investigate" aimy onClick={() => toast("Opens the canvas and starts comparing")}>
        Compare
      </EntryAction>
      <EntryAction
        mode="prompt"
        icon={<Search aria-hidden="true" />}
        onClick={() => toast("Stages the question in the composer")}
      >
        Ask what changed
      </EntryAction>
    </div>
  )
}

export function SuggestionDemo() {
  const [key, setKey] = useState(0)
  const [pending, setPending] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setPending(false), 2600)
    return () => window.clearTimeout(t)
  }, [key])
  return (
    <div className="flex flex-col gap-3">
      <Suggestion
        key={key}
        title="Tighten the refund rule"
        pending={pending}
        before="Customers may request a refund within 30 days."
        after="EU customers may cancel within 14 days, unless the licence has been activated."
        onAccept={() => {}}
        onReject={() => {}}
        onUndo={() => setKey((k) => k + 1)}
      />
      <Button
        size="sm"
        className="self-start"
        onClick={() => {
          setPending(true)
          setKey((k) => k + 1)
        }}
      >
        Propose it again
      </Button>
    </div>
  )
}

const RUN: { label: string; secs: number; result?: string }[] = [
  { label: "Reading what you asked for", secs: 0.9 },
  { label: "Asking Apollo", secs: 1.6, result: "42 people came back" },
  { label: "Finding their numbers and emails", secs: 1.4, result: "31 with a number, 38 with an email" },
  { label: "Checking them against your contacts", secs: 1.1, result: "6 of them you already have" },
  { label: "Putting the list together", secs: 1.0 },
]

// When each step ends, in seconds from the start.
const ENDS = RUN.map((_, i) => RUN.slice(0, i + 1).reduce((t, r) => t + r.secs, 0))

export function AgentStepsDemo() {
  const [elapsed, setElapsed] = useState(0)
  const [run, setRun] = useState(0)
  const start = useRef(0)
  useEffect(() => {
    start.current = performance.now()
    const t = window.setInterval(() => {
      const s = (performance.now() - start.current) / 1000
      setElapsed(Math.min(s, 6))
      if (s >= 6) window.clearInterval(t)
    }, 100)
    return () => window.clearInterval(t)
  }, [run])
  const steps: AgentStep[] = RUN.map((r, i) => ({
    label: r.label,
    result: r.result,
    state: elapsed >= ENDS[i]! ? "done" : elapsed >= ENDS[i]! - r.secs ? "live" : "wait",
  }))
  const live = elapsed < 6
  return (
    <div className="flex flex-col gap-3">
      <AgentSteps live={live} title="Curating “Leeds logistics”" doneTitle="Curated" seconds={elapsed} steps={steps} />
      <Button size="sm" className="self-start" disabled={live} onClick={() => setRun((r) => r + 1)}>
        Run it again
      </Button>
    </div>
  )
}

const A: Source = { id: "a", title: "Refund policy: EU customers", status: "conflicting", type: "Policy" }
const B: Source = { id: "b", title: "Activation and refunds FAQ", status: "conflicting", type: "Article" }

export function ChangeReviewDemo() {
  const [open, setOpen] = useState<"archive" | "resolve" | null>(null)
  const [winner, setWinner] = useState<Source | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <ConflictPair
        sides={[
          {
            source: A,
            says: "Refunds within 14 days, unless activated.",
            meta: "Confluence · Dana Whitfield · used 14 times in 90 days",
          },
          {
            source: B,
            says: "Refunds within 30 days, for any reason.",
            meta: "Zendesk · nobody owns it · used 9 times in 90 days",
          },
        ]}
        onPick={(s) => {
          setWinner(s.source)
          setOpen("resolve")
        }}
      />
      <Button variant="err" className="self-start" onClick={() => setOpen("archive")}>
        Archive the old ones
      </Button>
      <ChangeReview
        open={open === "resolve"}
        onOpenChange={(o) => !o && setOpen(null)}
        title="Resolve the conflict"
        now="Both answering"
        after={`${winner?.title ?? ""} wins`}
        rationale={
          <>
            <strong>{winner === A ? B.title : A.title}</strong> becomes superseded by <strong>{winner?.title}</strong>.
            It stays readable and stops being used in answers.
          </>
        }
        confirmLabel="Make it the one"
        done="Resolved"
        onConfirm={() => {}}
        onUndo={() => {}}
      />
      <ChangeReview
        open={open === "archive"}
        onOpenChange={(o) => !o && setOpen(null)}
        title="Archive documents"
        now="12 documents on the surface"
        after="9 archived"
        rationale={
          <>
            You typed <strong>“archive the old ones”</strong>. AiMY resolved that to everything on the surface,{" "}
            <strong>12 documents</strong>, and staged it rather than running it. Writes with consequence do not go
            through free text.
          </>
        }
        effects={[
          {
            tone: "ok",
            children: (
              <>
                <strong>9</strong> documents will be archived.
              </>
            ),
          },
          {
            tone: "warn",
            children: (
              <>
                <strong>2</strong> have no owner, so nobody is told they went.
              </>
            ),
          },
          {
            tone: "skip",
            children: (
              <>
                <strong>3</strong> are already excluded from retrieval, so answers do not change until this is
                confirmed.
              </>
            ),
          },
        ]}
        word="archive"
        confirmLabel="Archive"
        done="9 documents archived"
        danger
        onConfirm={() => {}}
        onUndo={() => {}}
      />
    </div>
  )
}

const VERSIONS: Version[] = [
  {
    id: "3",
    n: 3,
    label: "Clarified the policy scope",
    author: "Dana Whitfield",
    how: "edited in the document editor",
    time: "12 Oct",
    current: true,
  },
  {
    id: "2",
    n: 2,
    label: "Rewritten from 12 resolved tickets",
    author: "AiMY",
    how: "accepted by Dana Whitfield",
    time: "03 Oct",
    ai: true,
  },
  { id: "1", n: 1, label: "Imported from Confluence", author: "A. Mahfouz", how: "first ingestion", time: "21 Sep" },
]

export function VersionListDemo() {
  const [picked, setPicked] = useState("3")
  return <VersionList versions={VERSIONS} selected={picked} onPick={(v) => setPicked(v.id)} />
}

export function ActivityDemo() {
  return (
    <Activity
      onOpen={(t) => toast(`Opened ${t.subject}`)}
      items={[
        {
          id: "1",
          subject: "Dana Whitfield",
          outcome: "Meeting set",
          tone: "ok",
          by: "Engy Hassan",
          when: "10:42",
          note: "Tuesday at 3pm, to go through the annual plan.",
        },
        {
          id: "2",
          subject: "Youssef Amin",
          outcome: "Moved to Needs reply",
          by: "aimy",
          when: "09:15",
          note: "He asked for a callback after 3pm.",
        },
        {
          id: "3",
          subject: "Priya Natarajan",
          outcome: "Missed call",
          tone: "warn",
          by: "Engy Hassan",
          when: "Yesterday",
          note: "No answer twice. Nobody was called after that — 2 people skipped.",
        },
      ]}
    />
  )
}
