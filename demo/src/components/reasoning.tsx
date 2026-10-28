import { Clock } from "lucide-react"
import { Disclosure } from "@/components/disclosure"
import type { ReasoningStep } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// How AiMY got to an answer, folded under it. Knowledge appends this to every
// answer as "How this was answered" (.act-log, knowledge.js:14860): each step
// says what AiMY did and why. Sales does the same for an email draft, "Why
// AiMY wrote it this way" (.b-draft-why). The design system's "Thought for 8s"
// disclosure is used by neither, so this follows the products: steps a
// person can check, not a timer. Opens with the accordion (21).
//
//   <Reasoning steps={[{ what: "Searched 214 documents", why: "Your question named refunds" }]} />

type ReasoningProps = {
  steps: ReasoningStep[]
  /** The fold's label. Sales' drafts use "Why AiMY wrote it this way". */
  summary?: string
  defaultOpen?: boolean
  className?: string
}

export function Reasoning({ steps, summary = "How this was answered", defaultOpen, className }: ReasoningProps) {
  if (!steps.length) return null
  return (
    <Disclosure
      title={
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3" aria-hidden="true" />
          {summary}
        </span>
      }
      defaultOpen={defaultOpen}
      className={cn("text-2xs", className)}
    >
      <ol className="ml-1.5 flex flex-col gap-2 border-l border-hairline pl-3">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col gap-0.5 text-2xs">
            <span className="font-semibold text-ink">{s.what}</span>
            {s.why ? <span className="text-ink-secondary">{s.why}</span> : null}
          </li>
        ))}
      </ol>
    </Disclosure>
  )
}
