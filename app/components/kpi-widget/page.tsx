import type { Metadata } from "next"
import { KpiWidgetDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "KPI widget" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="KPI widget"
        lead="One measure over time, against what was promised, with AiMY's reading of it."
      />
      <Section title="Two measures on a client's floor: one behind, one kept">
        <KpiWidgetDemo />
      </Section>
      <Install name="kpi-widget aimy-note" exports="KpiWidgets, KpiWidget" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<KpiWidget label="Calls answered" value="64%" sub="51% at signing · 70% promised"\n  state={{ word: "behind", tone: "warn" }} series={weeks} goal={{ value: 70 }}\n  format={(v) => `${v}%`} start="Signing" keyLabel="Now · 4 weeks averaged"\n  summary="Calls answered: 51% at signing, 64% now, 70% promised, behind."\n  note={<AimyNote variant="quiet">Six points short, and closing about one a week.</AimyNote>} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say the verdict in a word beside the name."
            dontText="Colour the line red or green to say how it is going."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; floor widget (<code>.b-wid</code>, bdr.css 6425-6514, built by <code>floorWidget</code> in bdr.js
          13629-13720, hover by <code>widHover</code> 13731). The name and a verdict word in its tone (kept, behind),
          the figure now, a sub-line with where it began and what was promised. The plot is 88px whatever the column
          width, so a row of widgets lines up. An SVG on a 0-100 box with strokes that do not scale; the whole line in a
          quiet ink, the stretch the figure averages in the accent at 2.5px; a dashed line at the promise with its word
          on the side the line is not, the scale padded 14% and stretched so that word always has room; a dot on the
          latest point. Point at the plot and a hairline, a dot and a readout snap to the nearest week with a value; a
          week with none breaks the line. Added here: the plot takes focus and the arrow keys walk the weeks, read out
          politely, because Sales&apos; readout is pointer-only. AiMY&apos;s reading sits at the foot, so the sentences
          line up across a row.
        </p>
      </Source>
      <A11y
        items={[
          "The plot is an image named by the summary sentence; it takes focus and the arrow keys move the readout, which is announced.",
        ]}
      />
    </>
  )
}
