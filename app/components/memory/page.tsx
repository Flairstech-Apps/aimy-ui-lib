import type { Metadata } from "next"
import { MemoryDemos } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Memory" }

export default function Page() {
  return (
    <>
      <PageHeader title="Memory" lead="What AiMY carries forward, and the way to make it forget." />
      <Section title="Carried into a thread, and everything AiMY remembers about a person">
        <ThemePair>
          <MemoryDemos />
        </ThemePair>
      </Section>
      <Install name="memory-panel memory-list" exports="MemoryPanel, MemoryList" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<MemoryPanel age="Yesterday, 16:40" lines={lines} onForget={forget} onRestore={restore} onDrop={answerWithout} />\n<MemoryList title="What AiMY remembers about Dana" facts={facts} onForget={forget} onRestore={restore} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show where each memory came from, and let it be forgotten."
            dontText="Carry memory the person can't see or decline."
          />
        </div>
      </Section>
      <Source>
        <p>
          MemoryPanel is Knowledge&apos;s: the last exchanges carried from an earlier thread, and Answer without it,
          always there (the rule: memory the person cannot decline is surveillance, not continuity). MemoryList is new,
          your call on 28 Oct: neither product nor the design system has a forgetting control. Every fact says where it
          came from; each can be forgotten in a click with Undo; forgetting all of it asks once, in place, then offers
          Undo. The panel&apos;s lines can be forgotten one by one too.
        </p>
      </Source>
      <A11y items={["Forget buttons name what they forget; Undo is in the toast."]} />
    </>
  )
}
