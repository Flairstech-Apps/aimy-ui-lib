import type { Metadata } from "next"
import { ChipDemo } from "@/components/docs/batch-a-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Chip" }

export default function ChipPage() {
  return (
    <>
      <PageHeader title="Chip" lead="A filter you can switch on and off. It has an edge because you press it; when on, it takes the accent." />
      <Section title="Try it">
        <ThemePair>
          <ChipDemo />
        </ThemePair>
      </Section>
      <Install name="chip" exports="Chip" />
      <Section title="Use it">
        <CodeBlock>{`<Chip selected={onlyMine} onClick={() => setOnlyMine(v => !v)}>Only mine</Chip>
<Chip selected onRemove={() => clear("week")}>This week</Chip>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont
          doText="Keep unselected chips fully readable; the accent ground and edge say which are on."
          dontText="Fade the unselected chips to show they're off."
        />
      </Section>
      <Source>
        <p>
          Sales&apos; <code>.chip</code> as the filter cuts draw it: 12px, 500, 28px, pill, press to 0.97. Unselected text is
          the secondary ink instead of the faded white the products used.
        </p>
      </Source>
      <A11y items={["A toggle button with aria-pressed.", "The remove control is its own button, named after the chip."]} />
    </>
  )
}
