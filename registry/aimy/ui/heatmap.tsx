import { cn } from "@/lib/utils"

// QA's goal-by-week grid (.heatmap-*): a row per goal, a column per period,
// each cell its score in the tone of its band, so a weak week reads across a
// row and a weak goal down a column. A small dot in a cell marks coaching
// that week. A cell with no score says so. The key is drawn from the same
// bands the cells use (QA's hand-drawn key did not match its cells), and the
// grid scrolls sideways before it squeezes.
//
//   <Heatmap label="Quality by goal, last 12 weeks" columns={weeks} bands={{ ok: 80, warn: 70 }}
//     rows={[{ name: "Follow-up SOP", values: [88, 84, 79, …], coached: { 4: "Coaching session, 14 Mar" } }]} />

export type HeatmapRow = {
  name: string
  /** One score a column; null where there is none. */
  values: (number | null)[]
  /** Column index to what happened: draws the coaching dot, and the words as the cell's title. */
  coached?: Record<number, string>
}

type HeatmapProps = {
  rows: HeatmapRow[]
  columns: string[]
  /** Names the grid for screen readers. */
  label: string
  /** The caption over the row names. */
  rowsLabel?: string
  /** At or above ok is good; at or above warn is borderline; under it is weak. */
  bands?: { ok: number; warn: number }
  format?: (v: number) => string
  coachedLabel?: string
  className?: string
}

export function Heatmap({
  rows,
  columns,
  label,
  rowsLabel = "Goal",
  bands = { ok: 80, warn: 70 },
  format = String,
  coachedLabel = "Coaching that week",
  className,
}: HeatmapProps) {
  const tone = (v: number) => (v >= bands.ok ? "ok" : v >= bands.warn ? "warn" : "err")
  const anyCoached = rows.some((r) => r.coached && Object.keys(r.coached).length)
  return (
    <div className={className} data-slot="heatmap">
      <div className="qa-hm-body" role="region" aria-label={label} tabIndex={0}>
        <table className="qa-hm">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              <th scope="col" className="is-row">
                {rowsLabel}
              </th>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row" className="is-row-label">
                  {r.name}
                </th>
                {columns.map((c, i) => {
                  const v = r.values[i]
                  const note = r.coached?.[i]
                  return (
                    <td key={c}>
                      {v == null ? (
                        <span className="qa-hm-cell is-na" title={`${c} · no score`}>
                          none
                        </span>
                      ) : (
                        <span
                          className={cn("qa-hm-cell", `tone-${tone(v)}`, note && "is-coached")}
                          title={note ? `${c} · ${format(v)} · ${note}` : `${c} · ${format(v)}`}
                        >
                          {format(v)}
                          {note ? <span className="sr-only">, {note}</span> : null}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="qa-hm-keys" aria-hidden="true">
        <span className="qa-hm-key">
          <span className="qa-hm-cell tone-ok" />
          {format(bands.ok)} and up
        </span>
        <span className="qa-hm-key">
          <span className="qa-hm-cell tone-warn" />
          {format(bands.warn)} to under {format(bands.ok)}
        </span>
        <span className="qa-hm-key">
          <span className="qa-hm-cell tone-err" />
          Under {format(bands.warn)}
        </span>
        {anyCoached ? <span className="qa-hm-key is-coached">{coachedLabel}</span> : null}
      </div>
    </div>
  )
}
