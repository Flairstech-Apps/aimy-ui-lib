import type { Metadata } from "next"
import { DecisionZoneDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Decision zone" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Decision zone"
        lead="A proposal with consequences, decided in place: Accept, Edit or Reject."
      />
      <Section title="A revised SLA, awaiting you">
        <ThemePair>
          <DecisionZoneDemo />
        </ThemePair>
      </Section>
      <Install name="decision-zone" exports="DecisionZone" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<DecisionZone prompt="Apply the revised P1 SLA to 4 teams?" consequence="Reversible for 24 hours."\n  onAccept={apply} onEdit={editValues} onReject={reject} onUndo={revert}\n  accepted={{ prompt: "Revised P1 SLA applied to 4 teams." }} rejected={{ prompt: "Proposal rejected." }} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say what happens and how long it stays reversible."
            dontText="Offer only Accept and Reject."
          />
        </div>
      </Section>
      <Source>
        <p>
          Built from the design system&apos;s <code>.decision-zone</code>, your call on 28 Oct: neither product draws
          one. The question, what it will do and how long it stays reversible, Accept, Edit and Reject, and Awaiting
          you. Then it says what was decided, by whom and until when it can be undone, with Undo. Edit is not optional
          (the spec&apos;s rule), so the component requires an edit handler. For a wording change use Suggestion; for a
          governed change with a diff, Change review.
        </p>
      </Source>
      <A11y items={["A region named Decision; the outcome is announced when it changes."]} />
    </>
  )
}
