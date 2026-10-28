import type { Metadata } from "next"
import { DateDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Date picker" }

export default function Page() {
  return (
    <>
      <PageHeader title="Date picker" lead="Choose a day or a range, with quick choices first." />
      <Section title="The filter pill and the calendar on its own">
        <ThemePair>
          <DateDemo />
        </ThemePair>
      </Section>
      <Install name="date-picker calendar" exports="DatePicker, Calendar" />
      <Section title="Use it">
        <CodeBlock>{"<DatePicker label=\"Created\" value={range} onValueChange={setRange}\n  presets={[{ label: \"Last 7 days\", range: { from: weekAgo, to: today } }]} />\n<Calendar value={day} onValueChange={setDay} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Offer the common ranges as quick choices." dontText="Make people click through months to pick last week." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s date filter (<code>.k-date</code>) and settings calendar (<code>.cal</code>): a pill that opens quick choices and a month grid, today outlined, the choice in the accent, a range on an accent wash. Knowledge&apos;s calendar had no grid semantics or arrow keys; this one has both. Weeks start on Monday.</p>
      </Source>
      <A11y items={["A grid of days: arrows by day and week, Home and End, Page Up and Down by month.","Each day is named in full: Wednesday, 14 October 2026."]} />
    </>
  )
}
