"use client"

import { RadioGroup } from "radix-ui"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Knowledge's .seg after its override: a pill track with an inset ring, the
// chosen option on an accent wash with a brand ring. A radiogroup: arrow keys
// move and choose, and wrap. The highlight slides between options with
// transitions.dev's tabs sliding (16); it is placed without animation on
// first paint and on resize.
type Option = { value: string; label: React.ReactNode }

type SegmentedProps = {
  options: Option[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Accessible name for the group, e.g. "Show". */
  label: string
  /** Sends the choice with a form under this name. */
  name?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function Segmented({ options, value, defaultValue, onValueChange, label, name, disabled, required, className }: SegmentedProps) {
  const [inner, setInner] = useState(defaultValue)
  // Options that arrive after the first render still start on the first one.
  const current = value ?? inner ?? options[0]?.value
  const bar = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)

  const place = useCallback((animate: boolean) => {
    const el = bar.current?.querySelector<HTMLElement>('[data-state="checked"]')
    const p = pill.current
    if (!el || !p) return
    if (!animate) p.style.transition = "none"
    p.style.transform = `translateX(${el.offsetLeft}px)`
    p.style.width = `${el.offsetWidth}px`
    p.style.top = `${el.offsetTop}px`
    p.style.height = `${el.offsetHeight}px`
    if (!animate) {
      void p.offsetWidth
      p.style.transition = ""
    }
  }, [])

  const first = useRef(true)
  useLayoutEffect(() => {
    place(!first.current)
    first.current = false
  }, [current, place])

  useLayoutEffect(() => {
    const onResize = () => place(false)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [place])

  // Also follows the segments' own size (a count that gains a digit, a label that changes, the font
  // arriving). It glides there, so a segment that changes weight mid-slide doesn't cut the slide short.
  useLayoutEffect(() => {
    const el = bar.current
    if (!el || typeof ResizeObserver === "undefined") return
    let primed = false // the first report is the sizes as they are, not a change
    const ro = new ResizeObserver(() => {
      if (primed) place(true)
      primed = true
    })
    ro.observe(el)
    for (const child of el.children) ro.observe(child)
    return () => ro.disconnect()
  }, [place, options.length])

  return (
    <RadioGroup.Root
      ref={bar}
      data-slot="segmented"
      aria-label={label}
      value={current}
      name={name}
      disabled={disabled}
      required={required}
      loop
      orientation="horizontal"
      onValueChange={(next) => {
        if (value === undefined) setInner(next)
        onValueChange?.(next)
      }}
      className={cn("relative inline-flex w-fit items-center gap-0.5 rounded-pill p-[3px] shadow-[inset_0_0_0_1px_var(--card-border-hover)]", className)}
    >
      <span
        ref={pill}
        aria-hidden="true"
        className="t-tabs-pill rounded-pill bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] shadow-[inset_0_0_0_1px_var(--brand)]"
      />
      {options.map((o) => (
        <RadioGroup.Item
          key={o.value}
          value={o.value}
          className="t-tab min-h-7 rounded-pill px-3.5 text-xs font-semibold text-ink-secondary hover:text-ink data-[state=checked]:text-ink"
        >
          {o.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}
