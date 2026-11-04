import type { Metadata } from "next"
import { RankedListDemo } from "@/components/docs/chat-widget-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Ranked list" }

export default function Page() {
  return (
    <>
      <PageHeader title="Ranked list" lead="Results best first, one per row, each with its reason in view." />
      <Section title="Matched positions">
        <ThemePair>
          <RankedListDemo />
        </ThemePair>
      </Section>
      <Install name="ranked-list" exports="RankedList" />
      <Section title="Use it">
        <CodeBlock>{`<WidgetFrame icon={<Briefcase />} title="Matched positions for Omar Nabil" meta="Best match first" flush>
  <RankedList label="Matched positions" onOpen={openRole} items={[
    { id, title: "PHP Developer", details: "Cairo / Alexandria, 2 years needed", reason, match: 95 },
  ]} />
</WidgetFrame>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Keep the reason in view, two lines at most." dontText="Put the reason in a column that is cut off at the edge." />
          <DoDont doText="Order best first and say so in the frame." dontText="Mix orders without saying which." />
        </div>
      </Section>
      <Source>
        <p>{"The Knowledge app sent matched positions as a table whose reasoning column was cut off at the edge (Perfect title m…). Nour picked a ranked list for them on 4 Nov."}</p>
      </Source>
      <A11y items={["The list is ordered and named.","Each row is one button: title, details, reason and fit read in order."]} />
    </>
  )
}
