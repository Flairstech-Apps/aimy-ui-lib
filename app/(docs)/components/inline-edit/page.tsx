import type { Metadata } from "next"
import { InlineEditDemo } from "@/components/docs/behavior-parts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Inline edit" }

export default function Page() {
  return (
    <>
      <PageHeader title="Inline edit" lead="Rename or change one value where it sits: a list's name, a deal's title, a note. No dialog, no separate edit page." />
      <Section title="A title and a note">
        <ThemePair>
          <InlineEditDemo />
        </ThemePair>
      </Section>
      <Install name="inline-edit" exports="InlineEdit" />
      <Section title="Use it">
        <CodeBlock>{"<InlineEdit\n  label=\"List name\"\n  size=\"title\"\n  value={name}\n  onSave={saveName}\n  validate={(v) => (v.trim() ? null : \"Give the list a name.\")}\n/>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Save on Enter and on leaving the field, and put it back on Escape. Say what went wrong under the field if a save fails." dontText="Add Save and Cancel buttons around a single value." />
          <DoDont doText="Use it for one value. For several related values, use a form." dontText="Make a whole card editable in place." />
        </div>
      </Section>
      <Source>
        <p>Built on AiMY's inline edit behaviour (<code>createInlineEdit</code>). At rest it is the text itself with a Lucide pencil on hover and focus, centred on the first line; editing uses the box field (<code>controlStyles.box</code>) in the same type size, so nothing shifts.</p>
      </Source>
      <A11y items={["At rest, a button named by the label and the value: “List name: Q4 renewals. Press to change.”", "Editing, the field is named by the label; a refusal is an alert tied to the field with aria-describedby, and the field is marked invalid.", "Focus returns to the text after saving or putting it back."]} />
    </>
  )
}
