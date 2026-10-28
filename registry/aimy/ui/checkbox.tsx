"use client"

import { Checkbox as Primitive } from "radix-ui"
import { useId } from "react"
import { cn } from "@/lib/utils"

// Knowledge's settings checkbox (.set2-ck2): a 17px box with a 1px edge, the
// brand fill and a white tick when on, a dash for "some". The tick draws
// itself in (transitions.dev 25). A 28px hit area surrounds the box.
type CheckboxProps = Omit<React.ComponentProps<typeof Primitive.Root>, "children"> & {
  /** Words beside the box. Clicking them toggles it. */
  label?: React.ReactNode
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const auto = useId()
  const box = (
    <Primitive.Root
      id={id ?? auto}
      data-slot="checkbox"
      className={cn(
        "t-check group relative grid size-[1.0625rem] shrink-0 place-items-center rounded-xs border border-ink-rule bg-card text-on-brand",
        "after:absolute after:-inset-1.5 hover:not-disabled:border-brand",
        "data-[state=checked]:border-brand data-[state=checked]:bg-brand",
        "data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand-dim data-[state=indeterminate]:text-brand",
        "disabled:cursor-not-allowed disabled:opacity-[0.38]",
        className
      )}
      {...props}
    >
      {/* The tick is always in the DOM so it can draw in and out; the dash only shows for "some". */}
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3 group-data-[state=indeterminate]:hidden" style={{ "--check-len": 24 } as React.CSSProperties}>
        <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Primitive.Indicator forceMount className="absolute hidden data-[state=indeterminate]:block">
        <span className="block h-0.5 w-2 rounded-pill bg-brand" />
      </Primitive.Indicator>
    </Primitive.Root>
  )
  if (!label) return box
  return (
    <label htmlFor={id ?? auto} className="inline-flex cursor-pointer items-center gap-2.5 text-base text-ink-secondary has-disabled:cursor-not-allowed">
      {box}
      <span>{label}</span>
    </label>
  )
}
