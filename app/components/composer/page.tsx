import type { Metadata } from "next"
import { ComposerDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Composer" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Composer"
        lead="Where a person asks AiMY: the bar that floats over the work, and the bar at the foot of the canvas."
      />
      <Section title="Float and canvas bars, with the beam while AiMY answers">
        <ThemePair>
          <ComposerDemo />
        </ThemePair>
      </Section>
      <Install name="composer" exports="Composer" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Composer onSubmit={ask} generating={busy} onStop={stop} />\n\n<Composer variant="canvas" onSubmit={ask} generating={busy} onStop={stop}\n  attachments={files} onAttach={add} onRemoveAttachment={remove} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Keep stop on the same button, so there is always one way out of an answer."
            dontText="Disable the composer while AiMY answers."
          />
          <DoDont
            doText="Write the placeholder as what the bar can do: Ask, filter, or name a contact."
            dontText="Write Type here."
          />
        </div>
      </Section>
      <Source>
        <p>
          Both products&apos; <code>.aimy-float-bar</code> (single line, floats over the work) and{" "}
          <code>.overlay-input-bar</code> (the gate and canvas bar), values unchanged: 40px corners, the AiMY icon tile,
          the accent send button. While AiMY answers, Knowledge&apos;s beam rides the border (seven colour blobs, a
          turning conic window, parked under reduced motion) and send becomes stop. The tools are the live
          products&apos; <code>voice.js</code> arrangement in every bar: the clip and the mic as a pair before send. The mic
          records: the field gives way to a red waveform and a clock, and the way out is cancel or keep. Keep puts the
          words in the field to edit; nothing is sent. With onVoice, the empty bar&apos;s send is the voice button
          (Lucide audio-lines) that opens Voice mode. A file is a row of its own inside the bar, which grows to hold
          it, and says &quot;not uploaded&quot; until it is. Send, voice and stop share one slot and cross-fade.
          Changed: the canvas box now grows with its text up to the 7.5rem cap. Both products set the cap but never grew
          the box, so a second line was cut off. Not built: context chips inside the composer, which only the design
          system shows.
        </p>
      </Source>
      <A11y
        items={[
          "The text box is named by its label or placeholder; the send button says Send, then Stop generating.",
          "Enter sends, Shift+Enter starts a new line in the canvas; an empty box sends nothing.",
          "The beam is decoration, hidden from screen readers; the thread announces the answer.",
        ]}
      />
    </>
  )
}
