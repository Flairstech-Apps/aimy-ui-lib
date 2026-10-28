import type { Metadata } from "next"
import { FieldsDemo } from "@/components/docs/forms-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Field and text inputs" }

export default function Page() {
  return (
    <>
      <PageHeader title="Field and text inputs" lead="A label above, the control, then help or the error below. Two looks: a box for settings and pages, a line for forms inside dialogs and AiMY panels." />
      <Section title="Box, the default. Press Save with the name empty">
        <ThemePair>
          <FieldsDemo variant="box" />
        </ThemePair>
      </Section>
      <Section title="Line">
        <ThemePair>
          <FieldsDemo variant="line" />
        </ThemePair>
      </Section>
      <Install name="field input textarea password-field" exports="Field, Input, Textarea, PasswordField" />
      <Section title="Use it">
        <CodeBlock>{"<Field label=\"Contact name\" error={errors.name}>\n  <Input value={name} onChange={e => setName(e.target.value)} />\n</Field>\n<Field label=\"Notes\" help=\"AiMY drafts the reply from this.\" optional>\n  <Textarea rows={2} />\n</Field>\n<Field label=\"Auth token\">\n  <PasswordField secretName=\"the token\" />\n</Field>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Put the label above the field and say what is wrong and how to fix it: It still needs a name." dontText="Use the placeholder as the label, or write Invalid input." />
          <DoDont doText="Mark the optional fields and leave required ones plain." dontText="Put a red asterisk on every required field." />
        </div>
      </Section>
      <Source>
        <p>The box is Knowledge&apos;s settings field (<code>.set2-fld</code>): card ground, edge, 36px, brand focus. The line is the underline Knowledge uses in AiMY panels and dialogs and Sales uses in its draft forms (<code>.b-draft-in</code>), with brand focus instead of Sales&apos; accent, because focus is always the brand. Text is 16px. Textarea grows with its text like Sales&apos; <code>.b-draft-area</code>. The products never marked a field invalid for screen readers; this does.</p>
      </Source>
      <A11y items={["The label is a real label tied to the control.","Help and errors are tied to the control with aria-describedby; an error also sets aria-invalid.","The error stays until it is fixed. The shake runs once when it appears, unless reduced motion is on."]} />
    </>
  )
}
