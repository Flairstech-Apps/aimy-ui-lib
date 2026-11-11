"use client"

import { Mail, Send } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { Button } from "@/components/button"
import { IconButton } from "@/components/icon-button"
import { Score } from "@/components/score"
import { Tag } from "@/components/tag"
import { cn } from "@/lib/utils"

// One candidate in a grid of cards, the way the Knowledge app's chat lists
// recommended people (Nour's pick, 4 Nov, over ranked rows and a
// why-they-match card). Who they are, the Fit badge, where they work and
// live, two skills and how many more, then View profile, Email and Start
// outreach, the app's own actions. Two across while the grid has room, one
// below (its own width decides, so it works in a reply, a canvas or a page).
//
//   <WidgetFrame icon={<Users />} title="Recommended candidates" meta="Best match first">
//     <CandidateCards candidates={people} onView={open} onEmail={email} onOutreach={outreach} />
//   </WidgetFrame>

export type Candidate = {
  id: string
  name: string
  role?: string
  company?: string
  location?: string
  /** Match out of 100, shown as the Fit badge. */
  match?: number
  skills?: string[]
}

type Actions = {
  onView?: (c: Candidate) => void
  onEmail?: (c: Candidate) => void
  onOutreach?: (c: Candidate) => void
}

type CandidateCardProps = Actions & {
  candidate: Candidate
  /** How many skills to name before "N more". */
  maxSkills?: number
  className?: string
}

export function CandidateCard({ candidate: c, maxSkills = 2, onView, onEmail, onOutreach, className }: CandidateCardProps) {
  const skills = c.skills ?? []
  const rest = skills.length - maxSkills
  return (
    <article
      data-slot="candidate-card"
      aria-label={c.name}
      className={cn(
        // A card on AiMY's see-through bubble, as Sales draws cards in an answer.
        "flex h-full flex-col gap-3 rounded-lg border border-edge bg-card p-3.5 transition-[border-color] duration-(--t-fast) ease-out hover:border-edge-hover",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={c.name} size="md" />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-ink">{c.name}</h4>
          {c.role ? <p className="text-2xs text-ink-secondary">{c.role}</p> : null}
        </div>
        {c.match !== undefined ? <Score value={c.match} label="Fit" /> : null}
      </div>
      {c.company || c.location ? (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-2xs">
          {c.company ? (
            <>
              <dt className="text-ink-secondary">Company</dt>
              <dd className="text-ink">{c.company}</dd>
            </>
          ) : null}
          {c.location ? (
            <>
              <dt className="text-ink-secondary">Location</dt>
              <dd className="text-ink">{c.location}</dd>
            </>
          ) : null}
        </dl>
      ) : null}
      {skills.length ? (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, maxSkills).map((s) => (
            <Tag key={s} tone="info">
              {s}
            </Tag>
          ))}
          {rest > 0 ? <Tag>{`${rest} more`}</Tag> : null}
        </div>
      ) : null}
      {onView || onEmail || onOutreach ? (
        <div className="mt-auto flex flex-wrap gap-2">
          {onView ? (
            <Button size="sm" onClick={() => onView(c)}>
              View profile
            </Button>
          ) : null}
          {onEmail ? (
            <IconButton label={`Email ${c.name}`} size="sm" onClick={() => onEmail(c)}>
              <Mail />
            </IconButton>
          ) : null}
          {onOutreach ? (
            <IconButton label={`Start outreach to ${c.name}`} size="sm" onClick={() => onOutreach(c)}>
              <Send />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

/** The grid: two across while it has room, one below. */
export function CandidateCards({
  candidates,
  maxSkills,
  className,
  ...actions
}: Actions & { candidates: Candidate[]; maxSkills?: number; className?: string }) {
  return (
    <div className={cn("@container", className)}>
      <ul data-slot="candidate-cards" className="grid gap-2.5 @min-[30rem]:grid-cols-2">
        {candidates.map((c) => (
          <li key={c.id}>
            <CandidateCard candidate={c} maxSkills={maxSkills} {...actions} />
          </li>
        ))}
      </ul>
    </div>
  )
}
