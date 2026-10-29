import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// A sentence from AiMY on a record or a card, with where it came from: Sales'
// .b-aimy (aimyBlock, bdr.js:5226). The AiMY mark marks it as AiMY's, the
// sentence says one useful thing, the source line says what it is read from
// ("the last call", "your LinkedIn network"), and one control can follow.
// "quiet" sits on a card that already has a tint; "gap" says something is
// missing; "lead" opens a record's About block at body size.
//
//   <AimyNote from="this record’s own history">3 attempts and nobody has picked up. The number may not be the one they answer.</AimyNote>
//   <AimyNote variant="gap" action={<Button size="sm">Fill in what is missing</Button>}>No direct line yet.</AimyNote>

type AimyNoteProps = {
  children: React.ReactNode
  /** What AiMY read this from. Leave out on a board card. */
  from?: string
  /** One control under it. */
  action?: React.ReactNode
  variant?: "default" | "quiet" | "gap" | "lead"
  className?: string
}

export function AimyNote({ children, from, action, variant = "default", className }: AimyNoteProps) {
  return (
    <div data-slot="aimy-note" className={cn("b-aimy", variant !== "default" && `is-${variant}`, className)}>
      <AimyMark title="" className="b-aimy-mark" />
      <span className="b-aimy-say">
        <span className="sr-only">AiMY: </span>
        {children}
        {from ? <span className="b-aimy-from">{from}</span> : null}
        {action ? <span className="b-aimy-act">{action}</span> : null}
      </span>
    </div>
  )
}
