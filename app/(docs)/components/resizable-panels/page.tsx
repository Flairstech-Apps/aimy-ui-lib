import type { Metadata } from "next"
import { ResizableDemo } from "@/components/docs/behavior-parts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Resizable panels" }

export default function Page() {
  return (
    <>
      <PageHeader title="Resizable panels" lead="Side-by-side or stacked panels with a handle between each pair: a list beside its detail, a document beside AiMY." />
      <Section title="A list beside its detail">
        <ThemePair>
          <ResizableDemo />
        </ThemePair>
      </Section>
      <Install name="resizable-panels" exports="ResizablePanels" />
      <Section title="Use it">
        <CodeBlock>{"<ResizablePanels defaultSizes={[35, 65]} min={[20, 40]} labels={[\"Contacts\", \"Contact\"]}>\n  <ContactList />\n  <ContactDetail />\n</ResizablePanels>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Set a minimum for every panel, so nothing can be squeezed past use." dontText="Let a panel drag down to nothing. Give it a close button instead." />
          <DoDont doText="Remember the sizes per person with onSizesChange." dontText="Reset people's sizes on every visit." />
        </div>
      </Section>
      <Source>
        <p>Built on AiMY's drag behaviour (<code>bindDrag</code>). The handle is a 1px hairline with a wider hit area that turns brand and thickens on hover, drag and keyboard focus.</p>
      </Source>
      <A11y items={["Each handle is a focusable separator with aria-valuenow, aria-valuemin and aria-valuemax in percent, named after the panel before it.", "The arrows resize by 1% (Shift for 10%); Home and End go to the panel's smallest and largest."]} />
    </>
  )
}
