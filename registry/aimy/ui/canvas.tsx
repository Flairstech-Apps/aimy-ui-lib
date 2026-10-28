"use client"

import { PanelLeft, X } from "lucide-react"
import { Dialog as Primitive } from "radix-ui"
import { useRef } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/sheet"
import type { Basis } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// The AiMY canvas: where a briefing item, a question from the float bar or a
// peek card opens into a full conversation. Both products draw it as
// #aimyOverlay (Knowledge console.html:348, Sales index.html:481): glass over
// the page from under the topbar down, the work still visible behind it
// (the doctrine keeps the backdrop-filter), a chats column, and the thread
// with its composer.
//
// "Based on" names what the conversation is about, so the person can see
// what AiMY is looking at (Knowledge's scope basis, Sales' contact, account
// and campaign). Escape or × closes it and returns focus to where the person
// was; nothing behind it moved. Opens over 400ms and closes over 350ms, the
// panel reveal's clocks (07), as Knowledge does.
//
// Below 900px the chats column becomes a drawer behind a button, as both
// products do.
//
//   <Canvas open={open} onOpenChange={setOpen} basis={["Kestrel Logistics", "Contact"]}
//     chats={<ChatList />} composer={<Composer variant="canvas" onSubmit={ask} />}>
//     {turns.map((t) => <Message key={t.id} … />)}
//   </Canvas>

type CanvasProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The control that opens it (rendered as is). */
  trigger?: React.ReactNode
  /** What the conversation is about, shown as "Based on". */
  basis?: Basis
  /** The list of earlier chats. */
  chats?: React.ReactNode
  /** Usually <Composer variant="canvas" />. */
  composer: React.ReactNode
  /** The accessible name. Sales removed the visible "AiMY Canvas" badge. */
  title?: string
  className?: string
  /** The thread: Messages, Suggestions. */
  children?: React.ReactNode
}

export function Canvas({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  basis,
  chats,
  composer,
  title = "AiMY Canvas",
  className,
  children,
}: CanvasProps) {
  const content = useRef<HTMLDivElement>(null)
  const hasBasis = !!basis?.length
  return (
    <Primitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <Primitive.Trigger asChild>{trigger}</Primitive.Trigger> : null}
      <Primitive.Portal>
        <Primitive.Content
          ref={content}
          data-slot="canvas"
          aria-describedby={undefined}
          // The composer takes focus, not the first button: you came here to ask.
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            content.current
              ?.querySelector<HTMLElement>('[data-slot="composer"] textarea, [data-slot="composer"] input')
              ?.focus()
          }}
          className={cn(
            "aimy-overlay fixed inset-x-0 top-(--topbar-height) bottom-0 z-(--z-modal) flex outline-none",
            className
          )}
        >
          <Primitive.Title className="sr-only">{title}</Primitive.Title>

          {chats ? (
            <aside
              aria-label="Chats"
              className="w-60 shrink-0 overflow-y-auto border-r border-(--glass-border) px-3 py-5 max-column:hidden"
            >
              {chats}
            </aside>
          ) : null}

          <div className="relative flex min-w-0 flex-1 flex-col pb-6">
            {chats ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Show chats"
                    className="overlay-close absolute top-5 left-5 z-1 hidden size-9 place-items-center rounded-lg max-column:grid"
                  >
                    <PanelLeft className="size-4" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" title="Chats" width="w-[min(15rem,100dvw-4rem)]">
                  {chats}
                </SheetContent>
              </Sheet>
            ) : null}

            <Primitive.Close asChild>
              <button
                type="button"
                aria-label="Close the canvas"
                className="overlay-close absolute top-5 right-5 z-1 grid size-9 place-items-center rounded-lg"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </Primitive.Close>

            {hasBasis ? (
              // In the flow, 66px down as the products place it, so the thread
              // starts below it even when the tags wrap to a second line.
              <div className="mx-auto mt-[4.125rem] flex max-w-[calc(100%-8.75rem)] shrink-0 flex-wrap items-center justify-center gap-2">
                <span className="text-2xs font-medium tracking-wider text-ink-secondary uppercase">Based on</span>
                {basis.map((b) => (
                  <span
                    key={b}
                    className="overlay-context-tag rounded-pill px-2 py-0.5 text-2xs font-semibold text-ink-secondary"
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className={cn(
                "flex flex-1 flex-col gap-4 overflow-y-auto px-[max(1.5rem,calc((100%-42rem)/2))] pb-4",
                hasBasis ? "pt-4" : "pt-[5rem]"
              )}
            >
              {children}
            </div>

            {composer}
          </div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}
