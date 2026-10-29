import type { Metadata } from "next"
import { NoteCanvasDemo } from "@/components/docs/diary-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Meeting in the canvas" }

export default function Page() {
  return (
    <>
      <PageHeader title="Meeting in the canvas" lead="The note taker opened full height in the AiMY Canvas." />
      <Section title="Taking notes, and when the notes are ready">
        <NoteCanvasDemo />
      </Section>
      <Install name="note-taker canvas" exports="NoteTaker, Canvas" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Canvas open={open} onOpenChange={setOpen} title={meeting}\n  meeting={<NoteTaker layout="canvas" meeting={meeting} phase={phase} seconds={secs} items={items}\n    summary={summary} onSend={send} onEnd={end} onBack={() => setOpen(false)} />} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Open the meeting in the canvas when there is reading to do."
            dontText="Squeeze the full notes into the widget."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s canvas view of the note taker (<code>mountCanvas</code> in notetaker.js 216;{" "}
          <code>.nt-cv</code>, notetaker.css 197-222), reached from the card&apos;s Open in the canvas. The same
          meeting, the same transcript, notes and composer, laid out full height: a header with the small orb, the
          meeting, its status and timer, the Transcription and Notes tabs with End notes in the middle, and Back to the
          meeting on the right; the transcript and the notes in a 42rem column centred in the canvas; the quick
          questions and the bar at the foot. On a canvas under 720px wide the header wraps and the tabs take their own
          row. The Canvas takes it through its <code>meeting</code> slot, in place of the thread, its basis and its
          composer, as Knowledge hides them for a meeting. Knowledge also lists the meeting first in the conversations
          column under Now; that belongs to the conversations list, which the canvas here does not own.
        </p>
      </Source>
      <A11y
        items={[
          "The tabs are a tablist; the transcript is a polite live region, so new lines are read as they land; Back to the meeting is a plain button.",
        ]}
      />
    </>
  )
}
