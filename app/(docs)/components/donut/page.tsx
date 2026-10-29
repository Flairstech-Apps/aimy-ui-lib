import type { Metadata } from "next"
import { DonutDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Donut" }

export default function Page() {
  return (
    <>
      <PageHeader title="Donut" lead="The parts of a whole, with each part said in the centre when you point at it." />
      <Section title="How a month of evaluations went">
        <ThemePair>
          <DonutDemo />
        </ThemePair>
      </Section>
      <Install name="donut" exports="Donut" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Donut label="How 412 evaluations went" center={{ label: "Pass rate" }} parts={[\n  { key: "pass", label: "Pass", value: 297, tone: "ok", center: "Pass rate" },\n  { key: "fail", label: "Fail", value: 70, tone: "err", center: "Fail rate" },\n]} onPick={askWhy} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Put the count and share beside each part in the key."
            dontText="Rely on the colour of an arc alone."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s pass, borderline and fail ring (<code>.donut-*</code>, QA index.html 5047-5130;{" "}
          <code>evalHover</code> 11405; the markup, since removed from QA, recovered from its history). A 100px ring,
          radius 40, 10px arcs end to end from twelve o&apos;clock, clockwise. The centre says the main share. Point at
          a part, or at its row in the key, or tab to the row, and that part grows to 13px with a glow in its own
          colour, the others dim to a quarter, and the centre says that part in its ink. The key beside it stands in for
          QA&apos;s bars: a swatch, the name, the count and the share. Choosing a row calls <code>onPick</code> (QA asks
          AiMY why). Namespaced <code>qa-donut</code>, because QA has a second, different donut.
        </p>
      </Source>
      <A11y
        items={[
          "The ring is an image named with every part's share; the key rows are buttons that highlight their part on focus.",
        ]}
      />
    </>
  )
}
