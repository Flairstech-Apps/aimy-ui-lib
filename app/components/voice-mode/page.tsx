import type { Metadata } from "next"
import { VoiceStatesDemo, VoiceLiveDemo } from "@/components/docs/voice-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Voice mode" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Voice mode"
        lead="Talk to AiMY. The page steps back, one orb stays, and the conversation is written into the thread behind it."
      />
      <Section title="Each state of the stage">
        <VoiceStatesDemo />
      </Section>
      <Section title="A real session: microphone, speech and the composer">
        <VoiceLiveDemo />
      </Section>
      <Install name="voice-stage use-voice" exports="VoiceStage, useVoiceSession, useDictation" />
      <Section title="Use it">
        <CodeBlock>
          {
            "const voice = useVoiceSession({ ask: (question) => askAimy(question) })  // resolves with the answer text\n\n<Composer onSubmit={ask} onVoice={voice.start} />\n<VoiceStage open={voice.active} phase={voice.phase} heard={voice.heard} error={voice.error}\n  level={voice.level} seconds={voice.seconds}\n  onEnd={voice.end} onMute={voice.toggleMute} onInterrupt={voice.interrupt} />"
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Write every spoken question and answer into the thread, so ending lands on the record."
            dontText="Show a scrolling transcript behind the orb."
          />
          <DoDont
            doText="Say why voice can't start: The microphone is blocked. Allow it from the address bar."
            dontText="Fall back to a made-up answer."
          />
        </div>
      </Section>
      <Source>
        <p>
          Both products&apos; <code>voice.js</code> and <code>voice.css</code> (Knowledge&apos;s copy adds Take meeting
          notes), modelled on ChatGPT&apos;s mobile voice mode. The empty composer&apos;s round button starts it. The
          stage holds the logo where the navbar draws it, the session clock, the orb, one line saying what it is doing
          (Starting the microphone, Listening, Thinking, Answering, You&apos;re muted) with what you are saying under
          it, and two round buttons. AiMY sends your question once you pause for 900ms and reads the answer aloud. Tap
          the orb to cut it off. Mute turns red, because red means recording. End is the ink inverted, not red, because
          ending is not an alarm. It uses the browser&apos;s own speech recognition and speech. Where they are missing
          or the microphone is blocked, it says so in words and stops; it never makes up a sentence. Opens over 250ms
          and closes over 150ms.
        </p>
      </Source>
      <A11y
        items={[
          "A dialog named Voice conversation with AiMY: focus starts on End and stays on the stage; Escape ends it.",
          "The state line is a polite live region. The orb is a button only while AiMY answers.",
          "Mute reports pressed; End says Close when the session could not start.",
        ]}
      />
    </>
  )
}
