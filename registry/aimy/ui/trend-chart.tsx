"use client"

import { ArrowDownRight, ArrowUpRight, Zap } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { Chip } from "@/components/chip"
import type { HoverCardAction } from "@/components/hover-card"
import { Segmented } from "@/components/segmented"
import { cn } from "@/lib/utils"

// QA's quality-score trend (.chart-v2): a score over a range you choose,
// against its goal, optionally beside the period before. The ranges are a
// segmented control and Compare is a toggle. Under them: the average, the
// peak and the low in figures, and the key. The line is a smooth curve in
// the accent over a fading area; the period before is a dashed line in a
// quiet ink. The goal is a dashed line with its name in a pill. The peak,
// the low and the latest score are written at their points. A flagged point
// (a dip AiMY looked into) gets a red band and dot. Point at the plot, or
// focus it and use the arrow keys, for a readout of that point.
//
// QA drew its grid and percentages at fixed heights that did not match its
// scale, and placed its markers by hand; here everything comes from the data.
//
//   <TrendChart title="Quality score" goal={{ value: 90, label: "SLA 90%" }} ranges={[
//     { key: "ytd", label: "YTD", labels: months, scores, prev, flags: [10] },
//     { key: "30d", label: "30D", labels: ["W1", "W2", "W3", "W4"], scores: [86, 88, 85, 87] },
//   ]} pointNote={(r, i) => (r.flags?.includes(i) ? "AiMY looked into this" : undefined)} />

export type TrendRange = {
  key: string
  label: string
  /** One name a point: "Jan", "W1", "Mon". */
  labels: string[]
  scores: number[]
  /** The period before, point for point; shown with Compare. */
  prev?: number[]
  /** Points to flag: a band and a red dot. */
  flags?: number[]
}

type TrendChartProps = {
  ranges: TrendRange[]
  title?: React.ReactNode
  goal?: { value: number; label: string }
  /** The scale; fitted to the data if left out. QA's was 0 to 100. */
  domain?: [number, number]
  /** A tick every this many units; chosen from the span if left out. */
  tick?: number
  format?: (v: number) => string
  /** A line in the readout under a point, e.g. what AiMY did about it. */
  pointNote?: (range: TrendRange, i: number) => React.ReactNode | undefined
  /** An action in the readout of a point. The readout then stays open while the pointer travels into it. */
  pointAction?: (range: TrendRange, i: number) => HoverCardAction | undefined
  /** Extra controls after Compare, e.g. Ask AiMY. */
  actions?: React.ReactNode
  defaultRange?: string
  arriving?: boolean
  className?: string
}

const r2 = (v: number) => Math.round(v * 100) / 100

export function TrendChart({
  ranges,
  title,
  goal,
  domain,
  tick: tickProp,
  format = (v) => `${v}%`,
  pointNote,
  pointAction,
  actions,
  defaultRange,
  arriving,
  className,
}: TrendChartProps) {
  const gid = useId().replace(/:/g, "")
  const [rangeKey, setRangeKey] = useState(defaultRange ?? ranges[0]?.key ?? "")
  const [compare, setCompare] = useState(false)
  const [at, setAt] = useState<number | null>(null)
  // The readout closes a moment after the pointer leaves the plot, so it can be reached when it holds
  // an action; moving into it keeps it.
  const leave = useRef<ReturnType<typeof setTimeout> | null>(null)
  const actionRef = useRef<HTMLButtonElement | null>(null)
  const plotRef = useRef<HTMLDivElement | null>(null)
  const hold = () => {
    if (leave.current) clearTimeout(leave.current)
    leave.current = null
  }
  const release = () => {
    hold()
    leave.current = setTimeout(() => setAt(null), 220)
  }
  useEffect(() => hold, [])
  const range = ranges.find((r) => r.key === rangeKey) ?? ranges[0]
  // The scale fits the data, the period before and the goal, on round ticks.
  // QA fixed it at 0 to 100, which put every score in the top quarter.
  const seen = [...(range?.scores ?? []), ...(range?.prev ?? []), ...(goal ? [goal.value] : [])]
  const dMin = seen.length ? Math.min(...seen) : 0
  const dMax = seen.length ? Math.max(...seen) : 100
  const span = dMax - dMin
  // Up to a span of 100, the products' 5/10/20. Beyond it (money, counts), about five round steps
  // of 1, 2 or 5 times a power of ten, so 120K to 480K reads in 100K steps, not 18,000 ticks.
  const niceStep = (s: number) => {
    const raw = s / 5
    const p = 10 ** Math.floor(Math.log10(raw))
    const m = raw / p
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
  }
  const auto = span <= 20 ? 5 : span <= 50 ? 10 : span <= 100 ? 20 : niceStep(span)
  const tick = tickProp && tickProp > 0 ? tickProp : auto
  const [lo, hi] = domain ?? [Math.floor((dMin - 1) / tick) * tick, Math.ceil((dMax + 1) / tick) * tick]
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * 100

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {ranges.length > 1 ? (
        <Segmented
          label="Range"
          options={ranges.map((r) => ({ value: r.key, label: r.label }))}
          value={range?.key}
          onValueChange={(v) => {
            setRangeKey(v)
            setAt(null)
          }}
        />
      ) : null}
      {range?.prev ? (
        <Chip selected={compare} onClick={() => setCompare((c) => !c)}>
          Compare
        </Chip>
      ) : null}
      {actions}
    </div>
  )

  if (!range || !range.scores.length)
    return (
      <div className={cn("qa-trend", className)} data-slot="trend-chart">
        <div className="qa-trend-top">
          {title ? <h3 className="text-meta font-bold text-d50">{title}</h3> : <span />}
          {controls}
        </div>
        <div className="qa-trend-empty">No scores in this range yet.</div>
      </div>
    )

  const s = range.scores
  const n = s.length
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)
  // QA's curve: horizontal tangents, the control points 40% of a step out.
  const curve = (vals: number[]) => {
    const step = n <= 1 ? 0 : 100 / (n - 1)
    let d = `M${r2(x(0))},${r2(y(vals[0] as number))}`
    for (let i = 1; i < vals.length; i++) {
      const c = step * 0.4
      d += ` C${r2(x(i - 1) + c)},${r2(y(vals[i - 1] as number))} ${r2(x(i) - c)},${r2(y(vals[i] as number))} ${r2(x(i))},${r2(y(vals[i] as number))}`
    }
    return d
  }
  const area = (vals: number[]) => `${curve(vals)} L${r2(x(vals.length - 1))},100 L${r2(x(0))},100 Z`
  const prev = compare && range.prev?.length ? range.prev.slice(0, n) : null

  const peakI = s.indexOf(Math.max(...s))
  const lowI = s.indexOf(Math.min(...s))
  const lastI = n - 1
  const avg = s.reduce((a, b) => a + b, 0) / n
  // The average against the period before, point for point, when there is one: says whether it moved.
  const before = range.prev?.slice(0, n) ?? []
  const prevAvg = before.length ? before.reduce((a, b) => a + b, 0) / before.length : null
  const moved = prevAvg != null ? Math.round((avg - prevAvg) * 10) / 10 : null
  const near = (a: number, b: number) => Math.abs(x(a) - x(b)) < 8
  const showPeak = peakI !== lowI && !near(peakI, lowI) && !near(peakI, lastI)
  const showLow = lowI !== lastI && !near(lowI, lastI)

  const ticks: number[] = []
  for (let v = Math.ceil(lo / tick) * tick; v <= hi; v += tick) if (v > lo) ticks.push(v)
  const every = n > 15 ? 3 : n > 8 ? 2 : 1
  const showX = (i: number) => i === 0 || i === lastI || (i % every === 0 && lastI - i >= every)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!r.width) return
    const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    setAt(Math.round(f * (n - 1)))
  }
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") return setAt(null)
    const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0
    if (!step) return
    e.preventDefault()
    setAt((a) => Math.max(0, Math.min(lastI, (a ?? lastI) + step)))
  }
  const atNote = at != null ? pointNote?.(range, at) : undefined
  const atAction = at != null ? pointAction?.(range, at) : undefined
  const flags = (range.flags ?? []).filter((i) => i >= 0 && i < n)
  const said =
    `${typeof title === "string" ? title + ", " : ""}${range.label}: ${range.labels[0]} ${format(s[0] as number)}, ` +
    `peak ${format(s[peakI] as number)} in ${range.labels[peakI]}, low ${format(s[lowI] as number)} in ${range.labels[lowI]}, ` +
    `now ${format(s[lastI] as number)}${goal ? `, against a goal of ${format(goal.value)}` : ""}.`

  return (
    <div className={cn("qa-trend", arriving && "is-arriving", className)} data-slot="trend-chart">
      <div className="qa-trend-top">
        {title ? <h3 className="text-meta font-bold text-d50">{title}</h3> : <span />}
        {controls}
      </div>
      <div className="qa-trend-stats">
        <div className="qa-trend-stat">
          <span className="qa-trend-stat-l">Average</span>
          <span className="qa-trend-stat-v">
            {format(Math.round(avg * 10) / 10)}
            {moved != null ? (
              <span className={cn("qa-trend-delta", moved > 0 && "is-up", moved < 0 && "is-down")}>
                {moved > 0 ? <ArrowUpRight aria-hidden="true" /> : moved < 0 ? <ArrowDownRight aria-hidden="true" /> : null}
                {moved === 0 ? "Same as before" : `${moved > 0 ? "Up" : "Down"} ${format(Math.abs(moved))} on the period before`}
              </span>
            ) : null}
          </span>
        </div>
        <div className="qa-trend-stat">
          <span className="qa-trend-stat-l">Peak · {range.labels[peakI]}</span>
          <span className="qa-trend-stat-v tone-ok">{format(s[peakI] as number)}</span>
        </div>
        <div className="qa-trend-stat">
          <span className="qa-trend-stat-l">Low · {range.labels[lowI]}</span>
          <span className="qa-trend-stat-v tone-err">{format(s[lowI] as number)}</span>
        </div>
        <div className="qa-trend-legend" aria-hidden="true">
          <span className="qa-trend-key">This period</span>
          {prev ? <span className="qa-trend-key is-prev">Previous period</span> : null}
          {goal ? <span className="qa-trend-key is-goal">{goal.label}</span> : null}
        </div>
      </div>
      <div className="qa-trend-body">
        <div className="qa-trend-y" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ top: `${y(t)}%` }}>
              {format(t)}
            </span>
          ))}
        </div>
        <div
          className="qa-trend-plot"
          role="img"
          aria-label={said}
          tabIndex={0}
          ref={plotRef}
          onPointerMove={(e) => {
            hold()
            onMove(e)
          }}
          onPointerLeave={() => (pointAction ? release() : setAt(null))}
          onKeyDown={(e) => {
            // Into the readout from the keyboard, when it has something to press.
            if (e.key === "Tab" && !e.shiftKey && atAction) {
              e.preventDefault()
              actionRef.current?.focus()
              return
            }
            onKey(e)
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setAt(null)
          }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${gid}-a`} x1="0" y1="0" x2="0" y2="1">
                <stop className="qa-trend-stop-top" offset="0" />
                <stop className="qa-trend-stop-bottom" offset="1" />
              </linearGradient>
              <linearGradient id={`${gid}-p`} x1="0" y1="0" x2="0" y2="1">
                <stop className="qa-trend-pstop-top" offset="0" />
                <stop className="qa-trend-pstop-bottom" offset="1" />
              </linearGradient>
            </defs>
            {ticks.map((t) => (
              <line key={t} className="qa-trend-grid" x1="0" x2="100" y1={y(t)} y2={y(t)} />
            ))}
            {flags.map((i) => (
              <g key={i}>
                <rect className="qa-trend-band" x={Math.max(0, x(i) - 5)} y="0" width="10" height="100" />
                <line className="qa-trend-band-line" x1={x(i)} x2={x(i)} y1="0" y2="100" />
              </g>
            ))}
            {goal ? <line className="qa-trend-goal" x1="0" x2="100" y1={y(goal.value)} y2={y(goal.value)} /> : null}
            {prev ? (
              <>
                <path className="qa-trend-area" d={area(prev)} fill={`url(#${gid}-p)`} />
                <path className="qa-trend-prev" d={curve(prev)} />
              </>
            ) : null}
            <path className="qa-trend-area" d={area(s)} fill={`url(#${gid}-a)`} />
            <path className="qa-trend-line" d={curve(s)} />
          </svg>
          {goal ? (
            <span
              className={cn("qa-trend-goal-tag", (s[0] as number) > goal.value && "is-below")}
              style={{ top: `${y(goal.value)}%` }}
            >
              {goal.label}
            </span>
          ) : null}
          {flags.map((i) => (
            <span key={i} className="qa-trend-dot is-err" style={{ left: `${x(i)}%`, top: `${y(s[i] as number)}%` }} />
          ))}
          {showPeak ? (
            <span className="qa-trend-fig is-peak" style={{ left: `${x(peakI)}%`, top: `${y(s[peakI] as number)}%` }}>
              {format(s[peakI] as number)}
            </span>
          ) : null}
          {showLow ? (
            <span className="qa-trend-fig is-low" style={{ left: `${x(lowI)}%`, top: `${y(s[lowI] as number)}%` }}>
              {format(s[lowI] as number)}
            </span>
          ) : null}
          <span
            className={cn("qa-trend-fig is-now", x(lastI) > 90 && "is-edge")}
            style={{ left: `${x(lastI)}%`, top: `${y(s[lastI] as number)}%` }}
          >
            {format(s[lastI] as number)}
          </span>
          <span className="qa-trend-dot is-end" style={{ left: `${x(lastI)}%`, top: `${y(s[lastI] as number)}%` }} />
          {at != null ? (
            <>
              <span className="qa-trend-hline" style={{ left: `${x(at)}%` }} />
              <span className="qa-trend-dot" style={{ left: `${x(at)}%`, top: `${y(s[at] as number)}%` }} />
              <div
                className={cn("qa-trend-tip", atAction && "is-live")}
                style={x(at) > 70 ? { right: `calc(${100 - x(at)}% + 14px)` } : { left: `calc(${x(at)}% + 14px)` }}
                onPointerEnter={hold}
                onPointerLeave={release}
                onPointerMove={(e) => e.stopPropagation()}
              >
                <div className="qa-trend-tip-m">{range.labels[at]}</div>
                <div className="qa-trend-tip-r">
                  This period <b>{format(s[at] as number)}</b>
                </div>
                {prev && prev[at] != null ? (
                  <div className="qa-trend-tip-r is-prev">
                    Previous <b>{format(prev[at] as number)}</b>
                  </div>
                ) : null}
                {atNote ? (
                  <div className="qa-trend-tip-note">
                    <Zap aria-hidden="true" />
                    {atNote}
                  </div>
                ) : null}
                {atAction ? (
                  <button
                    ref={actionRef}
                    type="button"
                    className="qa-trend-tip-act"
                    onClick={() => {
                      setAt(null)
                      atAction.onClick()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" || (e.key === "Tab" && e.shiftKey)) {
                        e.preventDefault()
                        plotRef.current?.focus()
                      }
                    }}
                  >
                    {atAction.label}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div className="qa-trend-x" aria-hidden="true">
        {range.labels.map((l, i) =>
          showX(i) ? (
            <span key={i} style={{ left: `${x(i)}%` }}>
              {l}
            </span>
          ) : null
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {at != null ? `${range.labels[at]}, ${format(s[at] as number)}` : ""}
      </span>
    </div>
  )
}
