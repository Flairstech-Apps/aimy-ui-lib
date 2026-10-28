"use client"

import { Switch as Primitive } from "radix-ui"
import { useId, useState } from "react"
import { cn } from "@/lib/utils"

// Knowledge's settings switch (.toggle and .set2-us-sw): a 36 x 20 track, the
// brand when on, a 14px white thumb. The thumb travels with transitions.dev's
// toggle (27), a small double-bounce; it doesn't animate on first paint.
// A locked switch (disabled) keeps its position readable: a dimmed track and
// a grey thumb, plus a title saying why, rather than fading the whole row.
type SwitchProps = Omit<React.ComponentProps<typeof Primitive.Root>, "children"> & {
  /** Words beside the switch. */
  label?: React.ReactNode
  /** Why it can't be changed, shown as a tooltip when disabled. */
  lockedReason?: string
}

export function Switch({ label, lockedReason, className, id, checked, defaultChecked, onCheckedChange, disabled, ...props }: SwitchProps) {
  const auto = useId()
  const [inner, setInner] = useState(defaultChecked ?? false)
  const [moved, setMoved] = useState(false)
  const on = checked ?? inner
  const track = (
    <Primitive.Root
      id={id ?? auto}
      data-slot="switch"
      data-on={on}
      checked={on}
      disabled={disabled}
      title={disabled ? lockedReason : undefined}
      onCheckedChange={(next) => {
        setMoved(true)
        if (checked === undefined) setInner(next)
        onCheckedChange?.(next)
      }}
      className={cn(
        "t-toggle relative inline-block h-5 w-9 shrink-0 rounded-pill bg-w14 data-[state=checked]:bg-brand",
        moved && "is-init",
        "disabled:cursor-not-allowed disabled:bg-w07 disabled:data-[state=checked]:bg-[color-mix(in_srgb,var(--brand)_45%,transparent)]",
        className
      )}
      {...props}
    >
      <Primitive.Thumb
        className={cn(
          "t-toggle-thumb absolute top-[3px] left-[3px] block size-3.5 rounded-pill bg-on-brand shadow-sm",
          disabled && "bg-d300 shadow-none"
        )}
      />
    </Primitive.Root>
  )
  if (!label) return track
  return (
    <label htmlFor={id ?? auto} className="inline-flex cursor-pointer items-center gap-2.5 text-base text-ink-secondary has-disabled:cursor-not-allowed">
      {track}
      <span>{label}</span>
    </label>
  )
}
