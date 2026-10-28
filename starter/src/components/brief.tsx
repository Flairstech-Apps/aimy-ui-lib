import { useId } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// What AiMY has to say at the top of a page, built from parts so each product
// can say it its own way (Nour, 28 Oct: "used as it is in Sales or as it is in
// Knowledge or for AiMY info"). Every form is the products' own:
//
//   Sales' Today (.slv)        wash ground, a large head with the date, the day
//                              in sentences with linked numbers, ways to start
//   Sales' lead finding        accent ground, the small AiMY head with its work
//   (.s-insight.is-lead)       state, one large figure and its sentence, the
//                              consequence, actions
//   Knowledge's greeting       sentences, then "Worth asking" questions
//   AiMY info (.s-insight)     compact: a sentence or two and a link
//
// Each number in a sentence is a BriefLink that opens the set it counts. The
// start cards' reasons are what stop them being a menu, so they wrap and never
// truncate; four reflow to two, then one. DayBrief is Sales' Today, ready made.
//
//   <Brief ground="wash">
//     <BriefHead title="Today" meta="28 Oct" />
//     <BriefLines lines={[<><BriefLink onClick={open}>4 callbacks</BriefLink> are past the day they asked for.</>]} />
//     <BriefStarts starts={starts} />
//   </Brief>

type BriefProps = {
  /** wash: the AiMY wash (Sales' Today); accent: a light accent tint; plain: a card. */
  ground?: "wash" | "accent" | "plain"
  compact?: boolean
  /** Names the region for screen readers. */
  label?: string
  className?: string
  children: React.ReactNode
}

export function Brief({ ground = "wash", compact, label, className, children }: BriefProps) {
  return (
    <section
      data-slot="brief"
      aria-label={label}
      className={cn("slv", ground !== "wash" && `is-${ground}`, compact && "is-compact", className)}
    >
      {children}
    </section>
  )
}

type BriefHeadProps = {
  title: string
  /** On the right: the date, or when it was read. */
  meta?: React.ReactNode
  /** "large": Sales' Today title. "label": the small AiMY line, with a work state. */
  size?: "large" | "label"
  /** A WorkState, in the label head. */
  state?: React.ReactNode
}

export function BriefHead({ title, meta, size = "large", state }: BriefHeadProps) {
  if (size === "label")
    return (
      <div className="s-lead-mark">
        <AimyMark title="" />
        <span>{title}</span>
        {state}
        {meta ? <span className="slv-time">{meta}</span> : null}
      </div>
    )
  return (
    <div className="slv-head">
      <AimyMark title="" />
      <h2 className="slv-title">{title}</h2>
      {meta ? <span className="slv-time">{meta}</span> : null}
    </div>
  )
}

/** One sentence a line. */
export function BriefLines({ lines }: { lines: React.ReactNode[] }) {
  return (
    <div className="slv-body">
      {lines.map((l, i) => (
        <p key={i} className="slv-line">
          {l}
        </p>
      ))}
    </div>
  )
}

/** The one figure the block is about, and the sentence it belongs to. */
export function BriefFigure({
  n,
  of,
  children,
}: {
  n: React.ReactNode
  of?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="s-lead-line">
      <span className="s-lead-n">{n}</span>
      <span className="s-lead-say">
        {of ? <span className="s-lead-of">{of} </span> : null}
        {children}
      </span>
    </div>
  )
}

/** What the figure means: the loudest sentence in the block. */
export function BriefDeck({ children }: { children: React.ReactNode }) {
  return <p className="s-lead-deck">{children}</p>
}

export function BriefActions({ children }: { children: React.ReactNode }) {
  return <div className="s-lead-acts">{children}</div>
}

export type BriefStart = { label: string; n?: number; why: React.ReactNode; onClick: () => void }

/** Ways to start: a verb, how many are behind it, and why. */
export function BriefStarts({ starts, label = "Start" }: { starts: BriefStart[]; label?: string }) {
  const id = useId()
  return (
    <div className="s-starts-wrap">
      <span className="s-starts-cap" id={`${id}-cap`}>
        {label}
      </span>
      <div
        className="s-starts"
        role="group"
        aria-labelledby={`${id}-cap`}
        style={{ "--starts": Math.min(starts.length, 4) } as React.CSSProperties}
      >
        {starts.map((s) => (
          <button key={s.label} type="button" className="s-start" onClick={s.onClick}>
            <span className="s-start-top">
              <span className="s-start-label">{s.label}</span>
              <span className="s-start-n" aria-hidden={!s.n}>
                {s.n ? s.n.toLocaleString("en-GB") : "​"}
              </span>
            </span>
            <span className="s-start-why">{s.why}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Knowledge's "Worth asking": a label on its own line, then questions (Suggestions). */
export function BriefNext({ label = "Worth asking", children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="greet-next">
      <span className="greet-next-label">{label}</span>
      {children}
    </div>
  )
}

/** A number in a briefing sentence that opens the set it counts. */
export function BriefLink({ className, ...props }: React.ComponentProps<"button">) {
  return <button type="button" className={cn("slv-n", className)} {...props} />
}

type DayBriefProps = {
  title?: string
  date: string
  lines: React.ReactNode[]
  starts?: BriefStart[]
  startLabel?: string
  className?: string
}

/** Sales' Today, ready made. */
export function DayBrief({ title = "Today", date, lines, starts = [], startLabel, className }: DayBriefProps) {
  return (
    <Brief label={title} className={className}>
      <BriefHead title={title} meta={date} />
      <BriefLines lines={lines} />
      {starts.length ? <BriefStarts starts={starts} label={startLabel} /> : null}
    </Brief>
  )
}
