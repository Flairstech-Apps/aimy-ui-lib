import type { Metadata } from "next"
import { VirtualListDemo } from "@/components/docs/records-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Windowed list" }

export default function Page() {
  return (
    <>
      <PageHeader title="Windowed list" lead="Thousands of rows, with only the ones near the view drawn." />
      <Section title="5,000 people in a scrolling box, with a keyboard cursor">
        <ThemePair>
          <VirtualListDemo />
        </ThemePair>
      </Section>
      <Install name="virtual-list" exports="VirtualList" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<VirtualList label="Queue" items={people} rowKey={(p) => p.id}\n  cursor={at} renderRow={(p) => <QueueRow person={p} />} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use it past a few hundred rows of one height."
            dontText="Use it for rows of different heights."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; windowed list (<code>.b-vlist</code>, bdr.js 24698-24905, bdr.css 53-80): the host is as tall as
          the whole list and only the rows near the view exist, eight either side of it. The row height is measured from
          one row laid out out of sight, again when its size changes, so it is never guessed. It reads the nearest
          scrolling ancestor, or the page, once a frame. A hairline on every row, because under windowing the first row
          drawn is whichever one the scroll reached. The cursor row takes the accent tint and is kept in view with 96px
          of room under it. Positioning only: the row&apos;s content decides what it looks like. Every row must be the
          same height.
        </p>
      </Source>
      <A11y
        items={[
          "A named list; each row says its place with aria-posinset and aria-setsize, so a screen reader hears its number out of the whole.",
        ]}
      />
    </>
  )
}
