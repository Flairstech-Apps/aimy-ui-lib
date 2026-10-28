import { cn } from "@/lib/utils"

// QA's achievers list (.lead-*): ranked, no bars. A rank badge, in medal
// inks for the first three, the name, and each measure with its label over
// its value, right-aligned so the figures compare down the column. A row
// with `onOpen` is a button that opens that person (in QA, the AiMY canvas
// asked about them). QA took its leaderboard off the home page on purpose;
// this keeps the pattern for where a ranking is the point.
//
//   <Leaderboard label="Top 5 agents this month" rows={[
//     { name: "Layla Mansour", metrics: [{ label: "Quality", value: "97%", tone: "ok" }, { label: "CSAT", value: "96%" }] },
//   ]} />

export type LeaderMetric = { label: string; value: React.ReactNode; tone?: "ok" | "warn" | "err" }
export type LeaderRow = { name: string; metrics: LeaderMetric[]; onOpen?: () => void }

type LeaderboardProps = {
  rows: LeaderRow[]
  /** Names the list for screen readers. */
  label: string
  className?: string
}

export function Leaderboard({ rows, label, className }: LeaderboardProps) {
  const metrics = Math.max(1, ...rows.map((r) => r.metrics.length))
  return (
    <ol
      className={cn("qa-lead", className)}
      aria-label={label}
      style={{ "--metrics": metrics } as React.CSSProperties}
      data-slot="leaderboard"
    >
      {rows.map((r, i) => {
        const inner = (
          <>
            <span className={cn("qa-lead-rank", i < 3 && `r${i + 1}`)} aria-hidden="true">
              {i + 1}
            </span>
            <span className="qa-lead-name">{r.name}</span>
            {r.metrics.map((m) => (
              <span key={m.label} className="qa-lead-metric">
                <span className="qa-lead-metric-l">{m.label}</span>{" "}
                <span className={cn("qa-lead-metric-v", m.tone && `tone-${m.tone}`)}>{m.value}</span>
              </span>
            ))}
          </>
        )
        return (
          <li key={r.name}>
            {r.onOpen ? (
              <button type="button" className="qa-lead-row" onClick={r.onOpen}>
                {inner}
              </button>
            ) : (
              <div className="qa-lead-row">{inner}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
