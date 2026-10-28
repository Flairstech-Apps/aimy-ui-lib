"use client"

import { Popover as Primitive } from "radix-ui"
import { cn } from "@/lib/utils"

// A small panel tied to a control, for a few fields or a short explanation
// with a button in it: Knowledge's settings popovers (.set2-pop) and Sales'
// confidence explanation (.b-wait-pop). Opens below its control and flips
// when there's no room, moves focus inside, and Escape or a click outside
// closes it and returns focus. Opens and closes with transitions.dev's menu
// dropdown (05), the same timing both products used.
export const Popover = Primitive.Root
export const PopoverTrigger = Primitive.Trigger
export const PopoverClose = Primitive.Close

type PopoverContentProps = React.ComponentProps<typeof Primitive.Content> & {
  /** Names the panel for screen readers when it has no visible heading. */
  label?: string
}

export function PopoverContent({ className, align = "start", sideOffset = 6, label, ...props }: PopoverContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="popover"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        aria-label={label}
        className={cn(
          "t-dropdown z-(--z-popover) w-[15rem] max-w-[calc(100vw-1rem)] rounded-lg border border-edge-hover bg-raised p-3 text-meta text-ink-secondary shadow-lg outline-none",
          className
        )}
        {...props}
      />
    </Primitive.Portal>
  )
}
