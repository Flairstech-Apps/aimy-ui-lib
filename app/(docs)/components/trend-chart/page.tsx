import type { Metadata } from "next"
import { TrendChartDemo, TrendChartEmptyDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Trend chart" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Trend chart"
        lead="A score over a range you choose, against its goal, beside the period before."
      />
      <Section title="QA's quality score, a year to a week, with Compare">
        <TrendChartDemo />
      </Section>
      <Section title="No scores in the range">
        <ThemePair>
          <TrendChartEmptyDemo />
        </ThemePair>
      </Section>
      <Install name="trend-chart" exports="TrendChart" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<TrendChart title="Quality score" goal={{ value: 90, label: "SLA 90%" }} ranges={[\n  { key: "ytd", label: "YTD", labels: months, scores, prev, flags: [10] },\n  { key: "30d", label: "30D", labels: ["W1", "W2", "W3", "W4"], scores: [85, 88, 86, 87] },\n]} pointNote={(r, i) => (r.flags?.includes(i) ? "AiMY looked into this dip" : undefined)} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Write the peak, the low and the latest at their points."
            dontText="Leave the reader to read figures off a gridline."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s quality-score chart (<code>.chart-v2</code> in QA index.html: the SVG about 8380-8845,{" "}
          <code>applyRangeToChart</code> 10488, the hover 10702-10784). The ranges are the library&apos;s Segmented,
          Compare is a Chip. The average, the peak and the low in figures, then the key. The line is QA&apos;s smooth
          curve (horizontal tangents, control points 40% of a step out) at 2.5px in the accent over an area that fades
          to nothing; the period before is a dashed line in a quiet ink. The goal is a dashed line with its name in a
          pill. The peak, the low and the latest score are written at their points, and the peak gives way when it would
          crowd the others. A flagged point gets a red band and dot. Point at the plot, or focus it and use the arrow
          keys, for a readout of that point, with the period before and a line about what AiMY did when there is one.
          Fixed in the port: QA drew its grid and percentages at heights that did not match its own scale, placed its
          markers and the anomaly by hand, wrote its labels in Urbanist and hex colours, and had no empty state. Here
          ticks sit where their value is, every mark comes from the data, labels are HTML in the library&apos;s ink so
          they never stretch, and an empty range says so.
        </p>
      </Source>
      <A11y
        items={[
          "The plot is an image named in a sentence (start, peak, low, now, goal); it takes focus and the arrow keys move the readout, which is announced.",
        ]}
      />
    </>
  )
}
