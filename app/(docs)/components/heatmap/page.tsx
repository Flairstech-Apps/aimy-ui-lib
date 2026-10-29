import type { Metadata } from "next"
import { HeatmapDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Heatmap" }

export default function Page() {
  return (
    <>
      <PageHeader title="Heatmap" lead="Scores by goal and by week, so a weak week and a weak goal both stand out." />
      <Section title="A team's quality by goal, last 12 weeks">
        <HeatmapDemo />
      </Section>
      <Install name="heatmap" exports="Heatmap" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Heatmap label="Quality by goal, last 12 weeks" columns={weeks} bands={{ ok: 80, warn: 70 }}\n  rows={[{ name: "Empathy and tone", values: [66, 64, 68, 71], coached: { 3: "Coaching, 14 Mar" } }]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say the band in the key with its numbers."
            dontText="Use a colour scale with no numbers in the cells."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s goal-by-week grid (<code>.heatmap-*</code>, QA agent-scorecards.html 4455-4538). A row per goal, a
          column per week, each cell its score on a tint of its band (40% green, 25% amber or red) in that band&apos;s
          ink, so a weak week reads across a row and a weak goal down a column. A small dot in the AI ink marks a week
          with coaching, and the cell&apos;s title says what it was. A cell with no score says &quot;none&quot;. The
          bands are props (QA set each cell&apos;s colour by hand) and the key is drawn from them; QA&apos;s hand-drawn
          key did not match its own cells. The grid scrolls sideways before it squeezes. QA&apos;s 9px cell type is 12px
          here, the library&apos;s floor.
        </p>
      </Source>
      <A11y
        items={[
          "A real table with row and column headers in a focusable, named scroll region; coaching is read with the cell.",
        ]}
      />
    </>
  )
}
