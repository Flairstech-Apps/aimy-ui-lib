"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/checkbox"
import { useField } from "@/components/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { cn } from "@/lib/utils"

// Several choices behind one trigger. Knowledge's .k-multi (knowledge.css 7637-7715): the trigger of a
// single select and the panel of its dropdown, with a real checkbox on every row, so Tab reaches each
// one and Space ticks it, and the whole row is the label. The trigger says what is chosen in words
// ("Sales, Support", or "3 chosen" when they don't fit), never only a count. With "Select all" when
// there are more than a few.
//
//   <MultiSelect label="Teams" options={[{ value: "sales", label: "Sales" }]} value={teams} onValueChange={setTeams} />

export type MultiOption = { value: string; label: string; disabled?: boolean }

type MultiSelectProps = {
  options: MultiOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Shown when nothing is chosen: "Any team". */
  placeholder?: string
  /** Accessible name when it is not inside a Field. */
  label?: string
  /** Sends each choice with a form under this name. */
  name?: string
  disabled?: boolean
  className?: string
}

export function MultiSelect({ options, value, defaultValue = [], onValueChange, placeholder = "Choose", label, name, disabled, className }: MultiSelectProps) {
  const field = useField()
  const [own, setOwn] = useState<string[]>(defaultValue)
  const chosen = value ?? own
  const set = (next: string[]) => {
    if (value === undefined) setOwn(next)
    onValueChange?.(next)
  }
  const toggle = (v: string, on: boolean) => set(on ? [...chosen, v].filter((x, i, a) => a.indexOf(x) === i) : chosen.filter((x) => x !== v))
  const usable = options.filter((o) => !o.disabled)
  const all = usable.length > 0 && usable.every((o) => chosen.includes(o.value))
  const names = options.filter((o) => chosen.includes(o.value)).map((o) => o.label)
  const shown = names.length === 0 ? null : names.length <= 2 ? names.join(", ") : `${names[0]}, ${names[1]} and ${names.length - 2} more`

  return (
    <>
      <Popover>
        <PopoverTrigger
          data-slot="multi-select"
          id={field?.id}
          disabled={disabled}
          aria-label={field ? undefined : label}
          aria-invalid={field?.invalid || undefined}
          aria-describedby={field?.describedBy}
          className={cn(
            "t-input group/multi inline-flex min-h-8 max-w-full items-center justify-between gap-1.5 rounded-pill bg-transparent py-1 pe-2 ps-3 text-xs font-semibold",
            "shadow-[inset_0_0_0_1px_var(--card-border-hover)] transition-[background-color,box-shadow,color] duration-(--t-fast) ease-out",
            "hover:not-disabled:bg-raised hover:not-disabled:text-ink data-[state=open]:text-ink data-[state=open]:shadow-[inset_0_0_0_1px_var(--brand)]",
            "aria-invalid:shadow-[inset_0_0_0_1px_var(--err)] disabled:cursor-not-allowed disabled:opacity-[0.38]",
            shown ? "text-ink-secondary" : "text-ink-placeholder",
            className
          )}
        >
          <span className="min-w-0 truncate" title={names.length > 2 ? names.join(", ") : undefined}>
            {shown ?? placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className="size-3.5 shrink-0 transition-transform duration-(--t-fast) ease-out group-data-[state=open]/multi:rotate-180"
          />
        </PopoverTrigger>
        <PopoverContent label={label ?? placeholder} className="max-h-[min(16.25rem,var(--available-height))] w-[var(--anchor-width)] min-w-[12rem] overflow-y-auto p-1">
          <div role="group" aria-label={label ?? placeholder} className="flex flex-col">
            {usable.length > 4 ? (
              <div className="border-b border-hairline px-2 py-1.5">
                <Checkbox
                  label="Select all"
                  checked={all ? true : chosen.length ? "indeterminate" : false}
                  onCheckedChange={(on) => set(on === true ? usable.map((o) => o.value) : [])}
                />
              </div>
            ) : null}
            {options.map((o) => (
              <div key={o.value} className="rounded-sm px-2 py-1.5 text-xs text-ink transition-[background-color] duration-(--t-fast) ease-out hover:bg-w06">
                <Checkbox label={o.label} disabled={o.disabled} checked={chosen.includes(o.value)} onCheckedChange={(on) => toggle(o.value, on === true)} />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {name ? chosen.map((v) => <input key={v} type="hidden" name={name} value={v} disabled={disabled} />) : null}
    </>
  )
}
