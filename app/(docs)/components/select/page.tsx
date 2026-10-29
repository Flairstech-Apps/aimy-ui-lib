import type { Metadata } from "next"
import { SelectDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Select" }

export default function Page() {
  return (
    <>
      <PageHeader title="Select" lead="Choose one option from a list. The only select control in AiMY: never a native select." />
      <Section title="Default, placeholder, and inside a Field with an error">
        <ThemePair>
          <SelectDemo />
        </ThemePair>
      </Section>
      <Install name="select" exports="Select, SelectItem" />
      <Section title="Use it">
        <CodeBlock>{"<Select label=\"Owner\" value={owner} onValueChange={setOwner}>\n  <SelectItem value=\"engy\">Engy Hassan</SelectItem>\n  <SelectItem value=\"lina\">Lina Farouk</SelectItem>\n</Select>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use a select for one choice from more than four options." dontText="Use a select for two or three options. Use Segmented." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s <code>.v2-dropdown</code> as drawn after its override: a pill with an inset ring, a brand ring while open, a raised panel with 10px corners, the chosen option on a brand wash in the AI ink with a 5px dot. Weight 500 (Knowledge used 600). The keyboard model matches Knowledge&apos;s hand-written one, through Radix. The panel opens and closes with transitions.dev&apos;s menu dropdown (05). Sales&apos; pick menus (<code>.b-menu</code>) are a different control, a menu, and come with Batch C.</p>
      </Source>
      <A11y items={["A combobox with a listbox: arrow keys, Home, End, typeahead, Enter and Escape, and focus returns to the select.","Name it with label, or put it in a Field."]} />
    </>
  )
}
