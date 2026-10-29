import type { Metadata } from "next"
import { ScoreTileDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Score tile" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Score tile"
        lead="A score, how far it is from its goal, how it moved, and the way into its trend."
      />
      <Section title="QA's quality score, opening its trend">
        <ScoreTileDemo />
      </Section>
      <Install name="score-tile trend-chart" exports="ScoreTile" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<ScoreTile label="Quality score" value="87.3%" tone="warn"\n  sub={<><strong>2.7</strong> under the <strong>90%</strong> goal</>}\n  trend={{ dir: "up", amount: "5.2%", vs: "vs last period" }}\n  series={scores} goal={90} source="Real audit data · YTD"\n  open={open} onToggle={() => setOpen((o) => !o)} controls="trend-panel" />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Make the way into the trend the picture of the trend."
            dontText="Hide the full chart behind an unlabelled icon."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s quality-score summary (<code>.slv-score</code>, QA index.html 6582-6625; its line by{" "}
          <code>renderQualityMiniTrend</code>, 10441). The caption, the score in its tone at 38px, how far it is from
          the goal with the figures in bold, and how it moved since the last period with a Lucide arrow (QA used a typed
          arrow). Under them, a small curve of the period over a fading area against a faint goal line, which is also
          the button that opens the full trend: the way in is the picture of what it opens, and it says &quot;Open
          trend&quot; or &quot;Close trend&quot; in words. A green dot names where the data comes from. On the accent
          wash, with QA&apos;s glass blur dropped. The end of the line is HTML so it stays round.
        </p>
      </Source>
      <A11y
        items={[
          "A named region. The line is a button with aria-expanded and aria-controls naming the panel it opens; the arrow says up or down in words.",
        ]}
      />
    </>
  )
}
