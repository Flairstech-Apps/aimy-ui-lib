import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { StatusPill } from "@/registry/aimy/ui/status"

export const metadata: Metadata = { title: "Status" }

export default function StatusPage() {
  return (
    <>
      <PageHeader title="Status" lead="Whether someone is available, said in words with a coloured dot beside them." />
      <Section title="States">
        <ThemePair>
          <Row label="online, busy, away, offline">
            <StatusPill state="online">Available</StatusPill>
            <StatusPill state="busy">On a call</StatusPill>
            <StatusPill state="away">Away</StatusPill>
            <StatusPill state="offline">Offline</StatusPill>
          </Row>
        </ThemePair>
      </Section>
      <Install name="status" exports="StatusPill, StatusDot" />
      <Section title="Use it">
        <CodeBlock>{`<StatusPill state="busy">On a call</StatusPill>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont doText="Use the dot for real, live presence, always with the word." dontText="Put coloured dots before list rows or nav items as decoration, or make them pulse." />
      </Section>
      <Source>
        <p>
          The design system&apos;s <code>.status-pill</code> and <code>.status-dot</code>; Knowledge draws the dot. The
          <code> .pulse</code> animation was left out: the doctrine forbids pulsing decorative dots.
        </p>
      </Source>
      <A11y items={["The dot is hidden from screen readers; the words carry the state."]} />
    </>
  )
}
