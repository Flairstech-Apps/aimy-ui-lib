import { cn } from "@/lib/utils"

// A rating out of 100 with a three-bar meter: Knowledge's .conf-badge on ICP
// cards (knowledge.js:3897), "Fit 82". High from 75, medium from 50, low
// below. A score says how well something matches; to say how sure AiMY is
// about a fact, and why, use Confidence.
//
//   <Score value={82} label="Fit" />

type ScoreProps = {
  value: number
  /** What is being scored, shown before the number: "Fit". */
  label: string
  className?: string
}

export function Score({ value, label, className }: ScoreProps) {
  const band = value >= 75 ? "high" : value >= 50 ? "medium" : "low"
  return (
    <span
      data-slot="score"
      role="img"
      aria-label={`${label} ${value} out of 100, ${band}`}
      className={cn("conf-badge", `conf-${band}`, className)}
    >
      <span className="conf-meter" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span aria-hidden="true">{label}</span>
      <span className="conf-val" aria-hidden="true">
        {value}
      </span>
    </span>
  )
}
