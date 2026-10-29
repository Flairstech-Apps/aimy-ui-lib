import type { Metadata } from "next"
import { TimelineDemo } from "@/components/docs/records-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Timeline" }

export default function Page() {
  return (
    <>
      <PageHeader title="Timeline" lead="One record's history on a rail: what happened, who did it, how it went." />
      <Section title="A contact's calls, with a step climbed and one lost">
        <ThemePair>
          <TimelineDemo />
        </ThemePair>
      </Section>
      <Install name="timeline" exports="Timeline, TimelineMonth, TimelineItem" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Timeline end="First called 24 Jun · 3 steps climbed">\n  <TimelineMonth>October</TimelineMonth>\n  <TimelineItem when="28 Oct, 10:42" by="Engy Hassan" outcome="Meeting set" tone="ok"\n    move="Meeting" milestone ago="today" defaultOpen>…</TimelineItem>\n</Timeline>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Put the newest first and open it." dontText="Colour a row without saying how it went." />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; journey on a rail (<code>.b-tl</code>, bdr.css 1589-1643, built by <code>callsBlock</code> in
          bdr.js 23203-23300). A 2px rail at 7px, a 10px dot per touchpoint in the tone of how it went, a 14px accent
          node where a step was climbed, month headings where the month changes, and an end cap saying where it began.
          Each row is Sales&apos; call row (<code>.s-call</code>), a native disclosure that opens over 200ms: when, who
          (AiMY in the AI ink), how it went in its tone, the step reached as &quot;→ step&quot;, how long ago. Sales
          draws the chevron as a mask; here it is the Lucide chevron. Page it with Pager. Activity is the flat list
          across many subjects; this is one subject&apos;s history.
        </p>
      </Source>
      <A11y
        items={[
          "Rows are details and summary, so they open with Enter or Space.",
          "The dot is decoration; the outcome says how it went in words.",
        ]}
      />
    </>
  )
}
