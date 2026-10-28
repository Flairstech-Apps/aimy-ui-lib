import { AimyMark } from "@/components/aimy-mark"
import type { EntryMode } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// An action that says how it behaves (doctrine §3). The mode is required, so
// an unclassified action does not compile: the doctrine's "classification is
// mandatory" in TypeScript.
//
//   direct       completes in place and offers Undo        primary
//   review       shows a proposal: Accept, Edit, Reject     secondary
//   investigate  opens the canvas and starts                tertiary
//   prompt       stages a question; you send it             tertiary
//
// Sales' three tiers, Nour's choice (28 Oct, sales.css:497): the modes keep
// their meaning and lose their colours, because five tints all saying "press
// me" is the same as none. One direct action per surface. Pass `aimy` when
// AiMY carries the action out, and its mark leads the label (Knowledge's
// AI_EXIT: compare, find a successor, connect).
//
//   <EntryAction mode="direct" onClick={archive}>Archive it</EntryAction>
//   <EntryAction mode="investigate" aimy onClick={compare}>Compare</EntryAction>

type EntryActionProps = React.ComponentProps<"button"> & {
  mode: EntryMode
  /** AiMY carries the action out: its mark leads the label. */
  aimy?: boolean
  /** A Lucide icon before the label, when the action has one. */
  icon?: React.ReactNode
}

export function EntryAction({ mode, aimy, icon, className, children, type, ...props }: EntryActionProps) {
  return (
    <button
      type={type ?? "button"}
      data-slot="entry-action"
      data-entry-mode={mode}
      className={cn("entry-action", `em-${mode}`, className)}
      {...props}
    >
      {aimy ? <AimyMark title="" className="size-3.5" /> : icon}
      {children}
    </button>
  )
}
