import { cn } from "@/lib/utils"

// Sales' story of a contact (.b-story-line, bdr.js storyOf): the moments that got someone where they
// are, read left to right. Every step before the last has happened, so its dot is filled in the tone
// of how it went and joined to the next by a line you can see. The last step is where they stand
// now: an open ring in its tone with a halo, the shape a stepper or a git log uses for the point
// still moving. A long story keeps its first step and its last ones, with the stretch between them
// said in words on a dashed line ("3 steps more"), because a chain longer than the eye can hold is a
// list again. The chain wraps rather than scrolls. For one record's full history, use Timeline.
//
//   <Journey label="How Dana got here" steps={[
//     { label: "Already a contact", detail: "from the start" },
//     { label: "First called", detail: "11 Jul · Engy" },
//     { label: "Callback", detail: "24 Oct", tone: "warn" },
//     { label: "Answered", detail: "12 Nov", tone: "ok" },
//   ]} />

export type JourneyTone = "ok" | "warn" | "err" | "neutral"
export type JourneyStep = {
  label: string
  /** When, and by whom: "11 Jul · Engy". */
  detail?: React.ReactNode
  tone?: JourneyTone
}

type JourneyProps = {
  steps: JourneyStep[]
  /** Names the story for screen readers: "How Dana got here". */
  label: string
  /** At most this many steps are drawn: the first, the stretch between said in words, and the last ones. */
  max?: number
  className?: string
}

type Shown = JourneyStep & { gap?: boolean }

/** Sales' storyTrim: the first step, the hidden stretch in words, and the last max - 2. */
export function trimJourney(steps: JourneyStep[], max = 6): Shown[] {
  if (steps.length <= max || max < 3) return steps
  const tail = max - 2
  // Always two or more: a story one step over max hides two, since the gap takes a place itself.
  const hidden = steps.length - 1 - tail
  return [
    steps[0] as JourneyStep,
    { label: "⋯", detail: `${hidden} steps more`, gap: true },
    ...steps.slice(-tail),
  ]
}

export function Journey({ steps, label, max = 6, className }: JourneyProps) {
  const shown = trimJourney(steps, max)
  return (
    <ol className={cn("jr", className)} aria-label={label} data-slot="journey">
      {shown.map((s, i) => {
        const now = i === shown.length - 1
        return (
          <li
            key={`${s.label}-${i}`}
            className={cn("jr-step", now && "is-now", s.gap && "is-gap")}
            aria-current={now ? "step" : undefined}
          >
            <span className={cn("jr-dot", `tone-${s.tone ?? "neutral"}`)} aria-hidden="true" />
            <span className="jr-label">{s.gap ? <span aria-hidden="true">{s.label}</span> : s.label}</span>
            {s.detail ? <span className="jr-detail">{s.detail}</span> : null}
          </li>
        )
      })}
    </ol>
  )
}
