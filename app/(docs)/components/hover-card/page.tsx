import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { HoverCardDemo } from "@/components/docs/hover-card-demos"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Hover card" }

export default function HoverCardPage() {
  return (
    <>
      <PageHeader
        title="Hover card"
        lead="A card on a chart mark that you can reach: it opens beside the mark, stays while you move into it, and holds one action."
      />
      <Section
        title="On the parts of a bar"
        lead="Point at a part, or Tab to it. The bar says each part's size; the card adds the share and the one thing to do. Move into the card and press its action."
      >
        <ThemePair>
          <HoverCardDemo />
        </ThemePair>
      </Section>
      <Install name="hover-card" exports="HoverCard, HoverCardPanel, useHoverIntent" />
      <Section title="Use it">
        <CodeBlock>{`<HoverCard title="Left the company, still listed" lines={["14% of everyone with access"]}
  action={{ label: "Remove their access", onClick: () => open("off") }}>
  <span tabIndex={0} aria-label="Left the company, still listed: 4" />
</HoverCard>

// A mark whose box is bigger than the mark (a ring's arc): the intent on the mark, the card on a small
// anchor where the mark is. Donut does this.
const h = useHoverIntent()
<path {...h.bind} />
<HoverCardPanel open={h.open} onOpenChange={h.setOpen} onHold={h.hold} onRelease={h.hide} title="Fail">
  <span style={{ position: "absolute", left: "72%", top: "18%" }} />
</HoverCardPanel>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use a hover card only when it adds something the mark doesn't show: a share, a comparison, a label too long for the mark, or an action."
            dontText="Repeat the mark's own figure in a card: a bar that says 4 doesn't need a card that says 4."
          />
          <DoDont
            doText="Give it one action at most, worded as what happens: Remove their access."
            dontText="Put a form or a list of choices in it; that is a Popover opened by a press."
          />
          <DoDont
            doText="Use a Tooltip to name an icon; it closes when the pointer leaves."
            dontText="Put anything to press in a Tooltip: it closes before the pointer gets there."
          />
        </div>
      </Section>
      <Source>
        <p>
          Asked for by User Management, where an action inside a Tooltip could not be reached on the Overview&apos;s
          bars. Built on the library&apos;s popover: it opens 120ms after the pointer rests on the mark or the mark takes
          focus, and closes 220ms after the pointer leaves both the mark and the card. It is placed against the mark
          itself, beside the bar, point or arc under the pointer rather than the whole chart. Donut, Funnel and
          TrendChart use it where a part, a row or a point is given detail or an action.
        </p>
      </Source>
      <A11y
        items={[
          "The mark keeps focus when the card opens; the card is tied to it with aria-describedby, so its words are read with the mark.",
          "Tab from the mark goes to the card's action when there is one; Shift+Tab or Escape goes back to the mark.",
          "On a touch screen a tap on the mark opens it, a tap anywhere else closes it.",
        ]}
      />
    </>
  )
}
