"use client"

import { Copy, FileText, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/toast"
import type { Rating } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// What a person can do with one answer: Knowledge's .msg-acts
// (knowledge.js:8542). Copy, Retry, the sources it stands on, and a verdict.
// Each one says what happened in a toast, as Knowledge does. Sales has none.
//
// Always shown, in secondary ink, Nour's choice (28 Oct). Knowledge hid the
// row until the answer was hovered and drew it in faint ink, which touch
// screens never reveal and the no-muted-text rule doesn't allow.
//
//   <ResponseActions text={answer} onRetry={ask} sources={3}
//     sourcesOpen={open} onSourcesChange={setOpen} onRate={save} />

type ResponseActionsProps = {
  /** The answer as plain text, for Copy. */
  text: string
  /** Asks the same question again as a new turn. Leave out when the question is unknown. */
  onRetry?: () => void
  /** How many sources the answer stands on. Shows the sources button. */
  sources?: number
  sourcesOpen?: boolean
  onSourcesChange?: (open: boolean) => void
  rating?: Rating
  defaultRating?: Rating
  onRate?: (rating: Rating) => void
  className?: string
}

const act =
  "inline-flex min-h-6 items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-2xs font-semibold text-ink-secondary " +
  "transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-raised hover:text-ink " +
  "aria-pressed:text-ink-action aria-expanded:text-ink-action [&_svg]:size-3.5 [&_svg]:shrink-0"

export function ResponseActions({
  text,
  onRetry,
  sources,
  sourcesOpen,
  onSourcesChange,
  rating,
  defaultRating = null,
  onRate,
  className,
}: ResponseActionsProps) {
  const [inner, setInner] = useState<Rating>(defaultRating)
  const current = rating === undefined ? inner : rating

  const rate = (r: "up" | "down") => {
    const next = current === r ? null : r
    if (rating === undefined) setInner(next)
    onRate?.(next)
    if (next)
      toast(next === "up" ? "Marked useful" : "Marked not useful", {
        sub: "Recorded against this answer, not the conversation",
      })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast("Answer copied", {
        sub: `${text.length.toLocaleString("en-GB")} characters, as plain text`,
      })
    } catch {
      toast("Couldn't copy the answer", { sub: "Select it and press Ctrl+C" })
    }
  }

  return (
    <div
      data-slot="response-actions"
      role="group"
      aria-label="Answer actions"
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      <button type="button" className={act} onClick={copy}>
        <Copy aria-hidden="true" />
        Copy
      </button>
      {onRetry ? (
        <button type="button" className={act} onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Retry
        </button>
      ) : null}
      {sources ? (
        <button
          type="button"
          className={act}
          aria-expanded={!!sourcesOpen}
          onClick={() => onSourcesChange?.(!sourcesOpen)}
        >
          <FileText aria-hidden="true" />
          {sources} {sources === 1 ? "source" : "sources"}
        </button>
      ) : null}
      <span className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className={act}
          aria-pressed={current === "up"}
          aria-label="Useful"
          title="Useful"
          onClick={() => rate("up")}
        >
          <ThumbsUp aria-hidden="true" />
        </button>
        <button
          type="button"
          className={act}
          aria-pressed={current === "down"}
          aria-label="Not useful"
          title="Not useful"
          onClick={() => rate("down")}
        >
          <ThumbsDown aria-hidden="true" />
        </button>
      </span>
    </div>
  )
}
