import type { Metadata } from "next"
import { DiaryDemo } from "@/components/docs/diary-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Diary" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Diary"
        lead="The month and the day beside it: what is on, what is next, and what nobody wrote up."
      />
      <Section title="A seller's October, with the client line, the call log and Missing details">
        <DiaryDemo />
      </Section>
      <Install name="diary aimy-note" exports="Diary, DiaryLoop" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Diary today="2026-10-28" onAdd={addOne} entries={[\n  { id: "1", date: "2026-10-28", time: "10:30", kind: "demo", who: "Dana Whitfield",\n    what: "Pricing on the annual plan", set: "you", onOpen: openDana },\n  { id: "2", date: "2026-10-28", kind: "owed", who: "Harbour Foods", what: "Proposal due" },\n]} />\n<DiaryLoop rows={[{ id: "a", when: "Thu 23 Oct", who: "Peter Foster", what: "Signed the pilot", onClick: write }]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say the kind of each thing in words beside its dot."
            dontText="Let a dot's colour be the only way to tell a demo from a dinner."
          />
        </div>
      </Section>
      <Source>
        <p>
          Added to the plan on 28 Oct (Nour). Sales&apos; diary page (<code>diaryPage</code>, <code>calBody</code>,{" "}
          <code>calRow</code>, <code>calNext</code> in bdr.js 9862-10520; <code>.b-cal</code> bdr.css 4114-4424 and the
          page form <code>.b-diary</code> 5262-5307). The month&apos;s head with its count of things, the call log when
          there is one, Today, and the months either side. A Monday-first grid, 72px days, up to three dots a day
          coloured by kind (meeting, demo, dinner, held, callback, owed), the day you are on filled in the accent, today
          with an accent dot under its number. Beside it the day you chose: the hour or &quot;all day&quot;, the kind in
          words, who, what, and whether you set the time or AiMY put it there. An empty day says how things get in. Then
          add one, and the next three in the diary, which open their record or move to their day. The day goes under the
          month below 1024px of the diary&apos;s own width. Above it, a client&apos;s diary opens on AiMY&apos;s line
          about how often you have met (an AimyNote); under it, Missing details (<code>.b-loop</code>, 4440-4596):
          meetings that happened with nothing written, each one press from saying how it went. Added here: Sales marks
          the month as a grid but gives it no keys; the arrow keys move a day or a week, Home and End go to the
          week&apos;s ends, Page Up and Page Down move a month, and the day you land on is the day shown.
        </p>
      </Source>
      <A11y
        items={[
          "The month is a grid of days, each named with its date and how many things are on it; the arrow keys, Home, End, Page Up and Page Down move through it. The day's caption is read out when it changes.",
        ]}
      />
    </>
  )
}
