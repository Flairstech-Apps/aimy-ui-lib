"use client"

import { useSwipeActions } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// A row on a phone that slides to show an action behind it: archive a
// notification, snooze a task. Swipe past half the action's width (or
// flick) to open it, further to run it at once when fullSwipe is on. Never
// the only way: Tab reaches each action, which slides the row open, and
// the same actions belong in the row's menu. Tones are the status grounds,
// so an action reads by its word and colour.

export type SwipeAction = {
  label: string
  icon?: React.ReactNode
  tone?: "ok" | "warn" | "err" | "info"
  onAction: () => void
}

type SwipeRowProps = {
  children: React.ReactNode
  /** Shown on the left, revealed by swiping right. */
  leading?: SwipeAction
  /** Shown on the right, revealed by swiping left. */
  trailing?: SwipeAction
  /** Swiping most of the way runs the action without a second tap. */
  fullSwipe?: boolean
  className?: string
}

const WIDTH = 88

const tones = {
  ok: "bg-ok text-on-status",
  warn: "bg-warn text-on-status",
  err: "bg-err text-on-status",
  info: "bg-brand text-on-status",
}

export function SwipeRow({ children, leading, trailing, fullSwipe, className }: SwipeRowProps) {
  const { ref: rowRef, offset, swiping, open, close } = useSwipeActions({
    leading: leading ? WIDTH : 0,
    trailing: trailing ? WIDTH : 0,
    fullSwipe,
    onAction: (side) => (side === "leading" ? leading : trailing)?.onAction(),
  })
  const action = (a: SwipeAction, side: "leading" | "trailing") => (
    <button
      type="button"
      onFocus={() => open(side)}
      onBlur={(e) => !e.currentTarget.closest("[data-slot=swipe-row]")?.contains(e.relatedTarget as Node) && close()}
      onClick={() => {
        close()
        a.onAction()
      }}
      style={{ width: WIDTH }}
      className={cn("absolute inset-y-0 flex flex-col items-center justify-center gap-1 text-2xs font-semibold [&_svg]:size-4", side === "leading" ? "left-0" : "right-0", tones[a.tone ?? "info"])}
    >
      {a.icon}
      {a.label}
    </button>
  )
  return (
    <div data-slot="swipe-row" className={cn("relative overflow-hidden rounded-lg", className)}>
      {leading ? action(leading, "leading") : null}
      {trailing ? action(trailing, "trailing") : null}
      <div
        ref={rowRef}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn(
          "relative touch-pan-y bg-card",
          !swiping && "transition-transform duration-(--t-slow) ease-(--ease-spring) motion-reduce:transition-none"
        )}
      >
        {children}
      </div>
    </div>
  )
}
