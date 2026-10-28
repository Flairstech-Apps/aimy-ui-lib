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
  const all = [...before, ...after]
  if (!all.length) return null
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const span = hi - lo || 1
  const n = all.length
  const x = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - PAD * 2)
  const pts = (from: number, to: number) =>
    all
      .slice(from, to)
      .map((v, j) => `${r1(x(from + j))},${r1(y(v))}`)
      .join(" ")
  const mi = before.length - 1
  const mx = r1(x(Math.max(0, mi)))
  return (
    <div className={cn("agv-chart", className)} data-slot="sparkline">
      <svg className="agv-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
        {before.length && after.length ? <line className="agv-spark-at" x1={mx} x2={mx} y1={0} y2={H} /> : null}
        {before.length ? <polyline className="agv-spark-before" points={pts(0, before.length)} /> : null}
        {after.length ? <polyline className="agv-spark-after" points={pts(Math.max(0, mi), n)} /> : null}
      </svg>
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
