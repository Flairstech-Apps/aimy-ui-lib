import type { Metadata } from "next"
import { Install, Source } from "@/components/docs/component"
import { CodeBlock, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { Divider } from "@/registry/aimy/ui/divider"

export const metadata: Metadata = { title: "Divider" }

export default function DividerPage() {
  return (
    <>
      <PageHeader title="Divider" lead="A 1px rule between groups. With a label it becomes a section marker." />
      <Section title="Examples">
        <ThemePair>
          <div className="flex flex-col gap-4">
            <p className="text-meta text-ink-secondary">Kestrel Logistics</p>
            <Divider />
            <p className="text-meta text-ink-secondary">Harbour Foods</p>
            <Divider>Earlier</Divider>
            <div className="flex h-6 items-center gap-3 text-meta text-ink-secondary">
              Call back
              <Divider orientation="vertical" />
              Snooze
            </div>
          </div>
        </ThemePair>
      </Section>
      <Install name="divider" exports="Divider" />
      <Section title="Use it">
        <CodeBlock>{`<Divider />
<Divider>Earlier</Divider>
<Divider orientation="vertical" />`}</CodeBlock>
      </Section>
      <Source>
        <p>
          <code>.ds-divider</code> and <code>.ds-divider.labeled</code>. The label is a section marker, the one place capitals
          are allowed, in the quiet ink rather than the muted one the products used.
        </p>
      </Source>
    </>
  )
}
