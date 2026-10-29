import type { Metadata } from "next"
import { Code, DoDont, PageHeader, Section } from "@/components/docs/page"
import { ViewportWidth } from "@/components/docs/viewport-width"
import { layers } from "@/lib/tokens"

export const metadata: Metadata = { title: "Breakpoints" }

const WHAT: Record<string, [string, string]> = {
  "--bp-phone": ["phone", "Phone layouts: one column, controls take full width"],
  "--bp-canvas": ["canvas", "The canvas takes the whole window"],
  "--bp-column": ["column", "The canvas column and the product tabs become drawers"],
  "--bp-rail": ["rail", "The rail becomes a drawer"],
  "--bp-ref": ["ref", "The reference width every design is drawn at"],
}

export default function BreakpointsPage() {
  const bps = layers().filter(([k]) => k.startsWith("--bp-"))
  return (
    <>
      <PageHeader
        title="Breakpoints"
        lead="Breakpoints are the shell's rungs, where the whole app changes state at once. A component moves at the shell's rung, not at its own measured limit, so there is one narrow mode instead of many."
      />
      <Section title="The rungs">
        <p className="mb-4 text-meta text-ink-secondary">
          This window is <ViewportWidth /> wide.
        </p>
        <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
          {bps.map(([token, value]) => {
            const [name, what] = WHAT[token] ?? [token, ""]
            const px = Math.round(parseFloat(value) * 16)
            return (
              <div key={token} className="grid items-center gap-2 p-4 column:grid-cols-[10rem_8rem_1fr]">
                <p className="font-mono text-xs font-semibold text-ink">max-{name}:</p>
                <p className="font-mono text-xs text-ink-secondary">
                  {px}px ({value})
                </p>
                <p className="text-meta text-ink-secondary">{what}</p>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-meta text-ink-secondary">
          Write layouts for the reference width, then adapt below it with <Code>max-rail:</Code>, <Code>max-column:</Code>{" "}
          and the rest. <Code>rail:</Code> on its own means from 1040 up.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="When space runs out, change the component's form: a strip becomes a menu, a column becomes a drawer, a row gets its own line."
            dontText="Hide a component or shrink it past use to make it fit."
          />
          <DoDont
            doText="Key a component to the shell's existing rung and record its own measured limit in a comment."
            dontText="Add a new breakpoint number for one component without asking."
          />
        </div>
      </Section>
    </>
  )
}
