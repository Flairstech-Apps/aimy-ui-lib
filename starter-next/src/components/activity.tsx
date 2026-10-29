import { cn } from "@/lib/utils"

// What happened, who did it and when: Sales' activity rows (campTouchRow,
// bdr.js:5678), the trail both products keep instead of the design system's
// audit list, Nour's choice (28 Oct). Each row names the person or account it
// was about, what happened in the outcome's colour, then who did it and when,
// with the note under it. When AiMY did it, the row says AiMY: its actions
// are never shown as the person's (Sales' whoDid).
//
//   <Activity items={[{ id: "1", subject: "Dana Whitfield", outcome: "Meeting set", tone: "ok",
//     by: "aimy", when: "2 hours ago", note: "Booked from her reply." }]} onOpen={open} />

export type ActivityItem = {
  id: string
  /** Who or what it was about. */
  subject: string
  /** What happened: "Meeting set", "Missed call". */
  outcome: string
  tone?: "ok" | "warn" | "err"
  /** The person who did it, or "aimy". */
  by: string
  when: string
  note?: string
}

type ActivityProps = {
  items: ActivityItem[]
  onOpen?: (item: ActivityItem) => void
  className?: string
}

export function Activity({ items, onOpen, className }: ActivityProps) {
  return (
    <ol data-slot="activity" className={cn("b-feed", className)} aria-label="Activity">
      {items.map((t) => (
        <li key={t.id} className="s-qrow">
          <div className="s-qrow-id">
            <button type="button" className="s-qrow-name" onClick={() => onOpen?.(t)}>
              {t.subject}
            </button>
            <span className="s-qrow-sub">
              <span className={cn("b-feed-out", t.tone && `tone-${t.tone}`)}>{t.outcome}</span>
              <span className="b-feed-meta">
                {" "}
                · {t.by === "aimy" ? "AiMY" : t.by} · {t.when}
              </span>
            </span>
          </div>
          {t.note ? (
            <div className="s-qrow-why">
              <span>{t.note}</span>
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
