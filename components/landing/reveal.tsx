"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/** Plays transitions.dev's texts reveal on its lines once the block scrolls into view. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    el.setAttribute("data-armed", "")
    // A block already on screen plays at once; the rest wait to scroll into view.
    const frame = requestAnimationFrame(() => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-shown")
    })
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.classList.add("is-shown")
        observer.disconnect()
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])
  return (
    <div ref={ref} className={cn("t-stagger", className)}>
      {children}
    </div>
  )
}

/** One line of a Reveal; i sets its place in the stagger. */
export function Line({ i = 0, children, className }: { i?: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("t-stagger-line", className)} style={{ "--i": i } as React.CSSProperties}>
      {children}
    </div>
  )
}
