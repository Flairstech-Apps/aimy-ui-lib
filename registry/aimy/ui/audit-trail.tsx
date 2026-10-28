import { Check, Circle, CircleAlert, TriangleAlert } from "lucide-react"
import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// A governed record of changes: the design system's .audit-trail
// (aimy-ds.css:3285), built from the spec because neither product draws it.
// Each entry names the action, the actor and how it came about, the time, and
// whether it can be reverted; every entry says one or the other. AiMY's
// actions carry its mark and say AiMY: never shown as a person's. For the
// day-to-day feed of what happened to contacts, use Activity.
//
//   <AuditTrail entries={[{ id: "1", tone: "ai", action: "18 unowned tickets reassigned",
//     who: "AiMY", how: "direct action under the overnight backlog rule", time: "06:14", onRevert: undo }]} />

export type AuditEntry = {
  id: string
  /** What changed: "P1 first-response SLA changed from 4h to 2h". */
  action: string
  who: string
  /** How it came about: "accepted an AiMY change request · 4 teams affected". */
  how?: string
  time: string
  tone?: "ok" | "warn" | "err" | "ai"
  /** Reverts it. Leave out, with `irreversible`, when it cannot be. */
  onRevert?: () => void
  /** Says Irreversible instead of offering Revert. */
  irreversible?: boolean
  /** A status in place of Revert: "Not yet applied". */
  note?: string
}

const ICON = { ok: Check, warn: TriangleAlert, err: CircleAlert } as const

export function AuditTrail({ entries, className }: { entries: AuditEntry[]; className?: string }) {
  return (
    <ol data-slot="audit-trail" className={cn("audit-trail", className)} aria-label="Audit trail">
      {entries.map((e) => {
        const Icon = e.tone && e.tone !== "ai" ? ICON[e.tone] : Circle
        return (
          <li key={e.id}>
            <div className={cn("audit-entry", e.tone && `is-${e.tone}`)}>
              <span className="audit-ico" aria-hidden="true">
                {e.tone === "ai" ? <AimyMark title="" /> : <Icon />}
              </span>
              <div>
                <div className="audit-action">{e.action}</div>
                <div className="audit-actor">
                  <span className="audit-who">{e.who}</span>
                  {e.how ? ` · ${e.how}` : null}
                </div>
              </div>
              <div className="audit-side">
                <span className="audit-time">{e.time}</span>
                {e.onRevert ? (
                  <button
                    type="button"
                    className="audit-revert"
                    onClick={e.onRevert}
                    aria-label={`Revert: ${e.action}`}
                  >
                    Revert
                  </button>
                ) : e.note ? (
                  <span className="audit-irreversible">{e.note}</span>
                ) : e.irreversible ? (
                  <span className="audit-irreversible">Irreversible</span>
                ) : null}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
