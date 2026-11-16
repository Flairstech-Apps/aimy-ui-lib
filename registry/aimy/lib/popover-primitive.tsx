"use client"

// AiMY's popover primitive: a panel tied to a control. Opens beside it and
// flips when there's no room; focus moves in and comes back; Escape, a press
// outside or focus leaving closes it (pressing its own trigger toggles).
// Same parts and props as the Radix popover it replaces (Root, Anchor,
// Trigger, Portal, Content, Close) and the same data-state, data-side and
// data-align hooks.

import { type ComponentProps, type ReactNode, type RefCallback, createContext, use, useEffect, useId, useRef, useState } from "react"
import { focus, tabbables } from "./behaviors-focus"
import { type Align, type OutsideEvent, type Side } from "./behaviors-layers"
import { Portal as BodyPortal, Slot, composeRefs, afterCommit, useCallbackRef, useControllable, useFocusTrap, useHideOthers, useLayer, usePresence } from "./behaviors-react"
import { PopperContent } from "./popper-primitive"

type Ctx = {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean
  present: boolean
  presenceRef: RefCallback<HTMLElement>
  contentId: string
  anchor: HTMLElement | null
  setAnchor: (el: HTMLElement | null) => void
  trigger: HTMLElement | null
  setTrigger: (el: HTMLElement | null) => void
}

const PopoverContext = createContext<Ctx | null>(null)

function usePopover(part: string) {
  const ctx = use(PopoverContext)
  if (!ctx) throw new Error(`Popover.${part} must be inside Popover.Root`)
  return ctx
}

export function Root({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = false,
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
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const contentId = `${useId()}-popover`
  return (
    <PopoverContext value={{ open, setOpen, modal, present, presenceRef: ref, contentId, anchor, setAnchor, trigger, setTrigger }}>
      {children}
    </PopoverContext>
  )
}

/** Positions the panel against something other than the trigger. */
export function Anchor({ asChild, ref, ...props }: ComponentProps<"div"> & { asChild?: boolean }) {
  const p = usePopover("Anchor")
  const Comp = asChild ? Slot : "div"
  return <Comp {...props} ref={composeRefs(ref, p.setAnchor as RefCallback<HTMLDivElement>)} />
}

type ButtonProps = ComponentProps<"button"> & { asChild?: boolean }

export function Trigger({ asChild, onClick, ref, ...props }: ButtonProps) {
  const p = usePopover("Trigger")
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-haspopup="dialog"
      aria-expanded={p.open}
      aria-controls={p.open ? p.contentId : undefined}
      data-state={p.open ? "open" : "closed"}
      {...props}
      ref={composeRefs(ref, p.setTrigger as RefCallback<HTMLButtonElement>)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (!e.defaultPrevented) p.setOpen(!p.open)
      }}
    />
  )
}

export function Portal({ children, container, forceMount }: { children?: ReactNode; container?: Element | null; forceMount?: boolean }) {
  const p = usePopover("Portal")
  if (!p.present && !forceMount) return null
  return <BodyPortal container={container}>{children}</BodyPortal>
}

type ContentProps = Omit<ComponentProps<"div">, "dir"> & {
  asChild?: boolean
  forceMount?: boolean
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  onOpenAutoFocus?: (e: Event) => void
  onCloseAutoFocus?: (e: Event) => void
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  onPointerDownOutside?: (e: OutsideEvent) => void
  onFocusOutside?: (e: OutsideEvent) => void
  onInteractOutside?: (e: OutsideEvent) => void
}

export function Content({
  asChild,
  forceMount,
  side = "bottom",
  align = "center",
  sideOffset = 0,
  alignOffset = 0,
  collisionPadding = 0,
  avoidCollisions = true,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  ref,
  ...props
}: ContentProps) {
  const p = usePopover("Content")
  const [el, setEl] = useState<HTMLElement | null>(null)
  const active = p.open && !!el
  const outsideRef = useRef(false)
  const openFocus = useCallbackRef(onOpenAutoFocus)
  const closeFocus = useCallbackRef(onCloseAutoFocus)

  useLayer(el, active, {
    onDismiss: () => p.setOpen(false),
    onEscapeKeyDown,
    onPointerDownOutside: (e) => {
      onPointerDownOutside?.(e)
      if (!e.defaultPrevented) outsideRef.current = true
    },
    onFocusOutside,
    onInteractOutside,
    // Pressing the trigger toggles it; the trigger's own click does that.
    branches: () => [p.trigger],
    dismissOnFocusOutside: !p.modal,
  })
  useFocusTrap(el, active && p.modal, { onMountFocus: onOpenAutoFocus, onUnmountFocus: onCloseAutoFocus })
  useHideOthers(el, active && p.modal)

  // Not modal: move focus in on open and back to the trigger on close, unless
  // a handler said not to, or the close came from pressing elsewhere.
  useEffect(() => {
    if (!active || p.modal || !el) return
    outsideRef.current = false
    const mount = new Event("aimy.focus.mount", { cancelable: true })
    openFocus(mount)
    if (!mount.defaultPrevented && !el.contains(document.activeElement)) focus(tabbables(el)[0] ?? el)
    return () => {
      const unmount = new Event("aimy.focus.unmount", { cancelable: true })
      closeFocus(unmount)
      if (unmount.defaultPrevented || outsideRef.current) return
      const a = document.activeElement
      const trigger = p.trigger
      if (!a || a === document.body || el.contains(a)) afterCommit(() => focus(trigger))
    }
  }, [active, p.modal, el, p.trigger, openFocus, closeFocus])

  if (!p.present && !forceMount) return null
  return (
    <PopperContent
      anchor={p.anchor ?? p.trigger}
      open={p.present}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      avoidCollisions={avoidCollisions}
      asChild={asChild}
      role="dialog"
      id={p.contentId}
      tabIndex={-1}
      data-state={p.open ? "open" : "closed"}
      {...props}
      ref={composeRefs(ref as React.Ref<HTMLElement>, setEl, p.presenceRef)}
    />
  )
}

export function Close({ asChild, onClick, ...props }: ButtonProps) {
  const p = usePopover("Close")
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      {...props}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (!e.defaultPrevented) p.setOpen(false)
      }}
    />
  )
}
