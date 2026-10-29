import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Sales' history of one record on a rail (.b-tl): a 2px rail down the left,
// a dot per touchpoint in the tone of how it went, a larger accent node where
// a step was climbed, month headings where the month changes, and an end cap
// that says where it began. Each row is a disclosure (<details>): the closed
// line is when, who, how it went, the step reached, how long ago; open, it
// holds the whole record. It differs from Activity, which is a flat list
// across many subjects: a Timeline is one subject's history.
//
//   <Timeline end="First called 24 Jun · 3 steps climbed">
//     <TimelineMonth>October</TimelineMonth>
//     <TimelineItem when="28 Oct, 10:42" by="Engy Hassan" outcome="Meeting set" tone="ok"
//       move="Meeting" milestone ago="2 days ago" defaultOpen>…</TimelineItem>
//   </Timeline>

type Tone = "ok" | "warn" | "err" | "neutral"

export function Timeline({
  end,
  label = "History",
  className,
  children,
}: {
  /** The cap at the foot of the rail: where it began. */
  end?: React.ReactNode
  label?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("b-tl", className)} aria-label={label} data-slot="timeline">
      {children}
      {end ? (
        <p className="b-tl-end">
          <span className="b-tl-dot is-end" aria-hidden="true" />
          {end}
        </p>
      ) : null}
    </section>
  )
}

export function TimelineMonth({ children }: { children: React.ReactNode }) {
  return <h3 className="b-month b-tl-month">{children}</h3>
}

type TimelineItemProps = {
  when: React.ReactNode
  /** Who did it. */
  by: React.ReactNode
  /** AiMY did it: its name in the AI ink. */
  ai?: boolean
  /** How it went: the one fact on the line that is news, in its tone. */
  outcome: React.ReactNode
  tone?: Tone
  /** A word beside the outcome, e.g. how a meeting went. */
  kind?: React.ReactNode
  /** The step it reached, shown as "→ step". */
  move?: React.ReactNode
  /** The move was out of the pipeline: in the error ink. */
  moveOut?: boolean
  /** A step was climbed: the node is larger, in accent. */
  milestone?: boolean
  ago?: React.ReactNode
  defaultOpen?: boolean
  className?: string
  children?: React.ReactNode
}

export function TimelineItem({
  when,
  by,
  ai,
  outcome,
  tone = "neutral",
  kind,
  move,
  moveOut,
  milestone,
  ago,
  defaultOpen,
  className,
  children,
}: TimelineItemProps) {
  return (
    <details className={cn("s-call b-tl-item", milestone && "is-milestone", className)} open={defaultOpen}>
      <summary className="s-call-sum">
        <span className={cn("b-tl-dot", `tone-${tone}`)} aria-hidden="true" />
        <ChevronRight className="s-call-chev" aria-hidden="true" />
        <span className="s-call-when">{when}</span>
        <span className={cn("s-call-by", ai && "is-ai")}>{by}</span>
        <span className={cn("s-call-out", `tone-${tone}`)}>{outcome}</span>
        {kind ? <span className="b-kind">{kind}</span> : null}
        {move ? <span className={cn("b-tl-move", moveOut && "is-out")}>→ {move}</span> : null}
        {ago ? <span className="s-call-ago">{ago}</span> : null}
      </summary>
      {children ? <div className="s-call-body">{children}</div> : null}
    </details>
  )
}
