import type { Metadata } from "next"
import { LeaderboardDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Leaderboard" }

export default function Page() {
  return (
    <>
      <PageHeader title="Leaderboard" lead="A ranking, when the ranking is the point." />
      <Section title="Top five agents this month">
        <ThemePair>
          <LeaderboardDemo />
        </ThemePair>
      </Section>
      <Install name="leaderboard" exports="Leaderboard" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Leaderboard label="Top 5 agents this month" rows={[\n  { name: "Layla Mansour", metrics: [{ label: "Quality", value: "97%", tone: "ok" }, { label: "CSAT", value: "96%" }], onOpen },\n]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use it where the ranking is the point."
            dontText="Rank people where a ranking isn't asked for."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s achievers list (<code>.lead-*</code>, QA index.html 6540-6553; the markup recovered from QA&apos;s
          history, because QA took it off its home page on purpose). Ranked, no bars: a 26px rank badge, gold, silver
          and bronze for the first three, the name, and each measure with its label over its value, right-aligned so the
          figures compare down the column. QA hard-coded the medal colours; here they are tokens (
          <code>--medal-gold</code>, <code>--medal-silver</code>, <code>--medal-bronze</code>) with darker values on
          light so they still read. A row with <code>onOpen</code> is a button (in QA it asks AiMY about that person).
        </p>
      </Source>
      <A11y items={["An ordered list, so the rank is read from the order; each measure is read with its label."]} />
    </>
  )
}
