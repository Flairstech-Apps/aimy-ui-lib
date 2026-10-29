import type { Metadata } from "next"
import { SkeletonDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Skeleton" }

export default function Page() {
  return (
    <>
      <PageHeader title="Skeleton" lead="A placeholder shaped like what's coming, then a soft cross-fade to the real thing." />
      <Section title="Loading, then revealed">
        <ThemePair>
          <SkeletonDemo />
        </ThemePair>
      </Section>
      <Install name="skeleton" exports="Skeleton, SkeletonCard, Reveal" />
      <Section title="Use it">
        <CodeBlock>{"<Reveal loading={isLoading} label=\"Loading contacts\" skeleton={<SkeletonCard />}>\n  <ContactCard … />\n</Reveal>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Shape the skeleton like the content, and show it only on a first load." dontText="Show a spinner in the middle of an empty page." />
        </div>
      </Section>
      <Source>
        <p>Sales&apos; skeleton card over each card slot (<code>skelCard()</code>) and Knowledge&apos;s stage skeletons. The products shimmered; transitions.dev&apos;s skeleton reveal (14) pulses the bars and cross-fades with a 2px blur over 400ms, as the plan maps it. Both products show a skeleton only on a first visit; keep that.</p>
      </Source>
      <A11y items={["While loading, the area is busy and named: Loading contacts.","The pulse stops under reduced motion."]} />
    </>
  )
}
