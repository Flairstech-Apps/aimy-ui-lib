import type { Metadata } from "next"
import { DisclosureDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Disclosure" }

export default function Page() {
  return (
    <>
      <PageHeader title="Disclosure" lead="Show or hide one section in place." />
      <Section title="Closed and open">
        <ThemePair>
          <DisclosureDemo />
        </ThemePair>
      </Section>
      <Install name="disclosure" exports="Disclosure" />
      <Section title="Use it">
        <CodeBlock>{"<Disclosure title=\"Transcript\" count={lines.length}>\n  {lines.map(…)}\n</Disclosure>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use it for a bounded section, like a transcript or a short list." dontText="Hide open-ended data behind it. Give that its own place." />
        </div>
      </Section>
      <Source>
        <p>Sales&apos; <code>&lt;details&gt;</code> sections (the call transcript <code>.s-trace</code>, the crew list, the agent&apos;s steps) and Knowledge&apos;s rail blocks. The body slides open with transitions.dev&apos;s accordion (21); Sales animated height, Knowledge snapped open. The design system&apos;s <code>.acc</code> was never used.</p>
      </Source>
      <A11y items={["A button with aria-expanded controls a named region.","A closed section can't be tabbed into."]} />
    </>
  )
}
