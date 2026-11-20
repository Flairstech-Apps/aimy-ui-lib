"use client"

import { Tabs as Primitive } from "radix-ui"
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
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

type TabsProps = React.ComponentProps<typeof Primitive.Root> & {
  size?: Size
  /** Shows the tabs to AiMY under this id (inside an AgentProvider), so it can read which is open and open another. */
  agent?: string
}

export function Tabs({ size = "section", className, agent, ...props }: TabsProps) {
  const [dir, setDir] = useState<"ltr" | "rtl" | undefined>(undefined)
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  // The tabs' names are read from the page each time, so tabs added later are offered too.
  const tabs = () => Array.from(node?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []).filter((t) => t.closest("[data-slot=tabs]") === node)
  const nameOf = (t: HTMLElement) => (t.getAttribute("aria-label") ?? t.textContent ?? "").replace(/\s+/g, " ").trim()
  // Opening a tab the way a press does (Radix opens on pointer down), without moving the person's focus.
  const press = (t: HTMLElement) => t.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }))
  useAgentSurface(
    agent,
    {
      kind: "tabs",
      label: "",
      state: () => {
        const open = tabs().find((t) => t.getAttribute("aria-selected") === "true")
        return { open: open ? nameOf(open) : null, tabs: tabs().map(nameOf) }
      },
      actions: {
        open: {
          description: "Open a tab",
          keywords: "show switch go view",
          get params() {
            return { tab: { type: "string" as const, description: "The tab's name as shown", enum: tabs().map(nameOf) } }
          },
          say: (p) => `opened ${String(p.tab)}`,
          run: (p) => {
            const t = tabs().find((x) => nameOf(x) === p.tab)
            if (!t || t.hasAttribute("disabled")) throw new Error("That tab can't be opened now.")
            const prev = tabs().find((x) => x.getAttribute("aria-selected") === "true")
            press(t)
            return () => void (prev && press(prev))
          },
        },
      },
    },
    node
  )
  return (
    <SizeContext.Provider value={size}>
      <Primitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-4", className)}
        {...props}
        // Radix reads direction only from its own provider; this reads the page's, so the arrow keys
        // follow right to left without one.
        dir={props.dir ?? dir}
        ref={(el: HTMLDivElement | null) => {
          if (el !== node) setNode(el)
          if (el && !props.dir && getComputedStyle(el).direction === "rtl" && dir !== "rtl") setDir("rtl")
        }}
      />
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
    // Also follows each tab's own size (a count that gains a digit, a label that changes, the font
    // arriving). It glides there, so the active tab turning bold mid-slide doesn't cut the slide short.
    let primed = false // the first report is the sizes as they are, not a change
    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (primed) place()
            primed = true
          })
    ro?.observe(el)
    for (const child of el.children) ro?.observe(child)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", onResize)
      ro?.disconnect()
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
