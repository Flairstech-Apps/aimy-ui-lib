import { ArrowDown, ArrowUp, Scan } from "lucide-react"
import { useId } from "react"
import { cn } from "@/lib/utils"

// QA's quality-score summary (.slv-score): the score in its tone, how far it
// is from the goal, how it moved since the last period, and a small line of
// the period under it. The line is also the button that opens the full
// trend (a TrendChart in the panel it controls), so the way in is the
// picture of what it opens. A green dot under it names where the data comes
// from.
//
//   <ScoreTile label="Quality score" value="87.3%" tone="warn"
//     sub={<><strong>2.7</strong> under the <strong>90%</strong> goal</>}
//     trend={{ dir: "up", amount: "5.2%", vs: "vs last period" }}
//     series={scores} goal={90} source="Real audit data · YTD"
//     open={open} onToggle={() => setOpen((o) => !o)} controls="trend-panel" />

type ScoreTileProps = {
  label: string
  value: React.ReactNode
  tone?: "ok" | "warn" | "err"
  /** How far from the goal, in words. */
  sub?: React.ReactNode
  /** How it moved: the arrow, the amount, against what. Up is good unless `good` says otherwise. */
  trend?: { dir: "up" | "down"; amount: string; vs?: string; good?: boolean }
  /** The period's scores, drawn small. */
  series?: number[]
  goal?: number
  /** Where the scores come from. */
  source?: React.ReactNode
  /** The full trend is open. */
  open?: boolean
  onToggle?: () => void
  /** The id of the panel the line opens. */
  controls?: string
  className?: string
}

const W = 300
const H = 28
const PX = 4
const PY = 5

export function ScoreTile({
  label,
  value,
  tone,
  sub,
  trend,
  series = [],
  goal,
  source,
  open = false,
  onToggle,
  controls,
  className,
}: ScoreTileProps) {
  const gid = useId().replace(/:/g, "")
  const good = trend ? (trend.good ?? trend.dir === "up") : true
  const Arrow = trend?.dir === "down" ? ArrowDown : ArrowUp

  let line = null
  if (series.length) {
    const g = goal ?? series[series.length - 1]!
    const min = Math.max(0, Math.min(...series, g) - 3)
    const max = Math.min(100, Math.max(...series, g) + 3)
    const span = Math.max(1, max - min)
    const step = series.length === 1 ? 0 : (W - PX * 2) / (series.length - 1)
    const yOf = (v: number) => PY + ((max - v) / span) * (H - PY * 2)
    const pts = series.map((v, i) => [PX + i * step, yOf(v)] as const)
    let d = `M${pts[0]![0]},${pts[0]![1]}`
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1]!
      const [cx, cy] = pts[i]!
      const c = (cx - px) * 0.4
      d += ` C${px + c},${py} ${cx - c},${cy} ${cx},${cy}`
    }
    const last = pts[pts.length - 1]!
    line = (
      <span className="slv-score-mini-wrap" aria-hidden="true">
        <svg className="slv-score-mini" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id={`${gid}-f`} x1="0" y1="0" x2="0" y2="1">
              <stop className="slv-score-mini-stop-top" offset="0" />
              <stop className="slv-score-mini-stop-bottom" offset="1" />
            </linearGradient>
          </defs>
          {goal != null ? (
            <line className="slv-score-mini-target" x1={2} x2={W - 2} y1={yOf(goal)} y2={yOf(goal)} />
          ) : null}
          <path d={`${d} L${last[0]},${H - PY} L${pts[0]![0]},${H - PY} Z`} fill={`url(#${gid}-f)`} />
          <path className="slv-score-mini-path" d={d} />
        </svg>
        <span
          className="slv-score-mini-end"
          style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%` }}
        />
      </span>
    )
  }

  return (
    <section className={cn("slv-score", className)} aria-label={`${label} summary`} data-slot="score-tile">
      <span className="slv-score-cap">{label}</span>
      <span className={cn("slv-score-val", tone && `tone-${tone}`)}>{value}</span>
      {sub ? <span className="slv-score-sub">{sub}</span> : null}
      {trend ? (
        <span className="slv-score-trend">
          <span className={good ? "is-up" : "is-down"}>
            <Arrow aria-hidden="true" />
            <span className="sr-only">{trend.dir === "up" ? "up" : "down"}</span>
            {trend.amount}
          </span>
          {trend.vs}
        </span>
      ) : null}
      {onToggle ? (
        <button
          type="button"
          className="slv-score-toggle"
          aria-expanded={open}
          aria-controls={controls}
          onClick={onToggle}
        >
          <span className="slv-score-toggle-action">
            {open ? "Close trend" : "Open trend"}
            <Scan aria-hidden="true" />
          </span>
          {line}
          {source ? <span className="slv-score-mini-source">{source}</span> : null}
        </button>
      ) : (
        <span className="slv-score-toggle" style={{ cursor: "default" }}>
          {line}
          {source ? <span className="slv-score-mini-source">{source}</span> : null}
        </span>
      )}
    </section>
  )
}
