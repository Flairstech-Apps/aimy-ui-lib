"use client"

import { Info } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/button"
import { WorkState } from "@/components/work-state"
import { cn } from "@/lib/utils"

// A proposal with operational consequences, decided in place: the design
// system's .decision-zone (aimy-ds.css:3267), built from the spec because
// neither product draws it. The question, what it will do and how long it
// stays reversible, and Accept, Edit, Reject. Edit is not optional (the
// spec's rule): the type requires an edit handler. It waits on you
// (Awaiting you), then says what was decided, by whom, and until when it can
// be undone. For a wording change, use Suggestion; for a governed change with
// a diff, ChangeReview.
//
//   <DecisionZone prompt="Apply the revised P1 SLA to Teams Cairo, Nile, Delta and Aswan?"
//     consequence="Takes effect at the start of the next scoring cycle. Reversible for 24 hours."
//     meta={["Proposed by AiMY · 14:02", "Requires: QA Manager", "Decision is logged"]}
//     editLabel="Edit values" onAccept={apply} onEdit={openValues} onReject={reject}
//     accepted={{ prompt: "Revised P1 SLA applied to 4 teams.", meta: "Accepted by Nour W. · 14:06 · reversible until tomorrow 14:06" }}
//     rejected={{ prompt: "Proposal rejected — SLA unchanged at 4 hours." }} onUndo={revert} />

type Outcome = { prompt: string; meta?: string }

type DecisionZoneProps = {
  prompt: string
  consequence?: React.ReactNode
  meta?: string[]
  onAccept: () => void
  /** Required: a proposal you cannot edit is a proposal you can only take or leave. */
  onEdit: () => void
  onReject: () => void
  editLabel?: string
  /** What it says once accepted, and the line under it. */
  accepted: Outcome
  rejected: Outcome
  /** Takes an accepted decision back while it is still reversible. */
  onUndo?: () => void
  className?: string
}

export function DecisionZone({
  prompt,
  consequence,
  meta = [],
  onAccept,
  onEdit,
  onReject,
  editLabel = "Edit",
  accepted,
  rejected,
  onUndo,
  className,
}: DecisionZoneProps) {
  const [state, setState] = useState<"open" | "accepted" | "rejected">("open")
  const done = state !== "open"
  const outcome = state === "accepted" ? accepted : state === "rejected" ? rejected : null
  return (
    <section
      data-slot="decision-zone"
      aria-label="Decision"
      className={cn(
        "decision-zone",
        state === "accepted" && "is-accepted",
        state === "rejected" && "is-rejected",
        className
      )}
    >
      <p className="dz-prompt" role={done ? "status" : undefined}>
        {outcome ? outcome.prompt : prompt}
      </p>
      {!done && consequence ? (
        <p className="dz-consequence">
          <Info aria-hidden="true" />
          <span>{consequence}</span>
        </p>
      ) : null}
      <div className="dz-actions">
        {!done ? (
          <>
            <Button
              variant="brand"
              size="sm"
              onClick={() => {
                setState("accepted")
                onAccept()
              }}
            >
              Accept
            </Button>
            <Button size="sm" onClick={onEdit}>
              {editLabel}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setState("rejected")
                onReject()
              }}
            >
              Reject
            </Button>
          </>
        ) : state === "accepted" && onUndo ? (
          <Button
            size="sm"
            onClick={() => {
              setState("open")
              onUndo()
            }}
          >
            Undo
          </Button>
        ) : null}
        <span className="dz-spacer" />
        {state === "open" ? (
          <WorkState state="staged" />
        ) : state === "accepted" ? (
          <WorkState state="completed" label="Accepted" />
        ) : (
          <WorkState state="failed" label="Rejected" />
        )}
      </div>
      {(outcome?.meta ?? meta.length) ? (
        <div className="dz-meta">
          {outcome?.meta ? <span>{outcome.meta}</span> : meta.map((m) => <span key={m}>{m}</span>)}
        </div>
      ) : null}
    </section>
  )
}
