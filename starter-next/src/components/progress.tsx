import { cn } from "@/lib/utils"

// How much of something is done or used: Knowledge's settings progress bar
// (.set2-prog, 3px) and its usage meters (.set2-us-m, 6px or 8px, brand,
// then warn and err as a limit nears). Always with words beside it, such as
// "1,284 of 2,000 credits"; the bar backs the words up, never replaces them.
type ProgressProps = {
  value: number
  max?: number
  /** "thin" for work in progress, "meter" for usage against a limit. */
  size?: "thin" | "meter" | "large"
  /** Colours a meter by how close it is to the limit: warn from 80%, err from 95%. */
  limit?: boolean
  /** What it measures, for screen readers: "Credits used". */
  label: string
  className?: string
}

export function Progress({ value, max = 100, size = "thin", limit = false, label, className }: ProgressProps) {
  const ratio = Math.min(1, Math.max(0, max > 0 ? value / max : 0))
  const tone = !limit ? "bg-brand" : ratio >= 0.95 ? "bg-err" : ratio >= 0.8 ? "bg-warn" : "bg-brand"
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "overflow-hidden rounded-pill bg-w07",
        size === "thin" ? "h-[3px]" : size === "meter" ? "h-1.5" : "h-2",
        className
      )}
    >
      <div
        className={cn("h-full origin-left rounded-pill transition-[scale] duration-(--t-slow) ease-out motion-reduce:transition-none", tone)}
        style={{ scale: `${ratio} 1` }}
      />
    </div>
  )
}
