"use client"

// The second round of landing options (lab only): three heroes built on
// Hero C, the float bar, and three more footers. Shares the finder and the
// pieces in ./variants.

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CodeBlock } from "@/components/docs/page"
import { Haze } from "@/components/landing/haze"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { Button } from "@/registry/aimy/ui/button"
import { Composer } from "@/registry/aimy/ui/composer"
import { Orb } from "@/registry/aimy/ui/orb"
import { Peek } from "@/registry/aimy/ui/peek"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { Suggestions } from "@/registry/aimy/ui/suggestions"
import {
  Answer,
  ASKS,
  COLUMNS,
  Ctas,
  footLink,
  INIT,
  MATCHES,
  Release,
  SITE,
  useAsk,
  useFirstAsk,
  useInView,
  type Match,
} from "./variants"

/* ── Heroes built on C ───────────────────────────────────────────────────── */

/** C's dock: the Peek rising over the float bar. */
function FloatDock({
  a,
  onAsk,
  onOpen,
}: {
  a: ReturnType<typeof useAsk>
  onAsk: (q: string) => void
  onOpen?: () => void
}) {
  const [gone, setGone] = useState(false)
  const ask = (q: string) => {
    setGone(false)
    onAsk(q)
  }
  const status = a.phase === "thinking" ? "thinking" : a.phase === "speaking" ? "streaming" : "answered"
  return (
    <div className="relative w-full">
      {a.question && !gone ? (
        <Peek
          status={status}
          thinkingLabel={["Searching the library", "Reading its rules"]}
          onOpenCanvas={() => onOpen?.()}
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
  )
}

function HeroWords({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="max-w-[48rem] text-4xl font-semibold tracking-tight text-ink [line-height:var(--lh-tight)] column:text-6xl">
        The AI-native interface kit for AiMY products.
      </h1>
      <p className="mt-5 max-w-[36rem] text-lg text-ink-secondary [line-height:var(--lh-base)]">
        {count} React components, the ones AiMY already ships. Ask the bar for one.
      </p>
      <div className="mt-8">
        <Ctas center />
      </div>
    </div>
  )
}

function Install() {
  return (
    <CodeBlock what="the install command" wrap>
      {INIT}
    </CodeBlock>
  )
}

/* C2: Stage and canvas. The orb and its bar on the left; the part opens on a
   canvas beside it, as Knowledge's canvas opens beside the chat. */
export function HeroCanvas({ count }: { count: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  useFirstAsk(inView, a.ask, ASKS[0]!)
  return (
    <section ref={ref} className="relative overflow-hidden">
      <Haze />
      <div className="relative mx-auto flex max-w-[80rem] flex-col gap-12 px-5 pt-24 pb-16">
        <HeroWords count={count} />
        <div className="grid items-stretch gap-6 column:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col items-center justify-end gap-6">
            <div className="size-56">
              <Orb phase={a.phase} level={a.phase === "listening" ? a.level : 0} running={inView} />
            </div>
            {/* Room above the bar for the peek to rise into. */}
            <div className="w-full pt-36">
              <FloatDock a={a} onAsk={a.ask} />
            </div>
          </div>
          <div className="flex min-h-[26rem] flex-col gap-4 rounded-2xl border border-edge bg-card/70 p-6 backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink-secondary">
              <AimyMark title="" className="size-4" />
              {a.match ? `Based on: ${a.question}` : "The part you ask for opens here"}
            </p>
            {a.match ? (
              <Answer m={a.match} />
            ) : (
              <div className="flex flex-1 flex-col items-start justify-center gap-4">
                <p className="text-body text-ink">Ask for a part, or start from one of these.</p>
                <Suggestions items={ASKS} onPick={a.ask} />
              </div>
            )}
            <div className="mt-auto border-t border-hairline pt-4">
              <Install />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* C3: Horizon. The orb rises from the hero's foot like a sun, and the float
   bar rests on it. Opening the peek lays the part out above. */
export function HeroHorizon({ count }: { count: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  const [open, setOpen] = useState(false)
  useFirstAsk(inView, a.ask, ASKS[1]!)
  const ask = (q: string) => {
    setOpen(false)
    a.ask(q)
  }
  return (
    <section ref={ref} className="relative overflow-hidden">
      <Haze />
      <div className="relative mx-auto flex max-w-[80rem] flex-col items-center px-5 pt-24">
        <HeroWords count={count} />
        <div className="mt-6 w-full max-w-[40rem] text-left">
          <Install />
        </div>
        {open && a.match ? (
          <div className="mt-10 w-full max-w-[56rem] rounded-2xl border border-edge bg-card/80 p-6 backdrop-blur-md">
            <Answer m={a.match} />
          </div>
        ) : null}
        {/* The orb is twice the bar's width and cut by the section's foot. */}
        <div className="relative mt-4 w-full" style={{ height: "min(30rem, 60vw)" }}>
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            style={{ top: "9rem", width: "min(52rem, 100vw)", height: "min(52rem, 100vw)" }}
          >
            <Orb phase={a.phase} level={a.phase === "listening" ? a.level : 0} running={inView} />
          </div>
          <div className="relative mx-auto w-full max-w-[40rem] pt-40">
            <FloatDock a={a} onAsk={ask} onOpen={() => setOpen(true)} />
          </div>
        </div>
      </div>
    </section>
  )
}

const SHELF: Match[] = MATCHES.map(([, m]) => m)

/* C4: The bar and the shelf. Under the float bar sit the parts it can find;
   the one AiMY names lights up and opens below. A tile asks too. */
export function HeroShelf({ count }: { count: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  useFirstAsk(inView, a.ask, ASKS[2]!)
  return (
    <section ref={ref} className="relative overflow-hidden">
      <Haze />
      <div className="relative mx-auto flex max-w-[80rem] flex-col items-center px-5 pt-24 pb-16">
        <HeroWords count={count} />
        <div className="mt-8 size-44">
          <Orb phase={a.phase} level={a.phase === "listening" ? a.level : 0} running={inView} />
        </div>
        <div className="mt-36 w-full max-w-[40rem]">
          <FloatDock a={a} onAsk={a.ask} />
        </div>
        <div className="mt-6 grid w-full max-w-[56rem] gap-3 column:grid-cols-3">
          {SHELF.map((m, i) => {
            const on = a.match?.item === m.item
            return (
              <button
                key={m.item}
                type="button"
                aria-pressed={on}
                onClick={() => a.ask(ASKS[i]!)}
                className="group flex flex-col items-start gap-1.5 rounded-xl border border-edge bg-card/70 p-4 text-left backdrop-blur-md transition-[border-color,background-color,translate] duration-(--t-fast) ease-out hover:-translate-y-0.5 hover:border-edge-hover aria-pressed:border-accent aria-pressed:bg-accent-dim motion-reduce:hover:translate-y-0"
              >
                <span className="text-body font-semibold text-ink group-aria-pressed:text-ink-action">{m.name}</span>
                <span className="text-meta text-ink-secondary">{ASKS[i]}</span>
              </button>
            )
          })}
        </div>
        {a.match ? (
          <div className="mt-4 w-full max-w-[56rem] rounded-2xl border border-edge bg-card/80 p-6 backdrop-blur-md">
            <Answer m={a.match} />
          </div>
        ) : null}
        <div className="mt-8 w-full max-w-[40rem] text-left">
          <Install />
        </div>
      </div>
    </section>
  )
}

/* ── More footers ────────────────────────────────────────────────────────── */

const SETUP = {
  app: { words: "Into an app on Tailwind v4: the theme, the toast and the rules for agents.", code: INIT },
  agent: {
    words: "Into Claude Code, so your agent searches the library and reads each part's rules.",
    code: `claude mcp add --transport http aimy-ui ${SITE}/mcp`,
  },
  product: {
    words: "A new AiMY product, with the shell, canvas and composer already wired.",
    code: "npx tiged --mode=git https://github.com/Flairstech-Apps/aimy-ui-lib/starter my-product",
  },
}

function LinkRow() {
  return (
    <div className="mx-auto flex max-w-[80rem] flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline px-5 py-6">
      <AimyMark variant="lockup" title="AiMY" className="h-5" />
      <span className="text-meta text-ink-secondary">Made at FlairsTech.</span>
      <span className="ml-auto" />
      {COLUMNS.flatMap((c) => c.links.slice(0, 2)).map(([label, href]) => (
        <Link key={href} href={href} className={footLink}>
          {label}
        </Link>
      ))}
    </div>
  )
}

/* Footer D: Get set up. The three ways in, each with its command. */
export function FooterSetup() {
  const [way, setWay] = useState<keyof typeof SETUP>("app")
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-[80rem] items-start gap-10 px-5 py-16 column:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Set it up where you work.</h2>
          <p className="max-w-[26rem] text-body text-ink-secondary">{SETUP[way].words}</p>
          <Release />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Segmented
            label="Where to set it up"
            value={way}
            onValueChange={(v) => setWay(v as keyof typeof SETUP)}
            options={[
              { value: "app", label: "Your app" },
              { value: "agent", label: "Your agent" },
              { value: "product", label: "A new product" },
            ]}
          />
          <CodeBlock key={way} what="the command" wrap>
            {SETUP[way].code}
          </CodeBlock>
        </div>
      </div>
      <LinkRow />
    </footer>
  )
}

const LATEST: { name: string; what: string; href: string }[] = [
  { name: "Side navigation", what: "Sales' tabs lead; QA's column is the variant.", href: "/components/side-nav/" },
  { name: "Face stack", what: "A group of people as one object, the rest counted.", href: "/components/face-stack/" },
  { name: "Call recording", what: "The call log's voice note, played in place.", href: "/components/call-recording/" },
]

/* Footer E: What's new. The latest release's parts, each a way into its page. */
export function FooterRelease() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-8 px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">New in 1.4</h2>
            <p className="text-meta text-ink-secondary">The latest is 1.4.1, released 5 Nov 2026.</p>
          </div>
          <Button asChild>
            <Link href="/whats-new/">See every release</Link>
          </Button>
        </div>
        <div className="grid gap-3 column:grid-cols-3">
          {LATEST.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col gap-1.5 rounded-xl border border-edge bg-w02 p-5 transition-[border-color,background-color,translate] duration-(--t-fast) ease-out hover:-translate-y-0.5 hover:border-edge-hover hover:bg-w05 motion-reduce:hover:translate-y-0"
            >
              <span className="flex items-center gap-1.5 text-body font-semibold text-ink">
                {p.name}
                <ArrowUpRight
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-4 text-ink-secondary transition-transform duration-(--t-fast) ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-meta text-ink-secondary">{p.what}</span>
            </Link>
          ))}
        </div>
      </div>
      <LinkRow />
    </footer>
  )
}

/* Footer F: The sign-off. A small resting orb that takes you back to the bar,
   one line and one row of links. Pairs with the float-bar heroes. */
export function FooterSignoff({ barId }: { barId: string }) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <footer ref={ref} className="border-t border-hairline">
      <div className="mx-auto flex max-w-[80rem] flex-col items-center gap-5 px-5 pt-16 pb-10 text-center">
        <a
          href={`#${barId}`}
          aria-label="Back to the bar, to ask AiMY"
          className="size-24 rounded-full transition-[scale] duration-(--t-fast) ease-out hover:scale-105 motion-reduce:hover:scale-100"
        >
          <Orb phase="listening" level={0.08} running={inView} />
        </a>
        <p className="text-xl font-semibold tracking-tight text-ink">
          Something missing? Ask the bar before you build it.
        </p>
        <Button asChild variant="brand">
          <a href={`#${barId}`}>Ask AiMY</a>
        </Button>
        <Release />
      </div>
      <LinkRow />
    </footer>
  )
}
