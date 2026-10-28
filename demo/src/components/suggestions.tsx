"use client"

import { cn } from "@/lib/utils"

// Questions AiMY offers, one click to ask. Both products draw them as
// .overlay-sugg-chip (ai.css). Openers sit centred in an empty conversation
// (Knowledge's gate and canvas, Sales' canvas); follow-ups sit under an
// answer, in line with the bubble (Knowledge's .msg-follow). They rise in one
// after another: 6px over 500ms, 40ms apart, Knowledge's own entrance.
//
// Write them as the questions a person would ask: "Who is due today?",
// never "Show due items".
//
//   <Suggestions items={["Who is due today?", "What happened yesterday?"]} onPick={ask} />
//   <Suggestions variant="follow" items={next} onPick={ask} />

type SuggestionsProps = {
  items: string[]
  onPick: (question: string) => void
  /** "opener" centred in an empty thread; "follow" under an answer. */
  variant?: "opener" | "follow"
  className?: string
}

export function Suggestions({ items, onPick, variant = "opener", className }: SuggestionsProps) {
  if (!items.length) return null
  return (
    <div
      data-slot="suggestions"
      role="group"
      aria-label={variant === "opener" ? "Questions to start with" : "Ask next"}
      className={cn("flex flex-wrap", variant === "opener" ? "justify-center gap-2 pt-10 pb-5" : "gap-1.5", className)}
    >
      {items.map((q, i) => (
        <button
          key={q}
          type="button"
          className="overlay-sugg-chip aimy-sugg-in"
          style={{ "--i": i } as React.CSSProperties}
          onClick={() => onPick(q)}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
