import type { Metadata } from "next"
import { TreeDemo } from "@/components/docs/behavior-parts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Tree" }

export default function Page() {
  return (
    <>
      <PageHeader title="Tree" lead="Nested items you open and close: collections in a knowledge base, folders and files, a team under a department." />
      <Section title="Single choice, and checks that roll up to folders">
        <ThemePair>
          <TreeDemo />
        </ThemePair>
      </Section>
      <Install name="tree" exports="Tree" />
      <Section title="Use it">
        <CodeBlock>{"<Tree\n  label=\"Collections\"\n  items={[{ id: \"policies\", label: \"Policies\", children: [{ id: \"leave\", label: \"Leave and holidays\" }] }]}\n  selected={selected}\n  onSelect={setSelected}\n/>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Give folders a count or date in meta when it helps people choose where to look." dontText="Nest deeper than four levels. Flatten, or split into a second view." />
          <DoDont doText="Use checkable for choosing many (what AiMY may read), single choice for navigating." dontText="Mix both: a row that both opens a page and has a box." />
        </div>
      </Section>
      <Source>
        <p>Built on AiMY's tree behaviours (<code>treeDataNodes</code>, <code>visibleTreeRows</code>, <code>treeCheckedStates</code>, <code>createTreeNavigation</code>). Rows are 32px, indented 16px a level; the chosen row is Select's chosen option (brand wash, AI ink); the boxes are the library's Checkbox drawn inline.</p>
      </Source>
      <A11y items={["A tree with treeitems carrying aria-level, aria-posinset, aria-setsize and aria-expanded; one Tab stop.", "Up and Down move; Right opens or steps in; Left closes or steps out; Home and End; * opens the siblings; letters jump.", "With checkable, rows are aria-checked true, false or mixed; Space or Enter toggles."]} />
    </>
  )
}
