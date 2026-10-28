import type { Metadata } from "next"
import { DescriptionListDemo } from "@/components/docs/records-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Description list" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Description list"
        lead="Labels and values, beside each other or stacked, with unknowns said in words."
      />
      <Section title="Sales' record facts in groups, and Knowledge's stacked facts">
        <ThemePair>
          <DescriptionListDemo />
        </ThemePair>
      </Section>
      <Install name="description-list" exports="DescriptionList, FactGroup, FactGroups" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<FactGroup title="Company" action={<Confidence level="ok" group="Company" when="3 weeks ago" />}>\n  <DescriptionList items={[{ term: "Size", detail: "140 people" }, { term: "Founded", detail: null }]} />\n</FactGroup>\n<DescriptionList form="stacked" items={[{ term: "Pace", detail: "On track", tone: "ok", note: "62% used" }]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say “Not known” when a value is missing." dontText="Leave a dash or an empty cell." />
        </div>
      </Section>
      <Source>
        <p>
          Two shapes. Beside is Sales&apos; record facts (<code>.b-about-dl</code>, bdr.css 7363-7425): the label in an
          8rem column beside its value, 12px apart; below 360px of its own width the label goes over the value.
          FactGroup is the titled card around it, with room on the right for how sure AiMY is (Confidence), and it
          breathes while the group is checked again. Stacked is Knowledge&apos;s facts (<code>.set2-us-fact</code>,
          settings.css 4945-4970): a small upper-case label over the value, a note under it, a hairline between rows,
          one control on the right. A value nobody knows says &quot;Not known&quot; in italic reading ink, never a faded
          dash. Knowledge&apos;s quiet labels are secondary ink here.
        </p>
      </Source>
      <A11y items={["A real dl with dt and dd.", "A group being checked is aria-busy; its title names the region."]} />
    </>
  )
}
