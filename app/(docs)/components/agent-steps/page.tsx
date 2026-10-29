import type { Metadata } from "next"
import { AgentStepsDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Agent steps" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Agent steps"
        lead="What AiMY is doing, step by step, while it does it, and how long it took."
      />
      <Section title="Curating a list">
        <ThemePair>
          <AgentStepsDemo />
        </ThemePair>
      </Section>
      <Install name="agent-steps" exports="AgentSteps" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<AgentSteps live={running} title="Curating “Leeds logistics”" doneTitle="Curated" seconds={elapsed}\n  steps={[{ label: "Asking Apollo", result: "42 people came back", state: "done" }, …]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what each step found." dontText="Show a spinner for six seconds of real work." />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; curation trace (<code>.b-cur</code>): a fold whose summary says what AiMY is doing with a clock
          ticking in tenths, a line saying the person can close it and it keeps going, and the steps on a rail. A step
          grows in when it starts, its pin beats and its words shine while live, then the tick draws itself and what it
          found grows in under it. Done reads &quot;Curated in 6.0s&quot;. Added: a failed step in error ink, and
          &quot;Stopped before it finished&quot;, which Sales says only on reload. The design system&apos;s{" "}
          <code>.agent-steps</code> is used by neither product.
        </p>
      </Source>
      <A11y
        items={[
          "A disclosure; the steps are an ordered list announced as they change, each saying done, working or failed.",
        ]}
      />
    </>
  )
}
