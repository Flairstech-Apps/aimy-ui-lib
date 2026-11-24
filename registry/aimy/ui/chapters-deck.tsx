"use client"

import { ArrowRight, Check, Quote, type LucideIcon } from "lucide-react"
import {
  CloseAction,
  CloseTitle,
  Deck,
  DeckCount,
  DeckField,
  DeckHead,
  DeckLine,
  DeckSpot,
  DeckWords,
  figureText,
  stateOf,
  useDeck,
  type DeckClose,
  type DeckCover,
  type DeckFigure,
} from "@/components/deck"
import { cn } from "@/lib/utils"

// The Chapters deck: a talk organised by topic, not by date. A proposal, a
// plan, a pitch, a training, an update on a subject. The talk is split into
// parts; each opens with a divider and the agenda is built from them. A glass
// rail keeps the agenda on screen, the current part lit and a bar per slide
// inside it, and its light glides to each new part. Explored in
// docs/slides-variants.html (A).

/* ═════════════════ THE TALK ═════════════════ */

type Notes = {
  /** What the presenter says here, in the speaker view. Never on the slide. */
  notes?: string
}

/** One idea, said large. */
export type ChapterStatement = Notes & { kind: "statement"; title: string; sub?: string }
/** Two or three things that each matter, side by side. Never a bulleted list. */
export type ChapterPoints = Notes & {
  kind: "points"
  title: string
  points: { icon?: LucideIcon; head: string; line?: string }[]
}
/** Two or three figures, each with what it means. */
export type ChapterFigures = Notes & { kind: "figures"; title: string; figures: DeckFigure[] }
/** Before and after, row by row. */
export type ChapterCompare = Notes & {
  kind: "compare"
  title: string
  /** The two columns' names: "Today", "With Knowledge". */
  before: string
  after: string
  rows: [string, string][]
}
/** Someone's own words, with who said it. */
export type ChapterQuote = Notes & { kind: "quote"; quote: string; who: string }
/** Two options for the room to decide between; mark the one you recommend. */
export type ChapterChoice = Notes & {
  kind: "choice"
  title: string
  options: { name: string; lines: string[]; recommended?: boolean }[]
}

export type ChapterSlide = ChapterStatement | ChapterPoints | ChapterFigures | ChapterCompare | ChapterQuote | ChapterChoice

export type ChaptersPart = Notes & {
  /** Its name, in the agenda and the rail: "Why now". One to three words. */
  title: string
  /** One line under the part's title on its divider: what this part answers. */
  holds?: string
  slides: ChapterSlide[]
}

export type ChaptersStory = {
  cover: DeckCover
  /** Two to five parts; three or four read best. */
  parts: ChaptersPart[]
  close: DeckClose
  /** Show the agenda after the cover. On unless you say otherwise. */
  agenda?: boolean
  /** Notes for the agenda slide. */
  agendaNotes?: string
}

type Flat =
  | { type: "cover" }
  | { type: "agenda" }
  | { type: "part"; p: number }
  | { type: "slide"; p: number; slide: ChapterSlide }
  | { type: "close" }

/** Every slide in order: the cover, the agenda, each part's divider and slides, the close. */
export function chaptersSlides(story: ChaptersStory): Flat[] {
  const out: Flat[] = [{ type: "cover" }]
  if (story.agenda !== false) out.push({ type: "agenda" })
  story.parts.forEach((part, p) => {
    out.push({ type: "part", p })
    part.slides.forEach((slide) => out.push({ type: "slide", p, slide }))
  })
  out.push({ type: "close" })
  return out
}

const pad = (n: number) => String(n).padStart(2, "0")

/* ═════════════════ CHECKS ═════════════════ */

/**
 * What is wrong with a talk before it is drawn, in sentences an agent can
 * act on. The deck also measures every slide once it is drawn and sets
 * long words smaller until they fit, saying what to cut.
 */
export function chaptersProblems(story: ChaptersStory): string[] {
  const out: string[] = []
  const long = (where: string, text: string | undefined, max: number, what: string) => {
    if (text && text.length > max) out.push(`${where}: ${what} is ${text.length} characters; keep it under ${max}.`)
  }
  const { cover, parts, close } = story
  if (parts.length < 2) out.push(`A Chapters deck needs at least two parts; this one has ${parts.length}. With one, use a shorter talk or the Horizon deck.`)
  if (parts.length > 5) out.push(`${parts.length} parts is too many: five at most, three or four read best. Merge the closest.`)
  long("The cover", cover.title, 60, "the title")
  long("The cover", cover.kicker, 48, "the kicker")
  long("The cover", cover.sub, 110, "the line under the title")
  parts.forEach((part, p) => {
    const at = `Part ${p + 1} (${part.title || "no title"})`
    if (!part.title?.trim()) out.push(`${at}: needs a title, its name in the agenda.`)
    long(at, part.title, 24, "the title")
    long(at, part.holds, 70, "holds")
    if (!part.slides.length) out.push(`${at}: has no slides. Give it at least one, or fold it into another part.`)
    if (part.slides.length > 5) out.push(`${at}: ${part.slides.length} slides; five at most. Split the part or move detail to the notes.`)
    part.slides.forEach((s, k) => {
      const where = `${at}, slide ${k + 1} (${s.kind})`
      if ("title" in s) long(where, s.title, s.kind === "statement" ? 80 : 56, "the title")
      switch (s.kind) {
        case "statement":
          long(where, s.sub, 110, "the line under it")
          break
        case "points":
          if (s.points.length < 2 || s.points.length > 3) out.push(`${where}: two or three points; this has ${s.points.length}. More is a list: split it or say it aloud.`)
          s.points.forEach((pt, j) => {
            long(`${where}, point ${j + 1}`, pt.head, 24, "the head")
            long(`${where}, point ${j + 1}`, pt.line, 70, "the line")
          })
          break
        case "figures":
          if (s.figures.length < 1 || s.figures.length > 3) out.push(`${where}: one to three figures; this has ${s.figures.length}.`)
          s.figures.forEach((f, j) => {
            const fw = `${where}, figure ${j + 1}`
            if (!Number.isFinite(f.value)) out.push(`${fw}: the value isn't a number.`)
            if (!f.means?.trim()) out.push(`${fw}: needs means, what the number counts and what it is against.`)
            if (/^\s*(%|percent|per cent|\$|£|€)/i.test(f.means ?? "")) out.push(`${fw}: put the unit in suffix or prefix, not at the start of means.`)
            if ((f.suffix ?? "").trim().length > 4) out.push(`${fw}: the suffix "${f.suffix}" is long; use a symbol or short unit.`)
            long(fw, f.means, 80, "means")
          })
          break
        case "compare":
          if (s.rows.length < 2 || s.rows.length > 4) out.push(`${where}: two to four rows; this has ${s.rows.length}.`)
          s.rows.forEach((r, j) => {
            long(`${where}, row ${j + 1}`, r[0], 32, "the before")
            long(`${where}, row ${j + 1}`, r[1], 32, "the after")
          })
          break
        case "quote":
          long(where, s.quote, 120, "the quote")
          if (!s.who?.trim()) out.push(`${where}: say who said it (a role is enough: "An account manager in the pilot").`)
          break
        case "choice":
          if (s.options.length !== 2) out.push(`${where}: a choice is two options; this has ${s.options.length}.`)
          if (s.options.filter((o) => o.recommended).length > 1) out.push(`${where}: recommend one option at most.`)
          s.options.forEach((o, j) => {
            long(`${where}, option ${j + 1}`, o.name, 28, "the name")
            if (o.lines.length > 3) out.push(`${where}, option ${j + 1}: three lines at most.`)
            o.lines.forEach((l) => long(`${where}, option ${j + 1}`, l, 48, "a line"))
          })
          break
      }
    })
  })
  long("The close", `${close.title} ${close.turn ?? ""}`.trim(), 34, "the title with its turn")
  long("The close", close.sub, 110, "the line under the title")
  return out
}

/* ═════════════════ SLIDES ═════════════════ */

/* Each part's row in the rail: 132px, closer together when there are more of them. */
const partHeight = (n: number) => Math.min(132, Math.floor(600 / Math.max(n, 1)))

function Kicker({ p, parts }: { p: number; parts: ChaptersPart[] }) {
  return (
    <DeckLine className="dk-kicker">
      {pad(p + 1)} · {parts[p]?.title}
    </DeckLine>
  )
}

function SlideBody({ slide, n, p, parts }: { slide: ChapterSlide; n: number; p: number; parts: ChaptersPart[] }) {
  switch (slide.kind) {
    case "statement":
      return (
        <>
          <Kicker p={p} parts={parts} />
          <h2 className="dk-k-statement">
            <DeckWords text={slide.title} />
          </h2>
          {slide.sub ? (
            <DeckLine i={8} as="p" className="dk-k-sub">
              {slide.sub}
            </DeckLine>
          ) : null}
        </>
      )
    case "points":
      return (
        <>
          <Kicker p={p} parts={parts} />
          <h2 className="dk-k-title">
            <DeckWords text={slide.title} />
          </h2>
          <div className="dk-k-points">
            {slide.points.map((pt, j) => {
              const Icon = pt.icon
              return (
                <DeckLine key={j} i={j + 3} pop className="dk-k-point">
                  {Icon ? (
                    <span className="dk-k-tile">
                      <Icon aria-hidden="true" strokeWidth={2} />
                    </span>
                  ) : null}
                  <b className="dk-k-point-head">{pt.head}</b>
                  {pt.line ? <span className="dk-k-point-line">{pt.line}</span> : null}
                </DeckLine>
              )
            })}
          </div>
        </>
      )
    case "figures":
      return (
        <>
          <Kicker p={p} parts={parts} />
          <h2 className="dk-k-title">
            <DeckWords text={slide.title} />
          </h2>
          <div className="dk-k-figs" data-cols={slide.figures.length === 4 ? 2 : Math.min(slide.figures.length, 3)}>
            {slide.figures.map((f, j) => (
              <DeckLine key={j} i={j + 3} className="dk-k-fig">
                <DeckCount value={f.value} prefix={f.prefix} suffix={f.suffix} n={n} unitClassName="dk-k-unit" className="dk-k-fig-n" />
                <p className="dk-k-fig-m">{f.means}</p>
              </DeckLine>
            ))}
          </div>
        </>
      )
    case "compare":
      return (
        <>
          <Kicker p={p} parts={parts} />
          <h2 className="dk-k-title">
            <DeckWords text={slide.title} />
          </h2>
          <div className="dk-k-cmp">
            <div className="dk-k-cmp-row">
              <DeckLine i={2} className="dk-k-cmp-h" as="span">
                {slide.before}
              </DeckLine>
              <span aria-hidden="true" />
              <DeckLine i={2} className="dk-k-cmp-h is-after" as="span">
                {slide.after}
              </DeckLine>
            </div>
            {slide.rows.map((r, j) => (
              <div key={j} className="dk-k-cmp-row is-row">
                <DeckLine i={j * 2 + 3} as="span">
                  {r[0]}
                </DeckLine>
                <DeckLine i={j * 2 + 4} as="span" className="dk-k-cmp-arrow">
                  <ArrowRight aria-hidden="true" strokeWidth={2} />
                </DeckLine>
                <DeckLine i={j * 2 + 4} as="span" className="dk-k-cmp-after">
                  {r[1]}
                </DeckLine>
              </div>
            ))}
          </div>
        </>
      )
    case "quote":
      return (
        <>
          <Kicker p={p} parts={parts} />
          <DeckLine i={1} className="dk-k-qmark">
            <Quote aria-hidden="true" strokeWidth={2} />
          </DeckLine>
          <blockquote className="dk-k-quote">
            <DeckWords text={slide.quote} from={2} />
          </blockquote>
          <DeckLine i={9} className="dk-k-who">
            {slide.who}
          </DeckLine>
        </>
      )
    case "choice":
      return (
        <>
          <Kicker p={p} parts={parts} />
          <h2 className="dk-k-title">
            <DeckWords text={slide.title} />
          </h2>
          <div className="dk-k-opts">
            {slide.options.map((o, j) => (
              <DeckLine key={j} i={j * 2 + 3} pop className={cn("dk-k-opt", o.recommended && "is-rec")}>
                {o.recommended ? <span className="dk-k-opt-tag">Recommended</span> : null}
                <b className="dk-k-opt-name">{o.name}</b>
                {o.lines.map((l, k) => (
                  <span key={k} className="dk-k-opt-line">
                    <span className="dk-k-opt-mark">
                      <Check aria-hidden="true" strokeWidth={2.5} />
                    </span>
                    {l}
                  </span>
                ))}
              </DeckLine>
            ))}
          </div>
        </>
      )
  }
}

function ChaptersSlides({ story, flat }: { story: ChaptersStory; flat: Flat[] }) {
  const { i } = useDeck()
  const { cover, parts, close } = story
  const now = flat[i]
  const edge = !now || now.type === "cover" || now.type === "agenda" || now.type === "close"
  const p = now && "p" in now ? now.p : -1
  const last = flat.length - 1
  const partH = partHeight(parts.length)
  const fit = (n: number, hint: string) => ({ "data-fit": "150,960", "data-fit-slide": n + 1, "data-fit-hint": hint })

  return (
    <div className="dk-slide dk-chp" data-edge={edge ? "" : undefined}>
      <DeckField />
      <aside className="dk-chp-rail" aria-hidden="true">
        <ol className="dk-chp-parts" style={{ "--part-h": `${partH}px` } as React.CSSProperties}>
          <li className="dk-chp-light" style={{ transform: `translateY(${Math.max(p, 0) * partH}px)` }} />
          {parts.map((part, j) => (
            <li
              key={j}
              className="dk-chp-part"
              data-state={p < 0 ? (i === last ? "done" : "ahead") : j === p ? "now" : j < p ? "done" : "ahead"}
            >
              <span className="dk-chp-part-n">{pad(j + 1)}</span>
              <span className="dk-chp-part-name">{part.title}</span>
              <span className="dk-chp-segs">
                {flat.map((f, k) =>
                  "p" in f && f.p === j ? <span key={k} className="dk-chp-seg" data-state={stateOf(k, i)} /> : null
                )}
              </span>
            </li>
          ))}
        </ol>
        {cover.kicker || cover.when ? (
          <div className="dk-chp-foot">
            {cover.kicker ? <b>{cover.kicker}</b> : null}
            {cover.when}
          </div>
        ) : null}
      </aside>
      <DeckHead />
      {flat.map((f, n) => {
        const state = stateOf(n, i)
        const common = { "data-state": state, "aria-hidden": i !== n }
        if (f.type === "cover")
          return (
            <section key={n} className="dk-chp-panel is-edge" {...common} {...fit(n, "the cover is too tall. Keep the title to two lines and the line under it to two")}>
              <DeckSpot name="cover" />
              <DeckLine i={1} className="dk-kicker">
                {cover.kicker}
              </DeckLine>
              <h2 className="dk-display">
                <DeckWords text={cover.title} />
              </h2>
              {cover.sub ? (
                <DeckLine i={6} as="p" className="dk-k-sub">
                  {cover.sub}
                </DeckLine>
              ) : null}
              {cover.when ? (
                <DeckLine i={7} className="dk-k-meta">
                  {cover.when}
                </DeckLine>
              ) : null}
            </section>
          )
        if (f.type === "agenda")
          return (
            <section key={n} className="dk-chp-panel is-edge" {...common} {...fit(n, "the agenda is too tall. Use five parts at most, with short titles")}>
              <DeckLine className="dk-kicker">Agenda</DeckLine>
              <ol className="dk-k-agenda">
                {parts.map((part, j) => (
                  <DeckLine key={j} i={j + 1} as="li">
                    <span className="dk-k-agenda-n">{pad(j + 1)}</span>
                    <span className="dk-k-agenda-name">{part.title}</span>
                  </DeckLine>
                ))}
              </ol>
            </section>
          )
        if (f.type === "part") {
          const part = parts[f.p]
          return (
            <section key={n} className="dk-chp-panel" {...common} {...fit(n, "the part's divider is too tall. Keep its title to one line and holds to one")}>
              <DeckLine className="dk-k-part-n">{pad(f.p + 1)}</DeckLine>
              <h2 className="dk-k-part-name">
                <DeckWords text={part?.title ?? ""} from={1} />
              </h2>
              {part?.holds ? (
                <DeckLine i={5} as="p" className="dk-k-part-holds">
                  {part.holds}
                </DeckLine>
              ) : null}
            </section>
          )
        }
        if (f.type === "slide")
          return (
            <section key={n} className="dk-chp-panel" {...common} {...fit(n, "the slide's words run off it. Cut the title to two lines and each line under it to one or two; say the rest in the notes")}>
              <SlideBody slide={f.slide} n={n} p={f.p} parts={parts} />
            </section>
          )
        return (
          <section key={n} className="dk-chp-panel is-edge" {...common} {...fit(n, "the close is too tall. Keep the title to one line and the line under it to two")}>
            <DeckSpot name="close" />
            <CloseTitle close={close} />
            {close.sub ? (
              <DeckLine i={4} as="p" className="dk-k-sub">
                {close.sub}
              </DeckLine>
            ) : null}
            <DeckLine i={5}>
              <CloseAction close={close} />
            </DeckLine>
          </section>
        )
      })}
    </div>
  )
}

/** A slide's name, for the speaker view. */
function titleOf(story: ChaptersStory, f: Flat): string {
  if (f.type === "cover") return story.cover.title
  if (f.type === "agenda") return `Agenda: ${story.parts.map((p) => p.title).join(", ")}`
  if (f.type === "close") return [story.close.title, story.close.turn].filter(Boolean).join(" ")
  const part = story.parts[f.p]
  if (f.type === "part") return `${pad(f.p + 1)} ${part?.title ?? ""}`
  const s = f.slide
  if (s.kind === "quote") return `“${s.quote}”`
  if (s.kind === "figures") return `${s.title}: ${s.figures.map((x) => `${figureText(x)} ${x.means}`).join("; ")}`
  return s.title
}

function notesOf(story: ChaptersStory, f: Flat): string | undefined {
  if (f.type === "cover") return story.cover.notes
  if (f.type === "agenda") return story.agendaNotes
  if (f.type === "close") return story.close.notes
  if (f.type === "part") return story.parts[f.p]?.notes
  return f.slide.notes
}

/**
 * A talk organised by topic (a proposal, a plan, a pitch, a training): parts
 * with a divider each, an agenda built from them and kept on screen in a
 * glass rail, and ten kinds of slide.
 */
export function ChaptersDeck({
  story,
  label,
  onProblems,
  className,
}: {
  story: ChaptersStory
  label?: string
  /** Gets what chaptersProblems finds and what runs over on the drawn slides. Without it they go to the console in development. */
  onProblems?: (problems: string[]) => void
  className?: string
}) {
  const flat = chaptersSlides(story)
  return (
    <Deck
      label={label ?? story.cover.title}
      count={flat.length}
      titles={flat.map((f) => titleOf(story, f))}
      notes={flat.map((f) => notesOf(story, f))}
      problems={chaptersProblems(story)}
      checkKey={JSON.stringify(story, (_k, v) => (typeof v === "function" || v?.$$typeof ? (v.displayName ?? "icon") : v))}
      onProblems={onProblems}
      className={className}
    >
      <ChaptersSlides story={story} flat={flat} />
    </Deck>
  )
}

