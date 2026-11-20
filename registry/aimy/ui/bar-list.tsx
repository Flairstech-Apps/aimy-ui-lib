import { cn } from "@/lib/utils"

// A bar per category: how much each one has, against the others or against a goal. Two forms the
// products draw:
// - "stacked", QA's audit panel (.eval-bar-row, QA index.html 5134-5233): the name and its figures on
//   one line, a 4px bar under them, and an optional goal mark on the bar. With a goal the scale can be
//   narrowed (75 to 100%, say), because six scores between 79 and 94 all look full on 0 to 100; the
//   mark is what makes a narrowed scale honest, and the note under the list says so.
// - "inline", the operations hub's breakdowns (.bk-row, index.html 653-660): name, a short bar, the
//   value and its share, on one line with a rule between rows.
// Every row says what its number means (the figure beside it), and a row with onClick opens what it
// counts. Words never fade: the name is in secondary ink, the value in primary.
//
//   <BarList goal={85} scale={[75, 100]} unit="%" rows={[{ label: "Objectif Lune", value: 79.2, figure: "411 tickets", tone: "warn" }]} />

export type BarTone = "ok" | "warn" | "err" | "brand"

export type BarRow = {
  id?: string
  label: React.ReactNode
  /** The bar's value, in the list's units. */
  value: number
  /** What the value is, beside the bar: "411 tickets · ↓ 3". */
  figure?: React.ReactNode
  /** The value as people read it ("79.2%"); the number itself by default. */
  shown?: React.ReactNode
  /** stacked: the dot, the bar and the value's ink. Default brand. */
  tone?: BarTone
  /** Opens what the row counts. */
  onClick?: () => void
}

type BarListProps = {
  rows: BarRow[]
  form?: "stacked" | "inline"
  /** The scale the bars run on. Default 0 to the largest value. */
  scale?: [number, number]
  /** A goal marked on every bar (stacked form). */
  goal?: number
  /** Added to the goal in the note under the list: "%". */
  unit?: string
  /** inline: each row's share of the total, after its value. Default true. */
  share?: boolean
  /** The list's name for screen readers. */
  label?: string
  className?: string
}

const TONE: Record<BarTone, string> = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)", brand: "var(--ai)" }
const INK: Record<BarTone, string> = { ok: "text-ok-text", warn: "text-warn-text", err: "text-err-text", brand: "text-ink" }

export function BarList({ rows, form = "stacked", scale, goal, unit = "", share = true, label, className }: BarListProps) {
  const top = Math.max(0, ...rows.map((r) => (Number.isFinite(r.value) ? r.value : 0)))
  const [lo, hi] = scale ?? [0, top || 1]
  const pc = (v: number) => (Number.isFinite(v) && hi > lo ? Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100)) : 0)
  const total = rows.reduce((s, r) => s + (Number.isFinite(r.value) ? r.value : 0), 0)
  const narrowed = scale && scale[0] > 0
  const key = (r: BarRow, i: number) => r.id ?? `${typeof r.label === "string" ? r.label : "row"}-${i}`

  if (form === "inline")
    return (
      <ul data-slot="bar-list" data-form="inline" aria-label={label} className={cn("bl-inline", className)}>
        {rows.map((r, i) => {
          const Row = r.onClick ? "button" : "div"
          return (
            <li key={key(r, i)}>
              <Row type={r.onClick ? "button" : undefined} onClick={r.onClick} className="bl-irow">
                <span className="bl-ilabel">{r.label}</span>
                <span className="bl-itrack" aria-hidden="true">
                  <span className="bl-fill" style={{ width: `${pc(r.value)}%`, background: TONE[r.tone ?? "brand"] }} />
                </span>
                <span className="bl-ival">{r.shown ?? (Number.isFinite(r.value) ? r.value.toLocaleString("en-GB") : "No data")}</span>
                {share ? <span className="bl-ipct">{total && Number.isFinite(r.value) ? `${((r.value / total) * 100).toFixed(1)}%` : ""}</span> : null}
              </Row>
            </li>
          )
        })}
      </ul>
    )

  return (
    <div data-slot="bar-list" data-form="stacked" className={className}>
      <ul aria-label={label} className="bl-stack">
        {rows.map((r, i) => {
          const tone = r.tone ?? "brand"
          const Row = r.onClick ? "button" : "div"
          return (
            <li key={key(r, i)}>
              <Row type={r.onClick ? "button" : undefined} onClick={r.onClick} className="bl-row">
                <span className="bl-top">
                  <span className="bl-label">
                    <span className="bl-dot" style={{ background: TONE[tone] }} aria-hidden="true" />
                    {r.label}
                  </span>
                  <span className="bl-right">
                    {r.figure ? <span className="bl-figure">{r.figure}</span> : null}
                    <span className={cn("bl-value", INK[tone])}>{r.shown ?? (Number.isFinite(r.value) ? `${r.value}${unit}` : "No data")}</span>
                  </span>
                </span>
                <span className={cn("bl-track", goal !== undefined && "has-goal")} aria-hidden="true">
                  <span className="bl-fill" style={{ width: `${pc(r.value)}%`, background: TONE[tone] }} />
                  {goal !== undefined ? <span className="bl-goal" style={{ insetInlineStart: `${pc(goal)}%` }} /> : null}
                </span>
              </Row>
            </li>
          )
        })}
      </ul>
      {goal !== undefined || narrowed ? (
        <p className="bl-note">
          {goal !== undefined ? (
            <>
              The line on each bar is the goal, <b>{`${goal}${unit}`}</b>.{" "}
            </>
          ) : null}
          {narrowed ? `The bars run from ${scale![0]}${unit} to ${scale![1]}${unit}, so close scores stay apart.` : null}
        </p>
      ) : null}
    </div>
  )
}
