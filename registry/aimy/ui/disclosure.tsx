"use client"

import { useId, useState } from "react"
import { cn } from "@/lib/utils"

// Show or hide a section in place: Sales' <details> sections (the call
// transcript .s-trace, the crew list, the agent's steps) and Knowledge's rail
// blocks. A header row with an optional count and a chevron; the body slides
// open with transitions.dev's accordion (21), where Knowledge's snapped open.
// Use it for a bounded section, not to hide open-ended data.
type DisclosureProps = {
  title: React.ReactNode
  /** A number after the title, such as how many lines are inside. */
  count?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

export function Disclosure({ title, count, open, defaultOpen = false, onOpenChange, className, children }: DisclosureProps) {
  const [inner, setInner] = useState(defaultOpen)
  const isOpen = open ?? inner
  const id = useId()
  const toggle = () => {
    const next = !isOpen
    if (open === undefined) setInner(next)
    onOpenChange?.(next)
  }
  return (
    <div data-slot="disclosure" className={cn("t-acc", className)} data-open={isOpen}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-sm py-1 text-xs font-semibold text-ink-secondary transition-[color] duration-(--t-fast) ease-out hover:text-ink"
      >
        <span>{title}</span>
        {count !== undefined ? <span className="text-2xs font-medium text-ink-quiet">{count}</span> : null}
        <span className="t-acc-chevron text-ink-quiet" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <div id={`${id}-panel`} role="region" aria-label={typeof title === "string" ? title : undefined} className="t-acc-panel" inert={!isOpen}>
        <div className="t-acc-panel-inner">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  )
}
