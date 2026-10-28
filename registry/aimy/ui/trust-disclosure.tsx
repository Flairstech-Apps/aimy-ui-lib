import { Ban, Check, CircleAlert, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

// What an answer is grounded on, said under it. Knowledge's .trust-disclosure
// (knowledge.js:9625 and on): one row per thing worth knowing about the
// sources, and when nothing could answer, the panel says so on a warm ground
// with a way forward. The design system's rule: every answer states its
// grounding, and the exclusion case is never silent, or a governance gap
// looks the same as a gap in the content.
//
//   <TrustDisclosure rows={[{ tone: "err", children: <><strong>One cited source is behind Confluence</strong>, the source changed after our copy.</> }]} />
//   <TrustDisclosure exclusion rows={[{ tone: "none", children: <><strong>0 sources matched.</strong> This is a genuine coverage gap.</> }]}
//     actions={<DisclosureAction onClick={raise}>Raise it as a coverage gap →</DisclosureAction>} />

type Tone = "ok" | "warn" | "err" | "none"

const ICON = { ok: Check, warn: TriangleAlert, err: CircleAlert, none: Ban } as const

type TrustDisclosureProps = {
  rows: { tone: Tone; icon?: React.ReactNode; children: React.ReactNode }[]
  /** Nothing grounded the answer, or a source was excluded: the warm ground. */
  exclusion?: boolean
  actions?: React.ReactNode
  className?: string
}

export function TrustDisclosure({ rows, exclusion, actions, className }: TrustDisclosureProps) {
  return (
    <div
      data-slot="trust-disclosure"
      role="note"
      aria-label="What this answer is grounded on"
      className={cn("trust-disclosure", exclusion && "has-exclusion", className)}
    >
      {rows.map((r, i) => {
        const Icon = ICON[r.tone]
        return (
          <div key={i} className={cn("td-row", r.tone !== "none" && `is-${r.tone}`)}>
            {r.icon ?? <Icon aria-hidden="true" />}
            <span className="td-text">{r.children}</span>
          </div>
        )
      })}
      {actions ? <div className="td-actions">{actions}</div> : null}
    </div>
  )
}

/** A way forward from a disclosure: "Raise it as a coverage gap →". */
export function DisclosureAction({ className, ...props }: React.ComponentProps<"button">) {
  return <button type="button" className={cn("td-action", className)} {...props} />
}
