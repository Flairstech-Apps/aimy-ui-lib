import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { Tag } from "@/registry/aimy/ui/tag"

export const metadata: Metadata = { title: "Tag" }

export default function TagPage() {
  return (
    <>
      <PageHeader
        title="Tag"
        lead="The name of a state. A label has a fill and no edge, so it never looks like something to press. The word is always there; colour only backs it up."
      />
      <Section title="Tones">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="neutral, ok, warn, err, info">
              <Tag>Not started</Tag>
              <Tag tone="ok">Meeting Set</Tag>
              <Tag tone="warn">Needs reply</Tag>
              <Tag tone="err">Bounced</Tag>
              <Tag tone="info">In review</Tag>
            </Row>
            <Row label="ai, accent">
              <Tag tone="ai">Drafted by AiMY</Tag>
              <Tag tone="accent">Priority</Tag>
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Install name="tag" exports="Tag" />
      <Section title="Use it">
        <CodeBlock>{`<Tag tone="ok">Meeting Set</Tag>
<Tag tone="warn">Needs reply</Tag>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Write the state as a name in sentence case: Meeting Set, Needs reply." dontText="Set tags in capitals, or write a sentence in a tag." />
          <DoDont doText="Pick the tone from the outcome: done is ok, wrong is err." dontText="Use colour to sort categories. Colour marks an outcome, not a kind." />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>.tag</code>, your choice on 28 Oct: borderless, the tone&apos;s <code>-bg</code> ground and
          its <code>-text</code> ink, 12px, 600, 22px tall. Sales draws a saturated fill with a same-hue border; that was
          not chosen because an edge marks a control. Knowledge&apos;s 0.06em tracking was dropped: wide tracking is for
          capitals only.
        </p>
      </Source>
      <A11y items={["Words carry the state, so it reads with no colour at all.", "Every tone's word clears 4.5:1 on its ground in both themes."]} />
    </>
  )
}
