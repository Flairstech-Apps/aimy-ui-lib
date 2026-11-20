import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { TagInputDemo } from "@/components/docs/multi-tag-demos"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Tag input" }

export default function TagInputPage() {
  return (
    <>
      <PageHeader title="Tag input" lead="Values typed in as tags. Enter or a comma adds one, Backspace takes the last back, and a refused one says why." />
      <Section title="Try it">
        <ThemePair>
          <TagInputDemo />
        </ThemePair>
      </Section>
      <Install name="tag-input" exports="TagInput" />
      <Section title="Use it">
        <CodeBlock>{`<Field label="Regions">
  <TagInput value={regions} onValueChange={setRegions} placeholder="Add a region"
    validate={(t) => (isRegion(t) ? null : "Use a region code, like EMEA.")} />
</Field>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont doText="Say why a tag was refused, in a sentence with an example." dontText="Drop a tag silently, or turn the field red with no words." />
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>.tag-input</code> (<code>aimy-ds.css</code> 2780-2797): the raised ground with a 1px edge
          that takes the focus ring, tokens on the accent&apos;s dim ground with a 25% accent edge, each with its own
          remove control, then the text box. Changed: the remove control is a named button with a 24px target, at full
          strength rather than faded to 65%.
        </p>
      </Source>
      <A11y items={["Each tag's remove control is a button named for the tag.", "A refused tag is announced as an alert and marks the box invalid; an input method's Enter never adds a tag."]} />
    </>
  )
}
