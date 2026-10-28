import { FileText } from "lucide-react"
import { TrustState } from "@/components/trust-state"
import type { Source } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// The sources an answer stands on: Knowledge's sourceRow (knowledge.js:9587).
// Each row is the citation's number, what kind of document it is, its title,
// where it came from and its trust state, and opens the document. One row
// template wherever a source is listed: in the answer, or in the drawer under
// it ("What this answer stands on", opened from ResponseActions' sources).
// Below 520px a row takes a second line rather than lose its title.
//
//   <SourceList sources={docs} onOpen={openDoc} />
//   <SourceList variant="drawer" sources={docs} onOpen={openDoc} />

type SourceListProps = {
  sources: Source[]
  onOpen?: (source: Source) => void
  /** "inline" in the answer; "drawer" under it, with its caption. */
  variant?: "inline" | "drawer"
  className?: string
}

export function SourceList({ sources, onOpen, variant = "inline", className }: SourceListProps) {
  const rows = (
    <ol className="source-list" aria-label={variant === "inline" ? "Sources" : undefined}>
      {sources.map((s, i) => (
        <li key={s.id} className="contents">
          <button type="button" className="source-item" onClick={() => onOpen?.(s)}>
            <span className="cite" aria-hidden="true">
              {i + 1}
            </span>
            {s.type ? (
              <span className="tc-kind">
                <FileText aria-hidden="true" />
                {s.type}
              </span>
            ) : null}
            <span className="source-title">{s.title}</span>
            {s.connector ? <span className="source-domain">{s.connector}</span> : null}
            {s.status ? <TrustState status={s.status} setByHand={s.setByHand} /> : null}
          </button>
        </li>
      ))}
    </ol>
  )
  if (variant === "inline") return <div className={cn(className)}>{rows}</div>
  return (
    <section className={cn("msg-sources", className)} aria-label="What this answer stands on">
      <p className="msg-sources-cap">What this answer stands on</p>
      {rows}
    </section>
  )
}
