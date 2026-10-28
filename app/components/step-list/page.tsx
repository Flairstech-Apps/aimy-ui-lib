import type { Metadata } from "next"
import { StepListDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Step list" }

export default function Page() {
  return (
    <>
      <PageHeader title="Step list" lead="AiMY's steps in a compact list, with what each found." />
      <Section title="Done, running, pending">
        <ThemePair>
          <StepListDemo />
        </ThemePair>
      </Section>
      <Install name="step-list" exports="StepList" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<StepList steps={[{ label: "Searched connected sources", meta: "3 matches · 1.2s", state: "done" },\n  { label: "Drafting the summary", state: "running" }, { label: "Propose actions", state: "pending" }]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what each step found." dontText="List steps with no results." />
        </div>
      </Section>
      <Source>
        <p>
          Built from the design system&apos;s <code>.agent-steps</code>, your call on 28 Oct: neither product draws it.
          One row a step: a tick and what it found, a small turning ring while it runs, its number while it waits, a
          cross if it failed. For a long run the person watches, use Agent steps (Sales&apos;).
        </p>
      </Source>
      <A11y items={["An ordered list; each step says done, working, pending or failed."]} />
    </>
  )
}
