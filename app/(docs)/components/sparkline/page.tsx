import type { Metadata } from "next"
import { SparklineDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Sparkline" }

export default function Page() {
  return (
    <>
      <PageHeader title="Sparkline" lead="A small line that shows whether a change worked." />
      <Section title="Before and after a change of tone">
        <ThemePair>
          <SparklineDemo />
        </ThemePair>
      </Section>
      <Install name="sparkline" exports="Sparkline" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Sparkline before={[31, 33, 30, 34]} after={[26, 22, 19]}\n  label="Follow-up questions a day: about 32 before 14 Oct and about 21 after"\n  start="Follow-up questions a day, 1 Oct" at="Tone changed 14 Oct" end="Today" />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Name the change under the dashed line."
            dontText="Draw a sparkline with no words about what changed."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s before-and-after line in the console (<code>.agv-spark</code>, settings.css 4612-4626, drawn
          by settings.js 2945-2951). A 100 by 40 box stretched to 3.5rem high with strokes that do not scale: the line
          before the change at 1.5px in the reading ink, after it at 2px in the brand, and the change a dashed 1px line
          in the action ink, named in the same ink under it. The two halves join at the change, so the line never jumps.
          QA&apos;s mini trend, a different line, is part of the Score tile.
        </p>
      </Source>
      <A11y items={["An image named in a sentence that gives the before and after figures."]} />
    </>
  )
}
