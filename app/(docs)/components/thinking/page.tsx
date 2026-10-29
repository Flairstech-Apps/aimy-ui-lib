import type { Metadata } from "next"
import { ThinkingDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Thinking" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Thinking"
        lead="AiMY at work before any words: the think-mark and a line saying what it is doing."
      />
      <Section title="Knowledge's beats, Sales' fixed line, and the bare form for a peek card">
        <ThemePair>
          <ThinkingDemo />
        </ThemePair>
      </Section>
      <Install name="thinking" exports="ThinkingIndicator, ThinkMark" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<ThinkingIndicator label={["Searching the corpus", "Reading 3 documents", "Composing the answer"]} />\n<ThinkingIndicator label="Reading the record…" />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what AiMY is doing: Reading 3 documents." dontText="Write Loading, or show a spinner." />
        </div>
      </Section>
      <Source>
        <p>
          The think-mark is ported line for line from Knowledge (<code>knowledge.js</code>, about line 15444), which
          Sales copied verbatim. About ninety dots sampled from the AiMY mark scatter, orbit and gather on a 2.56s
          cycle. Each dot keeps the colour of the petal it left, read from the mark&apos;s own gradient. Under reduced
          motion the mark is drawn once, at rest. The line is transitions.dev&apos;s thinking states (28): it shimmers
          while a beat holds, then swaps up to the next, in secondary ink lifting to primary. Knowledge steps through
          three beats; Sales holds one line. The design system&apos;s three dots are used by neither product, so there
          are none.
        </p>
      </Source>
      <A11y
        items={[
          "A status region: the current line is read out.",
          "The canvas is hidden from screen readers; the words carry the meaning.",
        ]}
      />
    </>
  )
}
