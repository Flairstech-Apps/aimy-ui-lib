import { cn } from "@/lib/utils"

// .status-dot and .status-pill. The dot carries real state only (online,
// busy, away, offline), and never alone: StatusPill always says the state in
// words beside it. No pulse: the doctrine forbids pulsing decorative dots.
const DOT = {
  online: "bg-ok",
  busy: "bg-err",
  away: "bg-warn",
  offline: "bg-d500",
} as const

type State = keyof typeof DOT

export function StatusDot({ state, className }: { state: State; className?: string }) {
  return <span data-slot="status-dot" aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-pill", DOT[state], className)} />
}

type StatusPillProps = React.ComponentProps<"span"> & { state: State }

export function StatusPill({ state, className, children, ...props }: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      data-state={state}
      className={cn("inline-flex items-center gap-2 text-xs font-semibold text-ink-secondary", className)}
      {...props}
    >
      <StatusDot state={state} />
      {children}
    </span>
  )
}
