"use client"

// AiMY's select primitive: a button that opens a list of options and shows
// the chosen one. Opens by press, Enter, Space or the arrows; inside, the
// arrows, Home and End move, letters type ahead, Enter or Space or a click
// chooses; Escape, Tab or a press outside closes and focus goes back. Same
// parts and props as the Radix select it replaces in popper position (Root,
// Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText) and the
// same data-state, data-placeholder and data-highlighted hooks.

import { type ComponentProps, type ReactNode, type RefCallback, createContext, use, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { type Store, createStore } from "./behaviors-core"
import { focus } from "./behaviors-focus"
import { type Align, type OutsideEvent, type Side } from "./behaviors-layers"
import {
  Portal as BodyPortal,
  Slot,
  afterCommit,
  composeRefs,
  useControllable,
  useCallbackRef,
  useIsoLayoutEffect,
  useLayer,
  useMounted,
  usePresence,
  useStore,
  useTypeahead,
} from "./behaviors-react"
import { PopperContent } from "./popper-primitive"

type Labels = { labels: ReadonlyMap<string, ReactNode> }

type Ctx = {
  value: string | undefined
  setValue: (v: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
  present: boolean
  presenceRef: RefCallback<HTMLElement>
  ids: { trigger: string; content: string }
  trigger: HTMLElement | null
  setTrigger: (el: HTMLElement | null) => void
  labels: Store<Labels>
}

const SelectContext = createContext<Ctx | null>(null)
function useSelect(part: string) {
  const ctx = use(SelectContext)
  if (!ctx) throw new Error(`Select.${part} must be inside Select.Root`)
  return ctx
}

export function Root({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled,
  name,
  required,
  children,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  name?: string
  required?: boolean
  dir?: "ltr" | "rtl"
  children?: ReactNode
}) {
  const [value, setValue] = useControllable<string | undefined>({ value: valueProp, defaultValue, onChange: (v) => v !== undefined && onValueChange?.(v) })
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const { present, ref } = usePresence(open)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [labels] = useState(() => createStore<Labels>({ labels: new Map() }))
  const id = useId()
  return (
    <SelectContext
      value={{
        value,
        setValue: (v) => setValue(v),
        open,
        setOpen,
        disabled,
        present,
        presenceRef: ref,
        ids: { trigger: `${id}-trigger`, content: `${id}-listbox` },
        trigger,
        setTrigger,
        labels,
      }}
    >
      {children}
      {name ? <input type="hidden" name={name} value={value ?? ""} required={required} /> : null}
    </SelectContext>
  )
}

export function Trigger({ asChild, ref, onPointerDown, onClick, onKeyDown, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const s = useSelect("Trigger")
  const byPointer = useRef(false)
  const Comp = asChild ? Slot : "button"
  const disabled = s.disabled || props.disabled
  return (
    <Comp
      type={asChild ? undefined : "button"}
      role="combobox"
      id={s.ids.trigger}
      aria-haspopup="listbox"
      aria-expanded={s.open}
      aria-controls={s.open ? s.ids.content : undefined}
      aria-autocomplete="none"
      data-state={s.open ? "open" : "closed"}
      data-placeholder={s.value === undefined || s.value === "" ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      {...props}
      disabled={disabled}
      ref={composeRefs(ref, s.setTrigger as RefCallback<HTMLButtonElement>)}
      onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e)
        if (disabled || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.pointerType !== "mouse") return
        byPointer.current = true
        s.setOpen(!s.open)
        if (!s.open) e.preventDefault()
      }}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (byPointer.current) {
          byPointer.current = false
          return
        }
        if (!disabled && !e.defaultPrevented) s.setOpen(!s.open)
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e)
        if (disabled || e.defaultPrevented) return
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault()
          s.setOpen(true)
        }
      }}
    />
  )
}

/** The chosen option's text, or the placeholder. */
export function Value({ placeholder, ...props }: Omit<ComponentProps<"span">, "children"> & { placeholder?: ReactNode }) {
  const s = useSelect("Value")
  const { labels } = useStore(s.labels)
  // A chosen value shows its option's text (known once the options render,
  // just after hydration); never the placeholder while it waits.
  const chosen = s.value !== undefined && s.value !== ""
  return <span {...props}>{chosen ? labels.get(s.value!) : placeholder}</span>
}

export function Icon({ asChild, ...props }: ComponentProps<"span"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"
  return <Comp aria-hidden="true" {...props} />
}

export function Portal({ children, container }: { children?: ReactNode; container?: Element | null }) {
  const s = useSelect("Portal")
  const mounted = useMounted()
  const [fragment] = useState(() => (typeof document === "undefined" ? null : document.createDocumentFragment()))
  // Closed, the options still render, off the page, so the trigger can show
  // the chosen one's text (after hydration: a portal can't be hydrated).
  if (!s.present) return mounted && fragment ? createPortal(<ClosedContext value>{children}</ClosedContext>, fragment) : null
  return <BodyPortal container={container}>{children}</BodyPortal>
}

const ClosedContext = createContext(false)

const OPTION = '[role="option"]:not([data-disabled])'
const options = (list: HTMLElement) => Array.from(list.querySelectorAll<HTMLElement>(OPTION))

type ContentProps = Omit<ComponentProps<"div">, "dir"> & {
  position?: "popper" | "item-aligned"
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  onCloseAutoFocus?: (e: Event) => void
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  onPointerDownOutside?: (e: OutsideEvent) => void
}

export function Content({
  // Only popper placement is drawn; item-aligned falls back to it.
  position: _position,
  side = "bottom",
  align = "start",
  sideOffset = 0,
  alignOffset = 0,
  collisionPadding = 10,
  avoidCollisions = true,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onKeyDown,
  children,
  ref,
  ...props
}: ContentProps) {
  void _position
  const s = useSelect("Content")
  const closed = use(ClosedContext)
  const [el, setEl] = useState<HTMLElement | null>(null)
  const active = s.open && !!el && !closed
  const closeFocus = useCallbackRef(onCloseAutoFocus)

  useLayer(el, active, { onDismiss: () => s.setOpen(false), onEscapeKeyDown, onPointerDownOutside, branches: () => [s.trigger] })

  useEffect(() => {
    if (!active || !el) return
    const list = options(el)
    const chosen = list.find((o) => o.getAttribute("aria-selected") === "true")
    const target = chosen ?? list[0] ?? el
    focus(target)
    target.scrollIntoView?.({ block: "nearest" })
    return () => {
      const e = new Event("aimy.focus.unmount", { cancelable: true })
      closeFocus(e)
      if (e.defaultPrevented) return
      const a = document.activeElement
      const trigger = s.trigger
      if (!a || a === document.body || el.contains(a)) afterCommit(() => focus(trigger))
    }
  }, [active, el, s.trigger, closeFocus])

  const typeahead = useTypeahead<HTMLElement>({
    items: () => (el ? options(el) : []),
    text: (o) => o.getAttribute("data-text-value") ?? o.textContent ?? "",
    current: () => (el ? options(el).find((o) => o === document.activeElement) : undefined),
    onMatch: (o) => focus(o),
  })

  if (closed) return <>{children}</>
  return (
    <PopperContent
      anchor={s.trigger}
      open={s.present}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      avoidCollisions={avoidCollisions}
      role="listbox"
      id={s.ids.content}
      aria-labelledby={s.ids.trigger}
      tabIndex={-1}
      data-state={s.open ? "open" : "closed"}
      {...props}
      ref={composeRefs(ref as React.Ref<HTMLElement>, setEl, s.presenceRef)}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e as React.KeyboardEvent<HTMLDivElement>)
        if (e.defaultPrevented || !el) return
        const list = options(el)
        const at = list.indexOf(document.activeElement as HTMLElement)
        const go = (i: number) => {
          const o = list[Math.max(0, Math.min(list.length - 1, i))]
          focus(o)
          o?.scrollIntoView?.({ block: "nearest" })
        }
        const keys: Record<string, () => void> = {
          ArrowDown: () => go(at + 1),
          ArrowUp: () => go(at - 1),
          Home: () => go(0),
          End: () => go(list.length - 1),
          PageDown: () => go(at + 10),
          PageUp: () => go(at - 10),
          Tab: () => s.setOpen(false),
        }
        const fn = keys[e.key]
        if (fn && !(e.key === " " && typeahead.active())) {
          e.preventDefault()
          fn()
          return
        }
        typeahead.onKeyDown(e.nativeEvent)
      }}
    >
      {children}
    </PopperContent>
  )
}

export function Viewport({ asChild, ...props }: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return <Comp role="presentation" data-slot="select-viewport" {...props} />
}

type ItemCtx = { value: string }
const ItemContext = createContext<ItemCtx | null>(null)

export function Item({
  value,
  disabled,
  textValue,
  asChild,
  onFocus,
  onBlur,
  onPointerMove,
  onClick,
  onKeyDown,
  ...props
}: ComponentProps<"div"> & { value: string; disabled?: boolean; textValue?: string; asChild?: boolean }) {
  const s = useSelect("Item")
  const closed = use(ClosedContext)
  const [lit, setLit] = useState(false)
  const id = useId()
  const selected = s.value === value
  const choose = () => {
    if (disabled) return
    s.setValue(value)
    s.setOpen(false)
  }
  const Comp = asChild ? Slot : "div"
  return (
    <ItemContext value={{ value }}>
      <Comp
        role={closed ? undefined : "option"}
        id={`${id}-option`}
        aria-selected={closed ? undefined : selected}
        aria-disabled={disabled || undefined}
        tabIndex={closed ? undefined : -1}
        data-state={selected ? "checked" : "unchecked"}
        data-highlighted={lit ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-text-value={textValue}
        {...props}
        onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
          onFocus?.(e)
          setLit(true)
        }}
        onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
          onBlur?.(e)
          setLit(false)
        }}
        onPointerMove={(e: React.PointerEvent<HTMLDivElement>) => {
          onPointerMove?.(e)
          if (!disabled && e.pointerType === "mouse" && document.activeElement !== e.currentTarget) focus(e.currentTarget)
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          onClick?.(e)
          if (!e.defaultPrevented) choose()
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(e)
          if (e.defaultPrevented) return
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            choose()
          }
        }}
      />
    </ItemContext>
  )
}

/** The option's text: what the trigger shows when it is chosen. */
export function ItemText({ children, ...props }: ComponentProps<"span">) {
  const s = useSelect("ItemText")
  const item = use(ItemContext)
  const value = item?.value
  useIsoLayoutEffect(() => {
    if (value === undefined) return
    const prev = s.labels.get().labels
    if (prev.get(value) === children) return
    const next = new Map(prev)
    next.set(value, children)
    s.labels.set({ labels: next })
  })
  return <span {...props}>{children}</span>
}

export const ItemIndicator = ({ children }: { children?: ReactNode }) => {
  const s = useSelect("ItemIndicator")
  const item = use(ItemContext)
  return item && s.value === item.value ? <span aria-hidden="true">{children}</span> : null
}
