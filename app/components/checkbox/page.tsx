import type { Metadata } from "next"
import { ChoiceDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Checkbox" }

export default function Page() {
  return (
    <>
      <PageHeader title="Checkbox" lead="On or off for one item, or some for a group." />
      <Section title="On, off, some, disabled">
        <ThemePair>
          <ChoiceDemo />
        </ThemePair>
      </Section>
      <Install name="checkbox" exports="Checkbox" />
      <Section title="Use it">
        <CodeBlock>{"<Checkbox label=\"Only my calls\" checked={mine} onCheckedChange={setMine} />\n<Checkbox label=\"All teams\" checked=\"indeterminate\" />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use a checkbox when the choice applies on Save." dontText="Use a checkbox for something that takes effect at once. Use a Switch." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s settings checkbox <code>.set2-ck2</code>: 17px, a 1px edge, the brand fill with a white tick, a 28px hit area. The tick draws itself in with transitions.dev&apos;s checkbox check (25).</p>
      </Source>
      <A11y items={["A checkbox role with aria-checked, including mixed.","Clicking the words toggles it."]} />
    </>
  )
}
