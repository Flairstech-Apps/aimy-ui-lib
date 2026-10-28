import type { WorkStateValue } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// Where a surfaced item stands, on every item AiMY surfaces (doctrine §2.3):
// six claims, six hues. Sales' pill (sales.css:455), with Sales' words, Nour's
// choice (28 Oct): Found, Suggested, Drafted, Awaiting you, Done, Stopped.
// A pill can say something more specific, as Sales does beside the AiMY mark
// ("Read off the record"), and the doctrine allows "Blocked" for failed and
// "Handled" for completed. Collapsing states is a preservation-of-agency
// violation, so the state itself is always one of the six.
//
//   <WorkState state="staged" />
//   <WorkState state="detected" label="Read off the record" />

const WORDS: Record<WorkStateValue, string> = {
  detected: "Found",
  recommended: "Suggested",
  drafted: "Drafted",
  staged: "Awaiting you",
  completed: "Done",
  failed: "Stopped",
}

export const workStateLabel = (s: WorkStateValue) => WORDS[s]

export function WorkState({ state, label, className }: { state: WorkStateValue; label?: string; className?: string }) {
  return (
    <span data-slot="work-state" data-work-state={state} className={cn("work-state", `ws-${state}`, className)}>
      {label ?? WORDS[state]}
    </span>
  )
}
