import type { Metadata } from "next"
import { CanvasDemo } from "@/components/docs/ai1-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Canvas" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Canvas"
        lead="Where a briefing item or a question opens into a full conversation, over the work it is about."
      />
      <Section title="Ask, watch it think and stream, stop, ask again">
        <ThemePair>
          <CanvasDemo />
        </ThemePair>
      </Section>
      <Install name="canvas" exports="Canvas" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Canvas open={open} onOpenChange={setOpen} basis={["Kestrel Logistics", "Contact"]}\n  chats={<ChatList />} composer={<Composer variant="canvas" onSubmit={ask} generating={busy} onStop={stop} />}>\n  {turns.map((t) => <Message key={t.id} … />)}\n</Canvas>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say what the conversation is based on."
            dontText="Open a conversation with no context, or move the work behind it."
          />
        </div>
      </Section>
      <Source>
        <p>
          Both products&apos; <code>#aimyOverlay</code>: glass from under the topbar down (blur 28px, sunk a stop in
          dark, lifted in light). The work stays visible behind it, as the doctrine requires. It has a 240px chats
          column, a thread on a 42rem measure, and the canvas composer. &quot;Based on&quot; names what the conversation
          is about (Knowledge&apos;s scope, Sales&apos; contact, account and campaign). Below 900px the chats column
          becomes a drawer. It opens over 400ms and closes over 350ms, Knowledge&apos;s timing and the panel
          reveal&apos;s clocks. Focus goes to the composer, and Escape or × returns the person to where they were. The
          visible &quot;AiMY Canvas&quot; badge is left out, as Sales did.
        </p>
      </Source>
      <A11y
        items={[
          "A dialog named AiMY Canvas: focus moves to the composer and stays inside; Escape closes and focus returns.",
          "The thread is a polite live log, so answers are read out as they land.",
        ]}
      />
    </>
  )
}
