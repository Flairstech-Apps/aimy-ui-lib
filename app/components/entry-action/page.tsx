import type { Metadata } from "next"
import { EntryActionDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Entry action" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Entry action"
        lead="Every action says how it will behave: do it now, show a proposal, or open a conversation."
      />
      <Section title="Direct, review, investigate, prompt">
        <ThemePair>
          <EntryActionDemo />
        </ThemePair>
      </Section>
      <Install name="entry-action" exports="EntryAction" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<EntryAction mode="direct" onClick={archive}>Archive it</EntryAction>\n<EntryAction mode="review" onClick={propose}>Re-sync</EntryAction>\n<EntryAction mode="investigate" aimy onClick={compare}>Compare</EntryAction>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Classify every action, and keep one direct action per surface."
            dontText="Make a reviewed change look like a direct one."
          />
        </div>
      </Section>
      <Source>
        <p>
          The doctrine&apos;s four entry modes (§3), on Sales&apos; three tiers, your choice on 28 Oct. Direct does the
          thing and offers Undo, so it is the one filled button per surface. Review shows a proposal to Accept, Edit or
          Reject, so it is the quiet secondary. Investigate and prompt open a conversation, so they are accent text,
          part of a sentence. Sales counted eleven button treatments and five tints all saying press me; the modes keep
          their meaning and lose their colours. Knowledge gives each mode its own tint. The mode is a required prop, so
          an unclassified action does not compile, which is the doctrine&apos;s &quot;classification is mandatory&quot;.
          The AiMY mark leads actions AiMY carries out (Knowledge&apos;s compare, find a successor, connect).
        </p>
      </Source>
      <A11y items={["Real buttons with the mode in data-entry-mode; the label says what happens."]} />
    </>
  )
}
