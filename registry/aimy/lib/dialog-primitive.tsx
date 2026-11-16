"use client"

// AiMY's dialog primitive, built on the behaviours: focus moves in and is
// trapped, Escape or a press outside closes (topmost layer only), focus
// returns, the page behind can't scroll and is hidden from screen readers,
// and the panel stays mounted until its close animation ends. Same parts and
// props as the Radix dialog it replaces (Root, Trigger, Portal, Overlay,
// Content, Title, Description, Close), and the same data-state contract the
// transitions.dev adapters read.

import { type ComponentProps, type ReactNode, type RefCallback, createContext, use, useId, useState } from "react"
import { type OutsideEvent } from "./behaviors-layers"
import { Portal as BodyPortal, Slot, composeRefs, useControllable, useFocusTrap, useHideOthers, useIsoLayoutEffect, useLayer, usePresence, useScrollLock } from "./behaviors-react"

type Ctx = {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean
  present: boolean
  presenceRef: RefCallback<HTMLElement>
  ids: { content: string; title: string; description: string }
  trigger: HTMLElement | null
  setTrigger: (el: HTMLElement | null) => void
}

const DialogContext = createContext<Ctx | null>(null)

function useDialog(part: string) {
  const ctx = use(DialogContext)
  if (!ctx) throw new Error(`Dialog.${part} must be inside Dialog.Root`)
  return ctx
}

export function Root({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children?: ReactNode
}) {
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const { present, ref } = usePresence(open)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const id = useId()
  const ids = { content: `${id}-content`, title: `${id}-title`, description: `${id}-description` }
  return (
    <DialogContext value={{ open, setOpen, modal, present, presenceRef: ref, ids, trigger, setTrigger }}>{children}</DialogContext>
  )
}

type ButtonProps = ComponentProps<"button"> & { asChild?: boolean }

export function Trigger({ asChild, onClick, ref, ...props }: ButtonProps) {
  const d = useDialog("Trigger")
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-haspopup="dialog"
      aria-expanded={d.open}
      aria-controls={d.open ? d.ids.content : undefined}
      data-state={d.open ? "open" : "closed"}
      {...props}
      ref={composeRefs(ref, d.setTrigger)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (!e.defaultPrevented) d.setOpen(!d.open)
      }}
    />
  )
}

/** Renders its children into the body while the dialog is open or closing. */
export function Portal({ children, container, forceMount }: { children?: ReactNode; container?: Element | null; forceMount?: boolean }) {
  const d = useDialog("Portal")
  if (!d.present && !forceMount) return null
  return <BodyPortal container={container}>{children}</BodyPortal>
}

export function Overlay({ forceMount, ...props }: ComponentProps<"div"> & { forceMount?: boolean }) {
  const d = useDialog("Overlay")
  if ((!d.present && !forceMount) || !d.modal) return null
  return <div data-state={d.open ? "open" : "closed"} {...props} style={{ pointerEvents: "auto", ...props.style }} />
}

type ContentProps = ComponentProps<"div"> & {
  asChild?: boolean
  forceMount?: boolean
  onOpenAutoFocus?: (e: Event) => void
  onCloseAutoFocus?: (e: Event) => void
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  onPointerDownOutside?: (e: OutsideEvent) => void
  onInteractOutside?: (e: OutsideEvent) => void
}

export function Content({
  asChild,
  forceMount,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  ref,
  ...props
}: ContentProps) {
  const d = useDialog("Content")
  const [el, setEl] = useState<HTMLElement | null>(null)
  const active = d.open && !!el
  useFocusTrap(el, active && d.modal, { onMountFocus: onOpenAutoFocus, onUnmountFocus: onCloseAutoFocus })
  useLayer(el, active, {
    onDismiss: () => d.setOpen(false),
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    branches: () => (d.modal ? [] : [d.trigger]),
  })
  useScrollLock(active && d.modal)
  useHideOthers(el, active && d.modal)

  // Name and describe the dialog only by what is really on the page
  // (an aria-describedby pointing at nothing fails the audit). Passing
  // aria-describedby yourself, even undefined, opts out.
  const ownsDescribedBy = "aria-describedby" in props
  useIsoLayoutEffect(() => {
    if (!el) return
    const has = (id: string) => !!el.ownerDocument.getElementById(id)
    if (has(d.ids.title)) el.setAttribute("aria-labelledby", d.ids.title)
    if (!ownsDescribedBy) {
      if (has(d.ids.description)) el.setAttribute("aria-describedby", d.ids.description)
      else el.removeAttribute("aria-describedby")
    }
  })

  if (!d.present && !forceMount) return null
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      role="dialog"
      id={d.ids.content}
      aria-modal={d.modal || undefined}
      tabIndex={-1}
      data-state={d.open ? "open" : "closed"}
      {...props}
      ref={composeRefs(ref, setEl, d.presenceRef)}
    />
  )
}

export function Title({ asChild, ...props }: ComponentProps<"h2"> & { asChild?: boolean }) {
  const d = useDialog("Title")
  const Comp = asChild ? Slot : "h2"
  return <Comp id={d.ids.title} {...props} />
}

export function Description({ asChild, ...props }: ComponentProps<"p"> & { asChild?: boolean }) {
  const d = useDialog("Description")
  const Comp = asChild ? Slot : "p"
  return <Comp id={d.ids.description} {...props} />
}

export function Close({ asChild, onClick, ...props }: ButtonProps) {
  const d = useDialog("Close")
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      {...props}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (!e.defaultPrevented) d.setOpen(false)
      }}
    />
  )
}
