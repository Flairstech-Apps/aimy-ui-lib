import type { Metadata } from "next"
import { NoteTakerDemo } from "@/components/docs/voice-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Note taker" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Note taker"
        lead="AiMY takes notes in a meeting. It hears only you; your notes bring in everyone else."
      />
      <Section title="Start it from a voice session, or jump to a state">
        <NoteTakerDemo />
      </Section>
      <Install name="note-taker" exports="NoteTaker, NoteTakerConsent, NOTE_STEPS" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<VoiceStage … onTakeNotes={() => setAsking(true)}\n  asking={asking && <NoteTakerConsent meeting={meeting.title} onStart={start} onNotNow={() => setAsking(false)} />} />\n\n<NoteTaker meeting={meeting.title} phase={phase} seconds={secs} speaking={speaking}\n  items={items} steps={steps} summary={summary}\n  onSend={(text, tab) => (tab === "notes" ? addNote(text) : ask(text))}\n  onEnd={endNotes} onRetry={retry} onClose={close} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Ask before taking notes, and say what AiMY will and won't hear."
            dontText="Start recording when the voice session starts."
          />
          <DoDont
            doText="Keep the transcript safe when the summary fails, and say so."
            dontText="Lose what was said because a step failed."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s Console note taker (<code>notetaker.js</code>, AIMY-2684). It starts from the voice stage
          with one consent question: which meeting, and that AiMY hears only you. Then the orb floats in the corner,
          still listening. Drag it anywhere and it settles on the nearer side. The card has Transcription (what you
          said, your notes, your questions and AiMY&apos;s answers) and Notes, with one bar that asks AiMY or adds a
          private note. You end notes, or the meeting&apos;s time on your calendar does. Then three steps tick off in
          the chat, each saying what it found. The phases: Taking notes, Meeting ended, Writing the notes, Notes ready,
          Too short to summarise (under 30 seconds), and Notes not written (Try again; the transcript is safe). Not here
          yet: the meeting&apos;s view inside the canvas and the bell&apos;s ring when a step finishes, which arrive
          with the shell.
        </p>
      </Source>
      <A11y
        items={[
          "The orb is a button that opens the card and reports expanded; Escape folds the card back to it.",
          "The tabs are a tab list; the stream is a polite live region.",
          "Recording is shown by a red dot and said in words: Taking notes, Listening to you.",
        ]}
      />
    </>
  )
}
