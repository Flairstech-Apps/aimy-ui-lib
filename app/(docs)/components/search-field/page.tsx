import type { Metadata } from "next"
import { SearchDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Search field" }

export default function Page() {
  return (
    <>
      <PageHeader title="Search field" lead="Find as you type. The clear button appears only when there is something to clear; Escape clears too." />
      <Section title="Box and line">
        <ThemePair>
          <SearchDemo />
        </ThemePair>
      </Section>
      <Install name="search-field" exports="SearchField" />
      <Section title="Use it">
        <CodeBlock>{"<SearchField label=\"Search contacts\" value={q} onValueChange={setQ} />\n<SearchField label=\"Search documents\" variant=\"line\" />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Filter as people type, and keep their place and focus." dontText="Make people press Enter or a Search button to filter a short list." />
        </div>
      </Section>
      <Source>
        <p>The box is Sales&apos; <code>.b-find</code>; the line is Knowledge&apos;s <code>.k-search</code> after its underline override. Both replaced the browser&apos;s own clear button with their own, and so does this. Focus is the brand in both.</p>
      </Source>
      <A11y items={["A searchbox named by label, which is also the default placeholder.","The clear button is named Clear search."]} />
    </>
  )
}
