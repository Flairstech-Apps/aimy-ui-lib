"use client"

// Landing hero and footer variants, for choosing (rendered by the dev-only
// lab route app/lab-landing/page.lab.tsx). Every hero keeps the orb and the
// chat; the chat answers by finding the library part that does the job, so
// the hero shows the product instead of a staged sales demo.

import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { CodeBlock } from "@/components/docs/page"
import { Haze } from "@/components/landing/haze"
import type { VoicePhase } from "@/registry/aimy/hooks/use-voice"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { Composer } from "@/registry/aimy/ui/composer"
import { Message } from "@/registry/aimy/ui/message"
import { Orb } from "@/registry/aimy/ui/orb"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { Suggestions } from "@/registry/aimy/ui/suggestions"
import { ThinkingIndicator } from "@/registry/aimy/ui/thinking"
import { ASKS, Ctas, INIT, install, type Match, useAsk, useFirstAsk, useInView } from "./ask"

export * from "./ask"

const VERSION = "1.4.1"
const RELEASED = "5 Nov 2026"

const PHASE_WORDS: Partial<Record<VoicePhase, string>> = {
  listening: "Listening",
  thinking: "Finding the part",
  speaking: "Speaking",
}

/** What the finder hands back: the part, live, and the one command that installs it. */
export function Answer({ m }: { m: Match }) {
  return (
    <div className="grid gap-4 text-left canvas:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <Link
          href={m.href}
          className="group inline-flex items-center gap-1.5 self-start text-body font-semibold text-ink-action"
        >
          {m.name}
          <ArrowUpRight
            aria-hidden="true"
            strokeWidth={2}
            className="size-4 transition-transform duration-(--t-fast) ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
        <CodeBlock what="the install command" wrap>
          {install(m)}
        </CodeBlock>
      </div>
      <div className="min-w-0">{m.preview()}</div>
    </div>
  )
}

/* ── Hero A: Ask the library ─────────────────────────────────────────────── */
// Centred. The orb is the object, the composer is the main control, and the
// answer is the part itself with its install command.

export function HeroAsk({ count }: { count: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  useFirstAsk(inView, a.ask, ASKS[0]!)
  return (
    <section ref={ref} className="relative overflow-hidden">
      <Haze />
      <div className="relative mx-auto flex max-w-[64rem] flex-col items-center px-5 pt-24 pb-20 text-center">
        <h1 className="max-w-[44rem] text-4xl font-semibold tracking-tight text-ink [line-height:var(--lh-tight)] column:text-6xl">
          Ask for the part. Get the AiMY component.
        </h1>
        <p className="mt-5 max-w-[36rem] text-lg text-ink-secondary [line-height:var(--lh-base)]">
          {count} React components for AiMY products, from the voice orb to agent steps. Every one is the one Sales
          and Knowledge already ship.
        </p>
        <div className="mt-10 size-44 column:size-52">
          <Orb phase={a.phase} level={a.phase === "listening" ? a.level : 0} running={inView} />
        </div>
        <p aria-live="polite" className="mt-2 text-xs font-semibold text-ink-secondary">
          {PHASE_WORDS[a.phase]}
        </p>
        <div className="mt-6 w-full max-w-[40rem]">
          <Composer
            placeholder="Describe the part you need"
            dictate={false}
            generating={a.busy}
            onStop={a.stop}
            onSubmit={(q) => a.ask(q.trim() || ASKS[0]!)}
            onVoice={() => a.ask(ASKS[1]!)}
          />
          <Suggestions className="mt-3 justify-center" items={ASKS} onPick={a.ask} />
        </div>
        <div className="mt-8 flex min-h-[3rem] w-full max-w-[56rem] flex-col gap-5">
          {a.phase === "thinking" ? (
            <div className="flex justify-center">
              <ThinkingIndicator label={["Searching the library", "Reading its rules"]} />
            </div>
          ) : a.shown ? (
            <StreamingText text={a.shown} streaming={a.phase === "speaking"} className="text-body text-ink" />
          ) : null}
          {a.match ? <Answer m={a.match} /> : null}
        </div>
        <div className="mt-12 flex w-full max-w-[40rem] flex-col items-center gap-4">
          <Ctas center />
          <div className="w-full text-left">
            <CodeBlock what="the install command" wrap>
              {INIT}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Hero B: A conversation beside the promise ───────────────────────────── */
// Split. No box around the chat: the orb speaks at the top of a real thread,
// and AiMY's reply carries the part, live.

export function HeroThread({ count }: { count: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  useFirstAsk(inView, a.ask, ASKS[2]!)
  return (
    <section ref={ref} className="relative overflow-hidden">
      <Haze />
      <div className="relative mx-auto grid max-w-[80rem] items-start gap-12 px-5 pt-24 pb-20 column:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="column:pt-16">
          <h1 className="max-w-[36rem] text-4xl font-semibold tracking-tight text-ink [line-height:var(--lh-tight)] column:text-5xl">
            The AI-native interface kit for AiMY products.
          </h1>
          <p className="mt-6 max-w-[32rem] text-lg text-ink-secondary [line-height:var(--lh-base)]">
            Voice, streamed answers, proposals you accept, agents that show their steps. {count} React components.
          </p>
          <div className="mt-8">
            <Ctas />
          </div>
          <div className="mt-6 max-w-[36rem]">
            <CodeBlock what="the install command" wrap>
              {INIT}
            </CodeBlock>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0">
              <Orb phase={a.phase} level={a.phase === "listening" ? a.level : 0} running={inView} />
            </div>
            <div>
              <p className="text-body font-semibold text-ink">Ask AiMY for a part</p>
              <p aria-live="polite" className="text-meta text-ink-secondary">
                {PHASE_WORDS[a.phase]}
              </p>
            </div>
          </div>
          <div className="flex min-h-[22rem] flex-col gap-4">
            {a.question ? <Message speaker="user">{a.question}</Message> : null}
            {a.question ? (
              <Message
                speaker="aimy"
                status={a.phase === "thinking" ? "thinking" : a.phase === "speaking" ? "streaming" : "done"}
                thinkingLabel={["Searching the library", "Reading its rules"]}
              >
                <StreamingText text={a.shown} streaming={a.phase === "speaking"} />
              </Message>
            ) : null}
            {a.match ? <div className="pl-10">{a.match.preview()}</div> : null}
          </div>
          <Composer
            variant="canvas"
            placeholder="Describe the part you need"
            dictate={false}
            generating={a.busy}
            onStop={a.stop}
            onSubmit={(q) => a.ask(q.trim() || ASKS[0]!)}
          />
          <Suggestions variant="follow" items={ASKS} onPick={a.ask} />
        </div>
      </div>
    </section>
  )
}

export { AskHero as HeroFloat } from "./ask-hero"

/* ── Footers ─────────────────────────────────────────────────────────────── */

export const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Start",
    links: [
      ["Install", "/start/"],
      ["How to adopt", "/adopt/"],
      ["What's new", "/whats-new/"],
    ],
  },
  {
    title: "Library",
    links: [
      ["Foundations", "/foundations/color/"],
      ["Components", "/components/button/"],
      ["AI parts", "/components/composer/"],
      ["Charts", "/components/kpi-widget/"],
    ],
  },
  {
    title: "For agents",
    links: [
      ["Tools for AI agents", "/ai-tools/"],
      ["llms.txt", "/llms.txt"],
      ["AGENTS.md", "/AGENTS.md"],
    ],
  },
  {
    title: "Source",
    links: [
      ["GitHub", "https://github.com/Flairstech-Apps/aimy-ui-lib"],
      ["Releases", "https://github.com/Flairstech-Apps/aimy-ui-lib/releases"],
    ],
  },
]

export const footLink =
  "rounded-sm text-meta text-ink-secondary underline-offset-4 transition-[color] duration-(--t-fast) ease-out hover:text-ink hover:underline"

/** The version with what it means for you: when it came out, and where to read what changed. */
export function Release() {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-secondary">
      <span className="rounded-sm bg-w07 px-1.5 py-0.5 font-mono text-2xs text-ink">{VERSION}</span>
      released {RELEASED}
      <Link href="/whats-new/" className="inline-flex items-center gap-1 font-semibold text-ink-action">
        See what changed
        <ArrowRight aria-hidden="true" strokeWidth={2} className="size-3.5" />
      </Link>
    </p>
  )
}

/* Footer A: the site map. Four columns, the release beside the mark. */
export function FooterMap() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-[80rem] gap-10 px-5 pt-14 pb-10 column:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
        <div className="flex flex-col gap-4">
          <AimyMark variant="lockup" title="AiMY" className="h-7 self-start" />
          <p className="max-w-[18rem] text-meta text-ink-secondary">
            The interface kit for AiMY products, made at FlairsTech.
          </p>
          <Release />
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold text-ink">{c.title}</p>
            {c.links.map(([label, href]) => (
              <Link key={href} href={href} className={footLink}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-[80rem] flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline px-5 py-5 text-meta text-ink-secondary">
        <span>Built from AiMY Sales, Knowledge and QA.</span>
      </div>
    </footer>
  )
}

/* Footer B: one more question. The resting orb and a composer that finds the part. */
export function FooterAsk() {
  const a = useAsk()
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 px-5 py-16 column:grid-cols-[auto_minmax(0,1fr)]">
        <div className="size-28">
          <Orb phase={a.phase} level={a.phase === "listening" ? a.level * 0.5 : 0} running />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Ask before you build a lookalike.</h2>
          <p className="max-w-[40rem] text-body text-ink-secondary">
            If a part feels missing, it is probably here under another name. Describe it, and AiMY names the part.
          </p>
          <div className="max-w-[40rem]">
            <Composer
              placeholder="Describe the part you need"
              dictate={false}
              generating={a.busy}
              onStop={a.stop}
              onSubmit={(q) => a.ask(q.trim() || ASKS[0]!)}
            />
          </div>
          {a.shown ? (
            <div className="flex max-w-[40rem] flex-col gap-2">
              <StreamingText text={a.shown} streaming={a.phase === "speaking"} className="text-body text-ink" />
              {a.match ? (
                <Link href={a.match.href} className="inline-flex items-center gap-1 self-start text-meta font-semibold text-ink-action">
                  Open {a.match.name}
                  <ArrowRight aria-hidden="true" strokeWidth={2} className="size-3.5" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mx-auto flex max-w-[80rem] flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline px-5 py-6">
        <AimyMark variant="lockup" title="AiMY" className="h-5" />
        <Release />
        <span className="ml-auto" />
        {COLUMNS.flatMap((c) => c.links.slice(0, 1)).map(([label, href]) => (
          <Link key={href} href={href} className={footLink}>
            {label}
          </Link>
        ))}
      </div>
    </footer>
  )
}

/* Footer C: the statement. Links and the command, then the mark set large and cropped by the page's edge. */
export function FooterStatement() {
  return (
    <footer className="overflow-hidden border-t border-hairline">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-14 px-5 pt-14">
        <div className="grid gap-8 column:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-semibold tracking-tight text-ink">One command, and your app speaks AiMY.</p>
            <CodeBlock what="the install command" wrap>
              {INIT}
            </CodeBlock>
            <Release />
          </div>
          <div className="grid grid-cols-2 gap-8 phone:grid-cols-4 column:grid-cols-2">
            {COLUMNS.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
                <p className="text-xs font-semibold text-ink">{c.title}</p>
                {c.links.map(([label, href]) => (
                  <Link key={href} href={href} className={footLink}>
                    {label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>
        {/* The lockup spans the content width and the footer's foot cuts it at about two thirds. */}
        <div aria-hidden="true" className="overflow-hidden select-none" style={{ height: "min(18vw, 14.5rem)" }}>
          <AimyMark variant="lockup" title="" className="h-auto w-full" />
        </div>
      </div>
    </footer>
  )
}
