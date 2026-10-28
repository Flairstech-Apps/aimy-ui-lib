"use client"

import { ChevronDown } from "lucide-react"
import { Select as Primitive } from "radix-ui"
import { useField, useShake } from "@/components/field"
import { cn } from "@/lib/utils"

// The only select control (never a native <select>). Knowledge's
// .v2-dropdown as the products draw it after Knowledge's override: a pill
// with an inset ring, a brand ring while open, a raised panel, and the chosen
// option in the AI ink with its dot. Radix supplies the keyboard model the
// hand-written one had: arrow keys, Home and End, typeahead, Escape, focus
// return. The panel opens and closes with transitions.dev's menu dropdown (05).
type SelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  /** Accessible name when the select is not inside a Field. */
  label?: string
  disabled?: boolean
  name?: string
  className?: string
  children: React.ReactNode
}

export function Select({ placeholder = "Choose", label, className, children, ...props }: SelectProps) {
  const field = useField()
  const ref = useShake<HTMLButtonElement>(field?.error)
  return (
    <Primitive.Root {...props}>
      <Primitive.Trigger
        ref={ref}
        data-slot="select"
        id={field?.id}
        aria-label={field ? undefined : label}
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          "t-input group inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-pill bg-transparent py-1 pr-2 pl-3 text-xs font-semibold text-ink-secondary",
          "shadow-[inset_0_0_0_1px_var(--card-border-hover)] transition-[background-color,box-shadow,color] duration-(--t-fast) ease-out",
          "hover:not-disabled:bg-raised hover:not-disabled:text-ink data-[state=open]:text-ink data-[state=open]:shadow-[inset_0_0_0_1px_var(--brand)]",
          "aria-invalid:shadow-[inset_0_0_0_1px_var(--err)] data-placeholder:text-ink-placeholder",
          "disabled:cursor-not-allowed disabled:opacity-[0.38]",
          className
        )}
      >
        <span className="min-w-0 truncate">
          <Primitive.Value placeholder={placeholder} />
        </span>
        <Primitive.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className="size-3.5 shrink-0 transition-transform duration-(--t-fast) ease-out group-data-[state=open]:rotate-180"
          />
        </Primitive.Icon>
      </Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            "t-dropdown z-(--z-dropdown) max-h-[min(16.25rem,var(--radix-select-content-available-height))] min-w-[max(10rem,var(--radix-select-trigger-width))]",
            "overflow-y-auto rounded-lg border border-w10 bg-raised p-1 shadow-lg"
          )}
        >
          <Primitive.Viewport>{children}</Primitive.Viewport>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

export function SelectItem({ value, children, disabled }: { value: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <Primitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-ink-secondary outline-none select-none",
        "before:size-[5px] before:shrink-0 before:rounded-pill before:bg-transparent",
        "data-highlighted:bg-w06 data-highlighted:text-ink",
        "data-[state=checked]:bg-brand-dim data-[state=checked]:text-ai-ink data-[state=checked]:before:bg-ai-ink",
        "data-disabled:cursor-not-allowed data-disabled:opacity-[0.38]"
      )}
    >
      <Primitive.ItemText>{children}</Primitive.ItemText>
    </Primitive.Item>
  )
}
