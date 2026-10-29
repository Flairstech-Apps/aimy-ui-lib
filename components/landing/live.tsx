"use client"

import { Phone, RotateCcw } from "lucide-react"
import { useState } from "react"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { AimyNote } from "@/registry/aimy/ui/aimy-note"
import { Button } from "@/registry/aimy/ui/button"
import { KpiWidget, KpiWidgets } from "@/registry/aimy/ui/kpi-widget"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Suggestion } from "@/registry/aimy/ui/suggestion"
import { toast } from "@/registry/aimy/ui/toast"
import { CodeBlock } from "@/components/docs/page"

const ANSWERED = [51, 52, null, 55, 54, 57, 58, 56, 60, 61, 63, 62, 65, 64]

/** The hero's picture: a KPI as Sales draws it, AiMY's read of it, and the two actions. Live. */
export function HeroStack() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-card p-5 shadow-lg">
      <KpiWidgets>
        <KpiWidget
          label="Calls answered"
          value="64%"
          sub="51% at signing · 70% promised"
          state={{ word: "behind", tone: "warn" }}
          series={ANSWERED}
          goal={{ value: 70 }}
          format={(v) => `${v}%`}
          start="Signing"
          keyLabel="Now · 4 weeks averaged"
          summary="Calls answered: 51% at signing, 64% now across the last 4 weeks, 70% promised, behind."
          note={
            <AimyNote variant="quiet">
              Six points short, and closing about one a week. At this pace it lands in mid December.
            </AimyNote>
          }
        />
      </KpiWidgets>
      <div className="flex flex-wrap gap-3">
        <Button variant="brand" onClick={() => toast("AiMY prepares the call notes")}>
          <AimyMark title="" />
          Prepare me for it
        </Button>
        <Button onClick={() => toast("Calling Dana Whitfield")}>
          <Phone aria-hidden="true" />
          Call back
        </Button>
      </div>
    </div>
  )
}

const WAYS = {
  copy: {
    code: "npx shadcn@latest add @aimy/button",
    words: "Copy components into an app on Tailwind v4. The code lands in your project, and it is yours to change.",
  },
  package: {
    code: 'npm install @flairstech-aimy/ui\n\nimport { Button } from "@flairstech-aimy/ui"\nimport "@flairstech-aimy/ui/styles.css"',
    words:
      "Import the compiled package in any React app, with or without Tailwind. Versioned, so you choose when to upgrade.",
  },
  tokens: {
    code: '@import "@flairstech-aimy/tokens";',
    words: "Take only the colours, type, spacing and motion, as CSS variables. Works in any page, React or not.",
  },
} as const

/** The three ways in, one at a time. */
export function Ways() {
  const [way, setWay] = useState<keyof typeof WAYS>("copy")
  return (
    <div className="flex flex-col items-center gap-6">
      <Segmented
        label="Way in"
        value={way}
        onValueChange={(v) => setWay(v as keyof typeof WAYS)}
        options={[
          { value: "copy", label: "Copy components" },
          { value: "package", label: "Import the package" },
          { value: "tokens", label: "Tokens only" },
        ]}
      />
      <p className="max-w-[36rem] text-center text-body text-ink-secondary">{WAYS[way].words}</p>
      <div className="w-full max-w-[44rem] text-left">
        <CodeBlock key={way}>{WAYS[way].code}</CodeBlock>
      </div>
    </div>
  )
}

/** AiMY proposes; a person accepts, edits or rejects; a done change keeps its Undo. */
export function LiveProposal() {
  const [round, setRound] = useState(0)
  const [open, setOpen] = useState(true)
  // Suggestion says Applied or Rejected in its own toast; Applied carries the Undo.
  return open ? (
    <Suggestion
      key={round}
      title="Make the per-seat rule plainer"
      before="Quote it per seat and for the year, never per month."
      after="Give the price per seat for the year. Don't give a monthly figure."
      onAccept={() => setOpen(false)}
      onReject={() => setOpen(false)}
      onUndo={() => setOpen(true)}
    />
  ) : (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-hairline p-6">
      <p className="text-body text-ink">Done. An accepted change keeps its Undo in the toast.</p>
      <Button
        onClick={() => {
          setRound((r) => r + 1)
          setOpen(true)
        }}
      >
        <RotateCcw aria-hidden="true" />
        Show the proposal again
      </Button>
    </div>
  )
}
