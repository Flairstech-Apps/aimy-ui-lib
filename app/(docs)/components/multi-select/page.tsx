import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { MultiSelectDemo } from "@/components/docs/multi-tag-demos"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Multi-select" }

export default function MultiSelectPage() {
  return (
    <>
      <PageHeader title="Multi-select" lead="Several choices behind one trigger. The trigger says what is chosen in words; every row is a real checkbox." />
      <Section title="Try it">
        <ThemePair>
          <MultiSelectDemo />
        </ThemePair>
      </Section>
      <Install name="multi-select" exports="MultiSelect" />
      <Section title="Use it">
        <CodeBlock>{`<Field label="Teams">
  <MultiSelect options={teams} value={chosen} onValueChange={setChosen} placeholder="Any team" name="team" />
</Field>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont
          doText="Use it to filter or assign by several known values: teams, stages, owners."
          dontText="Use it for one choice (that is Select), or for values people type in (that is TagInput)."
        />
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>.k-multi</code> (<code>knowledge.css</code> 7637-7715): the trigger of a single select
          and the panel of its dropdown, with a real checkbox on every row so Tab reaches each and Space ticks it, the
          whole row the label. Here the trigger is the library&apos;s Select pill and the rows are Checkbox; Select all
          appears from five options.
        </p>
      </Source>
      <A11y items={["The trigger opens a group of checkboxes, each with its own name; the trigger's words say what is chosen.", "With a name, each choice is sent with the form; disabled, none is."]} />
    </>
  )
}
