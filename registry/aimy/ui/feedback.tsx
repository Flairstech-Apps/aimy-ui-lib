"use client"

import { Check, CircleAlert, LoaderCircle, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/button"
import { toast } from "@/components/toast"
import { reducedMotion, tokenEase, tokenMs } from "@/lib/behaviors"
import { failureMessage } from "@/lib/behaviors-feedback"
import { useActionFeedback } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// What a person sees between pressing and done, the AiMY way: act at once,
// show progress only when it is slow enough to notice, say it worked in a
// word and a tick, and when it didn't, say what failed and what is safe, with
// the way to try again. Confirmation is Undo after the fact (a toast), and a
// typed confirmation only for what can't be taken back: never a plain
// "Are you sure?".

type ActionButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "loading" | "children"> & {
  /** The work. Throw (reject) when it fails. */
  onAction: () => unknown | Promise<unknown>
  /** The verb: "Save changes". */
  children: string
  /** While it works: "Saving". */
  pendingLabel?: string
  /** When it worked: "Saved". */
  successLabel?: string
  /** It saves something (failure words say "save"). */
  save?: boolean
}

/**
 * A button that shows its own progress: a spinner and the pending words if
 * the work is slow, a tick and the success words when it's done, and the
 * failure under it (the button shakes once) with its label back for a retry.
 * Its width holds still through every state.
 */
export function ActionButton({ onAction, children, pendingLabel = "Working", successLabel = "Done", save, className, disabled, ...props }: ActionButtonProps) {
  const fb = useActionFeedback()
  const ref = useRef<HTMLButtonElement>(null)
  // A failure shakes the button once (transitions.dev 12, its own timings).
  useEffect(() => {
    const el = ref.current
    if (fb.status !== "error" || !el || reducedMotion() || typeof el.animate !== "function") return
    const d = tokenMs("--shake-distance", 6)
    el.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(${d}px)` }, { transform: `translateX(${-d}px)` }, { transform: `translateX(${tokenMs("--shake-overshoot", 4)}px)` }, { transform: "translateX(0)" }],
      { duration: tokenMs("--shake-dur-a", 80) * 2 + tokenMs("--shake-dur-b", 60) * 2, easing: tokenEase("--shake-ease") }
    )
  }, [fb.status])
  const labels = [children, `${pendingLabel}…`, successLabel]
  const shown = fb.status === "pending" ? 1 : fb.status === "success" ? 2 : 0
  return (
    <span data-slot="action-button" className="inline-flex flex-col items-start gap-1.5">
      <Button
        ref={ref}
        {...props}
        disabled={disabled}
        aria-busy={fb.status === "pending" || undefined}
        aria-disabled={fb.status === "pending" || undefined}
        onClick={() => {
          if (fb.status === "pending") return
          void fb.run(onAction, { save })
        }}
        className={className}
      >
        {/* Every state (its icon and words) in one cell, centred: the button
            keeps the widest state's width from the start, so it never moves. */}
        <span className="grid justify-items-center">
          {labels.map((l, i) => (
            <span
              key={i}
              aria-hidden={i !== shown}
              className={cn(
                "col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,translate] duration-(--t-fast) ease-out motion-reduce:transition-none",
                i === shown ? "opacity-100" : "pointer-events-none translate-y-0.5 opacity-0"
              )}
            >
              {i === 1 ? <LoaderCircle aria-hidden="true" strokeWidth={2} className={cn(i === shown && "animate-spin motion-reduce:animate-none")} /> : null}
              {i === 2 ? (
                <Check
                  aria-hidden="true"
                  strokeWidth={2.5}
                  className={cn("transition-[scale] duration-(--t-base) ease-(--ease-spring) motion-reduce:transition-none", i === shown ? "scale-100" : "scale-50")}
                />
              ) : null}
              {l}
            </span>
          ))}
        </span>
      </Button>
      <span role="status" className="sr-only">
        {fb.status === "pending" ? `${pendingLabel}…` : fb.status === "success" ? successLabel : ""}
      </span>
      {fb.status === "error" && fb.error ? (
        <span role="alert" className="flex items-start gap-1.5 text-xs text-err-text transition-[opacity,translate] duration-(--t-fast) ease-out starting:-translate-y-0.5 starting:opacity-0">
          <span className="flex h-[1lh] items-center">
            <CircleAlert aria-hidden="true" strokeWidth={2} className="size-3.5" />
          </span>
          {fb.error}
        </span>
      ) : null}
    </span>
  )
}

type SaveStatusProps = {
  status: "idle" | "saving" | "saved" | "failed"
  /** Why it failed, in a sentence. */
  error?: string | null
  onRetry?: () => void
  className?: string
}

/**
 * The quiet line beside something that saves by itself (an optimistic edit,
 * an autosaving form): Saving…, then Saved with a tick, then nothing; or
 * what failed and Try again. Polite live region.
 */
export function SaveStatus({ status, error, onRetry, className }: SaveStatusProps) {
  return (
    <span role="status" data-slot="save-status" data-status={status} className={cn("inline-flex min-h-5 items-center gap-1.5 text-xs", className)}>
      {status === "saving" ? (
        <span key="saving" className="inline-flex items-center gap-1.5 text-ink-secondary transition-opacity duration-(--t-fast) ease-out starting:opacity-0">
          <LoaderCircle aria-hidden="true" strokeWidth={2} className="size-3.5 animate-spin motion-reduce:animate-none" />
          Saving…
        </span>
      ) : status === "saved" ? (
        <span key="saved" className="inline-flex items-center gap-1.5 text-ok-text transition-[opacity] duration-(--t-fast) ease-out starting:opacity-0">
          <Check aria-hidden="true" strokeWidth={2.5} className="size-3.5 transition-[scale] duration-(--t-base) ease-(--ease-spring) starting:scale-50" />
          Saved
        </span>
      ) : status === "failed" ? (
        <span key="failed" className="inline-flex items-center gap-1.5 text-err-text transition-[opacity,translate] duration-(--t-fast) ease-out starting:-translate-y-0.5 starting:opacity-0">
          <CircleAlert aria-hidden="true" strokeWidth={2} className="size-3.5" />
          {error ?? "Couldn't save."}
          {onRetry ? (
            <Button variant="text" size="sm" onClick={onRetry} className="ms-1">
              <RotateCcw aria-hidden="true" strokeWidth={2} />
              Try again
            </Button>
          ) : null}
        </span>
      ) : null}
    </span>
  )
}

type UndoableAction = {
  /** What happened, for the toast: "Archived 3 contacts". */
  title: string
  /** Change what the person sees, now. */
  apply: () => void
  /** Put it back (Undo, or a failed save). */
  revert: () => void
  /** Save it behind. Reject when it didn't save: the change goes back and says why, with Try again. */
  save?: () => Promise<unknown>
  /** A second line for the toast. */
  sub?: string
}

/**
 * The first rung of the confirmation ladder as one call: the change shows at
 * once, a toast says what happened with Undo, and the save runs behind. If
 * the save fails, the change goes back and an error toast offers Try again.
 */
export function useUndoable() {
  return useCallback((a: UndoableAction) => {
    const run = () => {
      a.apply()
      if (!a.save) return
      a.save().catch((e: unknown) => {
        a.revert()
        toast(`Couldn't finish: ${a.title.charAt(0).toLowerCase()}${a.title.slice(1)}`, {
          tone: "err",
          sub: `${failureMessage(e, { save: true })} Nothing changed.`,
          action: { label: "Try again", onClick: run },
        })
      })
    }
    run()
    toast(a.title, { sub: a.sub, onUndo: a.revert })
  }, [])
}
