import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Knowledge's mini calendar (.cal in the date filter and settings): a month
// grid, today outlined, the chosen day in the accent, a range on an accent
// wash. Adds what Knowledge's lacked: a real grid for screen readers and the
// keyboard model (arrows by day and week, Home and End, Page Up and Down by
// month, Enter to choose). Weeks start on Monday.
export type DateRange = { from: Date; to?: Date }

type CalendarProps =
  | { mode?: "single"; value?: Date; onValueChange?: (d: Date) => void; disableFuture?: boolean; className?: string }
  | { mode: "range"; value?: DateRange; onValueChange?: (r: DateRange) => void; disableFuture?: boolean; className?: string }

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), 28))
const sameDay = (a?: Date, b?: Date) => !!a && !!b && day0(a).getTime() === day0(b).getTime()
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function Calendar(props: CalendarProps) {
  const today = day0(new Date())
  const selected = props.mode === "range" ? props.value?.from : props.value
  const [month, setMonth] = useState(() => new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1))
  const [focus, setFocus] = useState<Date>(() => day0(selected ?? today))
  const grid = useRef<HTMLTableElement>(null)
  const moved = useRef(false)

  const weeks = useMemo(() => {
    const start = addDays(month, -mondayIndex(month))
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)))
  }, [month])

  useEffect(() => {
    if (!moved.current) return
    grid.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus()
  }, [focus])

  const disabled = (d: Date) => !!props.disableFuture && d > today

  const choose = (d: Date) => {
    if (disabled(d)) return
    if (props.mode === "range") {
      const r = props.value
      if (!r || r.to || d < r.from) props.onValueChange?.({ from: d })
      else props.onValueChange?.({ from: r.from, to: d })
    } else {
      props.onValueChange?.(d)
    }
  }

  const moveTo = (d: Date) => {
    moved.current = true
    setFocus(d)
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, Date> = {
      ArrowLeft: addDays(focus, -1),
      ArrowRight: addDays(focus, 1),
      ArrowUp: addDays(focus, -7),
      ArrowDown: addDays(focus, 7),
      Home: addDays(focus, -mondayIndex(focus)),
      End: addDays(focus, 6 - mondayIndex(focus)),
      PageUp: addMonths(focus, -1),
      PageDown: addMonths(focus, 1),
    }
    const next = map[e.key]
    if (next) {
      e.preventDefault()
      moveTo(next)
    }
  }

  const range = props.mode === "range" ? props.value : undefined
  const inRange = (d: Date) => !!range?.to && d > range.from && d < range.to

  return (
    <div data-slot="calendar" className={cn("w-[14.875rem] select-none", props.className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonth(addMonths(month, -1))}
          className="grid size-7 place-items-center rounded-md text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
        >
          <ChevronLeft aria-hidden="true" strokeWidth={2} className="size-4" />
        </button>
        <p className="text-xs font-semibold text-ink" aria-live="polite">
          {monthLabel.format(month)}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonth(addMonths(month, 1))}
          className="grid size-7 place-items-center rounded-md text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
        >
          <ChevronRight aria-hidden="true" strokeWidth={2} className="size-4" />
        </button>
      </div>
      <table ref={grid} role="grid" aria-label={monthLabel.format(month)} className="w-full border-collapse" onKeyDown={onKey}>
        <thead>
          <tr>
            {DOW.map((d) => (
              <th key={d} scope="col" className="pb-1 text-2xs font-semibold text-ink-quiet">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]!.toISOString()}>
              {week.map((d) => {
                const isSelected = props.mode === "range" ? sameDay(d, range?.from) || sameDay(d, range?.to) : sameDay(d, selected)
                const outside = d.getMonth() !== month.getMonth()
                return (
                  <td key={d.toISOString()} role="gridcell" aria-selected={isSelected} className={cn("p-0", inRange(d) && "bg-accent-dim")}>
                    <button
                      type="button"
                      tabIndex={sameDay(d, focus) ? 0 : -1}
                      disabled={disabled(d)}
                      aria-current={sameDay(d, today) ? "date" : undefined}
                      aria-label={dayLabel.format(d)}
                      onClick={() => {
                        moveTo(d)
                        choose(d)
                      }}
                      className={cn(
                        "grid aspect-square w-full place-items-center rounded-sm text-xs transition-[background-color,color] duration-(--t-fast) ease-out",
                        outside ? "text-ink-quiet" : "text-ink",
                        "hover:not-disabled:bg-w07 disabled:cursor-not-allowed disabled:opacity-[0.38]",
                        "aria-[current=date]:shadow-[inset_0_0_0_1px_var(--card-border-hover)]",
                        isSelected && "bg-accent font-bold text-on-brand hover:not-disabled:bg-accent"
                      )}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


