import type { Metadata } from "next"
import { UnavailableDemo } from "@/components/docs/ai2-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "When AiMY is unavailable" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="When AiMY is unavailable"
        lead="The product keeps working. The composer says what still works, and nothing typed is lost."
      />
      <Section title="The composer while AiMY is down">
        <ThemePair>
          <UnavailableDemo />
        </ThemePair>
      </Section>
      <Install name="composer" exports="Composer" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Composer unavailable={aiDown ? "AiMY is unavailable — the filters still work" : undefined} onSubmit={ask} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what still works." dontText="Disable the product because AiMY is down." />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s degraded bar, your choice on 28 Oct (<code>?state=ai-down</code>): the placeholder says what
          still works and the send button steps back. Knowledge also faded the whole bar and disabled the field; here
          the words stay at full strength and the field stays usable, so nothing typed is lost. A question sent while
          AiMY is down waits, the send button says Sends when AiMY is back, and it goes when AiMY returns. The doctrine:
          AI-unavailable is a designed state, it says what still works, and it never loses staged work. The design
          system&apos;s &quot;AiMY can&apos;t answer right now&quot; panel and offline bar are used by neither product,
          so they are not built.
        </p>
      </Source>
      <A11y items={["The state is in the placeholder's words; the send button's name says what will happen."]} />
    </>
  )
}
