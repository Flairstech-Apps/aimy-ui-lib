"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// Sales' floor widget (.b-wid): one measure over time against what was
// promised. The name and a verdict word (kept, behind), the figure now, a
// sub-line with where it started and what was promised, then the line. The
// whole line is drawn in a quiet ink and the recent stretch, the weeks the
// figure averages, in the accent; a dashed line marks the goal with its word
// on the side the line is not. Point at the plot, or focus it and use the
// arrow keys, and a readout snaps to the nearest week that has a value. A
// week with no value breaks the line. AiMY's reading sits at the foot, so
// across a row of widgets the sentences line up.
//
//   <KpiWidgets>
//     <KpiWidget label="Calls answered" value="64%" sub="51% at signing · 70% promised"
//       state={{ word: "behind", tone: "warn" }} series={weeks} goal={{ value: 70 }}
//       format={(v) => `${v}%`} summary="Calls answered: 51% at signing, 64% now, 70% promised, behind."
//       note={<AimyNote>Six points short, and closing about one a week.</AimyNote>} />
//   </KpiWidgets>

type KpiWidgetProps = {
  label: string
  /** The figure now. */
  value: React.ReactNode
  /** Where it started, and what was promised, in words. */
  sub?: React.ReactNode
  /** The verdict, in a word and its tone. */
  state?: { word: string; tone?: "ok" | "warn" | "err" }
  /** One value a period; null where there is none, which breaks the line. */
  series: (number | null)[]
  /** How many of the last points the figure stands for, drawn in the accent. */
  recent?: number
  goal?: { value: number; label?: string }
  format?: (v: number) => string
  /** What a point is called in the readout. */
  pointName?: (i: number) => string
  /** The axis under the plot: its left end, and the key on the right. */
  start?: React.ReactNode
  keyLabel?: React.ReactNode
  /** The whole chart in one sentence, for screen readers. */
  summary: string
  /** AiMY's reading, at the foot (an AimyNote). */
  note?: React.ReactNode
  className?: string
}

const r1 = (v: number) => Math.round(v * 10) / 10

export function KpiWidget({
  label,
  value,
  sub,
  state,
  series,
  recent = 4,
  goal,
  format = String,
  pointName = (i) => `Week ${i + 1}`,
  start,
  keyLabel,
  summary,
  note,
  className,
}: KpiWidgetProps) {
  const [at, setAt] = useState<number | null>(null)
  const n = series.length
  const firstI = series.findIndex((v) => v != null)
  const vals = series.filter((v): v is number => v != null)
  if (!vals.length) return null

  // The scale: padded 14%, then stretched so the goal's word has room.
  const ends = [...vals, ...(goal ? [goal.value] : [])]
  const lo0 = Math.min(...ends)
  const hi0 = Math.max(...ends)
  const pad = (hi0 - lo0) * 0.14 || 1
  let lo = lo0 - pad
  let hi = hi0 + pad
  const tagBelow = !!goal && (series[firstI] as number) > goal.value
  if (goal) {
    const g = (hi - goal.value) / (hi - lo)
    if (tagBelow && g > 0.78) lo = (goal.value - 0.22 * hi) / 0.78
    if (!tagBelow && g < 0.22) hi = lo + (goal.value - lo) / 0.78
  }
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * 100
  const pathFrom = (from: number) => {
    let d = ""
    let pen = false
    for (let i = from; i < n; i++) {
      const v = series[i]
      if (v == null) {
        pen = false
        continue
      }
      d += `${pen ? "L" : "M"}${r1(x(i))} ${r1(y(v))}`
      pen = true
    }
    return d
  }
  const recentIs: number[] = []
  for (let i = n - 1; i >= 0 && recentIs.length < recent; i--) if (series[i] != null) recentIs.unshift(i)
  const lastI = recentIs[recentIs.length - 1] ?? firstI

  // The nearest point that has a value.
  const snap = (i: number) => {
    for (let k = 0; k < n; k++) {
      if (series[i - k] != null) return i - k
      if (series[i + k] != null) return i + k
    }
    return null
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!r.width) return
    const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    setAt(snap(Math.round(f * (n - 1))))
  }
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0
    if (e.key === "Escape") return setAt(null)
    if (!step) return
    e.preventDefault()
    // From the latest position, so presses faster than a render still step one each.
    setAt((a) => {
      let i = (a ?? lastI) + step
      while (i >= 0 && i < n && series[i] == null) i += step
      return i >= 0 && i < n ? i : a
    })
  }
  const atV = at != null ? series[at] : null
  const readout = at != null && atV != null ? `${pointName(at)} · ${format(atV)}` : ""

  return (
    <div className={cn("b-wid", className)} data-slot="kpi-widget">
      <div className="b-wid-head">
        <span className="b-wid-name">{label}</span>
        {state ? <span className={cn("s-pan-state", state.tone && `tone-${state.tone}`)}>{state.word}</span> : null}
      </div>
      <span className="b-wid-fig">{value}</span>
      {sub ? <span className="b-wid-sub">{sub}</span> : null}
      <div
        className="b-wid-plot"
        role="img"
        aria-label={summary}
        tabIndex={0}
        onPointerMove={onMove}
        onPointerLeave={() => setAt(null)}
        onKeyDown={onKey}
        onBlur={() => setAt(null)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="b-wid-line" d={pathFrom(firstI)} />
          <path className="b-wid-now" d={pathFrom(recentIs[0] ?? firstI)} />
        </svg>
        {goal ? (
          <>
            <span className="b-wid-goal" style={{ top: `${r1(y(goal.value))}%` }} />
            <span className={cn("b-wid-goal-tag", tagBelow && "is-below")} style={{ top: `${r1(y(goal.value))}%` }}>
              {goal.label ?? "promised"}
            </span>
          </>
        ) : null}
        <span className="b-wid-dot" style={{ left: `${r1(x(lastI))}%`, top: `${r1(y(series[lastI] as number))}%` }} />
        {at != null && atV != null ? (
          <>
            <span className="b-wid-cross" style={{ left: `${r1(x(at))}%` }} />
            <span className="b-wid-hdot" style={{ left: `${r1(x(at))}%`, top: `${r1(y(atV))}%` }} />
            <span
              className={cn("b-wid-tip", x(at) < 18 && "is-start", x(at) > 82 && "is-end")}
              style={{ left: `${r1(x(at))}%` }}
            >
              {readout}
            </span>
          </>
        ) : null}
      </div>
      <span className="sr-only" aria-live="polite">
        {readout}
      </span>
      {start || keyLabel ? (
        <div className="b-wid-axis" aria-hidden="true">
          <span>{start}</span>
          {keyLabel ? <span className="b-wid-key">{keyLabel}</span> : null}
        </div>
      ) : null}
      {note ? <div className="b-wid-note">{note}</div> : null}
    </div>
  )
}

/** Widgets two across, one below 620px of their own width. */
export function KpiWidgets({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="b-wids-wrap">
      <div className={cn("b-wids", className)}>{children}</div>
    </div>
  )
}
