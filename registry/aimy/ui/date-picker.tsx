"use client"

import { CalendarDays, ChevronDown } from "lucide-react"
import { useState } from "react"
import { Calendar, type DateRange } from "@/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
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
  /** Shows this to AiMY under this id (inside an AgentProvider), so it can read the dates and set them. */
  agent?: string
}

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" })

export function formatRange(r?: DateRange) {
  if (!r) return undefined
  if (!r.to || r.to.getTime() === r.from.getTime()) return fmt.format(r.from)
  return `${fmt.format(r.from)} to ${fmt.format(r.to)}`
}

export function DatePicker(props: DatePickerProps) {
  const { onValueChange, placeholder = "Any date", label, presets, disableFuture = true, className, agent } = props
  const [open, setOpenState] = useState(false)
  // Without a value prop it holds the range itself; with one (even undefined, which means cleared)
  // the parent does.
  const controlled = "value" in props
  const [own, setOwn] = useState<DateRange | undefined>(undefined)
  const value = controlled ? props.value : own
  // A range in the making: the parent hears about it only once both ends are chosen, so a list never
  // filters on half a range; closing the panel drops it.
  const [draft, setDraft] = useState<DateRange | undefined>(undefined)
  const commit = (r: DateRange | undefined) => {
    if (!controlled) setOwn(r)
    setDraft(undefined)
    onValueChange?.(r)
  }
  // For AiMY: dates as YYYY-MM-DD, read and written in the person's own calendar day.
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  const day = (s: unknown) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? ""))
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
  }
  useAgentSurface(
    agent,
    {
      kind: "date range",
      label,
      state: () => ({ from: value ? iso(value.from) : null, to: value?.to ? iso(value.to) : null, presets: presets?.map((p) => p.label) ?? [] }),
      actions: {
        set: {
          description: "Set the dates",
          keywords: "date range from to between period",
          params: {
            from: { type: "string", description: "First day, YYYY-MM-DD" },
            to: { type: "string", description: "Last day, YYYY-MM-DD", optional: true },
          },
          say: (p) => `set the dates to ${formatRange({ from: day(p.from)!, to: day(p.to) ?? undefined })}`,
          run: (p) => {
            const from = day(p.from)
            const to = p.to === undefined ? from : day(p.to)
            if (!from || !to || to < from) throw new Error("Give the first and last day as YYYY-MM-DD, the last on or after the first.")
            if (disableFuture && to > new Date()) throw new Error("This can't go past today.")
            const prev = value
            commit({ from, to })
            return () => commit(prev)
          },
        },
        ...(presets?.length
          ? {
              choose: {
                description: "Choose a preset range",
                keywords: "last week month quarter",
                params: { preset: { type: "string" as const, description: "The preset's name as shown", enum: presets.map((p) => p.label) } },
                say: (p) => `chose ${String(p.preset)}`,
                run: (p) => {
                  const preset = presets.find((x) => x.label === p.preset)
                  if (!preset) throw new Error("There is no such preset.")
                  const prev = value
                  commit(preset.range)
                  return () => commit(prev)
                },
              },
            }
          : {}),
        clear: {
          description: "Clear the dates",
          say: () => "cleared the dates",
          run: () => {
            const prev = value
            commit(undefined)
            return () => commit(prev)
          },
        },
      },
    },
    null
  )

  const setOpen = (o: boolean) => {
    setOpenState(o)
    if (!o) setDraft(undefined)
  }
  const shown = formatRange(value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`${label}: ${shown ?? placeholder}`}
        className={cn(
          "group/date inline-flex min-h-8 items-center gap-1.5 rounded-pill py-1 pe-2 ps-3 text-xs font-semibold text-ink-secondary",
          "shadow-[inset_0_0_0_1px_var(--card-border-hover)] transition-[background-color,box-shadow,color] duration-(--t-fast) ease-out",
          "hover:bg-raised hover:text-ink data-[state=open]:text-ink data-[state=open]:shadow-[inset_0_0_0_1px_var(--brand)]",
          className
        )}
      >
        <CalendarDays aria-hidden="true" strokeWidth={2} className="size-3.5" />
        <span className={cn(!shown && "text-ink-placeholder")}>{shown ?? placeholder}</span>
        <ChevronDown aria-hidden="true" strokeWidth={2} className="size-3.5 transition-transform duration-(--t-fast) ease-out group-data-[state=open]/date:rotate-180" />
      </PopoverTrigger>
      <PopoverContent label={label} className="flex w-auto gap-3 max-phone:flex-col">
        {presets?.length ? (
          // On a phone the presets are a row above the calendar, so the calendar keeps its width.
          <ul className="flex min-w-[8rem] flex-col gap-0.5 border-e border-hairline pe-3 max-phone:min-w-0 max-phone:flex-row max-phone:flex-wrap max-phone:border-e-0 max-phone:border-b max-phone:pe-0 max-phone:pb-2">
            {presets.map((p) => (
              <li key={p.label}>
                <button
                  type="button"
                  onClick={() => {
                    commit(p.range)
                    setOpen(false)
                  }}
                  className="w-full rounded-md px-2 py-1.5 text-start text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
                >
                  {p.label}
                </button>
              </li>
            ))}
            {value ? (
              <li className="mt-auto pt-2 max-phone:mt-0 max-phone:pt-0">
                <button
                  type="button"
                  onClick={() => {
                    commit(undefined)
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
          value={draft ?? value}
          disableFuture={disableFuture}
          onValueChange={(r) => {
            if (!r.to) return setDraft(r)
            commit(r)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
