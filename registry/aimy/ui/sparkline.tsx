"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

// Knowledge's before-and-after sparkline (.agv-spark): a small line that
// shows whether a change worked. The line before the change is in the
// reading ink, after it in the brand, and the change itself is a dashed line
// in the action ink. The labels under it name the start, the change and the
// end. The two halves join at the change, so the line never jumps.
//
//   <Sparkline before={[31, 33, 30, 34]} after={[26, 22, 19]} label="Follow-up questions a day,
//     about 32 before 14 Oct and about 21 after" start="Follow-up questions a day, 1 Oct"
//     at="Tone changed 14 Oct" end="Today" />

type SparklineProps = {
  before: number[]
  after: number[]
  /** The whole line in one sentence, for screen readers. */
  label: string
  start?: React.ReactNode
  /** The change, named under the dashed line. */
  at?: React.ReactNode
  end?: React.ReactNode
  className?: string
}

const W = 100
const H = 40
const PAD = 4
const r1 = (v: number) => Math.round(v * 10) / 10

export function Sparkline({ before, after, label, start, at, end, className }: SparklineProps) {
  const fillId = `spark-${useId().replace(/:/g, "")}`
  const all = [...before, ...after]
  if (!all.length) return null
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const span = hi - lo || 1
  const n = all.length
  const x = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - PAD * 2)
  // A smooth line (the trend chart's curve: level tangents, control points 40% of a step out), so it
  // never overshoots a point, and the part after the change sits on a fading area in its own ink.
  const curve = (from: number, to: number) => {
    const c = (n <= 1 ? 0 : W / (n - 1)) * 0.4
    let d = ""
    for (let i = from; i < to; i++) {
      const v = all[i] as number
      if (i === from) d = `M${r1(x(i))},${r1(y(v))}`
      else d += ` C${r1(x(i - 1) + c)},${r1(y(all[i - 1] as number))} ${r1(x(i) - c)},${r1(y(v))} ${r1(x(i))},${r1(y(v))}`
    }
    return d
  }
  const mi = before.length - 1
  const mx = r1(x(Math.max(0, mi)))
  const from = Math.max(0, mi)
  const last = all[n - 1] as number
  return (
    <div className={cn("agv-chart", className)} data-slot="sparkline">
      <div className="agv-spark-box">
        <svg className="agv-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop className="agv-spark-stop-top" offset="0" />
              <stop className="agv-spark-stop-bottom" offset="1" />
            </linearGradient>
          </defs>
          {after.length ? (
            <path className="agv-spark-fill" d={`${curve(from, n)} L${r1(x(n - 1))},${H} L${r1(x(from))},${H} Z`} fill={`url(#${fillId})`} />
          ) : null}
          {before.length && after.length ? <line className="agv-spark-at" x1={mx} x2={mx} y1={0} y2={H} /> : null}
          {before.length ? <path className="agv-spark-before" d={curve(0, before.length)} /> : null}
          {after.length ? <path className="agv-spark-after" d={curve(from, n)} /> : null}
        </svg>
        {after.length ? (
          <span className="agv-spark-end" aria-hidden="true" style={{ left: `${x(n - 1)}%`, top: `${(y(last) / H) * 100}%` }} />
        ) : null}
      </div>
      {start || at || end ? (
        <div className="agv-chart-l" aria-hidden="true">
          <span>{start}</span>
          {at ? <span className="is-at">{at}</span> : null}
          <span>{end}</span>
        </div>
      ) : null}
    </div>
  )
}
