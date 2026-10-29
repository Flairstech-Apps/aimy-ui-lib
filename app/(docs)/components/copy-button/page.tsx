import type { Metadata } from "next"
import { CopyDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Copy button" }

export default function Page() {
  return (
    <>
      <PageHeader title="Copy button" lead="Copies a value and says so in words." />
      <Section title="Copy, then Copied">
        <ThemePair>
          <CopyDemo />
        </ThemePair>
      </Section>
      <Install name="copy-button" exports="CopyButton" />
      <Section title="Use it">
        <CodeBlock>{"<CopyButton value={webhookUrl} what=\"the webhook URL\" />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Put the copy button right next to the value." dontText="Copy silently, with no confirmation." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s settings copy button <code>.set2-wh-copy</code>: the label becomes Copied for 1.4s, or Press Ctrl+C if the browser refuses. The icon swaps copy to check with transitions.dev&apos;s icon swap (09).</p>
      </Source>
      <A11y items={["Named Copy plus what it copies.","The result is announced to screen readers."]} />
    </>
  )
}
