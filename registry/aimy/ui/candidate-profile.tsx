"use client"

import { BadgeCheck, Download, Mail, MapPin, Phone, Send, StickyNote } from "lucide-react"
import { useState } from "react"
import { Avatar } from "@/components/avatar"
import { Button } from "@/components/button"
import { Score } from "@/components/score"
import { Tag } from "@/components/tag"
import { cn } from "@/lib/utils"

// One candidate in full, inside the reply, when the question is about them
// (Nour's pick, 4 Nov, over a summary that opens the canvas and tabs). The
// Knowledge app drew its profile in a side panel, always dark, with no
// match; this follows the theme and carries the Fit badge. The header, the
// contact facts, About in three lines with Read all, work experience two
// jobs deep with Show all, skills, then the app's actions: Start outreach,
// Download CV, Add note. Put it in a WidgetFrame.

export type ExperienceItem = {
  title: string
  company?: string
  /** "Jan 2016 to Dec 2019". */
  period?: string
  place?: string
  description?: string
}

type CandidateProfileProps = {
  name: string
  role?: string
  company?: string
  location?: string
  /** Seniority: "Junior". */
  level?: string
  email?: string
  phone?: string
  /** Match out of 100, shown as the Fit badge. */
  match?: number
  /** About, the profile's summary. */
  about?: string
  experience?: ExperienceItem[]
  skills?: string[]
  onOutreach?: () => void
  onDownloadCv?: () => void
  onAddNote?: () => void
  className?: string
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline pt-4">
      <h4 className="mb-2 text-xs font-semibold text-ink">
        {title}
        {count !== undefined ? <span className="ml-1.5 font-medium text-ink-secondary">{count}</span> : null}
      </h4>
      {children}
    </div>
  )
}

export function CandidateProfile({
  name,
  role,
  company,
  location,
  level,
  email,
  phone,
  match,
  about,
  experience = [],
  skills = [],
  onOutreach,
  onDownloadCv,
  onAddNote,
  className,
}: CandidateProfileProps) {
  const [allAbout, setAllAbout] = useState(false)
  const [allJobs, setAllJobs] = useState(false)
  const jobs = allJobs ? experience : experience.slice(0, 2)
  const facts = [
    { Icon: MapPin, text: location, label: "Location" },
    { Icon: BadgeCheck, text: level, label: "Level" },
    { Icon: Mail, text: email, label: "Email" },
    { Icon: Phone, text: phone, label: "Phone" },
  ].filter((f) => f.text)

  return (
    <div data-slot="candidate-profile" className={cn("flex flex-col gap-4 p-1", className)}>
      <div className="flex items-start gap-3">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <h4 className="text-body font-semibold text-ink">{name}</h4>
          {role || company ? (
            <p className="text-2xs text-ink-secondary">{[role, company].filter(Boolean).join(" at ")}</p>
          ) : null}
        </div>
        {match !== undefined ? <Score value={match} label="Fit" /> : null}
      </div>

      {facts.length ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {facts.map(({ Icon, text, label }) => (
            <li key={label} className="flex min-w-0 items-center gap-1.5 text-2xs">
              <Icon aria-label={label} className="size-3.5 shrink-0 text-ink-secondary" />
              <span className="truncate text-ink">{text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {about ? (
        <Section title="About">
          <p className={cn("text-meta text-ink", !allAbout && "line-clamp-3")}>{about}</p>
          <Button variant="text" className="mt-1" aria-expanded={allAbout} onClick={() => setAllAbout(!allAbout)}>
            {allAbout ? "Show less" : "Read all"}
          </Button>
        </Section>
      ) : null}

      {experience.length ? (
        <Section title="Work experience" count={experience.length}>
          <ol className="flex flex-col gap-3">
            {jobs.map((j, i) => (
              <li key={`${j.title}-${i}`} className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-d500" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">
                    {j.title}
                    {j.company ? <span className="font-medium text-ink-secondary"> at {j.company}</span> : null}
                  </p>
                  {j.period || j.place ? (
                    <p className="text-2xs text-ink-secondary">{[j.period, j.place].filter(Boolean).join(", ")}</p>
                  ) : null}
                  {j.description ? <p className="mt-1 text-2xs text-ink">{j.description}</p> : null}
                </div>
              </li>
            ))}
          </ol>
          {experience.length > 2 ? (
            <Button variant="text" className="mt-3" aria-expanded={allJobs} onClick={() => setAllJobs(!allJobs)}>
              {allJobs ? "Show fewer" : `Show all ${experience.length} jobs`}
            </Button>
          ) : null}
        </Section>
      ) : null}

      {skills.length ? (
        <Section title="Skills" count={skills.length}>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <Tag key={s} tone="info">
                {s}
              </Tag>
            ))}
          </div>
        </Section>
      ) : null}

      {onOutreach || onDownloadCv || onAddNote ? (
        <div className="flex flex-wrap gap-2">
          {onOutreach ? (
            <Button size="sm" variant="brand" onClick={onOutreach}>
              <Send aria-hidden="true" />
              Start outreach
            </Button>
          ) : null}
          {onDownloadCv ? (
            <Button size="sm" onClick={onDownloadCv}>
              <Download aria-hidden="true" />
              Download CV
            </Button>
          ) : null}
          {onAddNote ? (
            <Button size="sm" onClick={onAddNote}>
              <StickyNote aria-hidden="true" />
              Add note
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
