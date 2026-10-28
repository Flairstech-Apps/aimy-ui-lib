import { CircleAlert, RotateCcw } from "lucide-react"
import { Button } from "@/components/button"
import { cn } from "@/lib/utils"

// What a surface says when there is nothing to show, and what to do about it.
// Knowledge's .empty-state (a dashed edge around an icon tile, a title, a
// sentence that counts what's there, the way forward) and its settings
// .set2-empty (the same without the edge). Say why it's empty and offer the
// next step: Clear filters, New document.
type EmptyStateProps = {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** The way forward: one or two buttons. */
  actions?: React.ReactNode
  /** A small line under the actions: which file types, how long it takes. */
  fine?: React.ReactNode
  variant?: "dashed" | "plain"
  className?: string
}

export function EmptyState({ icon, title, description, actions, fine, variant = "dashed", className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl bg-card px-8 py-12 text-center",
        variant === "dashed" && "border border-dashed border-w08",
        className
      )}
    >
      {icon ? (
        <span className="grid size-12 place-items-center rounded-xl bg-w05 text-ink-secondary [&_svg]:size-5">{icon}</span>
      ) : null}
      <p className="text-body font-semibold text-ink">{title}</p>
      {description ? <p className="max-w-[20rem] text-meta text-ink-secondary">{description}</p> : null}
      {actions ? <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div> : null}
      {fine ? <p className="text-micro text-ink-quiet">{fine}</p> : null}
    </div>
  )
}

type ErrorStateProps = {
  title?: React.ReactNode
  /** Say what is safe: nothing changed, filters kept. */
  description?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/** Something failed to load (Knowledge's .error-state): what happened, that nothing was lost, and Try again. */
export function ErrorState({
  title = "Couldn't load this",
  description = "Nothing changed. Trying again is safe.",
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--err)_35%,transparent)] bg-card px-8 py-10 text-center",
        className
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-err-bg text-err-text">
        <CircleAlert aria-hidden="true" strokeWidth={2} className="size-5" />
      </span>
      <p className="text-body font-semibold text-ink">{title}</p>
      <p className="max-w-[22rem] text-meta text-ink-secondary">{description}</p>
      {onRetry ? (
        <Button onClick={onRetry} className="mt-1">
          <RotateCcw aria-hidden="true" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
