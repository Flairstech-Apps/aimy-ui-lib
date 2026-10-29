import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// A document's versions: Knowledge's versionList (knowledge.js:4837). An edit
// AiMY made is an ordinary version with AiMY as its author and its mark in the
// margin, marked, not set apart, and it says who accepted it. Restoring is
// additive: it adds a new version and deletes nothing, so the trail never
// gets a hole (use ChangeReview for the restore).
//
//   <VersionList versions={[{ id: "3", n: 3, label: "Clarified the scope", author: "Dana Whitfield",
//     how: "edited in the document editor", time: "12 Oct", current: true }, { id: "2", n: 2, ai: true,
//     label: "Rewritten from 12 resolved tickets", author: "AiMY", how: "accepted by Dana Whitfield", time: "3 Oct" }]}
//     selected={picked} onPick={setPicked} />

export type Version = {
  id: string
  n: number
  label: string
  author: string
  /** How it came about: "accepted by Dana Whitfield", "first ingestion". */
  how?: string
  time: string
  /** AiMY wrote it. */
  ai?: boolean
  current?: boolean
}

type VersionListProps = {
  versions: Version[]
  /** Makes each row a button, to read that version. */
  onPick?: (v: Version) => void
  selected?: string
  className?: string
}

export function VersionList({ versions, onPick, selected, className }: VersionListProps) {
  return (
    <ol data-slot="version-list" className={cn("ver-list", className)} aria-label="Versions">
      {versions.map((v) => {
        const body = (
          <>
            <span className="ver-mark" aria-hidden="true">
              {v.ai ? <AimyMark title="" /> : `v${v.n}`}
            </span>
            <span className="ver-main">
              <span className="ver-label block">{v.label}</span>
              <span className="ver-author block">
                <strong>{v.author}</strong>
                {v.how ? ` · ${v.how}` : null}
                <span className="sr-only">, version {v.n}</span>
              </span>
            </span>
            <span className="ver-side">
              {v.current ? <span className="ver-tag">Current</span> : null}
              <span className="ver-time">{v.time}</span>
            </span>
          </>
        )
        const cls = cn("ver-item", v.ai && "is-ai", v.current && "is-current")
        return (
          <li key={v.id}>
            {onPick ? (
              <button type="button" className={cls} aria-pressed={selected === v.id} onClick={() => onPick(v)}>
                {body}
              </button>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
