"use client"

// AiMY's tooltip primitive: a hint on hover (after a delay) or keyboard
// focus (at once). Moving from one tooltip to the next skips the delay;
// pressing the control, Escape or leaving closes it. Same parts and props as
// the Radix tooltip it replaces (Provider, Root, Trigger, Portal, Content),
// with data-state delayed-open, instant-open or closed for the transition.

import { type ComponentProps, type ReactNode, type RefCallback, createContext, use, useEffect, useId, useRef, useState } from "react"
import { type Align, type OutsideEvent, type Side } from "./behaviors-layers"
import { Portal as BodyPortal, Slot, composeRefs, useControllable, useLatest, useLayer, usePresence } from "./behaviors-react"
import { PopperContent } from "./popper-primitive"

type ProviderCtx = { delay: number; skip: number; closedAt: () => number; markClosed: () => void }
let lastClosed = 0
const ProviderContext = createContext<ProviderCtx>({
  delay: 700,
  skip: 300,
  closedAt: () => lastClosed,
  markClosed: () => {
    lastClosed = performance.now()
  },
})

export function Provider({ delayDuration = 700, skipDelayDuration = 300, children }: { delayDuration?: number; skipDelayDuration?: number; children?: ReactNode }) {
  const closed = useRef(0)
  const closedAt = () => closed.current
  const markClosed = () => {
    closed.current = performance.now()
  }
  return <ProviderContext value={{ delay: delayDuration, skip: skipDelayDuration, closedAt, markClosed }}>{children}</ProviderContext>
}

type Ctx = {
  open: boolean
  kind: "delayed-open" | "instant-open"
  present: boolean
  presenceRef: RefCallback<HTMLElement>
  contentId: string
  trigger: HTMLElement | null
  setTrigger: (el: HTMLElement | null) => void
  show: (instant: boolean) => void
  hide: () => void
}

const TooltipContext = createContext<Ctx | null>(null)
function useTooltip(part: string) {
  const ctx = use(TooltipContext)
  if (!ctx) throw new Error(`Tooltip.${part} must be inside Tooltip.Root`)
  return ctx
}

export function Root({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  children?: ReactNode
}) {
  const provider = use(ProviderContext)
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const [kind, setKind] = useState<"delayed-open" | "instant-open">("delayed-open")
  const { present, ref } = usePresence(open)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const contentId = `${useId()}-tooltip`
  const latest = useLatest({ open, setOpen, provider, delay: delayDuration ?? provider.delay })

  useEffect(() => () => clearTimeout(timer.current), [])

  const show = (instant: boolean) => {
    clearTimeout(timer.current)
    const l = latest.current
    const warm = performance.now() - l.provider.closedAt() < l.provider.skip
    if (instant || warm || l.delay <= 0) {
      setKind(instant || warm ? "instant-open" : "delayed-open")
      l.setOpen(true)
    } else {
      timer.current = setTimeout(() => {
        setKind("delayed-open")
        latest.current.setOpen(true)
      }, l.delay)
    }
  }
  const hide = () => {
    clearTimeout(timer.current)
    if (latest.current.open) latest.current.provider.markClosed()
    latest.current.setOpen(false)
  }

  return (
    <TooltipContext value={{ open, kind, present, presenceRef: ref, contentId, trigger, setTrigger, show, hide }}>{children}</TooltipContext>
  )
}

export function Trigger({ asChild, ref, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, onClick, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const t = useTooltip("Trigger")
  const pressed = useRef(false)
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-describedby={t.open ? t.contentId : undefined}
      data-state={t.open ? t.kind : "closed"}
      {...props}
      ref={composeRefs(ref, t.setTrigger as RefCallback<HTMLButtonElement>)}
      onPointerEnter={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(e)
        if (e.pointerType !== "touch") t.show(false)
      }}
      onPointerLeave={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(e)
        t.hide()
      }}
      onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e)
        pressed.current = true
        t.hide()
      }}
      onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e)
        // Focus from a press is not a request for the hint.
        if (!pressed.current) t.show(true)
        pressed.current = false
      }}
      onBlur={(e: React.FocusEvent<HTMLButtonElement>) => {
        onBlur?.(e)
        t.hide()
      }}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        t.hide()
      }}
    />
  )
}

export function Portal({ children, container }: { children?: ReactNode; container?: Element | null }) {
  const t = useTooltip("Portal")
  if (!t.present) return null
  return <BodyPortal container={container}>{children}</BodyPortal>
}

type ContentProps = Omit<ComponentProps<"div">, "dir"> & {
  asChild?: boolean
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  onPointerDownOutside?: (e: OutsideEvent) => void
}

export function Content({ asChild, side = "top", align = "center", sideOffset = 0, alignOffset = 0, collisionPadding = 0, avoidCollisions = true, onEscapeKeyDown, onPointerDownOutside, ref, ...props }: ContentProps) {
  const t = useTooltip("Content")
  const [el, setEl] = useState<HTMLElement | null>(null)
  useLayer(el, t.open && !!el, { onDismiss: t.hide, onEscapeKeyDown, onPointerDownOutside, branches: () => [t.trigger] })
  if (!t.present) return null
  return (
    <PopperContent
      anchor={t.trigger}
      open={t.present}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      avoidCollisions={avoidCollisions}
      asChild={asChild}
      role="tooltip"
      id={t.contentId}
      data-state={t.open ? t.kind : "closed"}
      {...props}
      ref={composeRefs(ref as React.Ref<HTMLElement>, setEl, t.presenceRef)}
    />
  )
}
