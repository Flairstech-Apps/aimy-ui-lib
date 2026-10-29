import type { Metadata } from "next"
import { PageHeader, Section } from "@/components/docs/page"
import { raw } from "@/lib/tokens"

export const metadata: Metadata = { title: "Radius" }

const RADII = [
  ["xs", "Code chips, tiny marks"],
  ["sm", "Tags, small chips"],
  ["md", "Buttons, inputs, the default control"],
  ["lg", "Small cards, menus"],
  ["xl", "Cards and panels"],
  ["2xl", "Dialogs, the canvas, large surfaces"],
  ["pill", "Pills and round controls"],
] as const

export default function RadiusPage() {
  return (
    <>
      <PageHeader title="Radius" lead="Radius grows with the size of the thing. A small control is barely rounded; a dialog is rounded the most." />
      <Section title="The scale">
        <div className="grid gap-4 canvas:grid-cols-4 rail:grid-cols-7">
          {RADII.map(([name, use]) => (
            <div key={name} className="flex flex-col gap-3">
              <div className="h-20 border border-edge bg-card" style={{ borderRadius: `var(--r-${name})` }} />
              <p className="font-mono text-xs text-ink">
                rounded-{name} <span className="text-ink-secondary">{raw(`--r-${name}`)}</span>
              </p>
              <p className="text-meta text-ink-secondary">{use}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
