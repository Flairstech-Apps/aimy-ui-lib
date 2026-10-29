import type { Metadata } from "next"
import { StatTileDemo } from "@/components/docs/records-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Stat tiles" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Stat tiles"
        lead="One figure, what it counts, and what it means, in a strip divided by hairlines."
      />
      <Section title="Figures, a door onto a set, and tones">
        <ThemePair>
          <StatTileDemo />
        </ThemePair>
      </Section>
      <Install name="stat-tile" exports="StatTiles, StatTile" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<StatTiles>\n  <StatTile label="Booked" value="€182,400" sub="was €140,000 at signing" />\n  <StatTile label="Callable" value="107" sub="38 you can call now" onClick={openThem} />\n</StatTiles>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say how a figure changed in words in the sub-line."
            dontText="Use an up or down arrow with no words."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; figure strip (<code>.s-afs</code> / <code>.s-af</code>, sales.css 8865-8970, bdr.css 1275-1292).
          Divided, never boxed: a hairline above each figure with 20px under it. The caption binds tight to its figure
          and the sub-line sits back from both. There is no delta arrow: the change is said in words in the sub-line. A
          tone recolours the figure only. A tile with <code>onClick</code> is Sales&apos; door (<code>.b-af-door</code>
          ): its rule turns accent on hover, its sub-line is accent with an arrow, and a press scales it to 0.985. Four
          sit in a row and reflow to two, then one, on the strip&apos;s own width rather than the window&apos;s; fewer
          than four take one column each. The caption and sub-line, faint in Sales, are secondary ink here.
        </p>
      </Source>
      <A11y
        items={[
          "A door tile is a button whose name is its caption, figure and sub-line.",
          "Tones are never the only signal: the sub-line says what the figure means.",
        ]}
      />
    </>
  )
}
