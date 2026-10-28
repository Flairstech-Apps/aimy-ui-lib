import type { Metadata } from "next"
import { AimyNoteDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "AiMY note" }

export default function Page() {
  return (
    <>
      <PageHeader title="AiMY note" lead="One useful sentence from AiMY on a record, and what it read it from." />
      <Section title="Notes on a contact">
        <ThemePair>
          <AimyNoteDemo />
        </ThemePair>
      </Section>
      <Install name="aimy-note" exports="AimyNote" />
      <Section title="Use it">
        <CodeBlock>
          {'<AimyNote from="this record’s own history">3 attempts and nobody has picked up.</AimyNote>'}
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what AiMY read it from." dontText="Put an AI sentence on a record with no source." />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; <code>.b-aimy</code>: the AiMY mark, one sentence, where it came from (&quot;the last call&quot;,
          &quot;your LinkedIn network&quot;), and one control. Quiet on a tinted card, warm when something is missing,
          body size when it leads a record. Sales&apos; own copy.
        </p>
      </Source>
      <A11y items={["Read as AiMY: and the sentence; the mark is decoration."]} />
    </>
  )
}
