"use client"

import { ChevronDown } from "lucide-react"
import { Children, isValidElement, useState } from "react"
import * as Primitive from "@/lib/select-primitive"
import { useField, useShake } from "@/components/field"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
import { useControllable } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// The only select control (never a native <select>). Knowledge's
// .v2-dropdown as the products draw it after Knowledge's override: a pill
// with an inset ring, a brand ring while open, a raised panel, and the chosen
// option in the AI ink with its dot. The select primitive supplies the keyboard model the
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
  /** Shows this part to AiMY under this id (inside an AgentProvider), so it can read it and act on it. */
  agent?: string
  children: React.ReactNode
}

const textOf = (n: React.ReactNode): string =>
  typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(textOf).join("") : isValidElement<{ children?: React.ReactNode }>(n) ? textOf(n.props.children) : ""

export function Select({ placeholder = "Choose", label, className, children, agent, value: valueProp, defaultValue, onValueChange, ...props }: SelectProps) {
  const field = useField()
  const ref = useShake<HTMLButtonElement>(field?.error)
  const [value, setValue] = useControllable<string | undefined>({ value: valueProp, defaultValue, onChange: (v) => v !== undefined && onValueChange?.(v) })
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const options = Children.toArray(children)
    .filter((c): c is React.ReactElement<{ value: string; children: React.ReactNode; disabled?: boolean }> => isValidElement(c))
    .filter((c) => !c.props.disabled)
    .map((c) => ({ value: c.props.value, label: textOf(c.props.children) }))
  useAgentSurface(
    agent,
    {
      kind: "select",
      label: label ?? "",
      state: () => ({ chosen: options.find((o) => o.value === value)?.label ?? null, options: options.map((o) => o.label) }),
      actions: {
        choose: {
          description: "Choose an option",
          keywords: "pick select set change",
          params: { option: { type: "string", description: "The option's name as shown", enum: options.map((o) => o.label) } },
          say: (p) => `chose ${p.option}`,
          run: (p) => {
            const prev = value
            const o = options.find((x) => x.label === p.option)
            if (o) setValue(o.value)
            return () => setValue(prev)
          },
        },
      },
    },
    trigger
  )
  return (
    <Primitive.Root {...props} value={value} onValueChange={setValue}>
      <Primitive.Trigger
        ref={(node: HTMLButtonElement | null) => {
          ref.current = node
          setTrigger(node)
        }}
        data-slot="select"
        id={field?.id}
        aria-label={field ? undefined : label}
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          "t-input group inline-flex min-h-8 max-w-full items-center justify-between gap-1.5 rounded-pill bg-transparent py-1 pr-2 pl-3 text-xs font-semibold text-ink-secondary",
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
            "t-dropdown z-(--z-dropdown) max-h-[min(16.25rem,var(--available-height))] min-w-[max(10rem,var(--anchor-width))]",
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
