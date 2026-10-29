import type { Metadata } from "next"
import { CardDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Card" }

export default function Page() {
  return (
    <>
      <PageHeader title="Card" lead="A record you can open: a state, what kind of record it is, a title, a line about it, a few facts and an action." />
      <Section title="Contact cards">
        <ThemePair>
          <CardDemo />
        </ThemePair>
      </Section>
      <Install name="card" exports="Card, CardHead, CardType, CardTitle, CardSummary, CardFacts, CardBody, CardFoot" />
      <Section title="Use it">
        <CodeBlock>{"<Card status=\"warn\">\n  <CardHead><Tag tone=\"warn\">Needs reply</Tag><CardType>Contact</CardType></CardHead>\n  <CardTitle onClick={() => open(id)}>Harbour Foods</CardTitle>\n  <CardSummary>Youssef Amin, buyer</CardSummary>\n  <CardFacts><p>Missed call this morning</p></CardFacts>\n  <CardFoot><Button size=\"sm\">Call Youssef</Button></CardFoot>\n</Card>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Make the title the way in, and put one or two actions in the foot." dontText="Make the whole card a div with an onClick: it can't be reached by keyboard." />
          <DoDont doText="Say the state with a Tag and tint the edge for warn and err." dontText="Draw a coloured stripe down the card's left edge." />
        </div>
      </Section>
      <Source>
        <p>Sales&apos; contact, customer and campaign card (<code>article.type-card.s-card.b-qcard</code>, eight screens) and Knowledge&apos;s document card (<code>.type-card</code>) share this anatomy. Radius 12, the card ground with an edge and a faint top highlight; hover lifts the edge and adds a shadow, a press scales to 0.995. A status tints the edge (Sales&apos; <code>.st-*</code>, Knowledge&apos;s <code>data-status</code>). Title 18px, 600. The arrival stagger and Sales&apos; finding and filled states come with the AI components.</p>
      </Source>
      <A11y items={["An article with a heading. The title is a real button or link, so the card is reachable by keyboard, and its hit area covers the card.","Buttons in CardBody and CardFoot stay separate controls."]} />
    </>
  )
}
