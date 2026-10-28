import type { Metadata } from "next"
import { Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { Kbd } from "@/registry/aimy/ui/kbd"

export const metadata: Metadata = { title: "Kbd" }

export default function KbdPage() {
  return (
    <>
      <PageHeader title="Kbd" lead="Keys for a keyboard shortcut, as key caps." />
      <Section title="Examples">
        <ThemePair>
          <Row label="single key, shortcut">
            <Kbd keys={["Esc"]} />
            <Kbd keys={["Ctrl", "K"]} />
            <Kbd keys={["Shift", "D"]} />
          </Row>
        </ThemePair>
      </Section>
      <Install name="kbd" exports="Kbd" />
      <Section title="Use it">
        <CodeBlock>{`<Kbd keys={["Ctrl", "K"]} />`}</CodeBlock>
      </Section>
      <Source>
        <p>
          <code>.ds-kbd</code>, identical in Sales, Knowledge and the design system: JetBrains Mono, 14px, the raised surface
          and a 2px bottom edge.
        </p>
      </Source>
    </>
  )
}
