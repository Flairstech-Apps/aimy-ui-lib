"use client"

import { useEffect, useId, useRef } from "react"
import {
  CloseAction,
  CloseTitle,
  Deck,
  DeckCount,
  DeckField,
  DeckHead,
  DeckSpot,
  DeckLine,
  DeckWords,
  cssEase,
  easeInOutCubic,
  isMoment,
  reducedMotion,
  runComet,
  stateOf,
  useDeck,
  type DeckClose,
  type DeckCover,
  type DeckFigure,
} from "@/components/deck"
import { Orb } from "@/components/orb"
import { cssDuration } from "@/lib/utils"

// The Horizon deck: the landing page's orb horizon as a timeline. The orb is
// now. It rises on the cover, then hops along the horizon from moment to
// moment, drawing its path in the sky; the ground ripples where it lands and
// the date it reached rises onto a glass chip. Made for a stage and a big
// screen: a headline and a line or two per slide. Explored in
// docs/deck-variants.html (C).

export type HorizonMoment = {
  /** When it happened: "27 Oct". */
  when: string
  /** Its name on the timeline: "The plan". */
  chapter: string
  /** The headline. Leave it out on a figure slide. */
  title?: string
  body?: string
  /** A number instead of a headline: the value and what it means. */
  figure?: DeckFigure
}

export type HorizonStory = {
  cover: DeckCover
  /** Two to seven moments fit the horizon; five reads best. */
  moments: HorizonMoment[]
  close: DeckClose
}

const LINE = 800
/* The ground is a 4400x1400 ellipse whose top is the horizon: how far it has
   fallen away from the line at x, so marks and the orb sit on the curve. */
const curve = (x: number) => 700 * (1 - Math.sqrt(1 - ((x - 960) / 2200) ** 2))
/* One curve for the hop and the path it leaves: a quadratic whose peak is
   110px above the higher end. */
const HOP = 220

type Pose = { x: number; y: number; s: number }
const orbT = (p: Pose) => `translate(${p.x - 300}px, ${p.y - 300}px) scale(${p.s})`

function geometry(n: number, count: number) {
  const tickX = (k: number) => (n === 1 ? 960 : 360 + (k * 1200) / (n - 1))
  const pose = (i: number): Pose => {
    const on = isMoment(i, count)
    const x = on ? tickX(i - 1) : 960
    return { x, y: LINE + (on ? curve(x) : 0), s: on ? 0.6 : i === 0 ? 1 : 0.8 }
  }
  const ctrl = (a: Pose, b: Pose) => ({ x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - HOP })
  const arc = (a: Pose, b: Pose) => {
    const c = ctrl(a, b)
    return `M${a.x} ${a.y.toFixed(1)} Q${c.x} ${c.y.toFixed(1)} ${b.x} ${b.y.toFixed(1)}`
  }
  const hop = (a: Pose, b: Pose, steps = 28): Keyframe[] => {
    const c = ctrl(a, b)
    return Array.from({ length: steps + 1 }, (_, k) => {
      const t = easeInOutCubic(k / steps)
      const u = 1 - t
      return {
        transform: orbT({
          x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
          y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
          s: a.s + (b.s - a.s) * t + Math.sin(Math.PI * t) * 0.05,
        }),
        offset: k / steps,
      }
    })
  }
  return { tickX, pose, arc, hop }
}

function HorizonSlides({ story }: { story: HorizonStory }) {
  const { i, prev, count } = useDeck()
  const { cover, moments, close } = story
  const last = count - 1
  const g = geometry(moments.length, count)
  const to = g.pose(i)
  const gid = `dk-ai-${useId().replace(/:/g, "")}`
  const orb = useRef<HTMLDivElement>(null)
  const comet = useRef<HTMLDivElement>(null)
  const ripples = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = orb.current
    if (!el || prev < 0 || reducedMotion() || typeof el.animate !== "function") return
    el.getAnimations().forEach((a) => a.cancel())
    const geo = geometry(moments.length, count)
    const dest = geo.pose(i)
    if (i === 0) {
      // Sunrise: the orb comes up from behind the horizon.
      el.animate([{ transform: orbT({ ...dest, y: dest.y + 320 }) }, { transform: orbT(dest) }], {
        duration: cssDuration("--deck-rise", 1100),
        easing: cssEase("--ease-smooth-out"),
      })
      return
    }
    // A hop along the same curve the sky path draws.
    const hop = cssDuration("--deck-hop", 760)
    el.animate(geo.hop(geo.pose(prev), dest), { duration: hop, easing: "linear" })
    if (isMoment(i, count)) {
      // The ground answers where it lands: two rings run out across it.
      ripples.current?.querySelectorAll<HTMLElement>(".dk-hzn-ripple").forEach((r, k) =>
        r.animate(
          [
            { transform: `translate(${dest.x}px, ${dest.y}px) scale(0.15)`, opacity: 0.9 },
            { transform: `translate(${dest.x}px, ${dest.y}px) scale(2.6)`, opacity: 0 },
          ],
          { duration: cssDuration("--deck-rise", 1100), delay: hop * 0.84 + k * 180, easing: cssEase("--ease-smooth-out") }
        )
      )
    }
    if (isMoment(prev, count) && isMoment(i, count)) {
      // A light runs along the horizon ahead of the orb.
      const x0 = geo.tickX(prev - 1)
      const x1 = geo.tickX(i - 1)
      const dir = Math.sign(x1 - x0)
      runComet(
        comet.current,
        Array.from({ length: 15 }, (_, k) => {
          const x = x0 + (x1 - x0) * easeInOutCubic(k / 14)
          const slope = (Math.atan2(curve(x + 1) - curve(x - 1), 2) * 180) / Math.PI
          return { x, y: LINE + curve(x), r: dir > 0 ? slope : 180 + slope }
        }),
        hop * 0.9
      )
    }
  }, [i, prev, count, moments.length])

  // On first paint the orb rises from behind the horizon too.
  useEffect(() => {
    const el = orb.current
    if (!el || reducedMotion() || typeof el.animate !== "function") return
    const p = geometry(moments.length, count).pose(0)
    el.animate([{ transform: orbT({ ...p, y: p.y + 320 }) }, { transform: orbT(p) }], {
      duration: cssDuration("--deck-rise", 1100),
      delay: 300,
      easing: cssEase("--ease-smooth-out"),
      fill: "backwards",
    })
    // First paint only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="dk-slide dk-hzn">
      <div
        className="dk-hzn-glow"
        style={{ transform: `translateX(${Math.round((to.x - 960) * 0.4)}px)` }}
        aria-hidden="true"
      />
      <DeckField blooms={false} />
      <svg className="dk-hzn-sky" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" className="is-a" />
            <stop offset="0.47" className="is-b" />
            <stop offset="1" className="is-c" />
          </linearGradient>
        </defs>
        {moments.slice(1).map((_, k) => {
          const d = g.arc(g.pose(k + 1), g.pose(k + 2))
          return (
            <g key={k} className="dk-arc" data-state={stateOf(k + 2, i)}>
              <path className="dk-arc-trace" d={d} />
              <path className="dk-arc-lit" pathLength={1} d={d} stroke={`url(#${gid})`} />
            </g>
          )
        })}
      </svg>
      <div ref={orb} className="dk-hzn-orb" style={{ transform: orbT(to) }} aria-hidden="true">
        <Orb phase={i === 0 ? "listening" : "speaking"} />
      </div>
      <div className="dk-hzn-ground" aria-hidden="true" />
      <div
        className="dk-hzn-reflect"
        style={{ transform: `translate(${to.x}px, ${(to.y - LINE).toFixed(1)}px)` }}
        aria-hidden="true"
      />
      <div ref={comet} className="dk-comet" aria-hidden="true" />
      <div ref={ripples} aria-hidden="true">
        <div className="dk-hzn-ripple" />
        <div className="dk-hzn-ripple" />
      </div>
      <DeckHead meta={cover.when} />
      <ol className="dk-hzn-ticks" aria-hidden="true">
        {moments.map((m, k) => {
          const x = g.tickX(k)
          return (
            <li
              key={k}
              className="dk-hzn-tick"
              data-state={stateOf(k + 1, i)}
              style={{ left: x, top: Number((LINE + curve(x)).toFixed(1)) }}
            >
              <span className="dk-hzn-mark" />
              <span className="dk-hzn-chip">
                <b>{m.when}</b>
                <span>{m.chapter}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <section className="dk-hzn-panel" data-state={stateOf(0, i)} aria-hidden={i !== 0}>
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
      {moments.map((m, k) => (
        <section key={k} className="dk-hzn-panel" data-state={stateOf(k + 1, i)} aria-hidden={i !== k + 1}>
          <DeckLine className="dk-kicker">
            {m.when} · {m.chapter}
          </DeckLine>
          {m.figure ? (
            <>
              <DeckLine i={1} className="dk-figure">
                <DeckCount value={m.figure.value} n={k + 1} />
              </DeckLine>
              <DeckLine i={2} as="p" className="dk-lede">
                {m.figure.means}
              </DeckLine>
            </>
          ) : (
            <>
              {m.title ? (
                <h2 className="dk-title">
                  <DeckWords text={m.title} />
                </h2>
              ) : null}
              {m.body ? (
                <DeckLine i={4} as="p" className="dk-body">
                  {m.body}
                </DeckLine>
              ) : null}
            </>
          )}
        </section>
      ))}
      <section className="dk-hzn-panel" data-state={stateOf(last, i)} aria-hidden={i !== last}>
        <DeckSpot name="close" />
        <CloseTitle close={close} />
        {close.sub ? (
          <DeckLine i={4} as="p" className="dk-lede">
            {close.sub}
          </DeckLine>
        ) : null}
        <DeckLine i={5}>
          <CloseAction close={close} center />
        </DeckLine>
      </section>
    </div>
  )
}

/** A deck told on the orb's horizon: cover, moments along the timeline, close. */
export function HorizonDeck({ story, label, className }: { story: HorizonStory; label?: string; className?: string }) {
  return (
    <Deck label={label ?? story.cover.title} count={story.moments.length + 2} className={className}>
      <HorizonSlides story={story} />
    </Deck>
  )
}
