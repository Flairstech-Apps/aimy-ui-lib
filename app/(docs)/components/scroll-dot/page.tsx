import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { ScrollDotDemo } from "@/components/docs/nav-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Scroll dot" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Scroll dot"
        lead="QA's scroll indicator for one scrolling area: an accent dot in place of the bar, with a flame that grows with the speed and a landing when you stop."
      />
      <Section title="A thread, and a list">
        <ScrollDotDemo />
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Scroll either one. Drag the dot to scroll; in the list, click the empty rail to jump there. In the thread,
          scroll up and the Latest pill takes you back.
        </p>
      </Section>
      <Install name="scroll-dot" exports="ScrollDot" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<ScrollDot label="Messages" latest className="h-96" innerClassName="p-4">\n  {messages}\n</ScrollDot>\n\n<ScrollDot label="Calls to review" track className="flex-1">\n  {rows}\n</ScrollDot>'
          }
        </CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          It is opt-in: the rest of the page keeps the library&apos;s scrollbar. Give it a height, or put it in a flex
          column. A label names the area and lets the keyboard reach it.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use it on a single reading area: a thread, a feed, a long list."
            dontText="Put it on an area that scrolls sideways too, such as a wide table; keep the bars there."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s scroll dot (<code>assets/aimy-scroll.css</code> and <code>aimy-scroll.js</code>, QA origin/main
          9911c5e), where it replaces the bar on every scrolling area; here a team turns it on per area. A 10px dot at
          85% accent with a 4px halo, on a 16px rail 3px from the edge, inset 6px from the top and bottom (or the
          area&apos;s own padding less 12px when that is 40px or more). While scrolling the dot stretches and trails a
          flame whose length follows how fast the content moves (12 to 64px, smoothed), pointing the way it goes; 130ms
          after the scroll stops the flame pulls in and the dot lands with a squash and settle (460ms). It grows to 1.3
          on hover and while dragged. The Latest pill shows once you are 120px from the end. Areas under 60px tall, or
          with less than 8px to scroll, show no dot. Not ported: QA finds every scrolling area by itself; here each one
          is a ScrollDot.
        </p>
      </Source>
      <A11y
        items={[
          "The dot is decoration, hidden from screen readers; the area still scrolls with the wheel, touch and the keyboard. With a label it is a named region you can Tab to. Reduced motion keeps the dot and drops the flame, the stretch and the landing.",
        ]}
      />
    </>
  )
}
