"use client"

import { Switch as Primitive } from "radix-ui"
import { useId, useState } from "react"
import { useAgentToggle } from "@/lib/behaviors-agent-react"
import { cn } from "@/lib/utils"
import { useField } from "@/components/field"

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
  /** Shows this to AiMY under this id (inside an AgentProvider), so it can read it and turn it on or off. */
  agent?: string
}

export function Switch({ label, lockedReason, className, id, checked, defaultChecked, onCheckedChange, disabled, agent, ...props }: SwitchProps) {
  const auto = useId()
  const field = useField()
  const [node, setNode] = useState<HTMLButtonElement | null>(null)
  useAgentToggle(agent, node, "switch")
  const [inner, setInner] = useState(defaultChecked ?? false)
  const [moved, setMoved] = useState(false)
  const on = checked ?? inner
  const track = (
    <Primitive.Root
      ref={setNode}
      // Inside a Field, its hint and error reach it (a Field can hold several, so each keeps its own id).
      id={id ?? auto}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
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
          "t-toggle-thumb absolute top-[3px] start-[3px] block size-3.5 rounded-pill bg-on-brand shadow-sm",
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
