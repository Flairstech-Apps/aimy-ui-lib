"use client"

import { CalendarDays, ChevronDown } from "lucide-react"
import { useState } from "react"
import { Calendar, type DateRange } from "@/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { cn } from "@/lib/utils"

// Knowledge's date filter (.k-date): a pill that opens a panel with quick
// choices and the calendar. Choosing a quick option or the second day of a
// range closes it. The pill looks like Select's, with a brand ring while open.
type Preset = { label: string; range: DateRange }

type DatePickerProps = {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  /** Shown in the pill when nothing is chosen: "Any date". */
  placeholder?: string
  /** Accessible name for the pill: "Created". */
  label: string
  presets?: Preset[]
  disableFuture?: boolean
  className?: string
}

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" })

export function formatRange(r?: DateRange) {
  if (!r) return undefined
  if (!r.to || r.to.getTime() === r.from.getTime()) return fmt.format(r.from)
  return `${fmt.format(r.from)} to ${fmt.format(r.to)}`
}

export function DatePicker({ value, onValueChange, placeholder = "Any date", label, presets, disableFuture = true, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const shown = formatRange(value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`${label}: ${shown ?? placeholder}`}
        className={cn(
          "group inline-flex min-h-8 items-center gap-1.5 rounded-pill py-1 pr-2 pl-3 text-xs font-semibold text-ink-secondary",
          "shadow-[inset_0_0_0_1px_var(--card-border-hover)] transition-[background-color,box-shadow,color] duration-(--t-fast) ease-out",
          "hover:bg-raised hover:text-ink data-[state=open]:text-ink data-[state=open]:shadow-[inset_0_0_0_1px_var(--brand)]",
          className
        )}
      >
        <CalendarDays aria-hidden="true" strokeWidth={2} className="size-3.5" />
        <span className={cn(!shown && "text-ink-placeholder")}>{shown ?? placeholder}</span>
        <ChevronDown aria-hidden="true" strokeWidth={2} className="size-3.5 transition-transform duration-(--t-fast) ease-out group-data-[state=open]:rotate-180" />
      </PopoverTrigger>
      <PopoverContent label={label} className="flex w-auto gap-3">
        {presets?.length ? (
          <ul className="flex min-w-[8rem] flex-col gap-0.5 border-r border-hairline pr-3">
            {presets.map((p) => (
              <li key={p.label}>
                <button
                  type="button"
                  onClick={() => {
                    onValueChange?.(p.range)
                    setOpen(false)
                  }}
                  className="w-full rounded-md px-2 py-1.5 text-left text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
                >
                  {p.label}
                </button>
              </li>
            ))}
            {value ? (
              <li className="mt-auto pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onValueChange?.(undefined)
                    setOpen(false)
                  }}
                  className="px-2 text-xs font-semibold text-accent-text hover:underline"
                >
                  Clear
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
        <Calendar
          mode="range"
          value={value}
          disableFuture={disableFuture}
          onValueChange={(r) => {
            onValueChange?.(r)
            if (r.to) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
