"use client"

import { useState } from "react"
import { HoverCardPanel, useHoverIntent, type HoverCardAction } from "@/components/hover-card"
import { cn } from "@/lib/utils"

// QA's pass, borderline and fail ring (.donut-*): the parts of a whole as
// arcs from twelve o'clock, clockwise, with round ends and a gap between them. The centre says the main
// share. Point at a part, or at its row in the key, or focus the row, and
// that part thickens with a glow, the rest dim, and the centre says that
// part in its own ink. The key beside it is the legend QA drew as bars: a
// swatch, the name and the count.
//
//   <Donut label="How 412 evaluations went" center={{ label: "Pass rate" }} parts={[
//     { key: "pass", label: "Pass", value: 297, tone: "ok", center: "Pass rate" },
//     { key: "border", label: "Borderline", value: 45, tone: "warn" },
//     { key: "fail", label: "Fail", value: 70, tone: "err", center: "Fail rate" },
//   ]} onPick={(k) => …} />

type Tone = "ok" | "warn" | "err" | "accent" | "neutral"
export type DonutPart = {
  key: string
  label: string
  value: number
  tone: Tone
  /** What the centre calls this part when it is pointed at. */
  center?: string
  /** A hover card on the part, only for what the ring and its key don't say: a comparison, an action. */
  detail?: { lines?: React.ReactNode[]; action?: HoverCardAction }
}

type DonutProps = {
  parts: DonutPart[]
  /** Names the chart for screen readers. */
  label: string
  /** The centre at rest: the first part's share, under this label. */
  center?: { value?: string; label: string }
  /** A part was chosen from the key. */
  onPick?: (key: string) => void
  className?: string
}

const R = 40
const C = 2 * Math.PI * R
// Round ends reach half the stroke past each end of an arc, so each arc is drawn that much shorter
// at both ends plus a gap, and parts read as separate pieces. A part too small for that is a dot.
const SW = 9
const GAP = 3.5

export function Donut({ parts, label, center, onPick, className }: DonutProps) {
  const [on, setOn] = useState<string | null>(null)
  // One card for the ring, on the part last pointed at, placed at the middle of that part's arc.
  const [card, setCard] = useState<string | null>(null)
  const intent = useHoverIntent()
  const total = parts.reduce((a, p) => a + p.value, 0) || 1
  const pct = (v: number) => `${Math.round((v / total) * 100)}%`
  const first = parts[0]
  const active = parts.find((p) => p.key === on)
  // Each arc starts where the ones before it end. Empty parts draw nothing; one part is a full ring.
  const lens = parts.map((p) => (p.value / total) * C)
  const many = parts.filter((p) => p.value > 0).length > 1
  const trim = many ? SW + GAP : 0
  const arcs = parts
    .map((p, i) => {
      const len = lens[i] as number
      const start = lens.slice(0, i).reduce((a, b) => a + b, 0)
      // The arc's middle, clockwise from twelve o'clock, as a share of the ring's box.
      const mid = ((start + len / 2) / C) * 2 * Math.PI
      return {
        p,
        len,
        off: -start,
        draw: Math.max(0.01, len - trim),
        drawOff: -(start + trim / 2),
        at: { left: `${50 + R * Math.sin(mid)}%`, top: `${50 - R * Math.cos(mid)}%` },
      }
    })
    .filter((a) => a.len > 0)
  return (
    <div className={cn("qa-donut", className)} data-slot="donut">
      <div
        className="qa-donut-ring"
        role="img"
        aria-label={`${label}: ${parts.map((p) => `${p.label} ${pct(p.value)}`).join(", ")}.`}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="qa-donut-track" cx="50" cy="50" r={R} />
          {arcs.map(({ p, draw, drawOff }) => (
            <circle
              key={p.key}
              className={cn("qa-donut-arc", `tone-${p.tone}`, on === p.key && "is-on", on && on !== p.key && "is-dim")}
              cx="50"
              cy="50"
              r={R}
              strokeDasharray={`${draw} ${C}`}
              strokeDashoffset={drawOff}
            />
          ))}
          {arcs.map(({ p, len, off }) => (
            <circle
              key={`${p.key}-hit`}
              className="qa-donut-hit"
              cx="50"
              cy="50"
              r={R}
              strokeDasharray={`${len} ${C}`}
              strokeDashoffset={off}
              onPointerEnter={(e) => {
                setOn(p.key)
                if (p.detail) {
                  setCard(p.key)
                  intent.bind.onPointerEnter(e)
                }
              }}
              onPointerLeave={(e) => {
                setOn(null)
                if (p.detail) intent.bind.onPointerLeave(e)
              }}
              onPointerDown={intent.bind.onPointerDown}
              onClick={() => {
                if (p.detail) {
                  setCard(p.key)
                  intent.bind.onClick()
                }
                onPick?.(p.key)
              }}
            />
          ))}
        </svg>
        {arcs.map(({ p, at }) =>
          p.detail && card === p.key ? (
            <HoverCardPanel
              key={p.key}
              open={intent.open}
              onOpenChange={intent.setOpen}
              onHold={intent.hold}
              onRelease={intent.hide}
              title={p.label}
              lines={p.detail.lines}
              action={p.detail.action}
            >
              <span className="qa-donut-anchor" style={at} aria-hidden="true" />
            </HoverCardPanel>
          ) : null
        )}
        <div className="qa-donut-center">
          <span className={cn("qa-donut-pct", active && `tone-${active.tone}`)}>
            {active ? pct(active.value) : (center?.value ?? (first ? pct(first.value) : ""))}
          </span>
          <span className="qa-donut-label">{active ? (active.center ?? active.label) : center?.label}</span>
        </div>
      </div>
      <div className="qa-donut-key">
        {parts.map((p) => (
          <button
            key={p.key}
            type="button"
            className={cn("qa-donut-row", on === p.key && "is-on")}
            onPointerEnter={() => setOn(p.key)}
            onPointerLeave={() => setOn(null)}
            onFocus={() => setOn(p.key)}
            onBlur={() => setOn(null)}
            onClick={() => onPick?.(p.key)}
          >
            <span className={cn("qa-donut-sw", `tone-${p.tone}`)} aria-hidden="true" />
            <span>{p.label}</span>
            <b>
              {p.value.toLocaleString("en-GB")} · {pct(p.value)}
            </b>
          </button>
        ))}
      </div>
    </div>
  )
}
