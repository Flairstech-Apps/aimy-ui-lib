import type { Metadata } from "next"
import { ResponseActionsDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Response actions" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Response actions"
        lead="What a person can do with an answer: copy it, ask again, see what it stands on, and say whether it helped."
      />
      <Section title="Under an answer">
        <ThemePair>
          <ResponseActionsDemo />
        </ThemePair>
      </Section>
      <Install name="response-actions" exports="ResponseActions" />
      <Section title="Use it">
        <CodeBlock>
          {
            "<ResponseActions text={answer} onRetry={askAgain} sources={3}\n  sourcesOpen={open} onSourcesChange={setOpen} rating={rating} onRate={save} />"
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Record a rating against the answer, and say so."
            dontText="Ask why in a dialog after a thumbs down."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>.msg-acts</code>: Copy, Retry, the N sources an answer stands on, and Useful or Not
          useful (one at a time; press again to clear). Each says what happened in a toast, with Knowledge&apos;s words.
          Sales has none. Always shown in secondary ink, your choice on 28 Oct; Knowledge hid the row until hover and
          drew it in faint ink. The design system&apos;s icon-only <code>.ai-actions</code> is used by neither product.
        </p>
      </Source>
      <A11y
        items={[
          "A labelled group. The rating buttons are toggles (pressed or not) with names, not just thumbs.",
          "Sources reports whether its list is open.",
        ]}
      />
    </>
  )
}
