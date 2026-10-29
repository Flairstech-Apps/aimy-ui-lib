import { ArrowRight, Check, CircleHelp, Clock, Pen, RefreshCw, TriangleAlert } from "lucide-react"
import type { TrustStatus } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// The trust condition of a source, said on the source itself. Knowledge's
// statusBadge (knowledge.js:207-250): seven statuses it computes from owner,
// use, freshness and agreement, drawn on the tone classes in grounding.css.
// A superseded source is excluded from answers, and the badge says so in
// words, not only in its title. A status a person set by hand carries a dot.
// The design system's five (Verified, Due, Expired, Unverified, Superseded)
// are used by neither product; their tones are what these are drawn in.

const STATUS: Record<TrustStatus, { label: string; tone: string; why: string; Icon: typeof Check }> = {
  current: {
    label: "No issues",
    tone: "ts-verified",
    why: "Owned, in use, matching its source, and nothing disagrees with it.",
    Icon: Check,
  },
  outdated: { label: "Out of date", tone: "ts-expired", why: "The source changed after our copy.", Icon: RefreshCw },
  conflicting: {
    label: "Conflicting",
    tone: "ts-expired",
    why: "It disagrees with another document.",
    Icon: TriangleAlert,
  },
  draft: {
    label: "Draft",
    tone: "ts-due",
    why: "Written but not published. The owner says who wrote it.",
    Icon: Pen,
  },
  unowned: { label: "Unowned", tone: "ts-unverified", why: "Nobody is accountable for it.", Icon: CircleHelp },
  unused: {
    label: "Unused",
    tone: "ts-due",
    why: "Nothing has cited or opened it in three months.",
    Icon: Clock,
  },
  superseded: { label: "Superseded", tone: "ts-superseded", why: "A newer document replaced it.", Icon: ArrowRight },
}

/** The words for a status, for places that need them without the badge. */
export const trustLabel = (s: TrustStatus) => STATUS[s].label

type TrustStateProps = {
  status: TrustStatus
  /** A person set it, rather than AiMY computing it. */
  setByHand?: boolean
  className?: string
}

export function TrustState({ status, setByHand, className }: TrustStateProps) {
  const s = STATUS[status]
  const excluded = status === "superseded"
  return (
    <span
      data-slot="trust-state"
      data-status={status}
      title={(setByHand ? "Set by hand. " : "") + s.why}
      className={cn("trust-state", s.tone, excluded && "is-excluded", setByHand && "is-pinned", className)}
    >
      <s.Icon aria-hidden="true" />
      {s.label}
      {setByHand ? <span className="pin-dot" aria-label="set by hand" role="img" /> : null}
      {excluded ? <span className="ts-excluded">Not in answers</span> : null}
    </span>
  )
}
