import type { Metadata } from "next"
import { FunnelDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Funnel" }

export default function Page() {
  return (
    <>
      <PageHeader title="Funnel" lead="How a group narrows step by step, as one shape." />
      <Section title="A campaign's funnel, and how far one step's people got">
        <ThemePair>
          <FunnelDemo />
        </ThemePair>
      </Section>
      <Install name="funnel" exports="Funnel" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Funnel label="Where the 240 are" head={{ name: "Step", n: "People" }} total={240} rows={[\n  { name: "Called", n: 187 }, { name: "Meeting set", n: 31, tone: "ok" },\n]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Let the bars arrive together." dontText="Stagger the bars one after another." />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; campaign funnel (<code>.b-funnel</code>, bdr.css 768-820 and 2382-2392, built by{" "}
          <code>funnelOf</code> in bdr.js 19757-19792) and a step&apos;s stages (<code>.b-steps</code>, bdr.css
          6520-6528). A name, an 8px pill bar and a count a row, on one grid so the bars start together. As a funnel
          every bar is a share of one whole, so the narrowing is the finding; as steps each row carries its own whole,
          said in words above it. A bar with anyone in it shows at least 1%. The counts are right-aligned, the edge the
          eye compares on. The bars wipe in together with no stagger: a narrowing is a shape, not a sequence. Tones
          colour the fill only; the name says what the row is.
        </p>
      </Source>
      <A11y items={["A named list; each row is read as its name, its count and its whole."]} />
    </>
  )
}
