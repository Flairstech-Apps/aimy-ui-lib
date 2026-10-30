"use client"

import { ArrowDown } from "lucide-react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// QA's scroll dot (aimy-scroll.js), opt-in per scrolling area: a translucent
// accent dot in place of the native bar. While the area scrolls the dot
// trails a flame sized by how fast the content moves; 130ms after it stops,
// the flame pulls in and the dot lands with a squash. Drag the dot to scroll;
// with `track`, a click on the empty rail jumps there; with `latest`, a pill
// takes a thread back to its newest message. Driven by scroll events and
// timers, not every frame. Short areas, and areas with less than 8px to
// scroll, show no dot. Reduced motion keeps the dot and drops the flame and
// the landing.
//
//   <ScrollDot className="h-96" label="Messages" latest>{messages}</ScrollDot>

const DOT = 10
const MIN_H = 60
const MIN_ROOM = 8
const EDGE = 6
const PAD_RESPECT = 40
const FLAME_MIN = 12
const FLAME_MAX = 64
const LATEST_AFTER = 120

type ScrollDotProps = {
  /** Names the scrolling area for screen readers, which also makes it reachable with Tab. */
  label?: string
  /** A click on the empty rail scrolls there. */
  track?: boolean
  /** Shows a Latest pill once scrolled up from the end, for threads. */
  latest?: boolean
  /** Sizes the area: give it a height, or put it in a flex column. */
  className?: string
  /** Classes for the scrolling element itself, e.g. its padding. */
  innerClassName?: string
  children: React.ReactNode
}

export function ScrollDot({ label, track, latest, className, innerClassName, children }: ScrollDotProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const tailRef = useRef<HTMLSpanElement>(null)
  const latestRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    const rail = railRef.current
    const head = headRef.current
    const tail = tailRef.current
    if (!el || !rail || !head || !tail) return
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const s = {
      railH: 0,
      y: 0,
      flame: 0,
      lastTop: el.scrollTop,
      lastT: 0,
      moved: false,
      stop: 0,
      drag: null as null | { y: number; top: number },
    }

    const hide = () => {
      rail.classList.add("is-idle")
      latestRef.current?.classList.remove("is-visible")
    }
    const place = () => {
      const room = el.scrollHeight - el.clientHeight
      if (room < MIN_ROOM || !s.railH) return hide()
      rail.classList.remove("is-idle")
      const pill = latestRef.current
      if (pill) {
        const show = room - el.scrollTop > LATEST_AFTER
        pill.classList.toggle("is-visible", show)
        pill.tabIndex = show ? 0 : -1
      }
      s.y = Math.max(0, Math.min(1, el.scrollTop / room)) * (s.railH - DOT)
      head.style.transform = `translateY(${s.y}px)`
    }
    const layout = () => {
      const cs = getComputedStyle(el)
      const padT = parseFloat(cs.paddingTop) || 0
      const padB = parseFloat(cs.paddingBottom) || 0
      const top = padT >= PAD_RESPECT ? padT - 12 : EDGE
      const bottom = padB >= PAD_RESPECT ? padB - 12 : EDGE
      const railH = el.clientHeight - top - bottom
      if (el.clientHeight < MIN_H || railH < DOT * 3) {
        s.railH = 0
        return hide()
      }
      rail.style.top = `${top}px`
      rail.style.height = `${railH}px`
      s.railH = railH
      place()
    }
    const land = () => {
      rail.classList.remove("is-moving")
      s.flame = 0
      tail.style.transform = "scaleY(0)"
      if (calm) return
      rail.classList.remove("is-landing")
      void rail.offsetWidth // restart the bounce if it is still playing
      rail.classList.add("is-landing")
    }
    // The flame follows how fast the content moves, not the dot, so it shows on long areas too.
    const onScroll = () => {
      const now = Date.now()
      place()
      if (!s.railH) return
      const top = el.scrollTop
      if (s.moved && !calm) {
        const d = top - s.lastTop
        const dt = Math.max(16, now - s.lastT)
        if (Math.abs(d) > 0.5) {
          rail.classList.toggle("is-down", d > 0)
          rail.style.setProperty("--land", d > 0 ? "1" : "-1")
          rail.classList.remove("is-landing")
          rail.classList.add("is-moving")
          const want = Math.min(FLAME_MAX, FLAME_MIN + Math.abs(d / dt) * 24)
          s.flame = s.flame ? s.flame * 0.55 + want * 0.45 : want
          tail.style.transform = `scaleY(${(s.flame / FLAME_MAX).toFixed(3)})`
        }
      }
      s.moved = true
      s.lastTop = top
      s.lastT = now
      window.clearTimeout(s.stop)
      s.stop = window.setTimeout(() => {
        s.moved = false
        land()
      }, 130)
    }

    const onDown = (e: PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      s.drag = { y: e.clientY, top: el.scrollTop }
      rail.classList.add("is-dragging")
      head.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!s.drag) return
      const room = el.scrollHeight - el.clientHeight
      el.scrollTop = s.drag.top + ((e.clientY - s.drag.y) * room) / Math.max(1, s.railH - DOT)
    }
    const onEnd = () => {
      s.drag = null
      rail.classList.remove("is-dragging")
    }
    const onRail = (e: PointerEvent) => {
      if (e.target !== rail || !track) return
      const at = (e.clientY - rail.getBoundingClientRect().top) / Math.max(1, s.railH)
      el.scrollTo({ top: at * el.scrollHeight - el.clientHeight / 2, behavior: calm ? "auto" : "smooth" })
    }
    const onAnimEnd = () => rail.classList.remove("is-landing")

    el.addEventListener("scroll", onScroll, { passive: true })
    head.addEventListener("pointerdown", onDown)
    head.addEventListener("pointermove", onMove)
    head.addEventListener("pointerup", onEnd)
    head.addEventListener("pointercancel", onEnd)
    head.addEventListener("lostpointercapture", onEnd)
    rail.addEventListener("pointerdown", onRail)
    rail.addEventListener("animationend", onAnimEnd)
    // The area and its content change size: re-measure.
    const ro = new ResizeObserver(layout)
    ro.observe(el)
    for (const child of Array.from(el.children)) ro.observe(child)
    const mo = new MutationObserver(() => {
      for (const child of Array.from(el.children)) ro.observe(child)
      layout()
    })
    mo.observe(el, { childList: true })
    layout()
    return () => {
      window.clearTimeout(s.stop)
      el.removeEventListener("scroll", onScroll)
      head.removeEventListener("pointerdown", onDown)
      head.removeEventListener("pointermove", onMove)
      head.removeEventListener("pointerup", onEnd)
      head.removeEventListener("pointercancel", onEnd)
      head.removeEventListener("lostpointercapture", onEnd)
      rail.removeEventListener("pointerdown", onRail)
      rail.removeEventListener("animationend", onAnimEnd)
      ro.disconnect()
      mo.disconnect()
    }
  }, [track])

  return (
    <div className={cn("sdot-area", className)} data-slot="scroll-dot">
      <div
        ref={scrollerRef}
        className={cn("sdot-scroller", innerClassName)}
        role={label ? "region" : undefined}
        aria-label={label}
        tabIndex={label ? 0 : undefined}
      >
        {children}
      </div>
      <div ref={railRef} className={cn("aimy-scroll is-idle", track && "has-track")} aria-hidden="true">
        <div ref={headRef} className="aimy-scroll-head">
          <span ref={tailRef} className="aimy-scroll-tail" />
          <span className="aimy-scroll-dot" />
        </div>
      </div>
      {latest ? (
        <button
          ref={latestRef}
          type="button"
          className="aimy-scroll-latest"
          tabIndex={-1}
          aria-label="Jump to the latest message"
          onClick={() => {
            const el = scrollerRef.current
            const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
            el?.scrollTo({ top: el.scrollHeight, behavior: calm ? "auto" : "smooth" })
          }}
        >
          <ArrowDown aria-hidden="true" strokeWidth={2} />
          <span>Latest</span>
        </button>
      ) : null}
    </div>
  )
}
