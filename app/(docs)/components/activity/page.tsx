import type { Metadata } from "next"
import { ActivityDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Activity" }

export default function Page() {
  return (
    <>
      <PageHeader title="Activity" lead="What happened, who did it and when. When AiMY did it, it says AiMY." />
      <Section title="A day's activity">
        <ThemePair>
          <ActivityDemo />
        </ThemePair>
      </Section>
      <Install name="activity" exports="Activity" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Activity items={[{ id: "1", subject: "Youssef Amin", outcome: "Moved to Needs reply", by: "aimy", when: "09:15",\n  note: "He asked for a callback after 3pm." }]} onOpen={open} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say AiMY when AiMY did it." dontText="Log an automatic action under the person's name." />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; activity rows (<code>campTouchRow</code>), your choice on 28 Oct over the design system&apos;s
          audit list, which neither product uses. Each row is who or what it was about, what happened in the
          outcome&apos;s colour, who did it and when, and the note under it. AiMY&apos;s actions say AiMY, never the
          person&apos;s name (Sales&apos; <code>whoDid</code>). Skips are said in the note, in a sentence, as Sales
          does: &quot;Nobody was called — 2 people skipped.&quot;
        </p>
      </Source>
      <A11y items={["An ordered list; each subject is a button that opens it."]} />
    </>
  )
}
