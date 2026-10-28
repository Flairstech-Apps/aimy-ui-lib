import type { Metadata } from "next"
import { MessageDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Message" }

export default function Page() {
  return (
    <>
      <PageHeader title="Message" lead="One turn in a conversation: who said it, and what." />
      <Section title="A question, an answer, thinking, and a stopped answer">
        <ThemePair>
          <MessageDemo />
        </ThemePair>
      </Section>
      <Install name="message" exports="Message" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Message speaker="user" author={me}>Who is due today?</Message>\n<Message speaker="aimy" status={turn.status} thinkingLabel="Reading the record…"\n  after={<ResponseActions text={turn.text} onRetry={retry} />}>\n  <StreamingText text={turn.text} streaming={turn.status === "streaming"} />\n</Message>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show a stopped answer with what it had written."
            dontText="Remove an answer the person stopped part way."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; <code>.chat-msg</code>, your choice on 28 Oct, which is also the design system&apos;s spec: a 28px
          avatar with 8px corners, a bubble up to 540px, 16px text, and the square corner on the speaker&apos;s side.
          Knowledge drew a 30px circle and a 480px bubble at 14px. While AiMY thinks, the think-mark stands where the
          bubble will be and the avatar waits; then the bubble&apos;s ground fades in (both products). A stopped answer
          keeps its words and says Stopped under them (Knowledge&apos;s <code>.msg-stopped</code>, in secondary ink
          instead of muted). Neither product shows timestamps in a thread, so there are none.
        </p>
      </Source>
      <A11y
        items={[
          "Put messages inside a polite live region (Canvas does) so new answers are read out.",
          "AiMY's avatar is the AiMY tile, never a person's face.",
        ]}
      />
    </>
  )
}
