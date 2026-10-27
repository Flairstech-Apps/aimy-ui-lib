import type { Metadata } from "next"
import { DoDont, PageHeader, Section } from "@/components/docs/page"
import { raw } from "@/lib/tokens"

export const metadata: Metadata = { title: "Spacing" }

const STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15]

export default function SpacingPage() {
  return (
    <>
      <PageHeader
        title="Spacing"
        lead="A 4px scale. The Tailwind number and the token number are the same: p-4 is --sp-4, 16px. Steps off this scale fail the doctrine lint."
      />
      <Section title="The scale">
        <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
          {STEPS.map((n) => (
            <div key={n} className="grid items-center gap-4 p-4 column:grid-cols-[12rem_1fr]">
              <p className="font-mono text-xs text-ink">
                --sp-{n} <span className="text-ink-secondary">{raw(`--sp-${n}`)} · {n * 4}px</span>
              </p>
              <div className="h-4 rounded-xs bg-brand" style={{ width: `var(--sp-${n})` }} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-meta text-ink-secondary">
          In Tailwind: p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-10, p-12, p-15 (and the same for m, gap and space). 0, px and
          0.5 are allowed too.
        </p>
      </Section>
      <Section title="In use">
        <DoDont
          doText="Pad cards 16 when compact and 20 to 24 when comfortable. Gap related items by 8 or 12, unrelated groups by 24 or more."
          dontText="Invent a step (p-7, gap-9) to make something fit. Change the component's form instead."
        />
      </Section>
    </>
  )
}
