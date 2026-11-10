"use client"

// Two more footers (lab only): G is the landing's current arc made quieter
// and richer; H ends the page on the orb horizon.

import Link from "next/link"
import { Fragment, useId } from "react"
import { CommandLine } from "@/components/landing/answer-canvas"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { Button } from "@/registry/aimy/ui/button"
import { COLUMNS, footLink, Release } from "./variants"

const STARTER = "npx tiged --mode=git https://github.com/Flairstech-Apps/aimy-ui-lib/starter my-product"
const LINKS = COLUMNS.flatMap((c) => c.links.slice(0, 2))

/** One centred row of links, set apart by small dots. */
function DotLinks() {
  return (
    <nav aria-label="Site" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      {LINKS.map(([label, href], i) => (
        <Fragment key={href}>
          {i > 0 ? (
            <span aria-hidden="true" className="size-1 rounded-full bg-ink-faint" />
          ) : null}
          <Link href={href} className={footLink}>
            {label}
          </Link>
        </Fragment>
      ))}
    </nav>
  )
}

/* Footer G: The arc, made luxurious. The landing's lit arc becomes two fine
   hairlines that fade at their ends, the AiMY mark sits at the apex like a
   rising sun, and the type goes light and roomy. The links rest in the bowl. */
export function FooterArc() {
  const id = useId()
  return (
    <footer className="relative overflow-hidden border-t border-hairline">
      <div className="relative mx-auto flex max-w-[80rem] flex-col items-center px-5 pt-28 text-center">
        <p className="text-2xs font-semibold tracking-[0.24em] text-ink-secondary uppercase">AiMY UI · Made at FlairsTech</p>
        <h2 className="mt-6 max-w-[44rem] text-4xl font-light tracking-[-0.02em] text-ink [line-height:var(--lh-tight)] column:text-5xl">
          Start the next AiMY product on the parts the others already ship.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="brand" size="lg">
            <Link href="/components/button/">Browse components</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/adopt/">How to adopt</Link>
          </Button>
        </div>
        <div className="mt-8 w-full max-w-[56rem]">
          <CommandLine command={STARTER} what="the starter command" />
        </div>
      </div>

      {/* The arc: two hairlines on one curve family, brightest at the apex, gone at the ends. */}
      <div className="relative mx-auto mt-20 w-full max-w-[96rem]" style={{ height: "clamp(13rem, 18vw, 17rem)" }}>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(36% 70% at 50% 4%, color-mix(in oklab, var(--brand) 20%, transparent), color-mix(in oklab, var(--accent) 8%, transparent) 50%, transparent 76%)",
          }}
        />
        <svg aria-hidden="true" viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id={`${id}-arc`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" style={{ stopColor: "var(--accent-text)", stopOpacity: 0 }} />
              <stop offset="0.28" style={{ stopColor: "var(--accent-text)", stopOpacity: 0.45 }} />
              <stop offset="0.5" style={{ stopColor: "var(--brand)", stopOpacity: 1 }} />
              <stop offset="0.72" style={{ stopColor: "var(--accent-text)", stopOpacity: 0.45 }} />
              <stop offset="1" style={{ stopColor: "var(--accent-text)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path
            d="M -40 300 A 640 282 0 0 1 1240 300"
            fill="none"
            stroke={`url(#${id}-arc)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 90 300 A 510 236 0 0 1 1110 300"
            fill="none"
            stroke={`url(#${id}-arc)`}
            strokeWidth="1"
            strokeOpacity="0.45"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* The mark at the apex, with a halo of its own. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{
            top: "6%",
            background: "radial-gradient(circle, color-mix(in oklab, var(--brand) 28%, transparent), transparent 70%)",
          }}
        >
          <AimyMark title="" className="size-8" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 px-5 pb-10">
          <DotLinks />
          <div className="[&>p]:justify-center">
            <Release />
          </div>
        </div>
      </div>
    </footer>
  )
}

// Footer H is the landing's footer now (site-footer.tsx); the lab shows the same one.
export { SiteFooter as FooterHorizon } from "./site-footer"
