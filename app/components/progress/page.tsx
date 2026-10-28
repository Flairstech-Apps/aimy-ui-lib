import type { Metadata } from "next"
import { ProgressDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Progress" }

export default function Page() {
  return (
    <>
      <PageHeader title="Progress" lead="How much is done or used, always with the numbers in words." />
      <Section title="Work in progress and usage against a limit">
        <ThemePair>
          <ProgressDemo />
        </ThemePair>
      </Section>
      <Install name="progress" exports="Progress" />
      <Section title="Use it">
        <CodeBlock>{"<p>1,700 of 2,000 credits used</p>\n<Progress value={1700} max={2000} size=\"meter\" limit label=\"Credits used\" />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Put the numbers beside the bar: 1,700 of 2,000 credits used." dontText="Show a bar with no numbers." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s settings progress bar (<code>.set2-prog</code>, 3px) and usage meters (<code>.set2-us-m</code>, 6 and 8px, brand then warn then err). The fill grows by scale, not width, so it animates smoothly. The design system&apos;s <code>.ds-progress</code> was never used.</p>
      </Source>
      <A11y items={["A progressbar with its value, maximum and a name."]} />
    </>
  )
}
