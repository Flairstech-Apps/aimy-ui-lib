import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Placeholders shaped like what is coming (Sales' skelCard over each card
// slot, Knowledge's stage skeletons), then a cross-fade to the real thing.
// Motion is transitions.dev's skeleton loader and reveal (14): the bars pulse
// while waiting, and the swap fades and un-blurs over 400ms.

/** One placeholder bar. Size it with classes: h-4 w-2/3, size-8 rounded-pill. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block h-3 rounded-sm bg-w07", className)} />
}

/** A card-shaped placeholder: a tag, a title, two lines and a button. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex min-h-[8.25rem] flex-col gap-2.5 rounded-xl border border-edge bg-card px-4 py-3", className)}>
      <Skeleton className="h-4 w-20 rounded-pill" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="w-1/2" />
      <Skeleton className="w-1/3" />
      <Skeleton className="mt-auto h-7 w-28 rounded-pill" />
    </div>
  )
}

type RevealProps = {
  loading: boolean
  /** What shows while loading, usually SkeletonCard or Skeleton bars. */
  skeleton: React.ReactNode
  /** Names what is loading, for screen readers: "Loading contacts". */
  label: string
  children: React.ReactNode
  className?: string
}

/** Shows the skeleton while loading, then cross-fades to the content. */
export function Reveal({ loading, skeleton, label, children, className }: RevealProps) {
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">(loading ? "loading" : "done")
  const [wasLoading, setWasLoading] = useState(loading)
  const [lifted, setLifted] = useState(false)

  // Follow the loading prop during render (adjusting state when a prop changes).
  if (loading !== wasLoading) {
    setWasLoading(loading)
    setPhase(loading ? "loading" : phase === "loading" ? "revealing" : phase)
    setLifted(false)
  }

  useEffect(() => {
    if (phase !== "revealing") return
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setLifted(true)))
    const dur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--reveal-dur")) || 400
    const t = window.setTimeout(() => {
      setPhase("done")
      setLifted(false)
    }, dur)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [phase])

  const revealed = phase === "done" || (phase === "revealing" && lifted)

  return (
    <div data-slot="reveal" aria-busy={phase === "loading"} className={cn("t-skel", revealed && "is-revealed", className)}>
      {phase !== "done" ? (
        <div
          className={cn("t-skel-skeleton is-pulsing [--pulse-count:infinite]", phase === "loading" && "is-flow")}
          role={phase === "loading" ? "status" : undefined}
          aria-label={phase === "loading" ? label : undefined}
        >
          {skeleton}
        </div>
      ) : null}
      {phase !== "loading" ? <div className="t-skel-content is-flow">{children}</div> : null}
    </div>
  )
}
