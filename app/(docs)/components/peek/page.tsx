import type { Metadata } from "next"
import { PeekDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Peek" }

export default function Page() {
  return (
    <>
      <PageHeader title="Peek" lead="A quick answer that rises out of the float bar, without leaving the work." />
      <Section title="Ask, then tuck it away or open the canvas">
        <PeekDemo />
      </Section>
      <Install name="peek" exports="Peek" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<div className="relative">\n  <Peek status={status} onOpenCanvas={openCanvas} onDismiss={dismiss} actions={<Suggestions variant="follow" … />}>\n    <StreamingText text={answer} streaming={status === "streaming"} />\n  </Peek>\n  <Composer … />\n</div>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Keep a quick answer above the bar, and open the canvas only when asked."
            dontText="Open the canvas for every question."
          />
        </div>
      </Section>
      <Source>
        <p>
          Both products&apos; answer card (Sales&apos; <code>.b-peek</code>, Knowledge&apos;s <code>.aimy-peek</code>,
          the same in both): composer-skin ground, 24px corners, its bottom tucked 14px under the bar. It thinks with
          the think-mark, then the answer arrives; three lines show and the rest fades. Pressing it opens the canvas.
          Sales&apos; one-click questions sit under it. The grip folds it into the bar and back. Drag up past 40px opens
          the canvas, down tucks it, a press elsewhere tucks it, and × dismisses it. Added: Escape tucks it. Words
          arrive with the streaming text you chose, where both products typed characters.
        </p>
      </Source>
      <A11y
        items={[
          "The answer is a polite status; the grip says Put this answer away or Bring this answer back.",
          "Every control is a real button.",
        ]}
      />
    </>
  )
}
