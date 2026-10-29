import type { Metadata } from "next"
import { SuggestionsDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Suggestions" }

export default function Page() {
  return (
    <>
      <PageHeader title="Suggestions" lead="Questions AiMY offers, one click to ask." />
      <Section title="Openers in an empty conversation, follow-ups under an answer">
        <ThemePair>
          <SuggestionsDemo />
        </ThemePair>
      </Section>
      <Install name="suggestions" exports="Suggestions" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Suggestions items={["Who is due today?", "What happened yesterday?"]} onPick={ask} />\n<Suggestions variant="follow" items={next} onPick={ask} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Write the question a person would ask: Who is due today?"
            dontText="Write a command: Show due items."
          />
        </div>
      </Section>
      <Source>
        <p>
          Both products&apos; <code>.overlay-sugg-chip</code>: pill chips that tint to the accent on hover, frosted on
          the light canvas. Openers sit centred in an empty conversation (Knowledge&apos;s gate and canvas, Sales&apos;
          canvas). Follow-ups sit under an answer, in line with the bubble (Knowledge&apos;s <code>.msg-follow</code>).
          They rise in 40ms apart, Knowledge&apos;s entrance on the motion tokens. The text is Sales&apos; 14px;
          Knowledge used 12px.
        </p>
      </Source>
      <A11y items={["A labelled group of buttons; each says the whole question."]} />
    </>
  )
}
