"use client"

import { Moon, RotateCcw, Sun } from "lucide-react"
import { useState } from "react"

type Row = { token: string; alias?: string; value: string; use: string }

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 self-start rounded-md border border-edge px-3 py-2 text-xs font-semibold text-ink transition-[background-color,border-color,scale] duration-(--t-fast) ease-out hover:border-edge-hover hover:bg-w05 active:scale-(--press-scale)"
    >
      <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden="true" />
      Replay
    </button>
  )
}

/** Each bar travels the same distance; only the duration token differs. */
export function DurationDemo({ rows }: { rows: Row[] }) {
  const [on, setOn] = useState(false)
  const replay = () => {
    setOn(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)))
  }
  return (
    <div className="flex flex-col gap-4">
      <ReplayButton onClick={replay} />
      <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
        {rows.map((r) => (
          <div key={r.token} className="grid items-center gap-3 p-4 column:grid-cols-[17rem_1fr]">
            <div>
              <p className="font-mono text-xs font-semibold text-ink">
                {r.token} <span className="text-ink-secondary">{r.value}</span>
              </p>
              {r.alias ? <p className="font-mono text-2xs text-ink-secondary">also {r.alias}</p> : null}
              <p className="mt-1 text-meta text-ink-secondary">{r.use}</p>
            </div>
            <div className="relative h-6 rounded-pill bg-w04 [container-type:inline-size]">
              <span
                className="absolute top-1 left-1 size-4 rounded-pill bg-brand"
                style={{
                  transform: on ? "translateX(calc(100cqw - 1.5rem))" : "translateX(0)",
                  transition: on ? `transform var(${r.token}) var(--ease-smooth-out)` : "none",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Same duration, different curve. */
export function EasingDemo({ rows }: { rows: Row[] }) {
  const [on, setOn] = useState(false)
  const replay = () => {
    setOn(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)))
  }
  return (
    <div className="flex flex-col gap-4">
      <ReplayButton onClick={replay} />
      <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
        {rows.map((r) => (
          <div key={r.token} className="grid items-center gap-3 p-4 column:grid-cols-[17rem_1fr]">
            <div>
              <p className="font-mono text-xs font-semibold text-ink">{r.token}</p>
              <p className="font-mono text-2xs text-ink-secondary">{r.value}</p>
              <p className="mt-1 text-meta text-ink-secondary">{r.use}</p>
            </div>
            <div className="relative h-6 rounded-pill bg-w04 [container-type:inline-size]">
              <span
                className="absolute top-1 left-1 size-4 rounded-pill bg-accent"
                style={{
                  transform: on ? "translateX(calc(100cqw - 1.5rem))" : "translateX(0)",
                  transition: on ? `transform 900ms var(${r.token})` : "none",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-meta text-ink-secondary">Slowed to 900ms here so the curves can be compared. Real use takes the duration token for the job.</p>
    </div>
  )
}

/** transitions.dev 09, the snippet the theme toggle uses. */
export function IconSwapDemo() {
  const [a, setA] = useState(true)
  return (
    <button
      type="button"
      onClick={() => setA((v) => !v)}
      className="inline-flex items-center gap-3 rounded-md border border-edge px-4 py-2 text-xs font-semibold text-ink transition-[background-color,border-color,scale] duration-(--t-fast) ease-out hover:border-edge-hover hover:bg-w05 active:scale-(--press-scale)"
    >
      <span className="t-icon-swap" data-state={a ? "a" : "b"}>
        <Sun className="t-icon size-4" data-icon="a" strokeWidth={2} aria-hidden="true" />
        <Moon className="t-icon size-4" data-icon="b" strokeWidth={2} aria-hidden="true" />
      </span>
      Swap the icon
    </button>
  )
}
