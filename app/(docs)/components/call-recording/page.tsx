import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { MessageAlone, RecordingAlone, RecordingLog } from "@/components/docs/call-recording-demos"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Call recording" }

export default function CallRecordingPage() {
  return (
    <>
      <PageHeader
        title="Call recording"
        lead="Something said on a call that you can listen to: the recording of a call, or the message they left on a missed one. Play, its waveform, and how long is left."
      />
      <Section title="On its own, and under its call">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="the recording of a call">
              <RecordingAlone />
            </Row>
            <Row label="the message they left on a missed call">
              <MessageAlone />
            </Row>
            <Row label="in a call log, hanging under its row">
              <RecordingLog />
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Install name="call-recording" exports="CallRecording" />
      <Section title="Use it">
        <CodeBlock>{`// Under a call in the log, indented to the row's text
<CallRecording id={call.id} seconds={call.seconds} src={call.recordingUrl} />

// The message left on a missed call
<CallRecording id={call.id} seconds={call.voicemailSeconds} src={call.voicemailUrl} kind="message" />`}</CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Pass the call&apos;s <code className="font-mono text-ink">id</code>: it shapes the waveform, so a recording
          looks the same every time and two never look alike. Without <code className="font-mono text-ink">src</code>{" "}
          the strip runs for its length and plays nothing, which is how the demos here work.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Hang it under the call it belongs to, so it plays without opening anything."
            dontText="Put the transcript in the strip. The words are what playing it is for; a summary belongs to the row."
          />
          <DoDont
            doText="Show a strip only where something was said: a call somebody answered, or a message they left."
            dontText="Draw one on a call nobody answered. There is nothing on it to play."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; <code>vmStrip</code> in <code>assets/bdr.js</code> and <code>.b-log-vm</code> in{" "}
          <code>assets/bdr.css</code> (Sales 160380e), from the Call log page. A pill on a 6% accent ground (12% on
          hover), at most 340px wide; a 26px play button in the accent text colour; 28 bars seeded by the call&apos;s
          id, the played half the same bars clipped from the right; the time left counting down in tabular figures.
          One plays at a time across the page. Changed: it plays real audio from <code>src</code> (Sales has no audio
          and runs a timer); its 40px height is set as a height where Sales pads by 7px; the time left is in the
          secondary ink, where Sales mutes it.
        </p>
      </Source>
      <A11y
        items={[
          "A toggle button named by what it plays and how long it is: Play the recording of the call, 2:34. aria-pressed says whether it is playing.",
          "The waveform and the countdown are hidden behind the button's name, which gives the whole length, so a screen reader is not read a clock every second.",
          "Under reduced motion it still plays and counts down; the played fill shows whole instead of travelling.",
        ]}
      />
    </>
  )
}
