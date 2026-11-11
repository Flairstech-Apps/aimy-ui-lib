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
          <DoDont
            doText="Let AiMY's answer start on the thread's edge and take 95% of it."
            dontText="Put the AiMY mark beside AiMY's messages."
          />
        </div>
      </Section>
      <Source>
        <p>
          The Knowledge gate&apos;s <code>.chat-msg</code>, which the Console canvas draws too, your choice on 11 Nov
          (it replaced Sales&apos; shape from 28 Oct): 14px text at weight 500, 10px by 14px, 16px corners with the
          square one on the speaker&apos;s side. Your turn sits on the accent&apos;s dim ground, up to 480px, beside
          your 30px round face. AiMY&apos;s turn has no mark, starts on the thread&apos;s left edge and takes 95% of
          it, on a 4% wash with a 7% edge (light: <code>#edf2f8</code> with a 10% ink edge). While AiMY thinks, the think-mark stands
          where the bubble will be; then the bubble&apos;s ground fades in (both products). A stopped answer keeps its
          words and says Stopped under them (Knowledge&apos;s <code>.msg-stopped</code>, in secondary ink instead of
          muted). Neither product shows timestamps in a thread, so there are none.
        </p>
      </Source>
      <A11y
        items={[
          "Put messages inside a polite live region (Canvas does) so new answers are read out.",
          "Only the person's turns show a face; AiMY's turns carry no mark, so a screen reader hears the words alone.",
        ]}
      />
    </>
  )
}
