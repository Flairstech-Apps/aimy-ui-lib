import type { Metadata } from "next"
import { SheetDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Sheet" }

export default function Page() {
  return (
    <>
      <PageHeader title="Sheet" lead="A panel that slides in from the side over the page." />
      <Section title="A settings sheet">
        <ThemePair>
          <SheetDemo />
        </ThemePair>
      </Section>
      <Install name="sheet" exports="Sheet, SheetTrigger, SheetClose, SheetContent" />
      <Section title="Use it">
        <CodeBlock>{"<Sheet>\n  <SheetTrigger asChild><Button>Open notification settings</Button></SheetTrigger>\n  <SheetContent title=\"Notifications\">…</SheetContent>\n</Sheet>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use a sheet for settings or detail that sits beside the work." dontText="Use a sheet for a two-field form. Use a popover." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s rail drawer below the rail rung and its settings and Connect sheets: the glass panel ground with a blur, an edge on the inner side, a deep shadow and a scrim. Slides with transitions.dev&apos;s panel reveal (07), on the X axis. The design system&apos;s <code>.drawer</code> was never used.</p>
      </Source>
      <A11y items={["A dialog: focus moves in, Escape or the scrim closes, focus returns."]} />
    </>
  )
}
