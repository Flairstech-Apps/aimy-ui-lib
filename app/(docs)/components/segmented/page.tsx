import type { Metadata } from "next"
import { SegmentedDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Segmented" }

export default function Page() {
  return (
    <>
      <PageHeader title="Segmented" lead="Two to five options where exactly one is on, all shown at once." />
      <Section title="Equal and unequal widths">
        <ThemePair>
          <SegmentedDemo />
        </ThemePair>
      </Section>
      <Install name="segmented" exports="Segmented" />
      <Section title="Use it">
        <CodeBlock>{"<Segmented label=\"Show\" value={range} onValueChange={setRange}\n  options={[{ value: \"day\", label: \"Day\" }, { value: \"week\", label: \"Week\" }]} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use it for a view or a filter with a few options." dontText="Use it to move between pages. That is tabs." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s <code>.seg</code> after its override: a pill track with an inset ring, the chosen option on an accent wash with a brand ring. The highlight slides with transitions.dev&apos;s tabs sliding (16). Knowledge&apos;s settings used it as a radiogroup, and so does this.</p>
      </Source>
      <A11y items={["A radiogroup: arrow keys move and choose, and wrap at the ends.","Name the group with label."]} />
    </>
  )
}
