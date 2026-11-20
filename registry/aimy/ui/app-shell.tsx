"use client"

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react"
import { AmbientBackground } from "@/components/ambient-background"
import { cn } from "@/lib/utils"

// The frame every AiMY product sits in: the topnav across the top, the rail
// on the left, and the page. Knowledge's widths, on the shell's own width:
// the rail is a column above 1040 and a drawer below it (the topnav grows a
// toggle for it), and the products leave the bar for a menu below 900. The
// rail's width is a setting, 320px by default, Sales' width, so the diary and
// Financials doors fit. Escape closes the drawer; opening it moves focus in.
// Behind it all, the products' ambient wash (AmbientBackground); ambient=
// {false} leaves the plain ground.
//
//   <AppShell topnav={<Topnav … />} rail={<Rail>…</Rail>}>
//     <Page><PageHead title="Today" stamp="Read 09:12" />…</Page>
//   </AppShell>

type Shell = { railOpen: boolean; setRailOpen: (open: boolean) => void; hasRail: boolean; railId: string }
const ShellContext = createContext<Shell | null>(null)

/** The shell's rail state, for the topnav's toggle and anything that opens the rail. */
export function useShell() {
  return useContext(ShellContext) ?? { railOpen: false, setRailOpen: () => {}, hasRail: false, railId: "" }
}

type AppShellProps = {
  topnav: React.ReactNode
  /** QA's left navigation (SideNav variant="qa"), before the rail, for many pages and nested flows. It brings its own collapse and drawer. Sales' tabs, the default SideNav, go in the rail instead. */
  nav?: React.ReactNode
  rail?: React.ReactNode
  /** The rail's width as a column, e.g. "17rem". 20rem (320px) by default. */
  railWidth?: string
  /** The products' ambient wash behind the whole shell (AmbientBackground), and the dark ground it is calibrated on. On by default. */
  ambient?: boolean
  className?: string
  children: React.ReactNode
}

export function AppShell({ topnav, nav, rail, railWidth, ambient = true, className, children }: AppShellProps) {
  const railId = useId()
  const [railOpen, setRailOpen] = useState(false)
  const value = useMemo(() => ({ railOpen, setRailOpen, hasRail: !!rail, railId }), [railOpen, rail, railId])
  useEffect(() => {
    if (!railOpen) return
    const onKey = (e: KeyboardEvent) => {
      // A menu, select or dialog open above the drawer takes the Escape; one press closes one layer.
      if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector("[data-aimy-layer]")) setRailOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [railOpen])

  // F6 and Shift+F6 move between the shell's regions (the bar, the side navigation, the rail, the
  // page), as in a browser or an OS window. Focus lands on the region's first control, or the
  // region itself. Nothing is drawn; a dialog or menu open on top keeps the keys.
  const shell = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "F6" || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const root = shell.current
      if (!root || document.querySelector("[data-aimy-layer]")) return
      const regions = Array.from(root.querySelectorAll<HTMLElement>(":scope > .app-topnav, :scope > .app-shell-body > *")).filter(
        (el) => el.getClientRects().length > 0 && !el.hasAttribute("inert") && !el.matches("[aria-hidden=true]")
      )
      if (regions.length < 2) return
      const at = regions.findIndex((r) => r.contains(document.activeElement))
      const next = regions[(at + (e.shiftKey ? -1 : 1) + regions.length) % regions.length]!
      const first = next.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      e.preventDefault()
      if (first) first.focus()
      else {
        if (!next.hasAttribute("tabindex")) next.setAttribute("tabindex", "-1")
        next.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <ShellContext.Provider value={value}>
      <div
        ref={shell}
        className={cn("app-shell", className)}
        style={railWidth ? ({ "--rail-w": railWidth } as React.CSSProperties) : undefined}
        data-slot="app-shell"
      >
        {ambient ? <AmbientBackground /> : null}
        {topnav}
        <div className="app-shell-body">
          {nav}
          {rail}
          <main className="app-main">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  )
}

/** The page's scroll and its measure (72.5rem). */
export function Page({
  centred,
  className,
  children,
}: {
  centred?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="page-scroll" data-slot="page">
      <div className={cn("page-inner", centred && "is-centred", className)}>{children}</div>
    </div>
  )
}

type PageHeadProps = {
  title: React.ReactNode
  /** When it was read, on the right in words. */
  stamp?: React.ReactNode
  /** One line under the title. */
  lead?: React.ReactNode
  /** Controls on the right. */
  actions?: React.ReactNode
}

/** Knowledge's page head: the title, and its stamp and controls on the right. */
export function PageHead({ title, stamp, lead, actions }: PageHeadProps) {
  return (
    <header className="page-head" data-slot="page-head">
      <div className="page-head-row">
        <h1 className="page-title">{title}</h1>
        {stamp || actions ? (
          <div className="page-head-end">
            {stamp ? <span className="page-stamp">{stamp}</span> : null}
            {actions}
          </div>
        ) : null}
      </div>
      {lead ? <p className="page-lead">{lead}</p> : null}
    </header>
  )
}
