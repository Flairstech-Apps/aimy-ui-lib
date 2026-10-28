import type { Metadata } from "next"
import { TipsDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Tooltip and popover" }

export default function Page() {
  return (
    <>
      <PageHeader title="Tooltip and popover" lead="A tooltip is a short hint you can't click into. A popover is a small panel you can." />
      <Section title="Tooltip, info tip, popover">
        <ThemePair>
          <TipsDemo />
        </ThemePair>
      </Section>
      <Install name="tooltip popover" exports="Tooltip, InfoTip, Popover, PopoverTrigger, PopoverContent, PopoverClose" />
      <Section title="Use it">
        <CodeBlock>{"<Tooltip content=\"Call Kestrel Logistics\">\n  <IconButton label=\"Call\"><Phone /></IconButton>\n</Tooltip>\n<InfoTip label=\"About relevance\" content=\"How closely a document matches…\" />\n<Popover>\n  <PopoverTrigger asChild><Button>Why this score</Button></PopoverTrigger>\n  <PopoverContent label=\"About this score\">…</PopoverContent>\n</Popover>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Put a button in a popover when the hint leads somewhere." dontText="Put a link or button in a tooltip. It disappears before it can be clicked." />
        </div>
      </Section>
      <Source>
        <p>Tooltip is Knowledge&apos;s settings tip (<code>.set2-tip</code>): a raised bubble with an edge, 15rem at most, after 80ms, with transitions.dev&apos;s tooltip timing (17). Its words are 14px in the secondary ink, not the 12px quiet ink the settings used, because hints are sentences. Popover is Knowledge&apos;s settings popover (<code>.set2-pop</code>) and Sales&apos; confidence explanation (<code>.b-wait-pop</code>), which held a button, so it was really a popover. The design system&apos;s <code>.tooltip</code> and <code>.pop</code> were never used by either product.</p>
      </Source>
      <A11y items={["A tooltip shows on hover and on keyboard focus, and Escape hides it.","A popover moves focus inside and returns it on close."]} />
    </>
  )
}
