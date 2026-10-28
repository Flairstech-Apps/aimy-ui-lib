"use client"

import { Check, X } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/toast"
import { cn } from "@/lib/utils"

// What a person can do with a briefing item, and the summary of a cluster.
// Neither product draws these yet; built from the design system's briefing
// card (.bcard-ack-row, .bcard-dismiss-picker, aimy-ds.css:3162) and
// aggregate (.agg-*, 3590), with the doctrine's §5.9: allow dismissing what is
// not relevant, and undoing it.
//
// Acknowledge marks it seen. Dismiss opens the reasons in place, one click
// each (no menu, no dialog), and the reason is captured. Both say so in a
// toast with Undo.
//
//   <BriefingActions onAcknowledge={ack} onDismiss={(reason) => dismiss(reason)} onUndo={restore} />
//   <Aggregate stats={[{ value: "142", label: "Unanswered" }]} rows={[{ label: "Refund eligibility, non-EU", value: 54, unit: "asks", share: 0.38 }]}
//     more="+ 9 more topics · 9 asks combined" />

type BriefingActionsProps = {
  onAcknowledge: () => void
  onDismiss: (reason: string) => void
  /** Brings an acknowledged or dismissed item back. */
  onUndo?: () => void
  reasons?: string[]
  className?: string
}

export function BriefingActions({
  onAcknowledge,
  onDismiss,
  onUndo,
  reasons = ["Not my team", "Already handling", "Not useful"],
  className,
}: BriefingActionsProps) {
  const [state, setState] = useState<"open" | "picking" | "acked">("open")
  const undo = onUndo
    ? () => {
        setState("open")
        onUndo()
      }
    : undefined
  return (
    <div data-slot="briefing-actions" className={cn("bcard-ack-row", className)}>
      <button
        type="button"
        className={cn("bcard-ack-btn", state === "acked" && "is-acked")}
        aria-pressed={state === "acked"}
        onClick={() => {
          if (state === "acked") return
          setState("acked")
          onAcknowledge()
          toast("Acknowledged", { sub: "It moves to the end of your briefing", onUndo: undo })
        }}
      >
        <Check aria-hidden="true" />
        {state === "acked" ? "Acknowledged" : "Acknowledge"}
      </button>
      {state !== "acked" ? (
        <button
          type="button"
          className="bcard-ack-btn"
          aria-expanded={state === "picking"}
          onClick={() => setState(state === "picking" ? "open" : "picking")}
        >
          <X aria-hidden="true" />
          Dismiss
        </button>
      ) : null}
      {state === "picking" ? (
        <span className="bcard-dismiss-picker" role="group" aria-label="Why dismiss it?">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              className="bcard-dismiss-reason"
              onClick={() => {
                setState("open")
                onDismiss(r)
                toast("Dismissed", { sub: `Reason recorded: ${r.toLowerCase()}`, onUndo: undo })
              }}
            >
              {r}
            </button>
          ))}
        </span>
      ) : null}
    </div>
  )
}

type AggregateProps = {
  stats: { value: string; label: string }[]
  rows: { label: string; value: number; unit?: string; share: number }[]
  /** Required when rows are left out: what the rest add up to. */
  more?: string
  className?: string
}

export function Aggregate({ stats, rows, more, className }: AggregateProps) {
  return (
    <div data-slot="aggregate" className={cn("flex flex-col gap-2", className)}>
      <div className="agg-summary">
        {stats.map((s) => (
          <span key={s.label} className="agg-stat">
            <span className="agg-stat-val">{s.value}</span>
            <span className="agg-stat-lbl">{s.label}</span>
          </span>
        ))}
      </div>
      <ul className="agg-rows">
        {rows.map((r) => (
          <li key={r.label} className="agg-row" style={{ "--agg-share": r.share } as React.CSSProperties}>
            <span className="agg-bar" aria-hidden="true" />
            <span>{r.label}</span>
            <span>
              <span className="agg-val">{r.value.toLocaleString("en-GB")}</span>
              {r.unit ? <span className="agg-unit">{r.unit}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {more ? <p className="agg-more">{more}</p> : null}
    </div>
  )
}
