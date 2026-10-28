"use client"

import { BadgeCheck, CircleHelp, ClockAlert } from "lucide-react"
import { useId, useState } from "react"
import { Button } from "@/components/button"
import { cn } from "@/lib/utils"

// How sure AiMY is about a group of facts, and why: Sales' .b-conf
// (bdr.js:21110), Nour's choice (28 Oct). Not a score: a word that says what
// limits it, and one hover or focus away, where the facts came from and when,
// with the way to fix it. The doctrine asks this of every medium or low
// confidence: say what limits it.
//
//   ok     a check, no word: "Checked 3 weeks ago on LinkedIn. Nothing here is
//          over a year old."
//   old    May be out of date: last checked over a year ago, Check again
//   gap    Partly known: what AiMY has not found yet, Find out more
//   none   Not known yet: the same, for a group with nothing in it
//   busy   Checking again
//
// The explanation opens after a short intent delay and closes at once, with a
// bridge so the pointer can reach its button (Sales' popover). Escape closes it.

export type ConfidenceLevel = "ok" | "old" | "gap" | "none" | "busy"

type ConfidenceProps = {
  level: ConfidenceLevel
  /** The group of facts: "Company", "Role". */
  group: string
  /** When they were last checked, in words: "3 weeks ago". */
  when?: string
  /** For "old": the month it was last checked, "March 2025". */
  checkedIn?: string
  /** Where they came from: "on LinkedIn", "in the company register". */
  source?: string
  /** For "gap" and "none": what AiMY has not found yet. */
  missing?: string[]
  onCheckAgain?: () => void
  onFindOut?: () => void
  className?: string
}

const list = (xs: string[]) => (xs.length < 2 ? (xs[0] ?? "") : xs.slice(0, -1).join(", ") + " and " + xs.at(-1))

export function Confidence({
  level,
  group,
  when,
  checkedIn,
  source,
  missing = [],
  onCheckAgain,
  onFindOut,
  className,
}: ConfidenceProps) {
  const [closed, setClosed] = useState(false)
  const id = useId()
  if (level === "busy")
    return (
      <span data-slot="confidence" className={cn("b-conf is-busy", className)} role="status">
        Checking again
      </span>
    )

  const word = { ok: "", old: "May be out of date", gap: "Partly known", none: "Not known yet" }[level]
  const Icon = level === "ok" ? BadgeCheck : level === "old" ? ClockAlert : CircleHelp
  const pop =
    level === "ok" ? (
      <>
        <b>Checked {when}</b> {source}. Nothing here is over a year old.
      </>
    ) : level === "old" ? (
      <>
        <b>May be out of date.</b> Last checked {source} in {checkedIn}, over a year ago.
      </>
    ) : (
      <>
        <b>{word}.</b> AiMY has not found {list(missing)} yet.
      </>
    )
  const act =
    level === "old" && onCheckAgain ? (
      <Button variant="text" size="sm" onClick={onCheckAgain}>
        Check again
      </Button>
    ) : (level === "gap" || level === "none") && onFindOut ? (
      <Button variant="text" size="sm" onClick={onFindOut}>
        Find out more
      </Button>
    ) : null

  return (
    <span
      data-slot="confidence"
      className={cn("b-conf-wrap", className)}
      data-closed={closed || undefined}
      onPointerLeave={() => setClosed(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setClosed(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setClosed(true)
      }}
    >
      <button
        type="button"
        className={cn("b-conf", `is-${level}`)}
        aria-label={level === "ok" ? `Checked ${when}, ${group}` : `${word}, ${group}`}
        aria-describedby={id}
      >
        <Icon aria-hidden="true" />
        {word}
      </button>
      <span id={id} className="b-wait-pop" role="tooltip">
        {pop}
        {act ? <span className="b-pop-act">{act}</span> : null}
      </span>
    </span>
  )
}
