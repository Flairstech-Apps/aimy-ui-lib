import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// How much of AiMY a person has used, in words with the numbers: Knowledge's
// usage popover (knowledge.js:15719; Sales ports it). It opens from the ring
// on the composer's AiMY mark (Composer's `usage`). Each group is a period;
// each row a thing counted, "336 of 300", with a meter and what it means
// ("36 chats past your share, $10.80 extra this month. You can keep going.").
// Going past a share is said, never blocked, unless an admin stopped it.
//
//   <Composer usage={{ fill: 0.67, tone: "warn", label: "Your usage: 67% of this slice, past your share",
//     content: <UsageSummary groups={groups} link={{ label: "Usage", href: "/usage" }} /> }} … />

export type UsageRow = {
  label: string
  used: number
  of: number
  /** What it means, in a sentence. */
  note?: string
  tone?: "warn" | "err"
}

type UsageSummaryProps = {
  groups: { title: string; rows: UsageRow[] }[]
  link?: { label: string; href: string }
}

export function UsageSummary({ groups, link }: UsageSummaryProps) {
  return (
    <div data-slot="usage-summary">
      {groups.map((g) => (
        <section key={g.title} className="use-pop-g" aria-label={g.title}>
          <h3 className="use-pop-h">{g.title}</h3>
          {g.rows.map((r) => (
            <div key={r.label}>
              <div className="use-pop-r">
                <span>{r.label}</span>
                <b>
                  {r.used.toLocaleString("en-GB")} of {r.of.toLocaleString("en-GB")}
                </b>
              </div>
              <div
                className={cn("use-pop-m", r.tone && `is-${r.tone}`)}
                role="meter"
                aria-label={r.label}
                aria-valuemin={0}
                aria-valuemax={r.of}
                aria-valuenow={r.used}
              >
                <i style={{ "--p": Math.min(1, r.used / r.of) } as React.CSSProperties} />
              </div>
              {r.note ? <p className={cn("use-pop-s", r.tone === "warn" && "is-warn")}>{r.note}</p> : null}
            </div>
          ))}
        </section>
      ))}
      {link ? (
        <a className="use-pop-a" href={link.href}>
          {link.label}
          <ArrowRight aria-hidden="true" />
        </a>
      ) : null}
    </div>
  )
}
