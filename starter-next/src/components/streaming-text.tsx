import { useEffect, useState } from "react"
import { cn, cssDuration } from "@/lib/utils"

// Text that arrives over time. Pass the text so far; each new word resolves
// out of a 1px blur, one every 60ms, with transitions.dev's streaming text
// (30), Nour's choice (28 Oct). Words that arrive faster than that queue and
// catch up; text that was already there when it mounted (an earlier answer
// in the thread) shows at once. Under reduced motion every word just shows.
//
// Knowledge typed characters with a caret and Sales showed answers whole;
// the snippet replaces both. Line breaks in the text are kept.
//
//   <StreamingText text={partial} streaming={!done} />

type StreamingTextProps = {
  text: string
  /** True while more text may still arrive. */
  streaming?: boolean
  className?: string
}

export function StreamingText({ text, streaming = false, className }: StreamingTextProps) {
  const tokens = text.match(/\S+|\s+/g) ?? []
  const count = tokens.filter((t) => /\S/.test(t)).length
  // How many words have resolved. Mounted mid-stream it starts from nothing;
  // mounted with a finished answer it starts complete.
  const [shown, setShown] = useState(() => (streaming ? 0 : count))

  useEffect(() => {
    if (shown >= count) return
    const gap = cssDuration("--stream-gap", 60)
    const t = window.setTimeout(() => setShown((n) => n + 1), gap)
    return () => window.clearTimeout(t)
  }, [shown, count])

  let w = 0
  return (
    <span
      data-slot="streaming-text"
      aria-busy={streaming || shown < count}
      className={cn("whitespace-pre-wrap", className)}
    >
      {tokens.map((t, i) => {
        if (!/\S/.test(t)) return t
        const n = w++
        return (
          <span key={i} className={cn("t-stream-w", n < shown && "is-in")}>
            {t}
          </span>
        )
      })}
    </span>
  )
}
