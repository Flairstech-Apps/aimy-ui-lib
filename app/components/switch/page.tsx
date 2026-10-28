import type { Metadata } from "next"
import { SwitchDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Switch" }

export default function Page() {
  return (
    <>
      <PageHeader title="Switch" lead="On or off, taking effect at once." />
      <Section title="On, off, locked">
        <ThemePair>
          <SwitchDemo />
        </ThemePair>
      </Section>
      <Install name="switch" exports="Switch" />
      <Section title="Use it">
        <CodeBlock>{"<Switch label=\"Email me the daily summary\" checked={on} onCheckedChange={setOn} />\n<Switch label=\"Voice mode\" disabled lockedReason=\"Your plan doesn't include voice.\" />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use a switch for a setting that applies at once, and say what it does in the label." dontText="Fade a locked setting into the background. Say why it is locked." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s settings switch (<code>.toggle</code>, <code>.set2-us-sw</code>): 36 by 20, the brand when on, a 14px white thumb. The thumb moves with transitions.dev&apos;s toggle (27). Knowledge&apos;s switch had no focus ring of its own; this one shows the brand ring.</p>
      </Source>
      <A11y items={["A switch role with aria-checked.","A locked switch says why in its tooltip and stays readable."]} />
    </>
  )
}
