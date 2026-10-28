import type { Metadata } from "next"
import { ChangeReviewDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Change review" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Change review"
        lead="A change with consequences, shown before it runs: now and after, why, and exactly what it will do."
      />
      <Section title="Settling a conflict, and a destructive change from a typed request">
        <ThemePair>
          <ChangeReviewDemo />
        </ThemePair>
      </Section>
      <Install name="change-review conflict-pair" exports="ChangeReview, ConflictPair" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<ChangeReview open={open} onOpenChange={setOpen} title="Archive documents"\n  now="12 documents on the surface" after="9 archived" word="archive" confirmLabel="Archive" danger\n  effects={[{ tone: "ok", children: <><strong>9</strong> documents will be archived.</> },\n            { tone: "skip", children: <><strong>3</strong> are already excluded…</> }]}\n  onConfirm={archive} onUndo={unarchive} done="9 documents archived" />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say how many it acts on and what it leaves alone."
            dontText="Run a bulk change straight from a chat message."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s commit surface: Now and After side by side, the reason, and &quot;What this will do&quot;.
          The rows say what changes, what needs care, and what is skipped and why, then &quot;Reversible for 24h ·
          logged to the audit trail&quot;. A destructive change asks for its word to be typed (case and spaces ignored).
          Confirming toasts with Undo, logged to the audit trail. This is the doctrine&apos;s ladder for governed and
          irreversible changes. A write typed as free text is staged here, never run: &quot;Writes with consequence do
          not go through free text.&quot; It also states the scope of bulk work, the way both products do, so the design
          system&apos;s set-scope bar is not built (your choice). ConflictPair is Knowledge&apos;s two disagreeing
          sources, each with Make this the one.
        </p>
      </Source>
      <A11y
        items={["A dialog: focus moves in and returns; the confirm button stays disabled until the word matches."]}
      />
    </>
  )
}
