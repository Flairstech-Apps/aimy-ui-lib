"use client"

// The landing hero (chosen from the lab as Hero C, 10 Nov): the orb as the
// stage, the composer docked at its foot like Sales' float bar, and the answer
// rising in the Peek. Asking finds the library part that does the job. Dragging
// the peek up opens one wide canvas: the part live, AiMY's answer beside it and
// its install command, while the stage orb hands over to a small one in the
// canvas head.

import { useRef, useState } from "react"
import { AnswerCanvas, CommandLine } from "@/components/landing/answer-canvas"
import { Haze } from "@/components/landing/haze"
import { Line, Reveal } from "@/components/landing/reveal"
import { Composer } from "@/registry/aimy/ui/composer"
import { Orb } from "@/registry/aimy/ui/orb"
import { Peek } from "@/registry/aimy/ui/peek"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { ASKS, Ctas, INIT, install, useAsk, useInView } from "./ask"

export function AskHero({ count }: { count: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  const [open, setOpen] = useState(false)
  const [gone, setGone] = useState(false)
  // A question under the pointer or focus: the orb leans in and listens harder.
  const [lean, setLean] = useState(false)
  // Once the drawer has been pulled, it stops hinting that it can be.
  const [pulled, setPulled] = useState(false)
  // A new ask keeps an open canvas open: it shows the new part once found.
  const ask = (q: string) => {
    setGone(false)
    a.ask(q)
  }
  const questions = a.match ? a.match.follow : ASKS
  const stage = useRef<HTMLDivElement>(null)
  const dock = useRef<HTMLDivElement>(null)
  const glide = (): ScrollBehavior => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth")
  const openCanvas = () => {
    setPulled(true)
    setOpen(true)
    // After the canvas is laid out, glide until the hero's foot meets the screen's foot: the
    // canvas and the bar under it in view, no further. Never past the canvas's top, under the nav.
    requestAnimationFrame(() => {
      const hero = ref.current?.getBoundingClientRect()
      const canvas = stage.current?.getBoundingClientRect()
      if (!hero || !canvas) return
      const toFoot = window.scrollY + hero.bottom - window.innerHeight
      const toCanvas = window.scrollY + canvas.top - 96
      window.scrollTo({ top: Math.max(0, Math.min(toFoot, toCanvas)), behavior: glide() })
    })
  }
  const close = () => {
    setOpen(false)
    // The hero's own touch, not the products' (there, closing the canvas closes the drawer):
    // once the drawer is back, press its own grip so it tucks away with Peek's own motion.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        dock.current?.querySelector<HTMLButtonElement>(".aimy-peek:not(.is-shut) .aimy-peek-grip")?.click()
      )
    )
    window.scrollTo({ top: 0, behavior: glide() })
  }
  const status = a.phase === "thinking" ? "thinking" : a.phase === "speaking" ? "streaming" : "answered"
  return (
    <section ref={ref} className="relative overflow-clip">
      <Haze />
      {/* The first screen at 1536x720 holds the words, the buttons, the install command on its
          own row, the big orb and the bar: the bar is the products' float bar, pinned to the
          screen's foot while the hero is in view, settling under the orb as you scroll. The
          section clips (overflow: clip) instead of hiding, so the sticky bar still sees the page. */}
      <div className="relative mx-auto flex max-w-[80rem] flex-col px-5 pt-28 pb-16">
        <Reveal className="flex flex-col items-center text-center">
          <Line>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-ink [line-height:var(--lh-tight)] column:text-[2.625rem]">
              The AI-native interface kit for AiMY products.
            </h1>
          </Line>
          <Line i={1}>
            <p className="mx-auto mt-3 max-w-[48rem] text-lg text-ink-secondary [line-height:var(--lh-base)]">
              {count} React components, the ones AiMY already ships. Ask the bar below for one.
            </p>
          </Line>
          <Line i={2}>
            <div className="mt-6">
              <Ctas center />
            </div>
          </Line>
          <Line i={3}>
            <div className="mx-auto mt-3 w-full max-w-[50rem]">
              <CommandLine command={INIT} what="the install command" />
            </div>
          </Line>
        </Reveal>
        {/* The stage: the orb and the canvas share one place. Pulling the drawer up raises the
            canvas in front, the questions step aside, and the orb stays behind the glass, growing
            into a backdrop; the page glides so the canvas sits under the nav and the bar settles
            under it. Closing plays it back. Styles: .hero-orb, .hero-aside, .hero-canvas. */}
        <div ref={stage} className="mt-4 grid grid-cols-[minmax(0,1fr)] [grid-template-areas:'stage']">
          {/* The questions sit either side of the orb, never on it: the library's openers first,
              then the follow-ups for the part on screen. On a phone they drop under the orb. */}
          <div className="grid items-center gap-4 self-center [grid-area:stage] column:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] column:gap-0">
            <OrbQuestions
              key={`l-${questions.join()}`}
              side="left"
              items={questions.slice(0, 2)}
              onPick={ask}
              onLean={setLean}
              away={open}
            />
            <div
              className="hero-orb order-1 mx-auto column:order-none"
              data-open={open || undefined}
              style={{ width: "min(18.5rem, 72vw)", height: "min(18.5rem, 72vw)" }}
            >
              <Orb phase={a.phase} level={a.phase === "listening" ? (lean ? 0.75 : a.level) : 0} running={inView} />
            </div>
            <OrbQuestions
              key={`r-${questions.join()}`}
              side="right"
              items={questions.slice(2)}
              onPick={ask}
              onLean={setLean}
              away={open}
            />
          </div>
          {open ? (
            <div className="hero-canvas relative z-[1] mx-auto w-full max-w-[60rem] [grid-area:stage]">
              <AnswerCanvas
                speaker={false}
                part={
                  a.match
                    ? { name: a.match.name, href: a.match.href, preview: a.match.preview(), command: install(a.match) }
                    : null
                }
                question={a.question}
                answer={a.shown}
                phase={a.phase}
                onClose={close}
              />
            </div>
          ) : null}
        </div>
        {/* The float bar: sticky to the screen's foot, with the peek rising above it. */}
        <div ref={dock} className="sticky bottom-6 z-[2] mx-auto mt-6 w-full max-w-[47.5rem]">
          {a.question && !gone && !open ? (
            <Peek
              key={a.question}
              status={status}
              thinkingLabel={["Searching the library", "Reading its rules"]}
              className={status === "answered" && !pulled ? "peek-nudge" : undefined}
              onOpenCanvas={openCanvas}
              onDismiss={() => setGone(true)}
            >
              <StreamingText text={a.shown} streaming={a.phase === "speaking"} />
            </Peek>
          ) : null}
          <Composer
            placeholder="Ask AiMY for a part"
            dictate={false}
            generating={a.busy}
            onStop={a.stop}
            onSubmit={(q) => ask(q.trim() || ASKS[0]!)}
            onVoice={() => ask(ASKS[0]!)}
          />
        </div>
      </div>
    </section>
  )
}

/** The questions beside the orb: each one a thin glass outline with its words at rest, the
    message you would send, its square corner pointing at the orb and joined to it by a hairline
    ending in a dot. Hover or focus brings it to full strength: the fill, a 2px lift, the lit
    line, and the orb leaning in (onLean). The bubble never shrinks or wraps; only the line gives
    way when space is tight. On a phone they stack under the orb. */
function OrbQuestions({
  side,
  items,
  onPick,
  onLean,
  away = false,
}: {
  side: "left" | "right"
  items: string[]
  onPick: (q: string) => void
  onLean: (on: boolean) => void
  /** The canvas is open: they step aside and leave the tab order. */
  away?: boolean
}) {
  const left = side === "left"
  return (
    <div
      role="group"
      aria-label="Ask next"
      inert={away}
      data-away={away || undefined}
      data-side={side}
      className={`hero-aside flex flex-col items-center gap-4 ${left ? "order-2" : "order-3"} column:order-none column:items-stretch`}
    >
      {items.map((q, i) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          onPointerEnter={() => onLean(true)}
          onPointerLeave={() => onLean(false)}
          onFocus={() => onLean(true)}
          onBlur={() => onLean(false)}
          style={{ "--i": i } as React.CSSProperties}
          className={`aimy-sugg-in group flex min-w-0 items-center rounded-2xl column:justify-end ${left ? "" : "column:flex-row-reverse"}`}
        >
          <span
            className={`flex shrink-0 items-center rounded-2xl border border-w14 bg-w03 px-2.5 py-1 text-left text-2xs font-medium whitespace-nowrap text-ink backdrop-blur-sm transition-[border-color,background-color,box-shadow,translate] duration-(--t-fast) ease-out group-hover:-translate-y-0.5 group-hover:border-accent group-hover:bg-card/90 group-hover:shadow-lg group-focus-visible:border-accent group-focus-visible:bg-card/90 group-focus-visible:shadow-lg motion-reduce:group-hover:translate-y-0 ${left ? "column:rounded-br-sm" : "column:rounded-bl-sm"}`}
          >
            {q}
          </span>
          <span aria-hidden="true" className={`hidden w-28 min-w-4 shrink items-center column:flex ${left ? "" : "flex-row-reverse"}`}>
            <span
              className="h-px flex-1 opacity-50 transition-[opacity] duration-(--t-fast) ease-out group-hover:opacity-100"
              style={{
                background: `linear-gradient(${left ? "to right" : "to left"}, transparent, var(--accent-text))`,
              }}
            />
            <span className="size-1.5 shrink-0 rounded-full bg-accent-text shadow-[0_0_8px_var(--accent)]" />
          </span>
        </button>
      ))}
    </div>
  )
}
