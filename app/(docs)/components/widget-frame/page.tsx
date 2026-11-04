import type { Metadata } from "next"
import { FrameDemo } from "@/components/docs/chat-widget-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Widget frame" }

export default function Page() {
  return (
    <>
      <PageHeader title="Widget frame" lead="What every widget in a chat reply sits in: the result's name and count, the result, and the way to the rest." />
      <Section title="In a reply">
        <ThemePair>
          <FrameDemo />
        </ThemePair>
      </Section>
      <Install name="widget-frame" exports="WidgetFrame" />
      <Section title="Use it">
        <CodeBlock>{`<WidgetFrame icon={<Users />} title="Recommended candidates" meta="Best match first"
  onOpen={openInCanvas} onDownload={download}
  more={{ label: "Show all candidates", onClick: openInCanvas }}>
  <CandidateCards candidates={people} onView={open} />
</WidgetFrame>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Name the result in sentence case and count or order it: Matched positions for Omar Nabil, Best match first." dontText="Show a raw data type as the title (Query_results) or shout it in capitals." />
          <DoDont doText="Show the best few and open the rest in the canvas with the foot." dontText="Put a paginator or a sideways scroll inside a reply." />
        </div>
      </Section>
      <Source>
        <p>{"The Knowledge app's chat drew each widget with its own header, border, corner and colours: a blue gradient head on tables, a grey card on uploads, always-dark candidates. Nour picked this card frame on 4 Nov over an open layout and a result chip. Open in the canvas follows the doctrine: generated work opens in the canvas."}</p>
      </Source>
      <A11y items={["The frame is a region named by its title.","Open in the canvas and Download are named buttons; the foot says what it opens."]} />
    </>
  )
}
