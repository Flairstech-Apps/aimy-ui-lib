"use client"

// The landing footer (chosen from the lab as Footer H, 10 Nov): the page ends
// on the orb horizon. The orb rises behind the curve of a lit ground, the float
// bar rests on the line and finds library parts like the hero's, and the
// site's links, the current version and the maker sit on the ground below.

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"
import ui from "@/package/ui/package.json"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { useAsk, useInView } from "./ask"
import { FloatDock, OrbHorizon } from "./orb-horizon"

const LINKS: [string, string][] = [
  ["Install and start", "/start/"],
  ["How to adopt", "/adopt/"],
  ["Foundations", "/foundations/color/"],
  ["Components", "/components/button/"],
  ["Tools for AI agents", "/ai-tools/"],
  ["llms.txt", "/llms.txt"],
  ["GitHub", "https://github.com/Flairstech-Apps/aimy-ui-lib"],
  ["Releases", "https://github.com/Flairstech-Apps/aimy-ui-lib/releases"],
]

const footLink =
  "rounded-sm text-meta text-ink-secondary underline-offset-4 transition-[color] duration-(--t-fast) ease-out hover:text-ink hover:underline"

export function SiteFooter() {
  const [ref, inView] = useInView<HTMLElement>()
  const a = useAsk()
  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-hairline">
      <div className="mx-auto max-w-[80rem] px-5 pt-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink column:text-4xl">Ask before you build a lookalike.</h2>
        <p className="mx-auto mt-3 max-w-[34rem] text-body text-ink-secondary">
          If a part feels missing, it is probably here under another name. Describe it, and AiMY names the part.
        </p>
      </div>
      <OrbHorizon
        phase={a.phase}
        level={a.phase === "listening" ? a.level : 0}
        running={inView}
        line="19rem"
        orb="min(24rem, 80vw)"
        dock={
          <FloatDock
            a={a}
            onAsk={a.ask}
            onOpen={() => {
              // Here the peek opens the part's own page; the hero is where the canvas opens.
              if (a.match) window.location.assign(a.match.href)
            }}
          />
        }
      >
        <div className="mx-auto flex max-w-[80rem] flex-col items-center gap-5 px-5 pb-10">
          <nav aria-label="Site" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {LINKS.map(([label, href], i) => (
              <Fragment key={href}>
                {i > 0 ? <span aria-hidden="true" className="size-1 rounded-full bg-ink-faint" /> : null}
                <Link href={href} className={footLink}>
                  {label}
                </Link>
              </Fragment>
            ))}
          </nav>
          {/* The version says what it is for: where to read what changed in it. */}
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-meta text-ink-secondary">
            Version
            <span className="rounded-sm bg-w07 px-1.5 py-0.5 font-mono text-2xs text-ink">{ui.version}</span>
            <Link href="/whats-new/" className="inline-flex items-center gap-1 font-semibold text-ink-action">
              See what changed
              <ArrowRight aria-hidden="true" strokeWidth={2} className="size-3.5" />
            </Link>
          </p>
          <div className="mt-2 flex items-center gap-3 text-meta text-ink-secondary">
            <AimyMark variant="lockup" title="AiMY" className="h-5" />
            Made at FlairsTech.
          </div>
        </div>
      </OrbHorizon>
    </footer>
  )
}
