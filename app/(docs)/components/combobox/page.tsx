import type { Metadata } from "next"
import { ComboboxDemo } from "@/components/docs/behavior-parts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Combobox" }

export default function Page() {
  return (
    <>
      <PageHeader title="Combobox" lead="Choose one option by typing to narrow a long list: an owner, a company, a product. Focus stays in the field while you move through what matches." />
      <Section title="Typing narrows the list; a second line says what each one is">
        <ThemePair>
          <ComboboxDemo />
        </ThemePair>
      </Section>
      <Install name="combobox" exports="Combobox" />
      <Section title="Use it">
        <CodeBlock>{"<Field label=\"Company\">\n  <Combobox\n    options={[{ value: \"kestrel\", label: \"Kestrel Logistics\", description: \"Freight, 1,200 people\" }]}\n    value={company}\n    onValueChange={setCompany}\n  />\n</Field>"}</CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-body text-ink-secondary">
          For a server search, fetch with the words from <code>onQueryChange</code>, pass what comes back as{" "}
          <code>options</code>, and set <code>filter=&#123;false&#125;</code> so the words don&apos;t narrow the answer
          again. <code>autoFocus</code> puts focus in the field when it first shows.
        </p>
        <CodeBlock>{"<Combobox label=\"Person\" options={people} filter={false}\n  onQueryChange={(q) => search(q).then(setPeople)} onValueChange={setPerson} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use a combobox when the list is long enough that people would rather type: more than about fifteen options." dontText="Use it for five options. Use Select, or Segmented for two or three." />
          <DoDont doText="Match on more than the name: the description is searched too, so \u201cfreight\u201d finds Kestrel." dontText="Make people remember the exact spelling of the first word." />
        </div>
      </Section>
      <Source>
        <p>Built on AiMY's listbox behaviour (<code>createListbox</code>) and the popper primitive. The field is the box field (<code>controlStyles.box</code>); the panel and rows are Select's (<code>.v2-dropdown</code> as Knowledge draws it), with the chosen row on the brand wash in the AI ink and a check. Opens with transitions.dev's menu dropdown (05).</p>
      </Source>
      <A11y items={["A combobox with a listbox popup: aria-expanded, aria-controls and aria-activedescendant follow the list, so focus never leaves the field.", "ArrowDown opens it; the arrows, Page Up and Page Down move; Enter chooses; Escape closes, and leaving puts the chosen text back.", "When nothing matches, a status line says so, and it is read out."]} />
    </>
  )
}
