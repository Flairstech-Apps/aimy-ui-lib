import type { Metadata } from "next"
import { DirectionDemo } from "@/components/docs/direction-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Direction" }

export default function DirectionPage() {
  return (
    <>
      <PageHeader
        title="Direction"
        lead="Every part reads right to left when the page does. Set dir on the page, and the layout, the arrow keys, drags, drawers and arrows all mirror; nothing in the parts needs telling."
      />
      <Section title="The same parts, both ways" lead="Use the arrow keys in the tabs, the toggle, the tree and the calendar on each side.">
        <DirectionDemo />
      </Section>
      <Section title="Turn it on">
        <div className="flex flex-col gap-3">
          <CodeBlock>{`<html lang="ar" dir="rtl">`}</CodeBlock>
          <p data-ai="p" className="max-w-[46rem] text-body text-ink-secondary">
            Or on any element, for a part of the page in another language. Next.js: set them on the root layout&apos;s
            html. In your own classes, write the logical forms (ms-, me-, ps-, pe-, start-, end-, text-start,
            border-s, border-e) rather than left and right, so your screens mirror too.
          </p>
        </div>
      </Section>
      <Section title="What mirrors">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-1.5 ps-5 text-body text-ink-secondary">
          <li>Layout: margins, padding, edges, positions and text alignment, through logical properties.</li>
          <li>
            Keys: ArrowLeft goes forward and ArrowRight back in tabs, segmented controls, menus, the calendar, the
            diary, the tree (ArrowLeft opens), sortable lists, the editor&apos;s toolbar and resizable panels.
          </li>
          <li>Pointer: dragging a panel&apos;s handle, and swiping a row: the leading action is on the right.</li>
          <li>Drawers come in from the side they sit on; the switch&apos;s on side is the left.</li>
          <li>Arrows and chevrons that mean next or back point the other way. Play and media controls don&apos;t.</li>
        </ul>
      </Section>
      <Section title="What stays">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-1.5 ps-5 text-body text-ink-secondary">
          <li>Charts: time runs left to right on their axes, as most Arabic dashboards draw them.</li>
          <li>Decks: a slide is a fixed stage.</li>
          <li>Sheet: its side is the one you choose, left or right.</li>
          <li>Numbers and codes inside a sentence keep their own order, as the browser lays them out.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <DoDont
          doText="Set dir once, on the page or the part in another language, and let the parts follow."
          dontText="Flip parts by hand with transforms, or write left and right in your own classes."
        />
      </Section>
    </>
  )
}
