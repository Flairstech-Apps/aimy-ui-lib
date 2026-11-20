"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import * as Primitive from "@/lib/popover-primitive"
import { Slot } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// A card that opens on a mark (a bar, a point, a slice) and that you can reach: unlike Tooltip, it
// stays open while the pointer travels from the mark into it, so an action inside it can be pressed.
// It opens 120ms after the pointer rests on the mark or the mark takes focus, and closes 220ms after
// the pointer leaves both, so passing over a chart doesn't flicker cards. It opens beside the mark
// itself, not the chart. On a touch screen a tap opens it and a tap anywhere else closes it. From
// the keyboard, Tab from the mark goes into the card when it has an action; Escape closes it and
// focus goes back to the mark. Focus never jumps into it on its own.
//
// Use one only when it adds something the mark doesn't show: a share, a comparison, a label too long
// for the mark, or an action. A card that repeats the mark's own figure is noise.
//
//   <HoverCard title="No access, still listed" lines={["4 people", "12% of everyone"]}
//     action={{ label: "See who", onClick: () => open("off") }}>
//     <rect … />
//   </HoverCard>
//
// For a mark whose own box is far bigger than what the eye reads as the mark (a ring's arc), use
// useHoverIntent on the mark and HoverCardPanel with a small anchor placed where the mark is.

export type HoverCardAction = { label: string; onClick: () => void }
export type HoverCardBody = {
  title?: React.ReactNode
  lines?: React.ReactNode[]
  action?: HoverCardAction
}

/** Open after a short rest, close after a short leave; one timer, so the latest intent wins. */
export function useHoverIntent({ openDelay = 120, closeDelay = 220 }: { openDelay?: number; closeDelay?: number } = {}) {
  const [open, setOpenState] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  const setOpen = useCallback((v: boolean) => {
    clear()
    setOpenState(v)
  }, [])
  const show = useCallback(() => {
    clear()
    timer.current = setTimeout(() => setOpenState(true), openDelay)
  }, [openDelay])
  const hide = useCallback(() => {
    clear()
    timer.current = setTimeout(() => setOpenState(false), closeDelay)
  }, [closeDelay])
  const hold = useCallback(() => clear(), [])
  useEffect(() => clear, [])
  // A touch has no hover: the tap is the intent, so it opens or closes at once.
  const lastPointer = useRef<string>("mouse")
  const bind = {
    onPointerEnter: (e: React.PointerEvent) => {
      lastPointer.current = e.pointerType
      if (e.pointerType !== "touch") show()
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") hide()
    },
    onPointerDown: (e: React.PointerEvent) => {
      lastPointer.current = e.pointerType
    },
    onClick: () => {
      if (lastPointer.current === "touch") setOpen(!open)
    },
    // Focus handed back by the card as it closes is a return, not a new visit: it doesn't reopen it.
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      if (e.currentTarget.dataset.hcReturn) {
        delete e.currentTarget.dataset.hcReturn
        return
      }
      show()
    },
    onBlur: () => hide(),
  }
  return { open, setOpen, show, hide, hold, bind }
}

type PanelProps = HoverCardBody & {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the pointer enters or leaves the card, to keep it open while it is in use. */
  onHold: () => void
  onRelease: () => void
  /** What the card is placed against: the mark, or a small anchor where the mark is. */
  children: React.ReactElement
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  /** Names the card for screen readers when the title is not plain words. */
  label?: string
  className?: string
}

/** The card itself, controlled, placed against its child. */
export function HoverCardPanel({
  open,
  onOpenChange,
  onHold,
  onRelease,
  children,
  title,
  lines,
  action,
  side = "top",
  align = "center",
  label,
  className,
}: PanelProps) {
  const id = useId()
  const anchorRef = useRef<HTMLElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const actionRef = useRef<HTMLButtonElement | null>(null)
  return (
    <Primitive.Root open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <Primitive.Anchor asChild>
        <Slot
          ref={anchorRef as React.Ref<HTMLElement>}
          aria-describedby={open ? id : undefined}
          onKeyDown={(e: React.KeyboardEvent) => {
            // Into the card from the keyboard: only when there is something in it to press.
            if (open && e.key === "Tab" && !e.shiftKey && action) {
              e.preventDefault()
              actionRef.current?.focus()
            }
            if (open && e.key === "Escape") {
              e.stopPropagation()
              onOpenChange(false)
            }
          }}
        >
          {children}
        </Slot>
      </Primitive.Anchor>
      <Primitive.Portal>
        <Primitive.Content
          ref={cardRef}
          id={id}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          aria-label={label ?? (typeof title === "string" ? title : undefined)}
          data-slot="hover-card"
          // It never takes focus on its own: the pointer or the mark keeps it.
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            const back = anchorRef.current
            if (back && cardRef.current?.contains(document.activeElement)) {
              back.dataset.hcReturn = "1"
              back.focus()
            }
          }}
          // A tap on the mark itself is the mark's own toggle, not a tap outside.
          onPointerDownOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault()
          }}
          onPointerEnter={onHold}
          onPointerLeave={(e) => e.pointerType !== "touch" && onRelease()}
          // Focus inside keeps it open (the mark's blur asked to close); leaving it closes it.
          onFocus={onHold}
          onBlur={(e) => {
            if (!cardRef.current?.contains(e.relatedTarget as Node) && e.relatedTarget !== anchorRef.current) onRelease()
          }}
          onKeyDown={(e) => {
            if (e.key === "Tab" && e.shiftKey && document.activeElement === actionRef.current && anchorRef.current) {
              e.preventDefault()
              anchorRef.current.dataset.hcReturn = "1"
              anchorRef.current.focus()
            }
          }}
          className={cn(
            "t-dropdown z-(--z-popover) flex max-w-[min(18rem,calc(100vw-1rem))] min-w-[10rem] flex-col gap-1 rounded-lg border border-edge-hover bg-raised px-3 py-2.5 text-ink shadow-lg outline-none",
            className
          )}
        >
          {title ? <p className="text-xs font-semibold text-ink">{title}</p> : null}
          {lines?.length ? (
            <ul className="flex flex-col gap-0.5 text-xs text-ink-secondary tabular-nums">
              {lines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          ) : null}
          {action ? (
            <button
              ref={actionRef}
              type="button"
              onClick={() => {
                onOpenChange(false)
                action.onClick()
              }}
              className="mt-1 self-start rounded-sm text-xs font-semibold text-ink-action underline-offset-[3px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {action.label}
            </button>
          ) : null}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

type HoverCardProps = HoverCardBody & {
  /** The mark: it opens the card and the card is placed against it. */
  children: React.ReactElement
  side?: PanelProps["side"]
  align?: PanelProps["align"]
  label?: string
  className?: string
  openDelay?: number
  closeDelay?: number
}

export function HoverCard({ children, openDelay, closeDelay, ...body }: HoverCardProps) {
  const h = useHoverIntent({ openDelay, closeDelay })
  return (
    <HoverCardPanel open={h.open} onOpenChange={h.setOpen} onHold={h.hold} onRelease={h.hide} {...body}>
      <Slot {...h.bind}>{children}</Slot>
    </HoverCardPanel>
  )
}
