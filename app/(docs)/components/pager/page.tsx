import type { Metadata } from "next"
import { PagerDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Pager" }

export default function Page() {
  return (
    <>
      <PageHeader title="Pager" lead="Where you are in a long list, in words, with Back and Next." />
      <Section title="134 contacts, 15 to a page">
        <ThemePair>
          <PagerDemo />
        </ThemePair>
      </Section>
      <Install name="pager" exports="Pager" />
      <Section title="Use it">
        <CodeBlock>{"<Pager total={134} page={page} pageSize={15} noun=\"contacts\" onPageChange={setPage} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say the range and the total in words." dontText="Show a strip of page numbers nobody can tell apart." />
        </div>
      </Section>
      <Source>
        <p>Sales&apos; pager (<code>pager()</code>, nine lists): the range in words and Back and Next as quiet text actions that say how many. No page-number strip. The design system&apos;s <code>.pager</code> was never used.</p>
      </Source>
      <A11y items={["A navigation region named after what it pages.","The range is announced when the page changes."]} />
    </>
  )
}
