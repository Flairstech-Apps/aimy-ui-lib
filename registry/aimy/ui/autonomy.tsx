"use client"

import { Lock, ShieldCheck } from "lucide-react"
import { Segmented } from "@/components/segmented"
import { toast } from "@/components/toast"
import { cn } from "@/lib/utils"

// How much AiMY may do without asking, and per kind of work. Neither product
// nor the design system has this; it is built from the doctrine. Trust grows
// by evidence: the setting says what AiMY has done and how often it was taken
// back, so a person can give it more room when it has earned it.
//
// The levels are the confirmation ladder's first rungs (doctrine §3.1):
//   ask    Ask me first: AiMY proposes; you accept, edit or reject
//   tell   Do it, then tell me: it acts, and the toast offers Undo
//   log    Do it, keep a log: it acts, and Activity records it with Undo
// Anything that can't be undone, or touches scoring, compliance or
// permissions, always asks, whatever is set here; those rows are locked and
// say why. Every change says so in a toast with Undo.
//
//   <Autonomy title="Moving contacts between stages" value={level} onValueChange={setLevel}
//     evidence="AiMY did this 38 times this month. You took back 1." />
//   <AskPolicy items={items} onChange={(id, value) => save(id, value)} />

export type AutonomyLevel = "ask" | "tell" | "log"

const LEVELS: { value: AutonomyLevel; label: string; means: string; toast: string }[] = [
  {
    value: "ask",
    label: "Ask me first",
    means: "AiMY proposes it. Nothing happens until you accept.",
    toast: "AiMY will ask first",
  },
  {
    value: "tell",
    label: "Do it, then tell me",
    means: "AiMY does it and tells you straight away, with Undo.",
    toast: "AiMY will do it, then tell you",
  },
  {
    value: "log",
    label: "Do it, keep a log",
    means: "AiMY does it quietly. Each one is in Activity, with Undo.",
    toast: "AiMY will do it and keep a log",
  },
]

const label = (v: AutonomyLevel) => LEVELS.find((l) => l.value === v)?.toast ?? ""

type AutonomyProps = {
  /** The kind of work: "Moving contacts between stages". */
  title: string
  value: AutonomyLevel
  onValueChange: (value: AutonomyLevel) => void
  /** What AiMY has done, and how often it was taken back. */
  evidence?: string
  className?: string
}

export function Autonomy({ title, value, onValueChange, evidence, className }: AutonomyProps) {
  const means = LEVELS.find((l) => l.value === value)?.means
  return (
    <section
      data-slot="autonomy"
      aria-label={title}
      className={cn("flex flex-col gap-3 rounded-lg border border-edge bg-card p-4", className)}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {evidence ? <p className="text-xs text-ink-secondary">{evidence}</p> : null}
      </div>
      <Segmented
        label={`How much AiMY does without asking: ${title}`}
        options={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
        value={value}
        onValueChange={(v) => {
          const was = value
          onValueChange(v as AutonomyLevel)
          toast(label(v as AutonomyLevel), { sub: title, onUndo: () => onValueChange(was) })
        }}
      />
      <p className="text-xs text-ink" aria-live="polite">
        {means}
      </p>
      <p className="flex items-start gap-1.5 text-xs text-ink-secondary">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Anything that can&apos;t be undone, or touches scoring or permissions, always asks.
      </p>
    </section>
  )
}

export type AskPolicyItem = {
  id: string
  label: string
  description?: string
  value: "ask" | "act"
  /** Why this one always asks: shown instead of the choice. */
  locked?: string
}

type AskPolicyProps = {
  items: AskPolicyItem[]
  onChange: (id: string, value: "ask" | "act") => void
  className?: string
}

export function AskPolicy({ items, onChange, className }: AskPolicyProps) {
  return (
    <ul
      data-slot="ask-policy"
      aria-label="When AiMY asks"
      className={cn("flex flex-col divide-y divide-hairline rounded-lg border border-edge bg-card", className)}
    >
      {items.map((it) => (
        <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
            <span className="text-xs font-semibold text-ink">{it.label}</span>
            {it.description ? <span className="text-xs text-ink-secondary">{it.description}</span> : null}
          </div>
          {it.locked ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
              <Lock className="size-3.5" aria-hidden="true" />
              Always asks · {it.locked}
            </span>
          ) : (
            <Segmented
              label={it.label}
              options={[
                { value: "ask", label: "Always ask" },
                { value: "act", label: "Just do it" },
              ]}
              value={it.value}
              onValueChange={(v) => {
                const was = it.value
                onChange(it.id, v as "ask" | "act")
                toast(
                  v === "ask"
                    ? `AiMY will ask before: ${it.label.toLowerCase()}`
                    : `AiMY will just do it: ${it.label.toLowerCase()}`,
                  {
                    sub: v === "act" ? "Each one is in Activity, with Undo" : undefined,
                    onUndo: () => onChange(it.id, was),
                  }
                )
              }}
            />
          )}
        </li>
      ))}
    </ul>
  )
}
