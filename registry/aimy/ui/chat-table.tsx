"use client"

import { useState } from "react"
import { DataTable, type SortState } from "@/components/data-table"
import { Skeleton } from "@/components/skeleton"
import { cn } from "@/lib/utils"

// A tool's table inside a chat reply (Nour's pick, 4 Nov). It replaces the
// Knowledge app's streaming table: a gradient head, uppercase headings, its
// own paginator, text cut at 50 characters and sideways scrolling in the
// reply. This is the library's DataTable: sentence-case headers, three-state
// sorting, figures to the right. Where the widget is too narrow for the
// columns it changes form instead of scrolling: the DataTable's rows form,
// the first column on its own line and the rest under it. While the tool
// runs it shows placeholder rows. Put it in a WidgetFrame with flush, and
// let the frame's foot open more than ten rows in the canvas.
//
//   <WidgetFrame icon={<Table2 />} title="Matched positions for Omar Nabil" meta="4 rows" flush>
//     <ChatTable label="Matched positions" rows={rows} rowKey={(r) => r.id} columns={cols} loading={!ready} />
//   </WidgetFrame>
//
// Wrap long text in a cell with wrapCell(text) so it wraps instead of
// widening the table.

type ChatTableProps<T> = Omit<React.ComponentProps<typeof DataTable<T>>, "form"> & {
  /** Placeholder rows while the tool runs. */
  loading?: boolean
}

export function ChatTable<T>({ loading, className, sort: sortProp, onSortChange, ...props }: ChatTableProps<T>) {
  // One sort for both forms, so changing width keeps the order.
  const [own, setOwn] = useState<SortState>(null)
  const sort = sortProp !== undefined ? sortProp : own
  const setSort = (next: SortState) => {
    if (sortProp === undefined) setOwn(next)
    onSortChange?.(next)
  }
  if (loading) {
    const cols = props.columns.length
    return (
      <div data-slot="chat-table" className={cn("flex flex-col gap-2 p-4", className)} role="status" aria-label={`Loading ${props.label}`}>
        {Array.from({ length: 4 }, (_, r) => (
          <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }, (_, c) => (
              <Skeleton key={c} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div data-slot="chat-table" className={cn("@container", className)}>
      <DataTable<T> {...props} sort={sort} onSortChange={setSort} form="table" className="@max-[36rem]:hidden" />
      <DataTable<T> {...props} sort={sort} onSortChange={setSort} form="rows" className="p-3 @min-[36rem]:hidden" />
    </div>
  )
}

/** Long text that wraps in its cell instead of widening the table. */
export function wrapCell(text: React.ReactNode, minWidth = "8rem") {
  return (
    <span className="block whitespace-normal text-ink" style={{ minWidth }}>
      {text}
    </span>
  )
}
