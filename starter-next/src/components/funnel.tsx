import { cn } from "@/lib/utils"

// Sales' funnel (.b-funnel): a name, a bar and a count a row. As a funnel
// every bar is a share of one whole (the roster), so the narrowing is the
// finding. As steps (.b-steps) each row carries its own whole, the count
// that reached the step before it, said in words above. A bar with anyone in
// it shows at least a sliver. The bars arrive together, never one after
// another, because a narrowing is a shape and not a sequence. The counts are
// right-aligned, the edge the eye compares on.
//
//   <Funnel label="Where the 240 are" head={{ name: "Step", n: "People" }} rows={[
//     { name: "Called", n: 187, tone: "neutral" }, { name: "Meeting set", n: 31, tone: "ok" },
//   ]} total={240} />

export type FunnelRow = {
  name: string
  n: number
  /** Steps: this row's own whole. */
  of?: number
  tone?: "ok" | "warn" | "err" | "neutral" | "accent"
}

type FunnelProps = {
  rows: FunnelRow[]
  /** The whole every bar is a share of; the largest row if left out. */
  total?: number
  /** Column captions over the names and the counts. */
  head?: { name: string; n: string }
  /** steps: each row its own whole, names at the regular weight. */
  form?: "funnel" | "steps"
  /** Names the chart for screen readers. */
  label: string
  arriving?: boolean
  className?: string
}

export function Funnel({ rows, total, head, form = "funnel", label, arriving, className }: FunnelProps) {
  const whole = total ?? Math.max(1, ...rows.map((r) => r.n))
  return (
    <div
      className={cn("b-funnel", form === "steps" && "is-steps", arriving && "is-arriving", className)}
      role="list"
      aria-label={label}
      data-slot="funnel"
    >
      {head ? (
        <div className="b-fn-head" aria-hidden="true">
          <span className="b-fn-name">{head.name}</span>
          <span />
          <span className="b-fn-n">{head.n}</span>
        </div>
      ) : null}
      {rows.map((r) => {
        const of = r.of ?? whole
        const pc = of ? (r.n / of) * 100 : 0
        return (
          <div
            key={r.name}
            className="b-fn-row"
            role="listitem"
            aria-label={`${r.name}: ${r.n.toLocaleString("en-GB")} of ${of.toLocaleString("en-GB")}`}
          >
            <span className="b-fn-name" aria-hidden="true">
              {r.name}
            </span>
            <span className="b-fn-bar" aria-hidden="true">
              <span
                className={cn("b-fn-fill", `tone-${r.tone ?? "neutral"}`)}
                style={{ width: `${r.n > 0 ? Math.max(1, Math.min(100, pc)) : 0}%` }}
              />
            </span>
            <span className="b-fn-n" aria-hidden="true">
              {r.n.toLocaleString("en-GB")}
            </span>
          </div>
        )
      })}
    </div>
  )
}
