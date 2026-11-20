"use client"

import { HoverCard } from "@/registry/aimy/ui/hover-card"
import { toast } from "@/registry/aimy/ui/toast"

// Who can open the billing app, as one bar in parts. The bar says each part's size; the card adds
// what it doesn't: the share, and the one thing to do about it.
const PARTS = [
  { key: "ok", label: "Use it this month", n: 18, tone: "var(--ok)", lines: ["62% of everyone with access"] },
  {
    key: "idle",
    label: "Haven't opened it in 90 days",
    n: 7,
    tone: "var(--warn)",
    lines: ["24% of everyone with access"],
    action: { label: "Review the 7", onClick: () => toast("Opens the 7 who haven't used it") },
  },
  {
    key: "off",
    label: "Left the company, still listed",
    n: 4,
    tone: "var(--err)",
    lines: ["14% of everyone with access"],
    action: { label: "Remove their access", onClick: () => toast("Removes access from 4 people") },
  },
]

export function HoverCardDemo() {
  const total = PARTS.reduce((a, p) => a + p.n, 0)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-meta font-semibold text-ink">Who can open Billing</p>
      <div className="flex h-3 gap-0.5" role="list" aria-label="Who can open Billing, 29 people">
        {PARTS.map((p) => (
          <HoverCard key={p.key} title={p.label} lines={p.lines} action={p.action}>
            <span
              role="listitem"
              tabIndex={0}
              aria-label={`${p.label}: ${p.n}`}
              className="block h-full rounded-xs outline-none first:rounded-s-pill last:rounded-e-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              style={{ width: `${(p.n / total) * 100}%`, background: p.tone }}
            />
          </HoverCard>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary" aria-hidden="true">
        {PARTS.map((p) => (
          <span key={p.key} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: p.tone }} />
            {p.label} <b className="font-semibold text-ink tabular-nums">{p.n}</b>
          </span>
        ))}
      </div>
    </div>
  )
}
