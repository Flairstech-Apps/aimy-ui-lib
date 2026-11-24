"use client"

import { ChevronLeft, ChevronRight, Maximize2, NotebookText } from "lucide-react"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AimyMark } from "@/components/aimy-mark"
import { Button } from "@/components/button"
import { IconButton } from "@/components/icon-button"
import { sampleMark } from "@/components/thinking"
import { toast } from "@/components/toast"
import { cn, cssDuration } from "@/lib/utils"

// Decks: presentations told on a timeline. This is the engine both templates
// (HorizonDeck, LanesDeck) share, and the motion they borrow from the Chrome
// extension (Knowledge/extension/popup.js): the logo's flight, the thinking
// mark, the ambient field. Styles are deck.css in @flairstech-aimy/tokens.
//
// A slide is authored on a fixed 1920x1080 stage that the frame scales whole,
// so it looks the same on a laptop, a projector or a phone and never re-lays
// out. Keys: arrows, Space, Page Up and Down, Home, End. Clicking the left
// third goes back, the rest goes on. Present takes the frame full screen.
// Slides switch by data-state (now, done, ahead); nothing is display:none.

/* ═════════════════ THE STORY ═════════════════ */

export type DeckCover = {
  /** A short line above the title: what the deck is. */
  kicker: string
  title: string
  sub?: string
  /** When, on the header's right. */
  when?: string
  /** What the presenter says here, in the speaker view. Never on the slide. */
  notes?: string
}

export type DeckClose = {
  title: string
  /** The turn of the phrase, set in AiMY blue after the title: "Knowledge to" + "Action." */
  turn?: string
  sub?: string
  action?: { label: string; href?: string }
  /** Where to find it, beside the action. */
  where?: string
  /** What the presenter says here, in the speaker view. Never on the slide. */
  notes?: string
}

/**
 * A number that earns its place: the value, and what it means. It counts up
 * when its slide arrives, keeping the value's decimals (92.5 stays 92.5) and
 * grouping thousands (1,240).
 */
export type DeckFigure = {
  value: number
  /** What it counts and what it is against, from the brief only: "win rate in the pilot teams, up from 18%". */
  means: string
  /** Before the number: "$", "£". */
  prefix?: string
  /** After it, a symbol or short unit: "%", "M", "K", "h", "x", "/5". */
  suffix?: string
}

const decimalsOf = (v: number) => Math.min(2, (String(v).split(".")[1] ?? "").length)

/** The figure's number as it is shown: its own decimals, thousands grouped. */
export function formatFigure(value: number, decimals = decimalsOf(value)) {
  return new Intl.NumberFormat("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

/** The whole figure in words, for the speaker view and screen readers: "$1.4M". */
export const figureText = (f: DeckFigure) => `${f.prefix ?? ""}${formatFigure(f.value)}${f.suffix ?? ""}`

/* ═════════════════ CHECKS ═════════════════ */

type AnyMoment = {
  when?: string
  chapter: string
  title?: string
  body?: string
  learned?: string
  did?: string
  figure?: DeckFigure
}

/**
 * What is wrong with a story before it is drawn, in sentences an agent can
 * act on: too many moments, a figure with a bare unit in its words, text a
 * template drops, lines long enough to run over. The deck also measures
 * every slide once it is drawn and reports what really runs over.
 */
export function deckProblems(
  story: { cover: DeckCover; moments: AnyMoment[]; close: DeckClose },
  kind: "horizon" | "lanes"
): string[] {
  const out: string[] = []
  const { cover, moments, close } = story
  const most = kind === "horizon" ? 7 : 12
  if (moments.length < 2) out.push(`A deck needs at least two moments; this one has ${moments.length}.`)
  if (moments.length > most)
    out.push(
      `${moments.length} moments is too many for the ${kind === "horizon" ? "horizon" : "lanes"}: ${most} at most, five reads best. Merge moments, or say the rest in the notes.`
    )
  const long = (where: string, text: string | undefined, max: number, what: string) => {
    if (text && text.length > max) out.push(`${where}: ${what} is ${text.length} characters; keep it under ${max}.`)
  }
  long("The cover", cover.title, 60, "the title")
  long("The cover", cover.kicker, 48, "the kicker")
  long("The cover", cover.sub, 110, "the line under the title")
  const fig = (where: string, f: DeckFigure) => {
    if (!Number.isFinite(f.value)) out.push(`${where}: the figure's value isn't a number.`)
    if (!f.means?.trim()) out.push(`${where}: the figure needs means, what the number counts and what it is against.`)
    if (/^\s*(%|percent|per cent|\$|£|€)/i.test(f.means ?? ""))
      out.push(`${where}: put the unit in the figure's suffix or prefix ("%", "$"), not at the start of means.`)
    if ((f.suffix ?? "").length > 3) out.push(`${where}: the suffix "${f.suffix}" is long; use a symbol or short unit and say the rest in means.`)
    if ((f.prefix ?? "").length > 2) out.push(`${where}: the prefix "${f.prefix}" is long; use a symbol.`)
    long(where, f.means, 80, "the figure's means")
  }
  moments.forEach((m, k) => {
    const where = `Moment ${k + 1} (${m.chapter || "no chapter"})`
    if (!m.chapter?.trim()) out.push(`${where}: needs a chapter, its name on the timeline.`)
    long(where, m.chapter, 22, "the chapter")
    long(where, m.when, 12, "when")
    if (kind === "horizon") {
      if (m.figure && (m.title || m.body)) out.push(`${where}: a figure takes the title's place; the title and body aren't shown. Put them in the notes or another moment.`)
      if (!m.figure && !m.title) out.push(`${where}: needs a title or a figure.`)
      long(where, m.title, 64, "the title")
      long(where, m.body, 130, "the body")
    } else {
      if (m.figure && m.learned) out.push(`${where}: a figure takes the learned card's words; learned isn't shown. Say it in the figure's means.`)
      if (!m.figure && !m.learned) out.push(`${where}: needs learned or a figure.`)
      if (!m.did?.trim()) out.push(`${where}: needs did, what was done about it (or "Next: …" when nothing was done yet).`)
      long(where, m.learned, 150, "learned")
      long(where, m.did, 150, "did")
    }
    if (m.figure) fig(where, m.figure)
  })
  long("The close", `${close.title} ${close.turn ?? ""}`.trim(), 34, "the title with its turn")
  long("The close", close.sub, kind === "horizon" ? 60 : 110, "the line under the title")
  return out
}

const dev = (() => {
  try {
    return process.env.NODE_ENV !== "production"
  } catch {
    return false
  }
})()

/** The smallest a slide's words are set to make them fit: 70% of their size. */
const FIT_FLOOR = 0.7

/**
 * Makes every slide's words fit their room, and says what it had to do.
 * Each [data-fit="top,bottom"] holds its children between those stage lines;
 * when they run over, the words step down in size (--fit, to 70% at most)
 * until they fit, so a long title never runs into the horizon or off the
 * slide. Measured by offsets, not boxes, so a line still rising measures
 * where it will land. Anything set smaller, or still over at the smallest,
 * comes back as a problem: cut words to bring it back to full size.
 */
export function fitDeck(stage: HTMLElement): string[] {
  const out: string[] = []
  const yIn = (el: HTMLElement) => {
    let y = 0
    let n: HTMLElement | null = el
    while (n && n !== stage) {
      y += n.offsetTop
      n = n.offsetParent as HTMLElement | null
    }
    return y
  }
  const overOf = (el: HTMLElement) => {
    const [top = 0, bottom = 1080] = (el.dataset.fit ?? "").split(",").map(Number)
    const kids = [...el.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.offsetHeight > 0)
    if (!kids.length) return 0
    const y0 = Math.min(...kids.map(yIn))
    const y1 = Math.max(...kids.map((c) => yIn(c) + c.offsetHeight))
    // Words that won't wrap (a long figure, four side by side) run off sideways.
    const wide = el.scrollWidth - el.clientWidth
    return Math.max(top - y0, y1 - bottom, wide)
  }
  // Rooms in one data-fit-group (a column's two cards) share one size, so
  // words side by side never differ.
  const groups = new Map<string, HTMLElement[]>()
  stage.querySelectorAll<HTMLElement>("[data-fit]").forEach((el, n) => {
    const key = el.dataset.fitGroup ?? `#${n}`
    groups.set(key, [...(groups.get(key) ?? []), el])
  })
  for (const els of groups.values()) {
    const set = (k: number) => els.forEach((el) => (k < 1 ? el.style.setProperty("--fit", String(k)) : el.style.removeProperty("--fit")))
    const worst = () => Math.max(...els.map(overOf))
    let k = 1
    set(k)
    const long = els.filter((el) => overOf(el) > 2)
    while (worst() > 2 && k > FIT_FLOOR) {
      k = Math.max(FIT_FLOOR, Math.round((k - 0.05) * 100) / 100)
      set(k)
    }
    for (const el of long) {
      const over = overOf(el)
      const at = el.dataset.fitSlide ? `Slide ${el.dataset.fitSlide}: ${el.dataset.fitHint}` : `${el.dataset.fitHint}`
      out.push(
        over > 2
          ? `${at} (${Math.round(over)}px over even at ${FIT_FLOOR * 100}% size).`
          : `${at} (set at ${Math.round(k * 100)}% size to fit).`
      )
    }
  }
  return out
}

/* ═════════════════ STATE ═════════════════ */

type DeckState = {
  /** The current slide: 0 is the cover, count - 1 the close. */
  i: number
  /** The slide before this one, or -1 on first paint. */
  prev: number
  count: number
  /** How long a line waits before it rises, in ms: the camera, or the logo's whole flight. */
  lead: number
  stage: React.RefObject<HTMLDivElement | null>
}

const DeckContext = createContext<DeckState | null>(null)

export function useDeck() {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error("useDeck is for slides inside a <Deck>.")
  return ctx
}

/** now, done or ahead: how slide n stands while slide i is showing. */
export const stateOf = (n: number, i: number) => (n === i ? "now" : n < i ? "done" : "ahead")
/** A moment is any slide between the cover and the close. */
export const isMoment = (k: number, count: number) => k > 0 && k < count - 1

export const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
/** A motion token's curve, for the Web Animations API. */
export const cssEase = (name: string) =>
  (typeof window !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) ||
  "ease-out"

/* ═════════════════ THE DECK ═════════════════ */

type DeckProps = {
  /** The deck's name, for screen readers. */
  label: string
  /** Every slide: the cover, each moment, the close. */
  count: number
  /** Each slide's name, for the speaker view. */
  titles?: string[]
  /** What the presenter says on each slide. Any notes add Speaker view to the bar. */
  notes?: (string | undefined)[]
  /** What deckProblems found in the story, reported with what the slides measure. */
  problems?: string[]
  /** Changes whenever the story does, so the slides are measured again. */
  checkKey?: string
  /** Gets every problem (the story's and what runs over). Without it they go to the console in development. */
  onProblems?: (problems: string[]) => void
  children: React.ReactNode
  className?: string
}

/** The engine: the 16:9 stage, the keys, the controls, Present and the speaker view. Its slides read where they are with useDeck(). */
export function Deck({ label, count, titles, notes, problems, checkKey, onProblems, children, className }: DeckProps) {
  const frame = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [nav, setNav] = useState({ i: 0, prev: -1 })
  const [speaker, setSpeaker] = useState<Window | null>(null)
  const last = count - 1
  const report = useRef(onProblems)
  useEffect(() => {
    report.current = onProblems
  })

  // Once the words are in their fonts, measure every slide and say what runs over.
  const storyProblems = (problems ?? []).join("\n")
  useEffect(() => {
    const st = stage.current
    if (!st) return
    let live = true
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!live) return
      const all = [...(storyProblems ? storyProblems.split("\n") : []), ...fitDeck(st)]
      // Shown only once its words fit, so a long title never flashes over the horizon.
      st.dataset.words = ""
      if (report.current) report.current(all)
      else if (dev && all.length) console.warn(`AiMY deck "${label}":\n- ${all.join("\n- ")}`)
    })
    return () => {
      live = false
    }
  }, [checkKey, storyProblems, label, count])

  // The speaker view is its own window, so the audience never sees it.
  useEffect(() => {
    if (!speaker) return
    const shut = () => speaker.close()
    window.addEventListener("pagehide", shut)
    return () => {
      window.removeEventListener("pagehide", shut)
      speaker.close()
    }
  }, [speaker])

  const openSpeaker = () => {
    if (speaker && !speaker.closed) {
      speaker.focus()
      return
    }
    const w = window.open("", "aimy-speaker-view", "popup,width=880,height=620")
    if (!w) {
      toast("Your browser blocked the speaker view", { tone: "err", sub: "Allow pop-ups for this site, then open it again." })
      return
    }
    const d = w.document
    d.title = `Speaker view · ${label}`
    d.head.replaceChildren(...[...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.cloneNode(true)))
    d.documentElement.dataset.theme = document.documentElement.dataset.theme ?? "dark"
    d.documentElement.lang = document.documentElement.lang || "en"
    d.body.replaceChildren()
    d.body.className = "dk-speaker-body"
    w.addEventListener("pagehide", () => setSpeaker(null))
    setSpeaker(w)
  }

  const go = useCallback(
    (n: number) =>
      setNav((s) => {
        const i = Math.max(0, Math.min(last, n))
        return i === s.i ? s : { i, prev: s.i }
      }),
    [last]
  )

  const { i, prev } = nav
  // The logo travels when the deck leaves or reaches its cover or its close;
  // then the words wait for it to land.
  const flies = prev >= 0 && ((prev === 0) !== (i === 0) || (prev === last) !== (i === last))
  const lead = flies ? cssDuration("--deck-flight", 720) + 60 : cssDuration("--duration-fast", 250)

  // Scale the stage to the frame, letterboxed when the frame isn't 16:9.
  useEffect(() => {
    const f = frame.current
    const s = stage.current
    if (!f || !s) return
    const fit = () => {
      const w = f.clientWidth
      const h = f.clientHeight
      if (!w || !h) return
      const k = Math.min(w / 1920, h / 1080)
      s.style.transform = `translate(${(w - 1920 * k) / 2}px, ${(h - 1080 * k) / 2}px) scale(${k})`
      s.dataset.fit = ""
    }
    fit()
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null
    ro?.observe(f)
    document.addEventListener("fullscreenchange", fit)
    return () => {
      ro?.disconnect()
      document.removeEventListener("fullscreenchange", fit)
    }
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) go(i + 1)
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) go(i - 1)
    else if (e.key === "Home") go(0)
    else if (e.key === "End") go(last)
    else return
    e.preventDefault()
  }

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a")) return
    const r = e.currentTarget.getBoundingClientRect()
    go(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1)
    e.currentTarget.focus()
  }

  const present = () => {
    const f = frame.current
    if (f?.requestFullscreen) void f.requestFullscreen().then(() => f.focus())
  }

  return (
    <div data-slot="deck" className={cn("dk", className)}>
      <div
        ref={frame}
        className="dk-frame"
        tabIndex={0}
        role="region"
        aria-roledescription="slide deck"
        aria-label={label}
        onKeyDown={onKey}
        onClick={onClick}
      >
        <div ref={stage} className="dk-stage" style={{ "--lead": `${lead}ms` } as React.CSSProperties}>
          <DeckContext.Provider value={{ i, prev, count, lead, stage }}>{children}</DeckContext.Provider>
        </div>
      </div>
      <div className="dk-bar">
        <IconButton label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0}>
          <ChevronLeft />
        </IconButton>
        <span className="dk-count" aria-live="polite">
          {i + 1} of {count}
        </span>
        <IconButton label="Next slide" onClick={() => go(i + 1)} disabled={i === last}>
          <ChevronRight />
        </IconButton>
        <span className="dk-keys">Arrows or Space when the deck is selected</span>
        {notes?.some(Boolean) ? (
          <Button size="sm" variant="ghost" onClick={openSpeaker}>
            <NotebookText />
            Speaker view
          </Button>
        ) : null}
        <Button size="sm" variant="brand" onClick={present}>
          <Maximize2 />
          Present
        </Button>
      </div>
      {speaker
        ? createPortal(
            <SpeakerView win={speaker} label={label} i={i} count={count} titles={titles} notes={notes} go={go} />,
            speaker.document.body
          )
        : null}
    </div>
  )
}

/* ═════════════════ THE SPEAKER VIEW ═════════════════ */

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

/**
 * The presenter's own window: this slide's notes large enough to read at a
 * glance, what comes next, and the time since it opened. Its keys and
 * buttons move the deck, so it can drive a deck shared on another screen.
 */
function SpeakerView({
  win,
  label,
  i,
  count,
  titles,
  notes,
  go,
}: {
  win: Window
  label: string
  i: number
  count: number
  titles?: string[]
  notes?: (string | undefined)[]
  go: (n: number) => void
}) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const t = win.setInterval(() => setSecs((s) => s + 1), 1000)
    return () => win.clearInterval(t)
  }, [win])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.("button")) return
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) go(i + 1)
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) go(i - 1)
      else if (e.key === "Home") go(0)
      else if (e.key === "End") go(count - 1)
      else return
      e.preventDefault()
    }
    win.addEventListener("keydown", onKey)
    return () => win.removeEventListener("keydown", onKey)
  }, [win, go, i, count])
  const note = notes?.[i]
  return (
    <main className="dk-speaker" aria-label={`Speaker view: ${label}`}>
      <header className="dk-speaker-head">
        <span className="dk-speaker-count" aria-live="polite">
          Slide {i + 1} of {count}
        </span>
        <span className="dk-speaker-time" aria-label={`${clock(secs)} since the speaker view opened`}>
          {clock(secs)}
        </span>
        <span className="dk-speaker-nav">
          <IconButton label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0}>
            <ChevronLeft />
          </IconButton>
          <IconButton label="Next slide" onClick={() => go(i + 1)} disabled={i === count - 1}>
            <ChevronRight />
          </IconButton>
        </span>
      </header>
      <h1 className="dk-speaker-title">{titles?.[i] ?? `Slide ${i + 1}`}</h1>
      <p className="dk-speaker-notes">{note ?? "No notes for this slide."}</p>
      <p className="dk-speaker-next">
        {i < count - 1 ? (
          <>
            <b>Next</b> {titles?.[i + 1] ?? `Slide ${i + 2}`}
          </>
        ) : (
          <b>This is the last slide.</b>
        )}
      </p>
    </main>
  )
}

/* ═════════════════ WORDS ═════════════════ */

type Tag = "div" | "p" | "span" | "h2" | "li"

/** A line that rises into place when its slide arrives; i orders it. pop lands it with a spring. */
export function DeckLine({
  i = 0,
  as: El = "div",
  pop,
  className,
  children,
}: {
  i?: number
  as?: Tag
  pop?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <El className={cn("dk-rv", pop && "is-pop", className)} style={{ "--i": i } as React.CSSProperties}>
      {children}
    </El>
  )
}

/** Words that arrive one after another (transitions.dev 30). */
export function DeckWords({ text, from = 0, className }: { text: string; from?: number; className?: string }) {
  const words = text.split(" ")
  return (
    <>
      {words.map((w, k) => (
        <span key={k}>
          <span className={cn("dk-w", className)} style={{ "--w": k + from } as React.CSSProperties}>
            {w}
          </span>
          {k < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  )
}

/** The close's title: the phrase, then its turn in AiMY blue. */
export function CloseTitle({ close }: { close: DeckClose }) {
  const n = close.title.split(" ").length
  return (
    <h2 className="dk-display">
      <DeckWords text={close.title} />
      {close.turn ? (
        <>
          {" "}
          <span className="dk-w dk-turn" style={{ "--w": n } as React.CSSProperties}>
            {close.turn}
          </span>
        </>
      ) : null}
    </h2>
  )
}

/** The close's action and where to find it. A link works even while presenting. */
export function CloseAction({ close, center }: { close: DeckClose; center?: boolean }) {
  if (!close.action) return null
  return (
    <div className={cn("dk-cta", center && "is-center")}>
      {close.action.href ? (
        <a className="dk-cta-btn" href={close.action.href}>
          {close.action.label}
        </a>
      ) : (
        <span className="dk-cta-btn">{close.action.label}</span>
      )}
      {close.where ? <span className="dk-cta-where">{close.where}</span> : null}
    </div>
  )
}

/**
 * A figure that counts up to itself when slide n arrives, then holds: in its
 * own decimals with thousands grouped, the prefix and suffix standing still.
 */
export function DeckCount({
  value,
  n,
  prefix,
  suffix,
  unitClassName,
  className,
}: {
  value: number
  n: number
  prefix?: string
  suffix?: string
  /** Sets the prefix and suffix apart (a template may draw units smaller). */
  unitClassName?: string
  className?: string
}) {
  const { i, lead } = useDeck()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || i !== n || reducedMotion()) return
    const t0 = performance.now() + lead
    const dur = cssDuration("--deck-count", 1100)
    const places = decimalsOf(value)
    let raf = 0
    el.textContent = formatFigure(0, places)
    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - t0) / dur))
      el.textContent = formatFigure(value * easeOutCubic(t), places)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      el.textContent = formatFigure(value)
    }
  }, [i, n, value, lead])
  return (
    <span className={className}>
      {prefix ? unitClassName ? <span className={cn(unitClassName, "is-pre")}>{prefix}</span> : prefix : null}
      <span ref={ref}>{formatFigure(value)}</span>
      {suffix ? unitClassName ? <span className={unitClassName}>{suffix.trim()}</span> : suffix : null}
    </span>
  )
}

/* ═════════════════ THE AMBIENT FIELD ═════════════════ */

// The extension's dust table: [x%, y%, size px, peak opacity, rise vh, sideways vw, seconds],
// scaled to the stage (sizes x2.4, rise and drift in stage pixels).
const DUST: [number, number, number, number, number, number, number][] = [
  [4, 82, 2.0, 0.3, -62, 1.4, 31], [11, 96, 1.4, 0.2, -74, -0.9, 38], [17, 71, 2.6, 0.34, -55, 2.1, 25],
  [23, 88, 1.2, 0.16, -68, -1.6, 41], [29, 63, 1.8, 0.26, -49, 0.7, 28], [34, 92, 2.2, 0.31, -71, -2.3, 34],
  [40, 77, 1.3, 0.18, -58, 1.9, 43], [45, 99, 2.8, 0.36, -80, -1.1, 22], [51, 68, 1.6, 0.23, -52, 2.6, 37],
  [56, 85, 2.1, 0.29, -66, -0.6, 26], [62, 94, 1.1, 0.15, -76, 1.2, 40], [67, 73, 2.4, 0.33, -54, -2.8, 29],
  [73, 90, 1.7, 0.24, -70, 0.4, 35], [78, 66, 2.0, 0.28, -47, 1.7, 23], [84, 97, 1.5, 0.21, -79, -1.4, 42],
  [89, 79, 2.5, 0.35, -60, 2.2, 27], [94, 87, 1.3, 0.17, -67, -0.8, 39], [98, 70, 1.9, 0.27, -51, 1.0, 32],
  [8, 61, 1.6, 0.22, -45, -1.9, 36], [20, 99, 2.3, 0.32, -83, 0.9, 24], [37, 58, 1.2, 0.14, -42, 2.4, 44],
  [48, 81, 1.9, 0.25, -63, -1.3, 30], [59, 60, 2.7, 0.34, -44, 1.5, 21], [70, 98, 1.4, 0.19, -81, -2.0, 45],
  [81, 64, 1.8, 0.26, -48, 0.6, 33], [92, 93, 2.2, 0.3, -73, -1.7, 28], [14, 75, 1.1, 0.13, -57, 2.8, 46],
  [65, 84, 1.5, 0.2, -64, -0.5, 20],
]

/** Two blooms drifting on coprime cycles, and dust rising through the slide. */
export function DeckField({ blooms = true }: { blooms?: boolean }) {
  return (
    <div className="dk-field" aria-hidden="true">
      {blooms ? (
        <>
          <div className="dk-bloom is-a" />
          <div className="dk-bloom is-b" />
        </>
      ) : null}
      {DUST.map((m, n) => (
        <span
          key={n}
          className="dk-mote"
          style={
            {
              "--x": `${m[0]}%`,
              "--y": `${m[1]}%`,
              "--s": `${(m[2] * 2.4).toFixed(1)}px`,
              "--o": m[3],
              "--t": `${Math.round(m[4] * 10.8)}px`,
              "--dx": `${Math.round(m[5] * 19.2)}px`,
              "--d": `${m[6]}s`,
              "--n": n,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** A light run along a path of stage points, head first (the comet both templates send to the next moment). */
export function runComet(el: HTMLElement | null, points: { x: number; y: number; r: number }[], ms: number) {
  if (!el || reducedMotion() || typeof el.animate !== "function" || points.length < 2) return
  const n = points.length - 1
  el.animate(
    points.map((p, k) => {
      const t = k / n
      return {
        transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`,
        opacity: t < 0.12 ? t / 0.12 : t > 0.8 ? (1 - t) / 0.2 : 1,
        offset: t,
      }
    }),
    { duration: ms, easing: "linear" }
  )
}

/* ═════════════════ THE LOGO ═════════════════ */

/* The logo flight: Knowledge/extension/popup.js buildKeyframes, line for line,
   with the wind-up dip scaled to the stage (7px in the 400px panel, 20 here).
   A wind-up so it reads as a push-off, a real arc, and a spin that ends ahead
   of the travel so the mark arrives upright. */
const WINDUP = 0.14
const SPIN_DONE = 0.85
const WINDUP_DIP = 20
const SAMPLES = 40

function flightFrames({ dx, dy, scale }: { dx: number; dy: number; scale: number }): Keyframe[] {
  const cx = dx * 0.22
  const cy = dy * 1.18
  const frames: Keyframe[] = []
  for (let k = 0; k < SAMPLES; k += 1) {
    const t = k / SAMPLES
    let x = 0
    let y: number
    let s: number
    let r: number
    if (t < WINDUP) {
      const w = easeInOutCubic(t / WINDUP)
      y = WINDUP_DIP * w
      s = 1 - 0.07 * w
      r = -10 * w
    } else {
      const u = (t - WINDUP) / (1 - WINDUP)
      const p = easeInOutCubic(u)
      x = 2 * (1 - p) * p * cx + p * p * dx
      y = Math.pow(1 - p, 2) * WINDUP_DIP + 2 * (1 - p) * p * cy + p * p * dy
      s = 0.93 + (scale - 0.93) * p
      r = -10 + 370 * easeOutCubic(Math.min(1, u / SPIN_DONE))
    }
    frames.push({ transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`, offset: t })
  }
  frames.push({ transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(360deg)`, offset: 1 })
  return frames
}

/* The thinking mark, one short cycle: the mark's dots come apart into an
   orbit, turn, and gather back (Knowledge's thinkFrame, via the extension). */
function thinkFrame(cv: HTMLCanvasElement, ms: number, total: number, markPx: number) {
  const ctx = cv.getContext("2d")
  const pts = sampleMark()
  if (!ctx || !pts.length) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = Math.round(cv.clientWidth * dpr)
  const H = Math.round(cv.clientHeight * dpr)
  if (cv.width !== W) {
    cv.width = W
    cv.height = H
  }
  ctx.clearRect(0, 0, W, H)
  const M = markPx * dpr
  const scatter = total * 0.34
  const orbit = total * 0.23
  let mix: number
  if (ms < scatter) mix = easeInOutCubic(ms / scatter)
  else if (ms < scatter + orbit) mix = 1
  else mix = 1 - easeInOutCubic(Math.min(1, (ms - scatter - orbit) / (total - scatter - orbit)))
  const spin = (ms / 2600) * Math.PI * 2
  for (const p of pts) {
    const a = spin * p.sp
    const ox = p.ox * Math.cos(a) - p.oy * Math.sin(a)
    const oy = p.ox * Math.sin(a) + p.oy * Math.cos(a)
    ctx.globalAlpha = 0.45 + (1 - mix) * 0.55
    ctx.fillStyle = p.c
    ctx.beginPath()
    ctx.arc(
      (p.x + (ox - p.x) * mix) * M + W / 2,
      (p.y + (oy - p.y) * mix) * M + H / 2,
      Math.max(0.6, p.sz * (M / 26) * (1 - mix * 0.25)),
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

type Spot = "cover" | "head" | "close"

/**
 * The deck's header: the mark and word top left, what you pass as meta on the
 * right. The mark rests large on the cover and the close (DeckSpot) and flies
 * between them and the header; between moments it thinks.
 */
export function DeckHead({ meta }: { meta?: React.ReactNode }) {
  const { i, prev, count, stage } = useDeck()
  const anchor = useRef<HTMLSpanElement>(null)
  const word = useRef<HTMLSpanElement>(null)
  const think = useRef<HTMLCanvasElement>(null)
  const fly = useRef<HTMLDivElement>(null)
  const at = useRef<Spot | null>(null)
  const run = useRef<{ anim: Animation; to: Spot } | null>(null)
  const raf = useRef(0)
  const last = count - 1
  const where: Spot = i === 0 ? "cover" : i === last ? "close" : "head"

  // The kit: measured in stage pixels, so the scale of the frame never matters.
  const kit = useRef<{
    rest: (s: Spot) => void
    to: (s: Spot, animate: boolean) => void
    think: () => void
  } | null>(null)

  useEffect(() => {
    const st = stage.current
    const a = anchor.current
    const w = word.current
    const f = fly.current
    const cv = think.current
    if (!st || !a || !w || !f || !cv) return
    const slide = a.closest(".dk-slide")
    const spotEl = (s: Spot) => (s === "head" ? a : slide?.querySelector<HTMLElement>(`[data-spot="${s}"]`)) ?? a
    const box = (el: Element) => {
      const s = st.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const k = s.width / 1920 || 1
      return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k }
    }
    const place = (b: { x: number; y: number; w: number; h: number }) => {
      f.style.left = `${b.x}px`
      f.style.top = `${b.y}px`
      f.style.width = `${b.w}px`
      f.style.height = `${b.h}px`
      f.style.visibility = "visible"
    }
    const rest = (s: Spot) => {
      at.current = s
      if (s === "head") {
        f.style.visibility = "hidden"
        a.classList.add("is-on")
        w.classList.add("is-on")
        return
      }
      place(box(spotEl(s)))
      a.classList.remove("is-on", "is-thinking")
      w.classList.remove("is-on")
    }
    kit.current = {
      rest,
      to(s, animate) {
        if (run.current) {
          const { anim, to } = run.current
          anim.onfinish = null
          anim.cancel()
          run.current = null
          rest(to)
        }
        if (s === at.current) return
        if (!animate || at.current === null || reducedMotion() || typeof f.animate !== "function") {
          rest(s)
          return
        }
        const from = box(spotEl(at.current))
        const dest = box(spotEl(s))
        cancelAnimationFrame(raf.current)
        place(from)
        a.classList.remove("is-on", "is-thinking")
        w.classList.remove("is-on")
        const anim = f.animate(
          flightFrames({
            dx: dest.x + dest.w / 2 - (from.x + from.w / 2),
            dy: dest.y + dest.h / 2 - (from.y + from.h / 2),
            scale: dest.w / from.w,
          }),
          { duration: cssDuration("--deck-flight", 720), easing: "linear", fill: "forwards" }
        )
        run.current = { anim, to: s }
        anim.onfinish = () => {
          run.current = null
          rest(s)
          anim.cancel()
          if (s === "head") {
            a.classList.remove("is-landing")
            void a.offsetWidth
            a.classList.add("is-landing")
          }
        }
      },
      think() {
        if (at.current !== "head" || run.current || reducedMotion() || !sampleMark().length) return
        cancelAnimationFrame(raf.current)
        const total = cssDuration("--deck-think", 1220)
        const t0 = performance.now()
        a.classList.add("is-thinking")
        const step = (now: number) => {
          const ms = now - t0
          thinkFrame(cv, Math.min(ms, total), total, 44)
          if (ms < total) raf.current = requestAnimationFrame(step)
          else a.classList.remove("is-thinking")
        }
        raf.current = requestAnimationFrame(step)
      },
    }
    // Fonts landing late move the cover's layout: put a resting mark back on its spot.
    void document.fonts?.ready.then(() => {
      if (!run.current && at.current && at.current !== "head") rest(at.current)
    })
    return () => {
      cancelAnimationFrame(raf.current)
      run.current?.anim.cancel()
    }
  }, [stage])

  useEffect(() => {
    const k = kit.current
    if (!k) return
    k.to(where, prev >= 0)
    if (prev >= 0 && isMoment(prev, count) && isMoment(i, count)) k.think()
  }, [i, prev, where, count])

  return (
    <>
      <div className="dk-head">
        <span className="dk-brand" role="img" aria-label="AiMY">
          <span ref={anchor} className="dk-anchor">
            <AimyMark title="" className="dk-icon size-full" />
            <canvas ref={think} className="dk-think" aria-hidden="true" />
          </span>
          <span ref={word} className="dk-word">
            <AimyMark variant="word" title="" className="block size-full" />
          </span>
        </span>
        {meta ? <span className="dk-head-meta">{meta}</span> : null}
      </div>
      <div ref={fly} className="dk-fly" aria-hidden="true">
        <AimyMark title="" className="size-full" />
      </div>
    </>
  )
}

/** Where the mark rests large: on the cover or the close, with its halo. */
export function DeckSpot({ name }: { name: "cover" | "close" }) {
  return (
    <span className="dk-spot" data-spot={name}>
      <DeckLine as="span" className="dk-halo" />
    </span>
  )
}
