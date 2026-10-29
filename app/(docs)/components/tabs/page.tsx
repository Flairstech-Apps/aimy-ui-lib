import type { Metadata } from "next"
import { TabsDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Tabs" }

export default function Page() {
  return (
    <>
      <PageHeader title="Tabs" lead="Views of one thing, side by side. The chosen one is underlined and the bar slides between them." />
      <Section title="Page size, with counts, and section size">
        <ThemePair>
          <TabsDemo />
        </ThemePair>
      </Section>
      <Install name="tabs" exports="Tabs, TabsList, Tab, TabPanel" />
      <Section title="Use it">
        <CodeBlock>{"<Tabs defaultValue=\"contacts\" size=\"page\">\n  <TabsList aria-label=\"Views\">\n    <Tab value=\"contacts\" count={134}>Contacts</Tab>\n    <Tab value=\"calls\" count={12}>Calls</Tab>\n  </TabsList>\n  <TabPanel value=\"contacts\">…</TabPanel>\n  <TabPanel value=\"calls\">…</TabPanel>\n</Tabs>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use tabs for views of the same records." dontText="Use tabs to move between pages of the product. That is the topnav." />
        </div>
      </Section>
      <Source>
        <p>size page is Sales&apos; view switcher (<code>h2.b-switch</code>): 18px words, a count beside each, the chosen one in the ink with its count in the accent ink and a 2px ink bar. size section is Knowledge&apos;s settings tabs (<code>.set2-tabs</code>): 14px, a hairline under the strip, a brand underline. The bar slides with transitions.dev&apos;s tabs sliding (16). Sales&apos; switcher had no roles or arrow keys; this is a real tablist.</p>
      </Source>
      <A11y items={["A tablist: arrow keys move between tabs, and each tab controls its panel.","Counts are read after the label."]} />
    </>
  )
}
