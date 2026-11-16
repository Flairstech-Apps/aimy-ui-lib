"use client"

// AiMY's menu primitive (a menu button's menu). Opens from its trigger by
// press, Enter, Space or the arrows; inside, the arrows, Home and End move,
// letters type ahead, Enter or Space chooses; Escape, Tab or a press outside
// closes and focus goes back to the trigger. Same parts and props as the
// Radix dropdown menu it replaces (Root, Trigger, Portal, Content, Item,
// CheckboxItem, RadioGroup, RadioItem, ItemIndicator, Label, Separator,
// Group) and the same data-state, data-highlighted and data-disabled hooks.

import { type ComponentProps, type ReactNode, type RefCallback, createContext, use, useCallback, useEffect, useId, useRef, useState } from "react"
import { focus } from "./behaviors-focus"
import { type Align, type OutsideEvent, type Side } from "./behaviors-layers"
import {
  Portal as BodyPortal,
  Slot,
  afterCommit,
  composeRefs,
  useControllable,
  useHideOthers,
  useCallbackRef,
  useLayer,
  usePresence,
  useTypeahead,
} from "./behaviors-react"
import { PopperContent } from "./popper-primitive"

type Ctx = {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean
  present: boolean
  presenceRef: RefCallback<HTMLElement>
  ids: { trigger: string; content: string }
  trigger: HTMLElement | null
  setTrigger: (el: HTMLElement | null) => void
  /** Which item to focus when the menu opens. */
  getEntry: () => Entry
  setEntry: (e: Entry) => void
}

type Entry = "first" | "last" | "content"

const MenuContext = createContext<Ctx | null>(null)
function useMenu(part: string) {
  const ctx = use(MenuContext)
  if (!ctx) throw new Error(`Menu.${part} must be inside Menu.Root`)
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
  dir?: "ltr" | "rtl"
  children?: ReactNode
}) {
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange })
  const { present, ref } = usePresence(open)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const id = useId()
  const entry = useRef<Entry>("content")
  const getEntry = useCallback(() => entry.current, [])
  const setEntry = useCallback((e: Entry) => {
    entry.current = e
  }, [])
  return (
    <MenuContext
      value={{ open, setOpen, modal, present, presenceRef: ref, ids: { trigger: `${id}-trigger`, content: `${id}-menu` }, trigger, setTrigger, getEntry, setEntry }}
    >
      {children}
    </MenuContext>
  )
}

export function Trigger({ asChild, ref, onPointerDown, onClick, onKeyDown, disabled, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const m = useMenu("Trigger")
  const byPointer = useRef(false)
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      type={asChild ? undefined : "button"}
      id={m.ids.trigger}
      aria-haspopup="menu"
      aria-expanded={m.open}
      aria-controls={m.open ? m.ids.content : undefined}
      data-state={m.open ? "open" : "closed"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      {...props}
      ref={composeRefs(ref, m.setTrigger as RefCallback<HTMLButtonElement>)}
      // A mouse opens on press, like a native menu button; anything that
      // only clicks (a screen reader, a test) opens on click.
      onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e)
        if (disabled || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.pointerType !== "mouse") return
        byPointer.current = true
        m.setEntry("content")
        m.setOpen(!m.open)
        if (!m.open) e.preventDefault() // keep focus off the trigger so it moves into the menu
      }}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (byPointer.current) {
          byPointer.current = false
          return
        }
        if (disabled || e.defaultPrevented) return
        m.setEntry(e.detail === 0 ? "first" : "content")
        m.setOpen(!m.open)
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e)
        if (disabled || e.defaultPrevented) return
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault()
          m.setEntry(e.key === "ArrowUp" ? "last" : "first")
          m.setOpen(true)
        }
      }}
    />
  )
}

export function Portal({ children, container, forceMount }: { children?: ReactNode; container?: Element | null; forceMount?: boolean }) {
  const m = useMenu("Portal")
  if (!m.present && !forceMount) return null
  return <BodyPortal container={container}>{children}</BodyPortal>
}

const ITEM = '[role^="menuitem"]:not([data-disabled])'
const items = (menu: HTMLElement) => Array.from(menu.querySelectorAll<HTMLElement>(ITEM)).filter((el) => el.closest('[role="menu"]') === menu)

type ContentProps = Omit<ComponentProps<"div">, "dir"> & {
  asChild?: boolean
  forceMount?: boolean
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  avoidCollisions?: boolean
  loop?: boolean
  onCloseAutoFocus?: (e: Event) => void
  onEscapeKeyDown?: (e: KeyboardEvent) => void
  onPointerDownOutside?: (e: OutsideEvent) => void
  onInteractOutside?: (e: OutsideEvent) => void
}

export function Content({
  asChild,
  forceMount,
  side = "bottom",
  align = "start",
  sideOffset = 0,
  alignOffset = 0,
  collisionPadding = 0,
  avoidCollisions = true,
  loop = false,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  onKeyDown,
  ref,
  ...props
}: ContentProps) {
  const m = useMenu("Content")
  const [el, setEl] = useState<HTMLElement | null>(null)
  const active = m.open && !!el
  const closeFocus = useCallbackRef(onCloseAutoFocus)

  useLayer(el, active, {
    onDismiss: () => m.setOpen(false),
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    branches: () => [m.trigger],
  })
  useHideOthers(el, active && m.modal)

  // Into the menu on open; back to the trigger on close.
  const { trigger, getEntry } = m
  useEffect(() => {
    if (!active || !el) return
    if (!el.contains(document.activeElement)) {
      const list = items(el)
      const entry = getEntry()
      const pick = entry === "first" ? list[0] : entry === "last" ? list[list.length - 1] : undefined
      focus(pick ?? el)
    }
    return () => {
      const e = new Event("aimy.focus.unmount", { cancelable: true })
      closeFocus(e)
      if (e.defaultPrevented) return
      const a = document.activeElement
      if (!a || a === document.body || el.contains(a)) afterCommit(() => focus(trigger))
    }
  }, [active, el, trigger, getEntry, closeFocus])

  const typeahead = useTypeahead<HTMLElement>({
    items: () => (el ? items(el) : []),
    text: (i) => i.getAttribute("data-text-value") ?? i.textContent ?? "",
    current: () => (el ? items(el).find((i) => i === document.activeElement) : undefined),
    onMatch: (i) => focus(i),
  })

  if (!m.present && !forceMount) return null
  return (
    <PopperContent
      anchor={m.trigger}
      open={m.present}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      avoidCollisions={avoidCollisions}
      asChild={asChild}
      role="menu"
      id={m.ids.content}
      aria-labelledby={m.ids.trigger}
      aria-orientation="vertical"
      tabIndex={-1}
      data-state={m.open ? "open" : "closed"}
      {...props}
      ref={composeRefs(ref as React.Ref<HTMLElement>, setEl, m.presenceRef)}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e as React.KeyboardEvent<HTMLDivElement>)
        if (e.defaultPrevented || !el) return
        const list = items(el)
        const at = list.indexOf(document.activeElement as HTMLElement)
        const go = (i: number) => focus(list[loop ? (i + list.length) % list.length : Math.max(0, Math.min(list.length - 1, i))])
        const keys: Record<string, () => void> = {
          ArrowDown: () => go(at < 0 ? 0 : at + 1),
          ArrowUp: () => go(at < 0 ? list.length - 1 : at - 1),
          Home: () => go(0),
          End: () => go(list.length - 1),
          Tab: () => m.setOpen(false),
        }
        const fn = keys[e.key]
        if (fn) {
          e.preventDefault()
          fn()
          return
        }
        if ((e.target as HTMLElement).closest("input,textarea")) return
        typeahead.onKeyDown(e.nativeEvent)
      }}
      // The pointer leaving every item puts focus back on the menu, so no item stays lit.
      onPointerLeave={(e: React.PointerEvent<HTMLElement>) => {
        ;(props.onPointerLeave as ((e: React.PointerEvent<HTMLElement>) => void) | undefined)?.(e)
        if (el && items(el).includes(document.activeElement as HTMLElement)) focus(el)
      }}
    />
  )
}

// ── Items ───────────────────────────────────────────────────

type ItemCtx = { checked: boolean | "indeterminate" }
const ItemContext = createContext<ItemCtx>({ checked: false })

type ItemProps = Omit<ComponentProps<"div">, "onSelect"> & {
  asChild?: boolean
  disabled?: boolean
  /** Called when chosen; preventDefault() keeps the menu open. */
  onSelect?: (e: Event) => void
  textValue?: string
}

function useItem({ disabled, onSelect, role, checked }: { disabled?: boolean; onSelect?: (e: Event) => void; role: string; checked?: boolean | "indeterminate" }) {
  const m = useMenu("Item")
  const [lit, setLit] = useState(false)
  const choose = () => {
    if (disabled) return
    const e = new Event("aimy.menu.select", { cancelable: true })
    onSelect?.(e)
    if (!e.defaultPrevented) m.setOpen(false)
  }
  return {
    lit,
    attrs: {
      role,
      tabIndex: -1,
      "aria-disabled": disabled || undefined,
      "aria-checked": checked === undefined ? undefined : checked === "indeterminate" ? ("mixed" as const) : checked,
      "data-disabled": disabled ? "" : undefined,
      "data-highlighted": lit ? "" : undefined,
      "data-state": checked === undefined ? undefined : checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked",
    },
    handlers: {
      onFocus: () => setLit(true),
      onBlur: () => setLit(false),
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        if (disabled || e.pointerType !== "mouse") return
        if (document.activeElement !== e.currentTarget) focus(e.currentTarget)
      },
      onClick: choose,
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          choose()
        }
      },
    },
  }
}

function chain<E>(a?: (e: E) => void, b?: (e: E) => void) {
  return (e: E) => {
    a?.(e)
    if (!(e as { defaultPrevented?: boolean }).defaultPrevented) b?.(e)
  }
}

function ItemBase({
  asChild,
  disabled,
  onSelect,
  textValue,
  role,
  checked,
  ...props
}: ItemProps & { role: string; checked?: boolean | "indeterminate" }) {
  const { attrs, handlers } = useItem({ disabled, onSelect, role, checked })
  const Comp = asChild ? Slot : "div"
  return (
    <ItemContext value={{ checked: checked ?? false }}>
      <Comp
        {...attrs}
        data-text-value={textValue}
        {...props}
        onFocus={chain(props.onFocus as (e: React.FocusEvent) => void, handlers.onFocus)}
        onBlur={chain(props.onBlur as (e: React.FocusEvent) => void, handlers.onBlur)}
        onPointerMove={chain(props.onPointerMove as (e: React.PointerEvent<HTMLElement>) => void, handlers.onPointerMove)}
        onClick={chain(props.onClick as (e: React.MouseEvent) => void, handlers.onClick)}
        onKeyDown={chain(props.onKeyDown as (e: React.KeyboardEvent<HTMLElement>) => void, handlers.onKeyDown)}
      />
    </ItemContext>
  )
}

export function Item(props: ItemProps) {
  return <ItemBase {...props} role="menuitem" />
}

export function CheckboxItem({
  checked = false,
  onCheckedChange,
  onSelect,
  ...props
}: ItemProps & { checked?: boolean | "indeterminate"; onCheckedChange?: (checked: boolean) => void }) {
  return (
    <ItemBase
      {...props}
      role="menuitemcheckbox"
      checked={checked}
      onSelect={(e) => {
        onCheckedChange?.(checked === "indeterminate" ? true : !checked)
        onSelect?.(e)
      }}
    />
  )
}

type RadioCtx = { value?: string; onValueChange?: (v: string) => void }
const RadioContext = createContext<RadioCtx>({})

export function RadioGroup({ value, onValueChange, ...props }: Omit<ComponentProps<"div">, "defaultValue"> & RadioCtx) {
  return (
    <RadioContext value={{ value, onValueChange }}>
      <div role="group" {...props} />
    </RadioContext>
  )
}

export function RadioItem({ value, onSelect, ...props }: ItemProps & { value: string }) {
  const r = use(RadioContext)
  return (
    <ItemBase
      {...props}
      role="menuitemradio"
      checked={r.value === value}
      onSelect={(e) => {
        r.onValueChange?.(value)
        onSelect?.(e)
      }}
    />
  )
}

/** Shows its children only when its item is checked. */
export function ItemIndicator({ children, forceMount, ...props }: ComponentProps<"span"> & { forceMount?: boolean }) {
  const { checked } = use(ItemContext)
  if (!checked && !forceMount) return null
  return (
    <span data-state={checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked"} {...props}>
      {children}
    </span>
  )
}

export function Label({ asChild, ...props }: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return <Comp {...props} />
}

export function Separator(props: ComponentProps<"div">) {
  return <div role="separator" aria-orientation="horizontal" {...props} />
}

export function Group(props: ComponentProps<"div">) {
  return <div role="group" {...props} />
}

export const menuItemSelector = ITEM
