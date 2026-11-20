"use client"

import { Check, Search } from "lucide-react"
import * as Primitive from "@/lib/menu-primitive"
import { cn } from "@/lib/utils"

// Sales' pick menus (.b-menu: the draft field pickers, the persona switcher)
// and Knowledge's account menu (.menu). A raised panel of items, each a name
// with an optional line under it; the chosen ones on an accent wash.
// - MenuItem: does something and closes.
// - MenuRadioGroup / MenuRadioItem: one answer (closes), like the persona list.
// - MenuCheckboxItem: several answers; the menu stays open while you pick.
// - MenuLabel: a caption at the top; MenuSearch filters long lists in place.
// The menu primitive supplies what Sales' menus lacked: arrow keys, Home and End,
// typeahead, aria-expanded on the opener, and focus back on close.
// Opens and closes with transitions.dev's menu dropdown (05), which is the
// same timing Sales' own menus used.
export const Menu = Primitive.Root
export const MenuTrigger = Primitive.Trigger
export const MenuRadioGroup = Primitive.RadioGroup

type MenuContentProps = React.ComponentProps<typeof Primitive.Content>

export function MenuContent({ className, align = "start", sideOffset = 8, children, ...props }: MenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="menu"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={16}
        className={cn(
          "t-dropdown z-(--z-menu) flex max-h-[min(20.5rem,var(--available-height))] max-w-[min(22rem,calc(100vw-2rem))] min-w-[13.5rem] flex-col gap-0.5 overflow-y-auto",
          // A 1px light along the top edge lifts the panel off the page, as Knowledge's panels do.
          "rounded-xl border border-edge-hover bg-raised p-1 shadow-[var(--shadow-lg),inset_0_1px_0_var(--w06)] outline-none",
          className
        )}
        {...props}
      >
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  )
}

// A row starts at the top: the leading icon and the tick sit on the name's line (h-[1lh]), never
// centred on a name and its description together. The row under the pointer or the keys takes a
// neutral wash; the chosen one keeps a light accent wash and a bolder name.
const itemStyles = [
  "relative flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs text-ink outline-none select-none",
  "transition-[background-color] duration-(--t-fast) ease-out data-highlighted:bg-w06",
  "data-disabled:cursor-not-allowed data-disabled:opacity-[0.38]",
  "[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-ink-secondary",
]

/** A box one line tall, so an icon or a tick sits on the name's line. */
function OnFirstLine({ children }: { children: React.ReactNode }) {
  return <span className="flex h-[1lh] shrink-0 items-center">{children}</span>
}

type ItemText = { children: React.ReactNode; description?: React.ReactNode; leading?: React.ReactNode }

function Lines({ children, description }: ItemText) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex min-w-0 items-center gap-2 font-medium in-data-[state=checked]:font-semibold [&>:first-child]:truncate">{children}</span>
      {/* A description wraps to two lines rather than being cut mid-word. */}
      {description ? <span className="line-clamp-2 text-2xs leading-snug text-ink-secondary">{description}</span> : null}
    </span>
  )
}

type MenuItemProps = Omit<React.ComponentProps<typeof Primitive.Item>, "children"> &
  ItemText & {
    /** Says the action destroys something: the words turn the error ink. */
    danger?: boolean
  }

export function MenuItem({ children, description, leading, danger, className, ...props }: MenuItemProps) {
  return (
    <Primitive.Item className={cn(itemStyles, danger && "text-err-text [&_svg]:text-err-text", className)} {...props}>
      {leading ? <OnFirstLine>{leading}</OnFirstLine> : null}
      <Lines description={description}>{children}</Lines>
    </Primitive.Item>
  )
}

// The tick grows in on the spring and shrinks out: choosing never snaps.
const tick =
  "flex transition-[opacity,scale] duration-(--t-base) ease-(--ease-spring) data-[state=unchecked]:scale-50 data-[state=unchecked]:opacity-0 data-[state=unchecked]:duration-(--t-fast) data-[state=unchecked]:ease-out motion-reduce:transition-none"

const chosen = "data-[state=checked]:bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] data-[state=checked]:data-highlighted:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]"

export function MenuRadioItem({ children, description, leading, className, ...props }: Omit<React.ComponentProps<typeof Primitive.RadioItem>, "children"> & ItemText) {
  return (
    <Primitive.RadioItem className={cn(itemStyles, chosen, className)} {...props}>
      {leading ? <OnFirstLine>{leading}</OnFirstLine> : null}
      <Lines description={description}>{children}</Lines>
      <OnFirstLine>
        <Primitive.ItemIndicator forceMount className={tick}>
          <Check aria-hidden="true" strokeWidth={2.25} className="text-accent-text!" />
        </Primitive.ItemIndicator>
      </OnFirstLine>
    </Primitive.RadioItem>
  )
}

export function MenuCheckboxItem({
  children,
  description,
  leading,
  className,
  onSelect,
  ...props
}: Omit<React.ComponentProps<typeof Primitive.CheckboxItem>, "children"> & ItemText) {
  return (
    <Primitive.CheckboxItem
      className={cn(itemStyles, chosen, className)}
      onSelect={(e) => {
        e.preventDefault() // several answers: stay open
        onSelect?.(e)
      }}
      {...props}
    >
      {leading ? <OnFirstLine>{leading}</OnFirstLine> : null}
      <Lines description={description}>{children}</Lines>
      <OnFirstLine>
        <Primitive.ItemIndicator forceMount className={tick}>
          <Check aria-hidden="true" strokeWidth={2.25} className="text-accent-text!" />
        </Primitive.ItemIndicator>
      </OnFirstLine>
    </Primitive.CheckboxItem>
  )
}

/** The caption at the top of a menu (one per group): capitals are allowed here. */
export function MenuLabel({ className, ...props }: React.ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      className={cn("sticky top-0 z-[1] bg-raised px-2.5 pt-2 pb-1.5 text-2xs font-semibold tracking-[0.06em] text-ink-secondary uppercase", className)}
      {...props}
    />
  )
}

export function MenuSeparator({ className, ...props }: React.ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn("my-1 h-px bg-hairline", className)} {...props} />
}

type MenuSearchProps = { value: string; onValueChange: (value: string) => void; label: string }

/** Filters a long menu in place. You filter the items you render. */
export function MenuSearch({ value, onValueChange, label }: MenuSearchProps) {
  return (
    <div className="sticky top-0 z-[1] bg-raised pb-1">
      <div className="flex items-center gap-2 rounded-lg border border-edge bg-card px-2.5 py-1.5 focus-within:border-brand">
        <Search aria-hidden="true" strokeWidth={2} className="size-3.5 text-ink-quiet" />
        <input
          type="search"
          aria-label={label}
          placeholder={label}
          value={value}
          autoFocus
          onChange={(e) => onValueChange(e.target.value)}
          // Typing belongs to the field; arrow down moves into the items.
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              e.currentTarget.closest('[role="menu"]')?.querySelector<HTMLElement>('[role^="menuitem"]:not([data-disabled])')?.focus()
              return
            }
            if (e.key !== "Escape" && e.key !== "Tab") e.stopPropagation()
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-placeholder"
        />
      </div>
    </div>
  )
}
