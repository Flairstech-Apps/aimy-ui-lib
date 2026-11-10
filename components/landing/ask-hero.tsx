"use client"

// The landing hero (chosen from the lab as Hero C, 10 Nov): the orb as the
// stage, the composer docked at its foot like Sales' float bar, and the answer
// rising in the Peek. Asking finds the library part that does the job. Dragging
// the peek up opens one wide canvas: the part live, AiMY's answer beside it and
// its install command, while the stage orb hands over to a small one in the
// canvas head.

import { CornerDownLeft } from "lucide-react"
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
  // Closing the canvas tucks the drawer away; the next question opens it again.
  const [tucked, setTucked] = useState(false)
  // A new ask keeps an open canvas open: it shows the new part once found.
  const ask = (q: string) => {
    setGone(false)
    setTucked(false)
    a.ask(q)
  }
  const questions = a.match ? a.match.follow : ASKS
  const stage = useRef<HTMLDivElement>(null)
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
    setTucked(true)
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
        <div ref={stage} className="mt-4 grid [grid-template-areas:'stage']">
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
        <div className="sticky bottom-6 z-[2] mx-auto mt-6 w-full max-w-[47.5rem]">
          {a.question && !gone && !open ? (
            <Peek
              key={a.question}
              defaultTucked={tucked}
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

/** The questions beside the orb: each one a small glass bubble, the message you would send,
    its square corner pointing at the orb, joined to it by a hairline ending in a dot, with an
    Enter glyph to say it sends. Hovering lifts it 2px, lights the line and makes the orb lean
    in (onLean). Below the column rung they drop under the orb as centred bubbles without lines. */
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
            className={`flex min-w-0 items-center gap-2.5 rounded-2xl border border-edge bg-card/70 py-2.5 pr-3 pl-4 text-left text-body font-medium text-ink shadow-lg backdrop-blur-md transition-[border-color,background-color,translate] duration-(--t-fast) ease-out group-hover:-translate-y-0.5 group-hover:border-accent group-hover:bg-card/90 motion-reduce:group-hover:translate-y-0 rail:whitespace-nowrap ${left ? "column:rounded-br-sm" : "column:rounded-bl-sm"}`}
          >
            <span className="min-w-0">{q}</span>
            <CornerDownLeft
              aria-hidden="true"
              strokeWidth={2}
              className="size-4 shrink-0 text-ink-secondary transition-[color] duration-(--t-fast) ease-out group-hover:text-ink-action"
            />
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
