"use client"

import { ChevronRight, Clock } from "lucide-react"
import { useEffect, useRef } from "react"
import { useShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"

// The rail: Sales' left column (.app-rail), the standing facts beside every
// page. Above 1040 of the shell it is a column; below, Knowledge's drawer,
// over the page with a scrim behind it, opened from the topnav's toggle,
// closed by the scrim, the toggle or Escape. Opening it moves focus in and
// closing it hands focus back to the toggle. The gutter for its scrollbar is
// always kept, so nothing reflows when the column grows a scrollbar.
//
// Its cards are Sales' doors (.b-door): a standing fact and the page it
// opens, the diary for today, Financials against target, the year a client
// has left. Each is a button that opens its page, never a panel hanging off
// the rail. RailLink is Sales' foot row (Console).
//
//   <Rail foot={<RailLink icon={<Settings />} href="/console">Console</RailLink>}>
//     <RailDoors>
//       <RailDoor cap="Today" fig="10:30" who="Dana Whitfield" kind="Demo" go="Open the diary" onClick={…} />
//       <RailDoor cap="Financials" fig="€182k" of="gained" bar={{ value: 182, target: 300 }} say="61% reached" go="Open the report" onClick={…} />
//     </RailDoors>
//   </Rail>

type RailProps = {
  /** Names the rail for screen readers. */
  label?: string
  /** At the foot, under everything: RailLink rows. */
  foot?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Rail({ label = "Briefing", foot, className, children }: RailProps) {
  const { railOpen, setRailOpen, railId } = useShell()
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const drawer = getComputedStyle(el).position === "absolute"
    if (railOpen && drawer) el.focus()
    if (!railOpen && el.contains(document.activeElement))
      document.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(railId)}"]`)?.focus()
  }, [railOpen, railId])
  return (
    <>
      <div className={cn("rail-scrim", railOpen && "is-open")} aria-hidden="true" onClick={() => setRailOpen(false)} />
      <aside
        ref={ref}
        id={railId}
        className={cn("app-rail", railOpen && "is-open", className)}
        aria-label={label}
        tabIndex={-1}
        data-slot="rail"
      >
        {children}
        {foot ? <div className="rail-foot">{foot}</div> : null}
      </aside>
    </>
  )
}

/** Sales' foot row: an icon and a name, a link to somewhere else. */
export function RailLink({
  icon,
  href,
  onClick,
  children,
}: {
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const inner = (
    <>
      {icon}
      <span className="rail-console-name">{children}</span>
    </>
  )
  return href ? (
    <a className="rail-console" href={href} onClick={onClick}>
      {inner}
    </a>
  ) : (
    <button type="button" className="rail-console" onClick={onClick}>
      {inner}
    </button>
  )
}

export function RailDoors({ children }: { children: React.ReactNode }) {
  return <div className="rail-doors">{children}</div>
}

type RailDoorProps = {
  /** What it is: "Today", "Financials", "Your journey". */
  cap: string
  /** The standing figure: a time, an amount, days left. */
  fig?: React.ReactNode
  /** After the figure: "gained", "signed", "days left". */
  of?: React.ReactNode
  /** The figure is a time: a clock before it. */
  clock?: boolean
  /** Who or what it is about, and a word for its kind. */
  who?: React.ReactNode
  kind?: React.ReactNode
  /** A bar of the figure against its target: what is in, what is open, the target mark. */
  bar?: { value: number; open?: number; target: number }
  /** One sentence, which may hold a part in the error ink (RailDoorMiss). */
  say?: React.ReactNode
  /** Where it opens, in words: "Open the diary". */
  go: string
  onClick: () => void
}

export function RailDoor({ cap, fig, of, clock, who, kind, bar, say, go, onClick }: RailDoorProps) {
  // Sales' scale: the target plus a fifth, or what is in if that is more.
  const scale = bar ? Math.max(bar.target * 1.2, bar.value + (bar.open ?? 0)) || 1 : 1
  const pc = (v: number) => `${Math.max(0, Math.min(100, (v / scale) * 100)).toFixed(1)}%`
  return (
    <button type="button" className="b-door" onClick={onClick} data-slot="rail-door">
      {/* Spaces between the parts keep the button's name readable aloud. */}
      <span className="b-door-cap">{cap}</span>{" "}
      {fig ? (
        <span className="b-door-fig">
          {clock ? (
            <span className="b-door-clock" aria-hidden="true">
              <Clock />
            </span>
          ) : null}
          {fig}
          {of ? <span className="b-door-of"> {of}</span> : null}
        </span>
      ) : null}{" "}
      {who ? (
        <span className="b-door-who">
          {who} {kind ? <span className="b-kind">{kind}</span> : null}
        </span>
      ) : null}{" "}
      {bar ? (
        <span className="b-door-bar" aria-hidden="true">
          <span className="b-door-seg is-won" style={{ width: pc(bar.value) }} />
          {bar.open ? <span className="b-door-seg is-open" style={{ width: pc(bar.open) }} /> : null}
          <span className="b-door-mark" style={{ left: pc(bar.target) }} />
        </span>
      ) : null}
      {say ? <span className="b-door-say">{say}</span> : null}{" "}
      <span className="b-door-go">
        {go}
        <ChevronRight aria-hidden="true" />
      </span>
    </button>
  )
}

/** The part of a door's sentence that is bad news, in the error ink. */
export function RailDoorMiss({ children }: { children: React.ReactNode }) {
  return <span className="b-door-miss">{children}</span>
}
