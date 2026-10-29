import type { Metadata } from "next"
import { StreamDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Streaming text" }

export default function Page() {
  return (
    <>
      <PageHeader title="Streaming text" lead="An answer arriving word by word, each word resolving into place." />
      <Section title="Stream an answer">
        <ThemePair>
          <StreamDemo />
        </ThemePair>
      </Section>
      <Install name="streaming-text" exports="StreamingText" />
      <Section title="Use it">
        <CodeBlock>{"<StreamingText text={partial} streaming={!done} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Pass the text so far and let the component pace it."
            dontText="Animate characters with a typing caret."
          />
        </div>
      </Section>
      <Source>
        <p>
          transitions.dev&apos;s streaming text (30), your choice on 28 Oct: each word fades up from a 1px blur over
          350ms, one every 60ms. Knowledge typed about 1,100 characters a second with a blinking accent caret; Sales
          showed answers whole. Words that arrive faster than 60ms queue and catch up. Text already there when it
          mounts, such as an earlier answer, shows at once.
        </p>
      </Source>
      <A11y items={["Busy while words are still arriving.", "Under reduced motion each word simply appears."]} />
    </>
  )
}
