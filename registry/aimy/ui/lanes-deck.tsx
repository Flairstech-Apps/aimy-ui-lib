"use client"

import { Lightbulb, Zap } from "lucide-react"
import { useEffect, useRef } from "react"
import {
  CloseAction,
  deckProblems,
  figureText,
  CloseTitle,
  Deck,
  DeckCount,
  DeckField,
  DeckHead,
  DeckSpot,
  DeckLine,
  DeckWords,
  easeInOutCubic,
  isMoment,
  runComet,
  stateOf,
  useDeck,
  type DeckClose,
  type DeckCover,
  type DeckFigure,
} from "@/components/deck"
import { cssDuration } from "@/lib/utils"

// The Two lanes deck: AiMY's brand line, Knowledge to Action, as a layout.
// Each moment is a column on one time axis: what we learned above it, what we
// did below it, and an arrow drawn from one to the other. Past columns stay
// on screen at full strength; a glass rail on the left carries the logo, the
// legend and the chapter. Made for reviews, retrospectives and updates.
// Explored in docs/deck-variants.html (D).

export type LanesMoment = {
  /** When it happened: "27 Oct", "July", "Q3". Leave it out rather than invent one. */
  when?: string
  /** Its name, on the learned card and in the rail, one to three words: "The plan". */
  chapter: string
  /** What we learned. A figure replaces it with a number and what it means. */
  learned?: string
  figure?: DeckFigure
  /** What we did about it; "Next: …" when nothing was done yet. Never invent it. */
  did: string
  /** What the presenter says here, in the speaker view. Never on the slide. */
  notes?: string
}

export type LanesStory = {
  cover: DeckCover
  moments: LanesMoment[]
  close: DeckClose
  /** The lanes' names in the rail. Knowledge and Action unless you say otherwise. */
  lanes?: { up: { name: string; holds: string }; down: { name: string; holds: string } }
}

const COL = 640
/* Inside the columns' window, which starts at 400 on the stage. */
const COL_X = 700

const LANES = {
  up: { name: "Knowledge", holds: "What we learned" },
  down: { name: "Action", holds: "What we did" },
}

function LanesSlides({ story }: { story: LanesStory }) {
  const { i, prev, count } = useDeck()
  const { cover, moments, close } = story
  const lanes = story.lanes ?? LANES
  const last = count - 1
  const edge = !isMoment(i, count)
  const k = isMoment(i, count) ? i - 1 : i === 0 ? 0 : moments.length - 1
  const comet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prev < 0 || !isMoment(prev, count) || !isMoment(i, count)) return
    // A light runs along the axis to the next moment.
    const x0 = (prev - 1) * COL + 12
    const x1 = (i - 1) * COL + 12
    runComet(
      comet.current,
      Array.from({ length: 9 }, (_, n) => ({ x: x0 + (x1 - x0) * easeInOutCubic(n / 8), y: 0, r: x1 > x0 ? 0 : 180 })),
      cssDuration("--deck-hop", 760) * 0.82
    )
  }, [i, prev, count])

  return (
    <div className="dk-slide dk-lns" data-edge={edge ? "" : undefined}>
      <DeckField />
      <div className="dk-lns-axis" aria-hidden="true" />
      <div className="dk-lns-view">
        <div className="dk-lns-strip" style={{ transform: `translateX(${COL_X - k * COL}px)` }}>
          <div
            className="dk-lns-fill"
            style={{
              width: (moments.length - 1) * COL,
              transform: `scaleX(${isMoment(i, count) && moments.length > 1 ? (i - 1) / (moments.length - 1) : 0})`,
            }}
            aria-hidden="true"
          />
          {moments.map((m, n) => (
            <section
              key={n}
              className="dk-lns-col"
              data-state={stateOf(n + 1, i)}
              style={{ left: n * COL }}
              aria-hidden={i !== n + 1}
            >
              <div
                className="dk-lns-up"
                data-fit-group={`col${n}`}
                data-fit="100,1080"
                data-fit-slide={n + 2}
                data-fit-hint="the learned card runs up into the header. Keep it to three lines; say the rest in the notes"
              >
                <DeckLine className="dk-card is-learned">
                  <span className="dk-card-label">{m.chapter}</span>
                  {m.figure ? (
                    <>
                      <DeckCount
                        value={m.figure.value}
                        prefix={m.figure.prefix}
                        suffix={m.figure.suffix}
                        n={n + 1}
                        className="dk-lns-figure"
                      />
                      {m.figure.means}
                    </>
                  ) : (
                    m.learned
                  )}
                </DeckLine>
              </div>
              <span className="dk-lns-dot" />
              {m.when ? <span className="dk-lns-when">{m.when}</span> : null}
              <svg className="dk-lns-link" viewBox="0 0 40 108" aria-hidden="true">
                <path pathLength={1} d="M20 4 V98 M10 88 L20 100 L30 88" />
              </svg>
              <div
                className="dk-lns-down"
                data-fit-group={`col${n}`}
                data-fit="0,1010"
                data-fit-slide={n + 2}
                data-fit-hint="the did card runs off the bottom. Keep it to three lines; say the rest in the notes"
              >
                <DeckLine i={5} pop className="dk-card is-did">
                  {m.did}
                </DeckLine>
              </div>
            </section>
          ))}
          <div ref={comet} className="dk-comet dk-lns-comet" aria-hidden="true" />
        </div>
      </div>
      <aside className="dk-lns-rail" aria-hidden={edge}>
        <span className="dk-lns-node" />
        <div className="dk-lns-legend is-up">
          <span className="dk-lns-tile">
            <Lightbulb aria-hidden="true" />
          </span>
          <b>{lanes.up.name}</b>
          <span className="dk-lns-legend-sub">{lanes.up.holds}</span>
        </div>
        <svg className="dk-rail-link" viewBox="0 0 40 98" aria-hidden="true">
          <path pathLength={1} d="M20 4 V88 M12 80 L20 90 L28 80" />
        </svg>
        <div className="dk-lns-legend is-down">
          <span className="dk-lns-tile">
            <Zap aria-hidden="true" />
          </span>
          <b>{lanes.down.name}</b>
          <span className="dk-lns-legend-sub">{lanes.down.holds}</span>
        </div>
        <div className="dk-lns-where">
          <span className="dk-lns-where-k">Chapter</span>
          {/* Keyed by the slide, so each new chapter swaps in rather than jumps. */}
          <b key={`n${i}`} className="dk-lns-where-n dk-swap">
            {Math.min(Math.max(i, 1), moments.length)} of {moments.length}
          </b>
          <span key={`c${i}`} className="dk-lns-where-name dk-swap">
            {moments[k]?.chapter}
          </span>
          <span className="dk-lns-segs">
            {moments.map((_, n) => (
              <span key={n} className="dk-lns-seg" data-state={stateOf(n + 1, i)} />
            ))}
          </span>
        </div>
      </aside>
      <DeckHead meta={cover.when} />
      <section
        className="dk-lns-panel"
        data-state={stateOf(0, i)}
        aria-hidden={i !== 0}
        data-fit="150,1000"
        data-fit-slide={1}
        data-fit-hint="the cover is too tall. Keep the title to three lines and the line under it to two"
      >
        <DeckSpot name="cover" />
        <DeckLine i={1} className="dk-kicker">
          {cover.kicker}
        </DeckLine>
        <h2 className="dk-display">
          <DeckWords text={cover.title} />
        </h2>
        {cover.sub ? (
          <DeckLine i={5} as="p" className="dk-lede">
            {cover.sub}
          </DeckLine>
        ) : null}
      </section>
      <section
        className="dk-lns-panel"
        data-state={stateOf(last, i)}
        aria-hidden={i !== last}
        data-fit="150,1000"
        data-fit-slide={last + 1}
        data-fit-hint="the close is too tall. Keep the title to two lines and the line under it to two"
      >
        <DeckSpot name="close" />
        <CloseTitle close={close} />
        {close.sub ? (
          <DeckLine i={4} as="p" className="dk-lede">
            {close.sub}
          </DeckLine>
        ) : null}
        <DeckLine i={5}>
          <CloseAction close={close} />
        </DeckLine>
      </section>
    </div>
  )
}

/** A deck told in two lanes on one time axis: what we learned above, what we did below. */
export function LanesDeck({
  story,
  label,
  onProblems,
  className,
}: {
  story: LanesStory
  label?: string
  /** Gets what deckProblems finds and what runs over on the drawn slides. Without it they go to the console in development. */
  onProblems?: (problems: string[]) => void
  className?: string
}) {
  const { cover, moments, close } = story
  return (
    <Deck
      label={label ?? cover.title}
      count={moments.length + 2}
      titles={[
        cover.title,
        ...moments.map((m) => `${m.chapter}: ${m.figure ? `${figureText(m.figure)} ${m.figure.means}` : m.learned}`),
        [close.title, close.turn].filter(Boolean).join(" "),
      ]}
      notes={[cover.notes, ...moments.map((m) => m.notes), close.notes]}
      problems={deckProblems(story, "lanes")}
      checkKey={JSON.stringify(story)}
      onProblems={onProblems}
      className={className}
    >
      <LanesSlides story={story} />
    </Deck>
  )
}
