"use client"

import { Tabs as Primitive } from "radix-ui"
import { createContext, useCallback, useContext, useLayoutEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// Two tab strips the products draw, as one control with two sizes:
// - "page": Sales' view switcher (h2.b-switch): 18px words, a count beside
//   each, the chosen one in the ink with its count in the accent ink, and a
//   2px bar under it.
// - "section": Knowledge's settings tabs (.set2-tabs): 14px, a hairline under
//   the strip, the chosen one with a brand underline.
// A real tablist (Sales' had no roles or keys): arrow keys move between tabs.
// The bar slides with transitions.dev's tabs sliding (16).
type Size = "page" | "section"
const SizeContext = createContext<Size>("section")

type TabsProps = React.ComponentProps<typeof Primitive.Root> & { size?: Size }

export function Tabs({ size = "section", className, ...props }: TabsProps) {
  return (
    <SizeContext.Provider value={size}>
      <Primitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
    </SizeContext.Provider>
  )
}

export function TabsList({ className, children, ...props }: React.ComponentProps<typeof Primitive.List>) {
  const size = useContext(SizeContext)
  const list = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  const place = useCallback(() => {
    const el = list.current?.querySelector<HTMLElement>('[data-state="active"]')
    const b = bar.current
    if (!el || !b) return
    const animate = placed.current
    if (!animate) b.style.transition = "none"
    b.style.transform = `translateX(${el.offsetLeft}px)`
    b.style.width = `${el.offsetWidth}px`
    if (!animate) {
      void b.offsetWidth
      b.style.transition = ""
      placed.current = true
    }
  }, [])

  useLayoutEffect(() => {
    place()
    const el = list.current
    if (!el) return
    const observer = new MutationObserver(place)
    observer.observe(el, { attributes: true, subtree: true, attributeFilter: ["data-state"] })
    const onResize = () => {
      placed.current = false
      place()
    }
    window.addEventListener("resize", onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [place])

  return (
    <Primitive.List
      ref={list}
      data-slot="tabs-list"
      className={cn(
        "relative flex flex-wrap items-end",
        size === "page" ? "gap-4" : "gap-1 border-b border-hairline",
        className
      )}
      {...props}
    >
      {children}
      <span
        ref={bar}
        aria-hidden="true"
        className={cn("t-tabs-pill bottom-0 h-0.5 rounded-pill", size === "page" ? "bg-ink" : "bg-brand")}
      />
    </Primitive.List>
  )
}

type TabProps = React.ComponentProps<typeof Primitive.Trigger> & {
  /** A count beside the label, such as how many records the view holds. */
  count?: number
}

export function Tab({ count, className, children, ...props }: TabProps) {
  const size = useContext(SizeContext)
  return (
    <Primitive.Trigger
      data-slot="tab"
      className={cn(
        "t-tab group/tab inline-flex items-baseline gap-1.5 transition-[color,scale] active:scale-(--press-scale) motion-reduce:active:scale-100",
        size === "page"
          ? "pb-1 text-lg font-medium text-ink-secondary hover:text-ink data-[state=active]:font-bold data-[state=active]:text-ink"
          : "px-3 py-2 text-xs text-ink-quiet hover:text-ink data-[state=active]:font-semibold data-[state=active]:text-ink",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined ? <span className="sr-only">, </span> : null}
      {count !== undefined ? (
        <span
          className={cn(
            "font-medium text-ink-quiet group-data-[state=active]/tab:text-accent-text",
            size === "page" ? "text-xs" : "text-2xs"
          )}
        >
          {count}
        </span>
      ) : null}
    </Primitive.Trigger>
  )
}

export function TabPanel({ className, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Content data-slot="tab-panel" className={cn("outline-none", className)} {...props} />
}
