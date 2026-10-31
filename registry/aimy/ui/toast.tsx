"use client"

import { CircleAlert } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// The confirmation every AiMY action ends with: act at once, then say what
// happened and offer Undo (the confirmation ladder's first rung). Sales'
// toast, Nour's choice (28 Oct): the AiMY mark on a tile, a 14px title, an
// optional second line, Undo after a divider, and an AI-gradient bar that
// counts down. One at a time: a new toast replaces the current one. It stays
// 6s with Undo, 4s without, and waits while hovered or focused. Rises in and
// leaves with transitions.dev's toast (22). Announced through a live region.
//
//   toast("Assigned to Lina", { onUndo: () => assign(was) })
//   toast("Link copied")
//   toast("We couldn't export the report", { tone: "err", sub: "Nothing changed.", action: { label: "Try again", onClick: exportIt } })
//   <Toaster />  (once, at the root of the app)
//
// tone "err" is for an action that failed (AIMY-2979): the alert icon on a
// red tile instead of the mark, a red edge and bar, announced at once, and
// 8s to read it. Say what failed and what is safe; offer the recovery.

type ToastInput = {
  /** A second line: what it means or what happens next. */
  sub?: string
  /** Shows Undo. Restore the state you captured before the action. */
  onUndo?: () => void
  undoLabel?: string
  /** err: an action failed. */
  tone?: "err"
  /** The recovery, in place of Undo: Try again, Try saving again. */
  action?: { label: string; onClick: () => void }
}

type ToastItem = ToastInput & { id: number; title: string }

const life = (t: ToastItem) => (t.tone === "err" ? 8000 : t.onUndo || t.action ? 6000 : 4000)

let current: ToastItem | null = null
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(title: string, options: ToastInput = {}) {
  current = { id: ++seq, title, ...options }
  emit()
  return current.id
}

toast.dismiss = () => {
  current = null
  emit()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

type ToasterProps = {
  /** Distance from the bottom of the window, e.g. above a composer bar. */
  offset?: string
}

export function Toaster({ offset = "1.5rem" }: ToasterProps) {
  const item = useSyncExternalStore(subscribe, () => current, () => null)
  const [shown, setShown] = useState<ToastItem | null>(null)
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const left = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const started = useRef(0)

  const [prevItem, setPrevItem] = useState(item)

  // A new toast replaces the shown one in place; null closes it.
  if (item !== prevItem) {
    setPrevItem(item)
    if (item) {
      setShown(item)
      setOpen(true) // rises in through @starting-style; no frame waiting
    } else {
      setOpen(false)
    }
  }

  // A newly shown toast starts its full life.
  useEffect(() => {
    if (shown) left.current = life(shown)
  }, [shown])

  // Count down, unless hovered or focused.
  useEffect(() => {
    window.clearTimeout(timer.current)
    if (!shown || !open || paused) return
    started.current = Date.now()
    timer.current = window.setTimeout(() => {
      if (current?.id === shown.id) toast.dismiss()
    }, left.current)
    return () => {
      window.clearTimeout(timer.current)
      left.current -= Date.now() - started.current
    }
  }, [shown, open, paused])

  const onClosed = () => {
    if (!open && !current) setShown(null)
  }

  const err = shown?.tone === "err"
  const press = shown?.action ?? (shown?.onUndo ? { label: shown.undoLabel ?? "Undo", onClick: shown.onUndo } : undefined)

  const card = shown ? (
        <div
          key={shown.id}
          onTransitionEnd={(e) => e.target === e.currentTarget && onClosed()}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className={cn(
            "t-toast pointer-events-auto relative flex max-w-[22.5rem] min-w-[16.5rem] items-center gap-2.5 overflow-hidden",
            "rounded-xl border bg-raised px-3.5 py-2.5 shadow-lg",
            err ? "border-err-border" : "border-w10",
            open && "is-open"
          )}
        >
          {err ? (
            <span className="grid size-[1.625rem] shrink-0 place-items-center rounded-md border border-err-border bg-err-bg text-err-text">
              <CircleAlert aria-hidden="true" strokeWidth={2} className="size-3.5" />
            </span>
          ) : (
            <span className="grid size-[1.625rem] shrink-0 place-items-center rounded-md border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]">
              <AimyMark title="" className="size-3.5" />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs leading-snug font-bold text-ink">{shown.title}</span>
            {shown.sub ? <span className="text-xs leading-snug text-ink-secondary">{shown.sub}</span> : null}
          </span>
          {press ? (
            <>
              <span aria-hidden="true" className="h-6 w-px shrink-0 bg-hairline" />
              <button
                type="button"
                onClick={() => {
                  toast.dismiss()
                  press.onClick()
                }}
                className={cn(
                  "min-h-6 shrink-0 rounded-sm text-xs font-bold transition-[color] duration-(--t-fast) ease-out hover:text-ink",
                  err ? "text-err-text" : "text-ai-ink"
                )}
              >
                {press.label}
              </button>
            </>
          ) : null}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2.5px]">
            <span
              key={`${shown.id}-bar`}
              className={cn("aimy-countdown block h-full origin-left", err ? "bg-err" : "bg-[image:var(--ai)]")}
              style={{ animationDuration: `${life(shown)}ms`, animationPlayState: paused || !open ? "paused" : "running" }}
            />
          </span>
        </div>
      ) : null

  // Two live regions that are always there, so either announces reliably:
  // a polite one for confirmations, an assertive one for failures.
  const region = "pointer-events-none fixed inset-x-0 z-(--z-toast) flex justify-center px-4"
  return (
    <>
      <div data-slot="toaster" role="status" aria-live="polite" className={region} style={{ bottom: offset }}>
        {err ? null : card}
      </div>
      <div data-slot="toaster-alert" role="alert" className={region} style={{ bottom: offset }}>
        {err ? card : null}
      </div>
    </>
  )
}
