"use client"

import { Score } from "@/components/score"
import { cn } from "@/lib/utils"

// Results best first, one per row, each with its reason (Nour's pick, 4 Nov,
// for matched positions). In the Knowledge app these came as a table whose
// reasoning column was cut off at the edge and scrolled sideways; the reason
// is why the list exists, so here it stays in view, two lines at most. The
// title, a line of details, the reason, and the Fit badge; the row opens the
// result. Put it in a WidgetFrame with flush. For rows compared on the same
// columns, use ChatTable.
//
//   <WidgetFrame icon={<Briefcase />} title="Matched positions for Omar Nabil" meta="Best match first" flush>
//     <RankedList label="Matched positions" items={roles} onOpen={openRole} />
//   </WidgetFrame>

export type RankedItem = {
  id: string
  title: string
  /** A line under the title: "Cairo / Alexandria, 2 years needed". */
  details?: string
  /** Why it ranks here. */
  reason?: string
  /** Match out of 100, shown as the Fit badge. */
  match?: number
}

type RankedListProps = {
  items: RankedItem[]
  /** Names the list for screen readers. */
  label: string
  onOpen?: (item: RankedItem) => void
  className?: string
}

export function RankedList({ items, label, onOpen, className }: RankedListProps) {
  return (
    <ol data-slot="ranked-list" aria-label={label} className={cn("divide-y divide-hairline", className)}>
      {items.map((item) => {
        const inner = (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-ink">{item.title}</span>
              {item.details ? <span className="mt-0.5 block text-2xs text-ink-secondary">{item.details}</span> : null}
              {item.reason ? <span className="mt-1.5 line-clamp-2 block text-2xs text-ink">{item.reason}</span> : null}
            </span>
            {item.match !== undefined ? <Score value={item.match} label="Fit" /> : null}
          </>
        )
        const row = "flex w-full items-start gap-4 px-4 py-3 text-left"
        return (
          <li key={item.id}>
            {onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(item)}
                className={cn(row, "transition-[background-color] duration-(--t-fast) ease-out hover:bg-w03")}
              >
                {inner}
              </button>
            ) : (
              <div className={row}>{inner}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
