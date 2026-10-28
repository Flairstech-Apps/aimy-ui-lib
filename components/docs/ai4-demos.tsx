"use client"

import { useEffect, useState } from "react"
import { AimyNote } from "@/registry/aimy/ui/aimy-note"
import { AuditTrail } from "@/registry/aimy/ui/audit-trail"
import { AskPolicy, Autonomy, type AskPolicyItem, type AutonomyLevel } from "@/registry/aimy/ui/autonomy"
import { Aggregate, BriefingActions } from "@/registry/aimy/ui/briefing"
import { Button } from "@/registry/aimy/ui/button"
import { Composer } from "@/registry/aimy/ui/composer"
import { DecisionZone } from "@/registry/aimy/ui/decision-zone"
import { EntryAction } from "@/registry/aimy/ui/entry-action"
import { MemoryList, type MemoryFact } from "@/registry/aimy/ui/memory-list"
import { MemoryPanel, type MemoryLine } from "@/registry/aimy/ui/memory-panel"
import { ModelPicker } from "@/registry/aimy/ui/model-picker"
import { Peek } from "@/registry/aimy/ui/peek"
import { SetScopeBar } from "@/registry/aimy/ui/set-scope-bar"
import { StepList } from "@/registry/aimy/ui/step-list"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { Suggestions } from "@/registry/aimy/ui/suggestions"
import { toast } from "@/registry/aimy/ui/toast"
import { UsageSummary } from "@/registry/aimy/ui/usage"
import { WorkState } from "@/registry/aimy/ui/work-state"

/* ── The gap list ─────────────────────────────────────────────────── */
export function SetScopeBarDemo() {
  const [n, setN] = useState(18)
  return n ? (
    <SetScopeBar
      count={n}
      scope={
        <>
          of <strong>240 cards</strong> · filtered to <strong>Policies</strong>, owner <strong>A. Mahfouz</strong>,
          trust state <strong>out of date</strong>
        </>
      }
      actions={
        <>
          <Button size="sm">Reassign owner</Button>
          <EntryAction mode="review" onClick={() => toast("Opens the review: what this will do")}>
            Request verification
          </EntryAction>
        </>
      }
      onClear={() => setN(0)}
    />
  ) : (
    <Button size="sm" onClick={() => setN(18)}>
      Select 18 again
    </Button>
  )
}

export function AuditTrailDemo() {
  return (
    <AuditTrail
      entries={[
        {
          id: "1",
          tone: "ok",
          action: "P1 first-response SLA changed from 4h to 2h",
          who: "Nour W.",
          how: "accepted an AiMY change request · 4 teams affected",
          time: "14:06",
          onRevert: () => toast("Reverted", { sub: "Logged to the audit trail", onUndo: () => {} }),
        },
        {
          id: "2",
          tone: "ai",
          action: "18 unowned tickets reassigned to available agents",
          who: "AiMY",
          how: "direct action under the overnight backlog rule",
          time: "06:14",
          onRevert: () => toast("Reverted", { onUndo: () => {} }),
        },
        {
          id: "3",
          tone: "warn",
          action: "Customer notice drafted for the Delta outage",
          who: "AiMY",
          how: "staged, not sent",
          time: "Yest · 17:20",
          note: "Not yet applied",
        },
        {
          id: "4",
          action: "Retention period set to 7 years",
          who: "Rami Saleh",
          how: "compliance setting",
          time: "Mar 14",
          irreversible: true,
        },
      ]}
    />
  )
}

export function DecisionZoneDemo() {
  return (
    <DecisionZone
      prompt="Apply the revised P1 SLA to Teams Cairo, Nile, Delta and Aswan?"
      consequence="Takes effect at the start of the next scoring cycle. Historical scores are not recalculated. Reversible for 24 hours, after which reverting needs a new change request."
      meta={["Proposed by AiMY · 14:02", "Requires: QA manager", "Decision is logged"]}
      editLabel="Edit values"
      onAccept={() => {}}
      onEdit={() => toast("Opens the values to edit")}
      onReject={() => {}}
      onUndo={() => {}}
      accepted={{
        prompt: "Revised P1 SLA applied to 4 teams.",
        meta: "Accepted by Nour W. · 14:06 · reversible until tomorrow 14:06",
      }}
      rejected={{ prompt: "Proposal rejected. The SLA stays at 4 hours.", meta: "Rejected by Nour W. · 14:06" }}
    />
  )
}

export function StepListDemo() {
  return (
    <StepList
      steps={[
        { label: "Searched connected sources", meta: "3 matches · 1.2s", state: "done" },
        { label: "Read Weekly Ops Report", meta: "14 pages · 3.8s", state: "done" },
        { label: "Drafting the summary", state: "running" },
        { label: "Propose actions", state: "pending" },
      ]}
    />
  )
}

/* ── The peek ─────────────────────────────────────────────────────── */
const ANSWER =
  "Two contacts are due today. Youssef Amin asked for a call after 3pm, and Dana Whitfield is waiting on the pricing reply, which is drafted. Priya Natarajan hasn't answered two emails, so a call is the next step."

export function PeekDemo() {
  const [status, setStatus] = useState<"thinking" | "streaming" | "answered" | null>("answered")
  useEffect(() => {
    if (status === "thinking") {
      const t = window.setTimeout(() => setStatus("streaming"), 1400)
      return () => window.clearTimeout(t)
    }
    if (status === "streaming") {
      const t = window.setTimeout(() => setStatus("answered"), 2600)
      return () => window.clearTimeout(t)
    }
  }, [status])
  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto mt-48 w-full max-w-[47.5rem]">
        {status ? (
          <Peek
            status={status}
            thinkingLabel="Reading the record…"
            onOpenCanvas={() => toast("Opens the canvas with this answer")}
            onDismiss={() => setStatus(null)}
            actions={
              <Suggestions
                variant="follow"
                items={["Call Youssef", "Draft the reply to Dana"]}
                onPick={(q) => toast(`Asked: ${q}`)}
              />
            }
          >
            <StreamingText text={ANSWER} streaming={status === "streaming"} />
          </Peek>
        ) : null}
        <Composer
          onSubmit={() => setStatus("thinking")}
          generating={status === "thinking" || status === "streaming"}
          onStop={() => setStatus("answered")}
        />
      </div>
      <p className="text-xs text-ink-secondary">
        Ask anything to see it think and answer. Drag the grip down to tuck it into the bar, up to open the canvas.
      </p>
    </div>
  )
}

/* ── AI-4 ─────────────────────────────────────────────────────────── */
const LINES: MemoryLine[] = [
  { id: "1", who: "You", what: "asked which refund source support should follow" },
  { id: "2", who: "AiMY", what: "flagged the two verified objects as contradictory" },
  { id: "3", who: "You", what: "left it open pending the policy owner" },
]

export function MemoryPanelDemo() {
  const [lines, setLines] = useState(LINES)
  const [dropped, setDropped] = useState(false)
  if (dropped)
    return (
      <Button size="sm" onClick={() => (setDropped(false), setLines(LINES))}>
        Bring the memory back
      </Button>
    )
  return (
    <MemoryPanel
      age="Yesterday, 16:40"
      lines={lines}
      onForget={(l) => setLines((ls) => ls.filter((x) => x.id !== l.id))}
      onRestore={(l) => setLines((ls) => LINES.filter((x) => x.id === l.id || ls.some((y) => y.id === x.id)))}
      onDrop={() => {
        setDropped(true)
        toast("Answering without it", { sub: "The earlier thread is not carried into this one" })
      }}
    />
  )
}

const FACTS: MemoryFact[] = [
  { id: "1", text: "Prefers calls after 3pm", from: "From your call on 21 Oct" },
  { id: "2", text: "Reports to Lina Farouk, head of operations", from: "From LinkedIn, checked 2 weeks ago" },
  { id: "3", text: "Asked about the annual plan for 140 people", from: "From her email on 24 Oct" },
]

export function MemoryListDemo() {
  const [facts, setFacts] = useState(FACTS)
  return (
    <MemoryList
      title="What AiMY remembers about Dana"
      facts={facts}
      onForget={(ids) => setFacts((fs) => fs.filter((f) => !ids.includes(f.id)))}
      onRestore={(ids) => setFacts((fs) => FACTS.filter((f) => ids.includes(f.id) || fs.some((x) => x.id === f.id)))}
    />
  )
}

export function AimyNoteDemo() {
  return (
    <div className="flex flex-col gap-3">
      <AimyNote from="this record’s own history">
        3 attempts and nobody has picked up. The number may not be the one they answer.
      </AimyNote>
      <AimyNote from="their LinkedIn, against your network">
        <b>4 connections</b> in common, the closest Lina Farouk at Kestrel. An introduction is one ask away.
      </AimyNote>
      <AimyNote variant="gap" action={<Button size="sm">Fill in what is missing</Button>}>
        No direct line yet, and the email bounced once.
      </AimyNote>
    </div>
  )
}

export function BriefingDemo() {
  const [gone, setGone] = useState(false)
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-edge bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink">Coverage gaps</span>
        <WorkState state="detected" className="ml-auto" />
      </div>
      <p className="text-xs text-ink-secondary">
        142 questions went unanswered this week. Four topics account for most of them.
      </p>
      <Aggregate
        stats={[
          { value: "142", label: "Unanswered" },
          { value: "4", label: "Topics" },
          { value: "↑ 38%", label: "vs last week" },
        ]}
        rows={[
          { label: "Refund eligibility, non-EU", value: 54, unit: "asks", share: 0.38 },
          { label: "Licence transfers", value: 41, unit: "asks", share: 0.29 },
          { label: "Invoice address changes", value: 23, unit: "asks", share: 0.16 },
        ]}
        more="+ 9 more topics · 24 asks combined"
      />
      <EntryAction mode="prompt" className="self-start" onClick={() => toast("Stages the question in the composer")}>
        Draft an article for the top gap
      </EntryAction>
      {gone ? (
        <p className="bcard-note">Dismissed. It won&apos;t come back this week.</p>
      ) : (
        <BriefingActions onAcknowledge={() => {}} onDismiss={() => setGone(true)} onUndo={() => setGone(false)} />
      )}
    </div>
  )
}

export function UsageDemo() {
  return (
    <Composer
      onSubmit={() => {}}
      usage={{
        fill: 0.67,
        tone: "warn",
        label: "Your usage: 67% of this slice, past your share",
        content: (
          <UsageSummary
            groups={[
              {
                title: "October",
                rows: [
                  {
                    label: "Chats",
                    used: 336,
                    of: 300,
                    tone: "warn",
                    note: "36 chats past your share, $10.80 extra this month. You can keep going.",
                  },
                  { label: "Tickets", used: 72, of: 120 },
                ],
              },
              {
                title: "Today: 7 chats, 2 tickets",
                rows: [
                  { label: "Chats", used: 7, of: 10, note: "$2.10 extra on chats. Tickets are within your share." },
                ],
              },
            ]}
            link={{ label: "Usage", href: "#usage" }}
          />
        ),
      }}
    />
  )
}

export function ModelPickerDemo() {
  const [model, setModel] = useState("reasoning")
  return (
    <ModelPicker
      value={model}
      onValueChange={setModel}
      models={[
        {
          id: "reasoning",
          name: "AiMY Reasoning",
          tag: "Pro",
          description: "Slower; checks its sources against each other",
        },
        { id: "fast", name: "AiMY Fast", description: "Quick answers from what it already knows" },
      ]}
    />
  )
}

export function AutonomyDemo() {
  const [level, setLevel] = useState<AutonomyLevel>("tell")
  const [items, setItems] = useState<AskPolicyItem[]>([
    {
      id: "move",
      label: "Moving contacts between stages",
      description: "After a call, from what was said",
      value: "act",
    },
    { id: "log", label: "Logging calls and emails", value: "act" },
    { id: "send", label: "Sending follow-up emails", description: "Drafts from your templates", value: "ask" },
    { id: "score", label: "Changing lead scores", locked: "it changes scoring", value: "ask" },
    { id: "delete", label: "Deleting contacts", locked: "it can't be undone", value: "ask" },
  ])
  return (
    <div className="flex flex-col gap-4">
      <Autonomy
        title="Moving contacts between stages"
        value={level}
        onValueChange={setLevel}
        evidence="AiMY did this 38 times this month. You took back 1."
      />
      <AskPolicy
        items={items}
        onChange={(id, value) => setItems((its) => its.map((i) => (i.id === id ? { ...i, value } : i)))}
      />
    </div>
  )
}

export function MemoryDemos() {
  return (
    <div className="flex flex-col gap-4">
      <MemoryPanelDemo />
      <MemoryListDemo />
    </div>
  )
}
