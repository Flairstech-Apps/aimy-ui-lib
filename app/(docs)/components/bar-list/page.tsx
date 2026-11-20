import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { BarList } from "@/registry/aimy/ui/bar-list"

export const metadata: Metadata = { title: "Bar list" }

export default function BarListPage() {
  return (
    <>
      <PageHeader
        title="Bar list"
        lead="A bar per category: how much each one has, against the others or against a goal. Each row says what its number means."
      />
      <Section title="Against a goal" lead="QA's audit panel: quality by product, on a scale narrowed to 75 to 100% so close scores stay apart, with the goal on every bar.">
        <ThemePair>
          <BarList
            label="Quality by product"
            goal={85}
            scale={[75, 100]}
            unit="%"
            rows={[
              { label: "Objectif Lune", value: 79.2, figure: "411 tickets", tone: "warn" },
              { label: "Upland · AccuRoute", value: 85.4, figure: "13 calls · ↑ 2", tone: "ok" },
              { label: "Upland · KCM", value: 79, figure: "28 tickets · ↓ 3", tone: "warn" },
              { label: "Kofax", value: 76.1, figure: "96 tickets", tone: "err" },
            ]}
          />
        </ThemePair>
      </Section>
      <Section title="A breakdown" lead="The operations hub: what AiMY did, each row's value and its share of the whole.">
        <ThemePair>
          <BarList
            form="inline"
            label="What AiMY did on tickets"
            rows={[
              { label: "Tickets AiMY created", value: 388 },
              { label: "Tickets AiMY updated", value: 224 },
            ]}
          />
        </ThemePair>
      </Section>
      <Install name="bar-list" exports="BarList" />
      <Section title="Use it">
        <CodeBlock>{`<BarList goal={85} scale={[75, 100]} unit="%" label="Quality by product"
  rows={[{ label: "Objectif Lune", value: 79.2, figure: "411 tickets", tone: "warn", onClick: () => open("objectif-lune") }]} />

<BarList form="inline" label="What AiMY did" rows={[{ label: "Tickets AiMY created", value: 388 }]} />`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Narrow the scale only with a goal on it, and let the note say so: the line is what keeps a short scale honest."
            dontText="Start the bars above zero with nothing to compare against; small gaps then look like big ones."
          />
          <DoDont
            doText="Give each row its figure (411 tickets) and open what it counts on a press."
            dontText="Show bars with no number, or a number that leads nowhere."
          />
        </div>
      </Section>
      <Source>
        <p>
          Stacked is QA&apos;s <code>.eval-bar-row</code> (QA <code>index.html</code> 5134-5233 and 5419-5473): the name
          with a dot in its tone, the figure and the score on the right, a 4px bar, and the goal as a 2px mark in the
          ok colour at three quarters strength, 3px above and below the bar. Inline is the operations hub&apos;s{" "}
          <code>.bk-row</code> (<code>index.html</code> 653-660): name, a bar of 6rem at most, value and share, a rule
          between rows. Changed: no word under 12px (QA&apos;s share was 10px) and none faded (QA&apos;s names were d300,
          the share d400; here the secondary ink). Sides are logical, so the bars grow from the right on a right-to-left
          page.
        </p>
      </Source>
      <A11y
        items={[
          "A list with a name; each row's words carry its figures, so the bars are decoration for the eye and hidden from screen readers.",
          "A row with onClick is a button, reached with Tab and pressed with Enter or Space.",
        ]}
      />
    </>
  )
}
