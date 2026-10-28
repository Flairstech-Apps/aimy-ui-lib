import type { Metadata } from "next"
import { StatesDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Empty and error states" }

export default function Page() {
  return (
    <>
      <PageHeader title="Empty and error states" lead="When there's nothing to show, say why and offer the way forward. When something fails, say nothing was lost." />
      <Section title="No matches, nothing yet, couldn't load">
        <ThemePair>
          <StatesDemo />
        </ThemePair>
      </Section>
      <Install name="empty-state" exports="EmptyState, ErrorState" />
      <Section title="Use it">
        <CodeBlock>{"<EmptyState icon={<SearchX />} title=\"No matches\"\n  description=\"134 contacts, none of them matching all of these filters.\"\n  actions={<Button size=\"sm\" onClick={clear}>Clear filters</Button>} />\n<ErrorState onRetry={load} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Count what's there and name the fix: 134 contacts, none matching. Clear filters." dontText="Write No data." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s <code>.empty-state</code> (dashed edge, icon tile, a sentence that counts what&apos;s there) and settings <code>.set2-empty</code> (plain), and Knowledge&apos;s <code>.error-state</code> (dashed error edge, Retry). Sales says empty in a single sentence (<code>.s-none</code>); use the description alone for that.</p>
      </Source>
      <A11y items={["ErrorState is announced at once.","Buttons say what they do: Clear filters, Try again."]} />
    </>
  )
}
