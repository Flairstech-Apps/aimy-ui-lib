"use client"

import { X } from "lucide-react"
import { Dialog as Primitive } from "radix-ui"
import { cn } from "@/lib/utils"

// A panel that slides in from the side over the page: Knowledge's rail
// drawer below the rail rung and its settings and Connect sheets. Glass
// ground with a blur, an edge on the inner side, a deep shadow; the page
// behind is scrimmed. Focus moves in and returns; Escape or the scrim closes.
// Slides with transitions.dev's panel reveal (07) on the X axis.
export const Sheet = Primitive.Root
export const SheetTrigger = Primitive.Trigger
export const SheetClose = Primitive.Close

type SheetContentProps = {
  title: React.ReactNode
  description?: React.ReactNode
  side?: "right" | "left"
  /** Width class, e.g. "w-[26rem]". Never wider than the window less 3.5rem. */
  width?: string
  className?: string
  children?: React.ReactNode
}

export function SheetContent({ title, description, side = "right", width = "w-[26rem]", className, children }: SheetContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="t-scrim fixed inset-0 z-(--z-modal) bg-scrim" />
      <Primitive.Content
        data-slot="sheet"
        data-side={side}
        className={cn(
          "t-sheet fixed inset-y-0 z-(--z-modal) flex max-w-[calc(100dvw-3.5rem)] flex-col bg-panel shadow-xl backdrop-blur-lg outline-none",
          side === "right" ? "right-0 border-l border-edge" : "left-0 border-r border-edge",
          width,
          className
        )}
      >
        <div className="flex items-start gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0 flex-1">
            <Primitive.Title className="text-xl leading-tight font-bold text-ink">{title}</Primitive.Title>
            {description ? (
              <Primitive.Description className="mt-1.5 text-meta text-ink-secondary">{description}</Primitive.Description>
            ) : (
              <Primitive.Description className="sr-only">{typeof title === "string" ? title : ""}</Primitive.Description>
            )}
          </div>
          <Primitive.Close
            aria-label="Close"
            className="grid size-7 shrink-0 place-items-center rounded-md text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
          >
            <X aria-hidden="true" strokeWidth={2} className="size-4" />
          </Primitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-meta text-ink-secondary">{children}</div>
      </Primitive.Content>
    </Primitive.Portal>
  )
}
