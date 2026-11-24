import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { ChaptersDemo } from "@/components/docs/deck-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Chapters deck" }

export default function ChaptersDeckPage() {
  return (
    <>
      <PageHeader
        title="Chapters deck"
        lead="A presentation organised by topic, not by date: a proposal, a plan, a pitch, a training. The talk is split into parts; the agenda is built from them and stays on screen in a glass rail, its light gliding to each new part."
      />
      <Section
        title="Try it"
        lead="Click the deck, then use the arrow keys or Space. Speaker view opens the notes in their own window; Present takes the deck full screen."
      >
        <ChaptersDemo />
      </Section>
      <Install name="chapters-deck" exports="ChaptersDeck" />
      <Section title="Which deck">
        <ul data-ai="ul" className="flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-body text-ink-secondary">
          <li data-ai="li">
            <b className="font-semibold text-ink">Horizon</b>: a story told on dates, to a room. Launches, all-hands,
            kick-offs.
          </li>
          <li data-ai="li">
            <b className="font-semibold text-ink">Two lanes</b>: what we learned and what we did, period by period.
            Reviews, retrospectives, updates.
          </li>
          <li data-ai="li">
            <b className="font-semibold text-ink">Chapters</b>: everything organised by topic rather than by date.
            Proposals, plans, pitches, trainings, a review of a subject.
          </li>
        </ul>
      </Section>
      <Section title="Use it">
        <CodeBlock>{`<ChaptersDeck
  story={{
    cover: { kicker: "Proposal · Customer Support", title: "Give Support answers in seconds, not minutes.", when: "3 December 2026" },
    parts: [
      {
        title: "Why now",
        holds: "What searching costs us today",
        slides: [
          { kind: "statement", title: "Agents spend a third of every call looking for the answer." },
          { kind: "figures", title: "What searching costs today", figures: [{ value: 11, suffix: "min", means: "to answer, against the 7-minute target" }] },
        ],
      },
      {
        title: "The decision",
        slides: [{ kind: "choice", title: "Two ways to roll it out", options: [
          { name: "Everyone in January", lines: ["All 60 agents on 12 January"] },
          { name: "Tier 1 first", recommended: true, lines: ["Tier 1 on 12 January, tier 2 in February"] },
        ] }],
      },
    ],
    close: { title: "Answers in", turn: "seconds.", action: { label: "Approve the rollout" } },
  }}
/>`}</CodeBlock>
        <ul data-ai="ul" className="mt-3 flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-meta text-ink-secondary">
          <li data-ai="li">
            Two to five parts; three or four read best. Each opens with a divider (its number, its title and what it
            answers), and the agenda after the cover lists them. Pass{" "}
            <code className="font-mono text-ink">agenda: false</code> to leave it out.
          </li>
          <li data-ai="li">
            Six kinds of slide inside a part: <code className="font-mono text-ink">statement</code> (one idea, large),{" "}
            <code className="font-mono text-ink">points</code> (two or three, side by side, with a Lucide icon each),{" "}
            <code className="font-mono text-ink">figures</code> (one to three, each with what it means),{" "}
            <code className="font-mono text-ink">compare</code> (before and after, two to four rows),{" "}
            <code className="font-mono text-ink">quote</code> and <code className="font-mono text-ink">choice</code> (two
            options, one marked recommended).
          </li>
          <li data-ai="li">
            Every slide takes <code className="font-mono text-ink">notes</code> for the speaker view.{" "}
            <code className="font-mono text-ink">chaptersProblems(story)</code> checks a talk before it is drawn, and
            words that run long are set smaller until they fit, with the deck saying what to cut.
          </li>
        </ul>
      </Section>
      <Section title="What moves">
        <ul data-ai="ul" className="flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-body text-ink-secondary">
          <li data-ai="li">
            The mark flies from the cover to the header as the rail slides in, and back for the close. Between slides it
            comes apart into dots and gathers back.
          </li>
          <li data-ai="li">
            The rail&apos;s light glides to each new part; the bar for the slide you are on fills in, and the parts you
            have covered stay lit.
          </li>
          <li data-ai="li">
            Titles arrive word by word, cards land with a spring, figures count up, and blooms drift behind it all.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Title each slide with its point: “Agents spend a third of every call looking for the answer.”"
            dontText="Title slides with topics (“The problem”, “Results”), or put a bulleted list on one."
          />
          <DoDont
            doText="Recommend one option on a choice slide, and say why in the notes."
            dontText="Show three or more options, or none marked, and leave the room to work it out."
          />
        </div>
      </Section>
      <Source>
        <p>
          Chosen from <code>docs/slides-variants.html</code> (variant A). The rail is Two lanes&apos; glass rail turned
          into an agenda; the logo flight, the thinking mark and the ambient field are the Chrome extension&apos;s, as in
          the other decks.
        </p>
      </Source>
      <A11y
        items={[
          "A region named by the deck, announced as a slide deck. Arrows, Space, Page Up and Down, Home and End move through it; the slide count is a live region.",
          "Only the current slide is read. The rail repeats the agenda and where you are, so it is hidden from screen readers; each slide names its part.",
          "Under reduced motion nothing travels: each slide appears in place and figures show their value.",
        ]}
      />
    </>
  )
}
