import type { Metadata } from "next"
import { SuggestionDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Suggestion" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Suggestion"
        lead="A change AiMY proposes, shown as a change, with Accept, Edit and Reject. Never applied silently."
      />
      <Section title="AiMY drafting, then proposing">
        <ThemePair>
          <SuggestionDemo />
        </ThemePair>
      </Section>
      <Install name="suggestion" exports="Suggestion" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Suggestion title="Tighten the refund rule" before={current} after={proposed}\n  onAccept={(text, edited) => apply(text, edited)} onUndo={revert} onReject={keep} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show what changes, and let the person edit it before accepting."
            dontText="Apply an AI change and tell them after."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s editor suggestion (<code>.ai-suggestion</code>): the current wording struck through in red,
          the new wording after it in green, and Accept, Edit, Reject. Edit makes the new wording editable in place and
          selects it; Accept applies what is there and files it as a version with AiMY as the author (toast with Undo);
          Reject keeps it in the trail. The outcome stays written under the proposal. While AiMY is writing it, a
          placeholder shows the step it is on. The proposal arrives with Knowledge&apos;s motion: the box rises, the old
          wording is set aside, the new follows out of a blur. Fixed from Knowledge: its Undo after Accept fell through
          to the browser&apos;s back button; here Undo calls yours. The design system&apos;s decision zone is used by
          neither product.
        </p>
      </Source>
      <A11y items={["A named group; Accept, Edit and Reject are buttons; the outcome is announced."]} />
    </>
  )
}
