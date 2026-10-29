"use client"

import { Check, X } from "lucide-react"
import { useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Button } from "@/components/button"
import { Skeleton } from "@/components/skeleton"
import { ThinkingIndicator } from "@/components/thinking"
import { toast } from "@/components/toast"
import { cn } from "@/lib/utils"

// A change AiMY proposes, shown as a change: Knowledge's editor suggestion
// (knowledge.js:7789). The current wording struck through, the new wording
// after it, and Accept, Edit, Reject. AI never applies silently (doctrine
// §11), and Edit is not optional: it makes the new wording editable in place,
// and Accept then applies what you left there.
//
// Accept files it as a version with AiMY as the author and offers Undo;
// Reject keeps it in the trail. Each says so in a toast, with Knowledge's
// words, and the outcome stays written under the proposal.
//
//   <Suggestion title="Tighten the refund rule" before={old} after={proposed}
//     onAccept={(text, edited) => apply(text, edited)} onUndo={revert} onReject={reject} />

type SuggestionProps = {
  /** What the change is, in the head. Defaults to "AiMY drafted this" when there is no `before`. */
  title?: string
  /** The current wording. Leave out for a new draft. */
  before?: string
  after: string
  /** AiMY is still writing it: the steps it is on, under a placeholder. */
  pending?: boolean
  /** Called with the text to apply, and whether the person edited it. */
  onAccept: (text: string, edited: boolean) => void
  onReject: () => void
  /** Takes an accepted change back. */
  onUndo?: () => void
  className?: string
}

export function Suggestion({ title, before, after, pending, onAccept, onReject, onUndo, className }: SuggestionProps) {
  const [editing, setEditing] = useState(false)
  const [outcome, setOutcome] = useState<"accept" | "reject" | null>(null)
  const ins = useRef<HTMLModElement>(null)
  const head = title ?? (before ? "AiMY proposes a change" : "AiMY drafted this")

  const edit = () => {
    setEditing(true)
    window.setTimeout(() => {
      const el = ins.current
      if (!el) return
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
  }
  const accept = () => {
    const text = (ins.current?.textContent ?? after).trim()
    setEditing(false)
    setOutcome("accept")
    onAccept(text, text !== after.trim())
    toast("Applied", { sub: "Filed as a version with AiMY as the author", onUndo })
  }
  const reject = () => {
    setEditing(false)
    setOutcome("reject")
    onReject()
    toast("Rejected", { sub: "Kept in the trail, not applied" })
  }

  return (
    <div data-slot="suggestion" className={cn("flex max-w-[30rem] flex-col", className)}>
      <div
        className={cn("ai-suggestion", pending ? "is-pending" : "is-proposing")}
        aria-busy={pending || undefined}
        role="group"
        aria-label={head}
      >
        <div className="ai-suggestion-head">
          <AimyMark title="" />
          {head}
        </div>
        <div className="ai-suggestion-body">
          {pending ? (
            <div className="ai-suggestion-wait">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
              <ThinkingIndicator
                variant="bare"
                label={["Reading the document", "Drafting the change", "Checking it against the sources"]}
              />
            </div>
          ) : (
            <>
              {before ? (
                <>
                  <del>{before}</del>{" "}
                </>
              ) : null}
              <ins
                ref={ins}
                className={cn(editing && "is-editing")}
                contentEditable={editing}
                suppressContentEditableWarning
                aria-label={editing ? "The proposed wording, editable" : undefined}
              >
                {after}
              </ins>
            </>
          )}
        </div>
        <div className="ai-suggestion-foot">
          <Button variant="brand" size="sm" disabled={pending || !!outcome} onClick={accept}>
            Accept
          </Button>
          <Button size="sm" disabled={pending || !!outcome || editing} onClick={edit}>
            {editing ? "Editing…" : "Edit"}
          </Button>
          <Button size="sm" disabled={pending || !!outcome} onClick={reject}>
            Reject
          </Button>
        </div>
      </div>
      {outcome ? (
        <p className={cn("ai-outcome", outcome === "accept" ? "is-accept" : "is-reject")} role="status">
          {outcome === "accept" ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
          {outcome === "accept" ? "Applied to the document." : "Rejected. Kept in the trail."}
        </p>
      ) : !pending ? (
        <p className="ai-outcome is-reject">Proposed in the document. Not applied.</p>
      ) : null}
    </div>
  )
}
