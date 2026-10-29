"use client"

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/checkbox"
import { cn } from "@/lib/utils"

// Records in columns, in Knowledge's two forms (Sales draws no tables).
//
//   rows   Knowledge's run history (.set2-runs): every row its own card at a
//          gap you can see, one height for every row, a head naming the
//          columns. Below 46rem of its own width the first column takes a
//          line and the rest share the next, and the head goes.
//   table  Knowledge's preview table (.set2-pv): a real <table>, zebra rows,
//          a sub-label under a header, scrolls sideways when it must.
//
// Sorting is Knowledge's three states: ascending, descending, and back to
// the order the rows came in, which a two-state toggle never returns you
// to. The arrow is always drawn, so a header never hides that it sorts.
// Two parts neither product has, from the design-system spec: a head that
// stays put while the body scrolls (`stickyHead` with `maxHeight`), and row
// selection (a checkbox column; the head's box selects all or none). For a
// long list, render rows in a VirtualList instead.
//
//   <DataTable label="Syncs" rows={runs} rowKey={(r) => r.id} columns={[
//     { key: "when", header: "When", width: "5.5rem", cell: (r) => r.when, sort: byDate },
//     { key: "n", header: "Documents", end: true, cell: (r) => r.n },
//   ]} />

export type SortDir = "asc" | "desc"
export type SortState = { key: string; dir: SortDir } | null

export type Column<T> = {
  key: string
  header: string
  /** Table form: a line under the header, e.g. where the column comes from. */
  sub?: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Makes the column sortable. */
  sort?: (a: T, b: T) => number
  /** Right-aligned: figures and states. */
  end?: boolean
  /** Rows form: the column's track, e.g. "5.5rem" or "auto". */
  width?: string
}

type DataTableProps<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  /** Names the table for screen readers. */
  label: string
  form?: "rows" | "table"
  /** Table form: the head stays put while the body scrolls. Give it a maxHeight. */
  stickyHead?: boolean
  maxHeight?: string
  /** Turns on the checkbox column. */
  selected?: string[]
  onSelectedChange?: (keys: string[]) => void
  /** What each row's box is called: "Select Kestrel Logistics". */
  rowName?: (row: T) => string
  /** Controlled sort; leave out to let the table keep its own. */
  sort?: SortState
  onSortChange?: (sort: SortState) => void
  /** Shown in place of the rows when there are none. */
  empty?: React.ReactNode
  className?: string
}

/** The next of the three states. */
export function nextSort(sort: SortState, key: string): SortState {
  if (!sort || sort.key !== key) return { key, dir: "asc" }
  return sort.dir === "asc" ? { key, dir: "desc" } : null
}

/** Knowledge's sort header, also usable on its own in a sort bar above rows. */
export function SortHeader({
  label,
  dir,
  onClick,
  className,
}: {
  label: string
  /** Sorted by this column, which way; leave out when it is not. */
  dir?: SortDir
  onClick: () => void
  className?: string
}) {
  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ChevronsUpDown
  return (
    <button type="button" className={cn("set2-th", className)} onClick={onClick}>
      {label}
      <span className={cn("set2-th-a", dir && "is-on")} aria-hidden="true">
        <Icon />
      </span>
      <span className="sr-only">{dir === "asc" ? ", sorted up" : dir === "desc" ? ", sorted down" : ""}</span>
    </button>
  )
}

/** Knowledge's empty block: what is missing, and how to fill it. */
export function TableEmpty({
  title,
  children,
  action,
}: {
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="set2-empty">
      <b>{title}</b>
      {children ? <span>{children}</span> : null}
      {action}
    </div>
  )
}

const ariaSort = (s: SortState, key: string) =>
  s?.key === key ? (s.dir === "asc" ? "ascending" : "descending") : "none"

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  label,
  form = "rows",
  stickyHead,
  maxHeight,
  selected,
  onSelectedChange,
  rowName,
  sort: sortProp,
  onSortChange,
  empty,
  className,
}: DataTableProps<T>) {
  const [own, setOwn] = useState<SortState>(null)
  const sort = sortProp !== undefined ? sortProp : own
  const setSort = (s: SortState) => {
    if (sortProp === undefined) setOwn(s)
    onSortChange?.(s)
  }
  const cmp = sort ? columns.find((c) => c.key === sort.key)?.sort : undefined
  const up = sort?.dir === "asc"
  const shown = cmp ? [...rows].sort((a, b) => (up ? cmp(a, b) : cmp(b, a))) : rows

  const picking = selected !== undefined
  const keys = rows.map(rowKey)
  const chosen = new Set(selected ?? [])
  const all = keys.length > 0 && keys.every((k) => chosen.has(k))
  const some = !all && keys.some((k) => chosen.has(k))
  const pickAll = (
    <Checkbox
      aria-label={all ? "Select none" : "Select all"}
      checked={all ? true : some ? "indeterminate" : false}
      onCheckedChange={() => onSelectedChange?.(all ? [] : keys)}
    />
  )
  const pickOne = (row: T) => {
    const k = rowKey(row)
    return (
      <Checkbox
        aria-label={`Select ${rowName ? rowName(row) : k}`}
        checked={chosen.has(k)}
        onCheckedChange={(on) =>
          onSelectedChange?.(on === true ? [...(selected ?? []), k] : (selected ?? []).filter((x) => x !== k))
        }
      />
    )
  }
  const head = (c: Column<T>) =>
    c.sort ? (
      <SortHeader
        label={c.header}
        dir={sort?.key === c.key ? sort.dir : undefined}
        onClick={() => setSort(nextSort(sort, c.key))}
      />
    ) : (
      <span className="set2-th-l">{c.header}</span>
    )

  if (!rows.length && empty) return <div className={cn("dt", className)}>{empty}</div>

  if (form === "table")
    return (
      <div
        className={cn("dt set2-pv-wrap", className)}
        style={maxHeight ? { maxHeight } : undefined}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-slot="data-table"
      >
        <table className={cn("set2-pv", stickyHead && "is-sticky")}>
          <thead>
            <tr>
              {picking ? <th className="dt-pick">{pickAll}</th> : null}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={c.end ? "is-end" : undefined}
                  aria-sort={c.sort ? ariaSort(sort, c.key) : undefined}
                >
                  {c.sort ? head(c) : c.header}
                  {c.sub ? <span className="set2-pv-sub">{c.sub}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const k = rowKey(r)
              return (
                <tr key={k} data-selected={chosen.has(k) || undefined}>
                  {picking ? <td className="dt-pick">{pickOne(r)}</td> : null}
                  {columns.map((c) => (
                    <td key={c.key} className={c.end ? "is-end" : undefined}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )

  const tracks = [...(picking ? ["auto"] : []), ...columns.map((c) => c.width ?? "minmax(0, 1fr)")].join(" ")
  return (
    <div className={cn("dt", className)} data-slot="data-table">
      <div className="set2-runs" role="table" aria-label={label} style={{ "--dt-cols": tracks } as React.CSSProperties}>
        <div className="set2-run set2-run-hd" role="row">
          {picking ? (
            <span role="columnheader" className="dt-pick">
              {pickAll}
            </span>
          ) : null}
          {columns.map((c) => (
            <span
              key={c.key}
              role="columnheader"
              className={c.end ? "is-end" : undefined}
              aria-sort={c.sort ? ariaSort(sort, c.key) : undefined}
            >
              {head(c)}
            </span>
          ))}
        </div>
        {shown.map((r) => {
          const k = rowKey(r)
          return (
            <div key={k} className="set2-run" role="row" data-selected={chosen.has(k) || undefined}>
              {picking ? (
                <span role="cell" className="dt-pick">
                  {pickOne(r)}
                </span>
              ) : null}
              {columns.map((c, i) => (
                <span key={c.key} role="cell" className={cn(`dt-c${i + 1}`, c.end && "is-end")}>
                  {c.cell(r)}
                </span>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
