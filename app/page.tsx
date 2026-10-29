import { ArrowRight, Menu } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { CodeBlock, ThemePair } from "@/components/docs/page"
import { HeroStack, LiveProposal, Ways } from "@/components/landing/live"
import { Line, Reveal } from "@/components/landing/reveal"
import ui from "@/package/ui/package.json"
import registry from "@/registry.json"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { Button } from "@/registry/aimy/ui/button"
import { StatTile, StatTiles } from "@/registry/aimy/ui/stat-tile"
import { ThemeToggle } from "@/registry/aimy/ui/theme-toggle"

export const metadata: Metadata = { title: { absolute: "AiMY UI: build AiMY screens from the real parts" } }

const COMPONENTS = registry.items.filter((i) => i.type === "registry:component").length

const LINKS = [
  { href: "/start/", label: "Docs" },
  { href: "/components/button/", label: "Components" },
  { href: "/whats-new/", label: "What's new" },
]

const navLink =
  "rounded-md px-3 py-2 text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w05 hover:text-ink"

function SiteNav() {
  return (
    <header className="sticky top-0 z-(--z-float) border-b border-hairline bg-topbar backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[80rem] items-center gap-2 px-5">
        <Link href="/" className="mr-4 flex items-center gap-3 rounded-md" aria-label="AiMY UI home">
          <AimyMark variant="lockup" title="" className="h-6" />
          <span className="rounded-sm bg-w07 px-2 py-0.5 text-2xs font-semibold text-ink-secondary">UI</span>
        </Link>
        <nav aria-label="Site" className="hidden items-center gap-1 canvas:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLink}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto" />
        <ThemeToggle />
        <Button asChild variant="brand">
          <Link href="/start/">Install</Link>
        </Button>
        {/* Below the canvas rung the links become a menu (they change form, they never disappear). */}
        <details className="group relative canvas:hidden">
          <summary
            aria-label="Menu"
            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-ink hover:bg-w05"
          >
            <Menu aria-hidden="true" strokeWidth={2} className="size-5" />
          </summary>
          <nav
            aria-label="Site"
            className="absolute top-11 right-0 flex w-48 flex-col rounded-lg border border-hairline bg-raised p-1.5 shadow-lg"
          >
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={navLink}>
                {l.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  )
}

function Heading({ title, lead, center = false }: { title: string; lead: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-[40rem] text-center" : "max-w-[34rem]"}>
      <Line>
        <h2 className="text-3xl font-semibold tracking-tight text-ink column:text-4xl">{title}</h2>
      </Line>
      <Line i={1}>
        <p className="mt-4 text-lg text-ink-secondary [line-height:var(--lh-base)]">{lead}</p>
      </Line>
    </Reveal>
  )
}

export default function Landing() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Hero: the promise on the left, the real thing working on the right. */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(56rem_32rem_at_15%_0%,color-mix(in_oklab,var(--brand)_16%,transparent),transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-[80rem] items-center gap-12 px-5 pt-16 pb-20 column:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] column:pt-24 column:pb-28">
            <Reveal>
              <Line>
                <h1 className="max-w-[36rem] text-4xl font-semibold tracking-tight text-ink [line-height:var(--lh-tight)] column:text-5xl">
                  Build AiMY screens from the real parts.
                </h1>
              </Line>
              <Line i={1}>
                <p className="mt-6 max-w-[32rem] text-lg text-ink-secondary [line-height:var(--lh-base)]">
                  Every button, rail and chart from AiMY Sales and Knowledge, as React components you can install today.
                </p>
              </Line>
              <Line i={2}>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button asChild variant="brand" size="lg">
                    <Link href="/start/">Install</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link href="/components/button/">Browse components</Link>
                  </Button>
                </div>
              </Line>
            </Reveal>
            <Reveal>
              <Line i={3}>
                <HeroStack />
              </Line>
            </Reveal>
          </div>
        </section>

        {/* What it is, in real numbers. */}
        <section className="border-y border-hairline">
          <Reveal className="mx-auto grid max-w-[80rem] grid-cols-2 px-5 column:grid-cols-4">
            {[
              [String(COMPONENTS), "components, each with its rules"],
              ["2", "products it comes from: Sales and Knowledge"],
              ["AA", "WCAG 2.2, in the dark and the light theme"],
              [ui.version, "the stable release, versioned from here"],
            ].map(([n, words], i) => (
              <Line
                key={words}
                i={i}
                className="border-hairline px-1 py-8 odd:border-r column:border-r column:px-6 column:first:pl-0 column:last:border-r-0"
              >
                <p className="text-4xl font-semibold tracking-tight text-ink">{n}</p>
                <p className="mt-2 text-meta text-ink-secondary">{words}</p>
              </Line>
            ))}
          </Reveal>
        </section>

        {/* Three ways in, one at a time. */}
        <section className="mx-auto max-w-[80rem] px-5 py-28">
          <Heading
            center
            title="Pick your way in"
            lead="All three come from one source, so nothing is written twice and you can mix them."
          />
          <Reveal className="mt-10">
            <Line i={2}>
              <Ways />
            </Line>
          </Reveal>
        </section>

        {/* The doctrine, shown working. */}
        <section className="border-t border-hairline bg-card/40">
          <div className="mx-auto grid max-w-[80rem] items-center gap-12 px-5 py-28 column:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <Heading
                title="AiMY never changes anything silently"
                lead="It proposes, and a person accepts, edits or rejects. Every direct action ends in a toast with Undo. The rules ship with the components."
              />
              <Reveal className="mt-8">
                <Line i={2}>
                  <Link
                    href="/components/suggestion/"
                    className="group inline-flex items-center gap-2 rounded-sm text-body font-semibold text-ink-action"
                  >
                    How proposals work
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={2}
                      className="size-4 transition-transform duration-(--t-fast) ease-out group-hover:translate-x-0.5"
                    />
                  </Link>
                </Line>
              </Reveal>
            </div>
            <Reveal>
              <Line i={1}>
                <LiveProposal />
              </Line>
            </Reveal>
          </div>
        </section>

        {/* Both themes are designed, not inverted. */}
        <section className="mx-auto max-w-[80rem] px-5 py-28">
          <Heading
            center
            title="Dark by default, light by design"
            lead="Every component is drawn and checked in both themes. The same code, side by side."
          />
          <Reveal className="mt-12">
            <Line i={2}>
              <ThemePair>
                <StatTiles>
                  <StatTile label="Booked" value="€182,400" sub="was €140,000 at signing" />
                  <StatTile label="Meetings held" value="25" sub="of the 30 promised" tone="ok" />
                  <StatTile label="No answer twice" value="12" sub="the sequence is still running" tone="warn" />
                </StatTiles>
              </ThemePair>
            </Line>
          </Reveal>
        </section>

        {/* Agents read the same rules people do. */}
        <section className="border-t border-hairline">
          <div className="mx-auto grid max-w-[80rem] items-center gap-12 px-5 py-28 column:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Heading
              title="Your AI agent knows the rules too"
              lead="One command adds the theme, the toast with Undo, and AGENTS.md with the aimy-ui skill, so Claude Code and Copilot build the AiMY way."
            />
            <Reveal>
              <Line i={2}>
                <CodeBlock>npx shadcn@latest add @aimy/init</CodeBlock>
              </Line>
              <Line i={3}>
                <ul className="mt-6 flex flex-col gap-3 text-body text-ink-secondary">
                  <li>
                    <span className="font-mono text-ink">AGENTS.md</span> and the aimy-ui skill: the doctrine, the
                    writing rules, and which component to use for what.
                  </li>
                  <li>
                    <span className="font-mono text-ink">/llms.txt</span>: every component and its page, for agents that
                    read the web.
                  </li>
                  <li>
                    <span className="text-ink">Copy for AI</span> on every docs page, as clean markdown.
                  </li>
                </ul>
              </Line>
            </Reveal>
          </div>
        </section>

        {/* The way to start. */}
        <section className="relative overflow-hidden border-t border-hairline">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_24rem_at_50%_100%,color-mix(in_oklab,var(--brand)_14%,transparent),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-[80rem] px-5 py-28">
            <Heading
              center
              title="Start a new AiMY product"
              lead="A starter already in the AiMY shell, with the theme, fonts and agent rules in place. Vite or Next.js."
            />
            <Reveal className="mx-auto mt-10 flex max-w-[56rem] flex-col items-center gap-8">
              <Line i={2} className="w-full">
                <CodeBlock>
                  npx tiged --mode=git https://github.com/Flairstech-Apps/aimy-ui-lib/starter my-product
                </CodeBlock>
              </Line>
              <Line i={3}>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild variant="brand" size="lg">
                    <Link href="/start/">Install</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link href="/adopt/">How to adopt</Link>
                  </Button>
                </div>
              </Line>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[80rem] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-meta text-ink-secondary">
          <AimyMark title="AiMY" className="h-5" />
          <span>AiMY UI, made at FlairsTech.</span>
          <span className="ml-auto" />
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-sm hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  )
}
