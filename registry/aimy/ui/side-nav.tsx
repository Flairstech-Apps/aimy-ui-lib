"use client"

import { ChevronRight, PanelLeft } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { useShell } from "@/components/app-shell"
import { Tooltip } from "@/components/tooltip"
import { workStateLabel } from "@/components/work-state"
import type { WorkStateValue } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// The pages of a product, in two forms (Nour, 5 Nov: Sales' is the main one).
//
// variant="sales", the default: Sales' tabs (railNav in bdr.js, bdr.css 111),
// for a product with a few pages. One card at the top of the Rail, a row per
// page with its icon, name and count; the page you are on is the tinted block,
// and it opens to hold AiMY's reading of that page (SideNavRead). Changing page
// closes the old reading while the new one opens. It needs no narrow form of
// its own: the Rail it sits in becomes the drawer.
//
//   <Rail>
//     <SideNav pages={pages} />   // the current page's `read` is a <SideNavRead>
//     <RailDoors>…</RailDoors>
//   </Rail>
//
// variant="qa": QA's left navigation (aimy-rail.js and aimy-rail.css), for a
// product with many pages and nested flows. Its own column, in two forms. Open,
// 272px: each page is a section with its headline figures, the current page
// first in an accent card that says "You're here". Collapsed, 64px: the pages
// as icon squares with count badges and tooltips, the current one first. The
// head's button collapses it and the mark's button opens it again; the choice
// is remembered. Below 1100px of the shell (`breakpoint`) it stays collapsed, and opening
// it brings the open form in as a drawer over a scrim: Escape, the scrim or a
// link closes it, and focus goes back to where it was.
//
//   <AppShell topnav={…} nav={<SideNav variant="qa" title="AiMY" summary="6 insights" pages={pages} />}>

export type SideNavFinding = {
  /** The figure, as it should read: "29", "4/6". */
  fig: React.ReactNode
  /** What the figure counts, in words: "points below target". */
  text: string
  href?: string
  onSelect?: () => void
  /** The finding the page is showing now. */
  active?: boolean
  /** A share from 0 to 1, drawn as a bar under the words. */
  bar?: number
}

export type SideNavPage = {
  id: string
  label: string
  href: string
  /** A Lucide icon, 24 grid at stroke 2. */
  icon: React.ReactNode
  current?: boolean
  /** The page's count: at the end of its row (sales), on the collapsed icon (qa). */
  badge?: React.ReactNode
  /** qa: the collapsed icon's tooltip after the page name: "29 points below target". */
  tip?: string
  /** qa: the page's headline figures, under its name. */
  findings?: SideNavFinding[]
  /** sales: AiMY's reading of the page, shown under it while you are on it. A SideNavRead. */
  read?: React.ReactNode
}

type SideNavProps = {
  /** sales (the default) for a few pages, in the Rail; qa for many pages and nested flows, in its own column. */
  variant?: "sales" | "qa"
  pages: SideNavPage[]
  /** qa: the head's title, in the AI ink beside the mark: "AiMY". */
  title?: string
  /** qa: on the right of the head: "6 insights". */
  summary?: string
  /** qa: on the mark's button when collapsed: the number of insights. */
  count?: React.ReactNode
  /** The navigation's name for screen readers. */
  label?: string
  /** qa: where the open or collapsed choice is kept. */
  storageKey?: string
  /** Called instead of following href, for an app's own router. */
  onNavigate?: (href: string) => void
  /** qa: the shell width, in px, below which it stays collapsed and opens as a drawer. 1100, QA's. */
  breakpoint?: number
  className?: string
}

/**
 * True below the breakpoint of the shell's width (or the window's, outside a
 * shell). Read as an external store, so it is right before the first paint.
 */
function useNarrow(ref: React.RefObject<HTMLElement | null>, breakpoint: number) {
  const host = () => ref.current?.closest<HTMLElement>(".app-shell") ?? document.documentElement
  const subscribe = useCallback(
    (onChange: () => void) => {
      const ro = new ResizeObserver(onChange)
      ro.observe(ref.current?.closest<HTMLElement>(".app-shell") ?? document.documentElement)
      return () => ro.disconnect()
    },
    [ref]
  )
  return useSyncExternalStore(
    subscribe,
    () => host().clientWidth < breakpoint,
    () => false
  )
}

// The open or collapsed choice lives in localStorage, read as an external store
// so the server's render (always open) and the browser's agree.
const PREF_EVENT = "aimy-side-nav-pref"
function readPref(key: string): "open" | "collapsed" {
  try {
    return localStorage.getItem(key) === "collapsed" ? "collapsed" : "open"
  } catch {
    return "open"
  }
}
function usePref(key: string) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange)
    window.addEventListener(PREF_EVENT, onChange)
    return () => {
      window.removeEventListener("storage", onChange)
      window.removeEventListener(PREF_EVENT, onChange)
    }
  }, [])
  const pref = useSyncExternalStore(
    subscribe,
    () => readPref(key),
    () => "open" as const
  )
  const save = (next: "open" | "collapsed") => {
    try {
      localStorage.setItem(key, next)
    } catch {
      // Private windows: nothing is kept, and the choice lasts until the page changes.
    }
    window.dispatchEvent(new Event(PREF_EVENT))
  }
  return [pref, save] as const
}

export function SideNav({ variant = "sales", ...props }: SideNavProps) {
  return variant === "qa" ? <QaSideNav {...props} /> : <SalesSideNav {...props} />
}

/** Sales: a card of tabs, the current one holding AiMY's reading of the page. */
function SalesSideNav({ pages, label = "Pages", onNavigate, className }: Omit<SideNavProps, "variant">) {
  const { setRailOpen } = useShell()
  const follow = (href: string) => (e: React.MouseEvent) => {
    // Every row in the drawer is a way out of it (Sales: railOpen(false) on every move).
    setRailOpen(false)
    if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onNavigate(href)
  }
  return (
    <nav aria-label={label} data-slot="side-nav" data-variant="sales" className={cn("snav-tabs", className)}>
      <ul>
        {pages.map((p) => (
          <li key={p.id} className={cn("snav-tab", p.current && "is-on")}>
            <a
              className="snav-tab-link"
              href={p.href}
              aria-current={p.current ? "page" : undefined}
              onClick={follow(p.href)}
            >
              <span className="snav-tab-icon" aria-hidden="true">
                {p.icon}
              </span>
              <span className="snav-tab-name">{p.label}</span>
              {/* The space keeps "Lists 11" two words for a screen reader; the flex row draws none. */}
              {p.badge != null ? <> <span className="snav-tab-n">{p.badge}</span></> : null}
            </a>
            {/* Every reading stays in the page, shut unless you are on it, so a change of page
                closes one while the next opens (grid rows 0fr to 1fr) instead of jumping. */}
            {p.read ? (
              <div className="snav-tab-read" inert={!p.current}>
                <div className="snav-tab-read-in">
                  <div className="snav-tab-body">{p.read}</div>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}

type SideNavReadProps = {
  /** Where the reading stands; its words are the work state's ("Awaiting you"). */
  state: WorkStateValue
  /** Says the state more specifically, as Sales does: "Reading". */
  label?: string
  /** The state's tone, as Sales paints it. */
  tone?: "err" | "warn" | "ok"
  /** Figures that back the sentence: { val: 4, cap: "steps due this week" }. */
  evidence?: { val: React.ReactNode; cap: string }[]
  /** The one way in, under the sentence: "Show the 5". */
  action?: { label: string; onClick: () => void }
  /** The sentence. Bold the numbers that matter with <b>. */
  children: React.ReactNode
}

/** AiMY's reading of the page you are on (Sales' railReadHtml): its state, a sentence, the figures and a way in. */
export function SideNavRead({ state, label, tone = "warn", evidence, action, children }: SideNavReadProps) {
  return (
    <>
      <p className="snav-read-state" data-tone={tone}>
        {label ?? workStateLabel(state)}
      </p>
      <p className="snav-read-text">{children}</p>
      {evidence?.length ? (
        <ul className="snav-read-evidence">
          {evidence.map((e) => (
            <li key={e.cap} className="snav-read-pill">
              <span className="snav-read-val">{e.val}</span> {e.cap}
            </li>
          ))}
        </ul>
      ) : null}
      {action ? (
        <button type="button" className="snav-read-act" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </>
  )
}

/** QA: its own column, open with each page's figures or collapsed to icons, a drawer when narrow. */
function QaSideNav({
  pages,
  title = "AiMY",
  summary,
  count,
  label = "Pages",
  storageKey = "aimy-side-nav",
  onNavigate,
  breakpoint = 1100,
  className,
}: Omit<SideNavProps, "variant">) {
  const ref = useRef<HTMLElement>(null)
  const narrow = useNarrow(ref, breakpoint)
  const [pref, save] = usePref(storageKey)
  const [drawerWanted, setDrawer] = useState(false)
  // A wide shell has no drawer.
  const drawer = narrow && drawerWanted
  const [entering, setEntering] = useState(false)
  const expandRef = useRef<HTMLButtonElement>(null)
  const collapseRef = useRef<HTMLButtonElement>(null)
  const drawerCollapseRef = useRef<HTMLButtonElement>(null)
  const drawerId = useId()

  const mode = !narrow && pref === "open" ? "open" : "collapsed"
  // The current page leads, in both forms.
  const ordered = [...pages.filter((p) => p.current), ...pages.filter((p) => !p.current)]

  const expand = () => {
    if (narrow) {
      setDrawer(true)
      requestAnimationFrame(() => drawerCollapseRef.current?.focus())
      return
    }
    save("open")
    setEntering(true)
    window.setTimeout(() => setEntering(false), 700)
    requestAnimationFrame(() => collapseRef.current?.focus())
  }

  const closeDrawer = useCallback(() => {
    setDrawer(false)
    requestAnimationFrame(() => expandRef.current?.focus())
  }, [])

  const collapse = () => {
    if (narrow) return closeDrawer()
    save("collapsed")
    requestAnimationFrame(() => expandRef.current?.focus())
  }

  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [drawer, closeDrawer])

  const follow = (href: string) => (e: React.MouseEvent) => {
    if (drawer) setDrawer(false)
    if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onNavigate(href)
  }

  const open = (inDrawer: boolean) => (
    <>
      <div className="snav-head">
        <span className="snav-head-mark" aria-hidden="true">
          <AimyMark title="" />
        </span>
        <span className="snav-head-label">{title}</span>
        {summary ? <span className="snav-head-count">{summary}</span> : null}
        <button
          ref={inDrawer ? drawerCollapseRef : collapseRef}
          type="button"
          className={cn("snav-collapse", !summary && "ml-auto")}
          aria-label={inDrawer ? "Close the pages" : "Collapse the pages"}
          aria-expanded="true"
          aria-controls={inDrawer ? drawerId : undefined}
          onClick={inDrawer ? closeDrawer : collapse}
        >
          <PanelLeft aria-hidden="true" strokeWidth={2} />
        </button>
      </div>
      <ul className="snav-groups">
        {ordered.map((p) => (
          <li key={p.id} className={cn("snav-section", p.current && "is-current")}>
            {p.current ? (
              <div className="snav-section-head" aria-current="page">
                <span className="snav-section-icon" aria-hidden="true">
                  {p.icon}
                </span>
                <span className="snav-section-name">{p.label}</span>
                <span className="snav-here">You&apos;re here</span>
              </div>
            ) : (
              <a className="snav-section-head" href={p.href} onClick={follow(p.href)}>
                <span className="snav-section-icon" aria-hidden="true">
                  {p.icon}
                </span>
                <span className="snav-section-name">{p.label}</span>
                <ChevronRight className="snav-chevron" aria-hidden="true" strokeWidth={2} />
              </a>
            )}
            {p.findings?.length ? (
              <ul className="snav-findings" aria-label={`${p.label} findings`}>
                {p.findings.map((f, i) => {
                  const body = (
                    <>
                      <span className="snav-fig">{f.fig}</span>
                      <span>{f.text}</span>
                      {f.bar != null ? (
                        <span className="snav-bar" aria-hidden="true">
                          <span style={{ width: `${Math.round(Math.max(0, Math.min(1, f.bar)) * 100)}%` }} />
                        </span>
                      ) : null}
                    </>
                  )
                  const cls = cn("snav-finding", f.active && "is-active")
                  return (
                    <li key={i}>
                      {f.href ? (
                        <a className={cls} href={f.href} onClick={follow(f.href)} aria-current={f.active || undefined}>
                          {body}
                        </a>
                      ) : f.onSelect ? (
                        <button type="button" className={cls} onClick={f.onSelect} aria-pressed={f.active}>
                          {body}
                        </button>
                      ) : (
                        <div className={cls}>{body}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <>
      <nav
        ref={ref}
        aria-label={label}
        data-slot="side-nav"
        data-variant="qa"
        data-rail={mode}
        data-narrow={narrow || undefined}
        className={cn("snav", entering && "is-entering", className)}
      >
        <div className="snav-scroll">
          {mode === "open" ? (
            open(false)
          ) : (
            <>
              <button
                ref={expandRef}
                type="button"
                className="snav-expand"
                aria-label={narrow ? "Open the pages" : "Expand the pages"}
                aria-expanded={narrow ? drawer : false}
                aria-controls={narrow ? drawerId : undefined}
                onClick={expand}
              >
                <AimyMark title="" />
                {count != null ? <span className="snav-badge">{count}</span> : null}
              </button>
              {ordered.map((p) => {
                const name = `${p.label}${p.tip ? `: ${p.tip}` : ""}${p.current ? " (you're here)" : ""}`
                return (
                  <Tooltip key={p.id} side="right" content={name}>
                    <a
                      className="snav-icon"
                      href={p.href}
                      aria-label={name}
                      aria-current={p.current ? "page" : undefined}
                      onClick={follow(p.href)}
                    >
                      {p.icon}
                      {p.badge != null ? (
                        <span className="snav-badge" aria-hidden="true">
                          {p.badge}
                        </span>
                      ) : null}
                    </a>
                  </Tooltip>
                )
              })}
            </>
          )}
        </div>
      </nav>
      {narrow ? (
        <>
          <div className={cn("snav-scrim", drawer && "is-open")} onClick={closeDrawer} aria-hidden="true" />
          <div
            id={drawerId}
            role="region"
            aria-label={label}
            className={cn("snav-drawer", drawer && "is-open")}
            inert={!drawer}
          >
            <div className="snav-scroll">{open(true)}</div>
          </div>
        </>
      ) : null}
    </>
  )
}
