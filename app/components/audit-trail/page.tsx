import type { Metadata } from "next"
import { AuditTrailDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Audit trail" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Audit trail"
        lead="A record of governed changes: what, who, when, and whether it can be reverted."
      />
      <Section title="Four entries, one by AiMY">
        <ThemePair>
          <AuditTrailDemo />
        </ThemePair>
      </Section>
      <Install name="audit-trail" exports="AuditTrail" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<AuditTrail entries={[{ id: "1", tone: "ai", action: "18 unowned tickets reassigned", who: "AiMY",\n  how: "direct action under the overnight backlog rule", time: "06:14", onRevert: revert }]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say whether each change can be reverted." dontText="Leave an entry without its actor." />
        </div>
      </Section>
      <Source>
        <p>
          Built from the design system&apos;s <code>.audit-trail</code>, your call on 28 Oct: neither product draws one.
          Each entry names the change, the actor and how it came about, the time, and Revert or Irreversible, so every
          entry declares one or the other. AiMY&apos;s entries carry its mark on AiMY blue and say AiMY. For what
          happened to contacts day to day, use Activity (Sales&apos;).
        </p>
      </Source>
      <A11y items={["An ordered list; Revert buttons name the change they revert."]} />
    </>
  )
}
