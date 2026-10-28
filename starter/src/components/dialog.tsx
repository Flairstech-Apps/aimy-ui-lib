import { X } from "lucide-react"
import { Dialog as Primitive } from "radix-ui"
import { useState } from "react"
import { Button } from "@/components/button"
import { Field } from "@/components/field"
import { Input } from "@/components/input"
import { cn } from "@/lib/utils"

// A dialog is for the structured moments: an ordered form, or a change with
// consequences that needs a diff and an accept. Not for confirming something
// Undo can take back (act, then toast). Knowledge's settings modal
// (.set2-modal): the card ground with an edge, 10px corners, a 20px title,
// a body that scrolls, and a footer on the raised ground with the actions at
// the end. Radix supplies what the products missed in places: focus moves in
// and is trapped, Escape closes, focus returns, the page behind can't scroll.
// Opens and closes with transitions.dev's modal (06).
export const Dialog = Primitive.Root
export const DialogTrigger = Primitive.Trigger
export const DialogClose = Primitive.Close

type DialogContentProps = {
  title: React.ReactNode
  /** One sentence under the title: what this changes. */
  description?: React.ReactNode
  /** The buttons, end-aligned in the footer. The primary action goes last. */
  footer?: React.ReactNode
  size?: "default" | "wide"
  className?: string
  children?: React.ReactNode
}

export function DialogContent({ title, description, footer, size = "default", className, children }: DialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="t-scrim fixed inset-0 z-(--z-modal) bg-scrim" />
      <div className="pointer-events-none fixed inset-0 z-(--z-modal) grid place-items-center p-6 max-canvas:p-3">
        <Primitive.Content
          data-slot="dialog"
          className={cn(
            "t-modal pointer-events-auto flex max-h-[calc(100dvh-6rem)] w-full flex-col overflow-hidden rounded-lg border border-edge bg-card shadow-xl outline-none",
            size === "wide" ? "max-w-[52rem]" : "max-w-[34rem]",
            className
          )}
        >
          <div className="flex items-start gap-4 px-5 pt-4 pb-3">
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
          {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 text-meta text-ink-secondary">{children}</div> : null}
          {footer ? (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-hairline bg-raised px-5 py-3.5">{footer}</div>
          ) : null}
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  )
}

type TypeToConfirmProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  /** What happens, in one sentence, including what can't be undone. */
  description: React.ReactNode
  /** The word or number to type: "delete", "1,284". Matching ignores case, spaces and commas. */
  word: string
  /** The destructive action, named: "Delete 1,284 records". */
  actionLabel: string
  onConfirm: () => void
  /** What else this affects, shown above the field. */
  children?: React.ReactNode
}

const loose = (s: string) => s.toLowerCase().replace(/[\s,]/g, "")

/**
 * The last rung of the confirmation ladder, for destructive or governed
 * changes only: the action stays disabled until the word is typed
 * (Knowledge's commit surface and its delete-records modal).
 */
export function TypeToConfirm({ open, onOpenChange, title, description, word, actionLabel, onConfirm, children }: TypeToConfirmProps) {
  const [typed, setTyped] = useState("")
  const ok = loose(typed) === loose(word)
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("")
        onOpenChange(next)
      }}
    >
      <DialogContent
        title={title}
        description={description}
        footer={
          <>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              variant="err"
              disabled={!ok}
              onClick={() => {
                onConfirm()
                setTyped("")
                onOpenChange(false)
              }}
            >
              {actionLabel}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {children}
          <Field label={`Type ${word} to confirm`}>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
          </Field>
        </div>
      </DialogContent>
    </Dialog>
  )
}
