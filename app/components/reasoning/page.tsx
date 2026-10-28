import type { Metadata } from "next"
import { ReasoningDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Reasoning" }

export default function Page() {
  return (
    <>
      <PageHeader title="Reasoning" lead="How AiMY got to an answer, folded under it, step by step." />
      <Section title="How this was answered, and why a draft reads as it does">
        <ThemePair>
          <ReasoningDemo />
        </ThemePair>
      </Section>
      <Install name="reasoning" exports="Reasoning" />
      <Section title="Use it">
        <CodeBlock>
          {'<Reasoning steps={[{ what: "Searched 214 documents", why: "Your question named refunds" }]} />'}
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Write each step as something AiMY did, and why."
            dontText="Show raw model reasoning or a token count."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge folds &quot;How this was answered&quot; under every answer (<code>.act-log</code>): each step says
          what AiMY did and why. Sales does the same for an email draft (&quot;Why AiMY wrote it this way&quot;). The
          design system&apos;s &quot;Thought for 8s&quot; disclosure is used by neither product, so this follows the
          products: steps a person can check, not a timer. Opens with transitions.dev&apos;s accordion (21). Steps are
          in primary and secondary ink, where Knowledge used faint.
        </p>
      </Source>
      <A11y items={["A disclosure button that reports open or closed; the steps are an ordered list."]} />
    </>
  )
}
