import { cn } from "@/lib/utils"

// Label and value pairs, in the two shapes the products draw them.
//
//   beside   Sales' record facts (.b-about-dl): the label in an 8rem column
//            beside its value. Below 360px of its own width the label goes
//            over the value rather than squeezing it.
//   stacked  Knowledge's facts (.set2-us-fact): the label small and upper
//            case over the value, a note under it, a hairline between rows,
//            and room on the right for one control (an Edit button).
//
// A value that is not known says so in words ("Not known"), in the reading
// ink, never as a faded dash. A tone colours the value and the word carries
// the meaning with it. FactGroup is Sales' titled card around a list, and
// FactGroups lays them out two or three across.
//
//   <FactGroups>
//     <FactGroup title="Company" action={<Confidence … />}>
//       <DescriptionList items={[{ term: "Size", detail: "140 people" }, { term: "Founded", detail: null }]} />
//     </FactGroup>
//   </FactGroups>

export type Fact = {
  term: React.ReactNode
  /** null or undefined: not known, said in words. */
  detail?: React.ReactNode
  tone?: "ok" | "warn" | "err"
  /** Stacked only: a line under the value. */
  note?: React.ReactNode
  /** Stacked only: one control on the right of the row. */
  action?: React.ReactNode
}

type DescriptionListProps = {
  items: Fact[]
  form?: "beside" | "stacked"
  /** What an unknown value says. */
  unknown?: string
  className?: string
}

export function DescriptionList({ items, form = "beside", unknown = "Not known", className }: DescriptionListProps) {
  const known = (d: Fact["detail"]) => d !== null && d !== undefined && d !== ""
  if (form === "stacked")
    return (
      <dl className={cn("set2-us-facts", className)} data-slot="description-list">
        {items.map((f, i) => (
          <div key={i} className="set2-us-fact">
            <dt>{f.term}</dt>
            <dd>
              {known(f.detail) ? (
                <b className={f.tone ? `is-${f.tone}` : undefined}>{f.detail}</b>
              ) : (
                <b className="b-about-none">{unknown}</b>
              )}
              {f.note ? <span>{f.note}</span> : null}
            </dd>
            {f.action ? <div className="set2-us-fact-ed">{f.action}</div> : null}
          </div>
        ))}
      </dl>
    )
  return (
    <dl className={cn("b-about-dl", className)} data-slot="description-list">
      {items.map((f, i) => (
        <div key={i} className="b-about-row">
          <dt>{f.term}</dt>
          <dd className={f.tone ? `tone-${f.tone}` : undefined}>
            {known(f.detail) ? f.detail : <span className="b-about-none">{unknown}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type FactGroupProps = {
  title: string
  /** On the right of the title: how sure AiMY is, or a control. */
  action?: React.ReactNode
  /** Being checked again: the card breathes. */
  checking?: boolean
  className?: string
  children: React.ReactNode
}

export function FactGroup({ title, action, checking, className, children }: FactGroupProps) {
  return (
    <section
      className={cn("b-about-g", checking && "is-checking", className)}
      aria-label={title}
      aria-busy={checking || undefined}
      data-slot="fact-group"
    >
      <div className="b-about-gh">
        <h3 className="b-about-h">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Groups side by side; `four` lays four out two by two, not three and a stray. */
export function FactGroups({
  four,
  className,
  children,
}: {
  four?: boolean
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("b-about-grid", four && "is-four", className)}>{children}</div>
}
