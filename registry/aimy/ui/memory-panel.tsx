"use client"

import { Clock, X } from "lucide-react"
import { Button } from "@/components/button"
import { toast } from "@/components/toast"

// What AiMY is carrying forward into this conversation: Knowledge's memory
// panel (knowledge.js:8523). The last few exchanges from an earlier thread,
// who said what, and the way to decline it. The design system's rule: memory
// the person cannot decline is surveillance, not continuity, so "Answer
// without it" is always there.
//
// Added from scratch (the plan's forgetting control): each line can be
// forgotten on its own, with Undo, so declining is not all or nothing.
//
//   <MemoryPanel age="Yesterday, 16:40" lines={lines} onForget={forget} onDrop={answerWithout} />

export type MemoryLine = { id: string; who: string; what: string }

type MemoryPanelProps = {
  lines: MemoryLine[]
  /** When the earlier thread was: "Yesterday, 16:40". */
  age?: string
  title?: string
  /** Forget one line. Offer it back with onRestore. */
  onForget?: (line: MemoryLine) => void
  onRestore?: (line: MemoryLine) => void
  /** Answer without any of it. */
  onDrop: () => void
  /** Optional: carry it on explicitly (the design system's "Continue this thread"). */
  onContinue?: () => void
}

export function MemoryPanel({
  lines,
  age,
  title = "Carried from an earlier thread",
  onForget,
  onRestore,
  onDrop,
  onContinue,
}: MemoryPanelProps) {
  return (
    <section data-slot="memory-panel" className="memory-panel" aria-label={title}>
      <div className="mem-head">
        <Clock aria-hidden="true" />
        {title}
        {age ? <span className="mem-age">{age}</span> : null}
      </div>
      <ul className="mem-thread">
        {lines.map((l) => (
          <li key={l.id} className="mem-line">
            <span className="mem-who">{l.who}</span>
            <span className="mem-what">{l.what}</span>
            {onForget ? (
              <button
                type="button"
                className="mem-forget"
                aria-label={`Forget: ${l.who} ${l.what}`}
                title="Forget this"
                onClick={() => {
                  onForget(l)
                  toast("Forgotten", {
                    sub: "AiMY won't carry it forward",
                    onUndo: onRestore ? () => onRestore(l) : undefined,
                  })
                }}
              >
                <X aria-hidden="true" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mem-foot">
        {onContinue ? (
          <Button variant="brand" size="sm" onClick={onContinue}>
            Continue this thread
          </Button>
        ) : null}
        <Button size="sm" onClick={onDrop}>
          Answer without it
        </Button>
      </div>
    </section>
  )
}
