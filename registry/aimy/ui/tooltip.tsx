"use client"

import { CircleHelp } from "lucide-react"
import { Tooltip as Primitive } from "radix-ui"
import { cn } from "@/lib/utils"

// A short hint on hover or keyboard focus. Knowledge's settings tip
// (.set2-tip): a raised bubble with an edge, 15rem at most. It appears after
// 80ms and leaves at once, with transitions.dev's tooltip timing (17).
// Hints are sentences, so they are 14px in the secondary ink, not the 12px
// quiet ink the settings used. Nothing in a tooltip can be clicked; if it
// needs a button, use a Popover.
type TooltipProps = {
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  /** One element that can take focus: a button, a link. */
  children: React.ReactElement
}

export function Tooltip({ content, side = "top", children }: TooltipProps) {
  return (
    <Primitive.Provider delayDuration={0} skipDelayDuration={300}>
      <Primitive.Root>
        <Primitive.Trigger asChild>{children}</Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Content
            data-slot="tooltip"
            side={side}
            sideOffset={8}
            collisionPadding={8}
            className="t-tt z-(--z-tooltip) max-w-[15rem] rounded-md border border-edge bg-raised px-2.5 py-1.5 text-xs text-ink-secondary shadow-md"
          >
            {content}
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
    </Primitive.Provider>
  )
}

/** The small "?" beside a label that explains it (Knowledge's .set2-tip-b). */
export function InfoTip({ content, label, className }: { content: React.ReactNode; label: string; className?: string }) {
  return (
    <Tooltip content={content} side="right">
      <button
        type="button"
        aria-label={label}
        className={cn(
          "inline-grid size-4.5 place-items-center rounded-pill text-ink-quiet transition-[color] duration-(--t-fast) ease-out hover:text-ink",
          className
        )}
      >
        <CircleHelp aria-hidden="true" strokeWidth={2} className="size-3.5" />
      </button>
    </Tooltip>
  )
}
