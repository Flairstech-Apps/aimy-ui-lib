"use client"

import { CircleCheck, CircleX, RotateCcw, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/button"
import { cn } from "@/lib/utils"

// A batch counted by status, then the items that need a person (Nour's
// pick, 4 Nov, for bulk CV upload). The Knowledge app listed every file in a
// table whose status and messages were cut off at the edge. Here three
// counts say how the batch went, Added, Added with warnings and Not added,
// each a number, an icon and a word; they filter the rows below, which open
// on the status that needs a person. Each row has its fix: Open, See
// warnings, Upload again. Put it in a WidgetFrame with flush.
//
//   <WidgetFrame icon={<Upload />} title="Bulk CV upload results" meta="8 files" flush>
//     <UploadResults label="CV upload" items={files} onAction={act} />
//   </WidgetFrame>

export type UploadStatus = "added" | "warnings" | "failed"

export type UploadItem = {
  id: string
  /** The candidate read from the file, or the file name when none was read. */
  name: string
  file: string
  status: UploadStatus
  /** What went wrong, or the warning. */
  message?: string
}

const STATUS = {
  added: { word: "Added", short: "Added", Icon: CircleCheck, ink: "text-ok-text", fill: "bg-ok", ground: "bg-ok-bg", edge: "shadow-[inset_0_0_0_1px_var(--ok-border)]", action: "Open" },
  warnings: { word: "Added, with warnings", short: "With warnings", Icon: TriangleAlert, ink: "text-warn-text", fill: "bg-warn", ground: "bg-warn-bg", edge: "shadow-[inset_0_0_0_1px_var(--warn-border)]", action: "See warnings" },
  failed: { word: "Not added", short: "Not added", Icon: CircleX, ink: "text-err-text", fill: "bg-err", ground: "bg-err-bg", edge: "shadow-[inset_0_0_0_1px_var(--err-border)]", action: "Upload again" },
} as const

const ORDER: UploadStatus[] = ["added", "warnings", "failed"]

type UploadResultsProps = {
  items: UploadItem[]
  /** Names the batch for screen readers: "CV upload". */
  label: string
  onAction?: (item: UploadItem) => void
  className?: string
}

export function UploadResults({ items, label, onAction, className }: UploadResultsProps) {
  const count = (s: UploadStatus) => items.filter((i) => i.status === s).length
  // Open on what needs a person: failures, then warnings, then the rest.
  const first: UploadStatus = count("failed") ? "failed" : count("warnings") ? "warnings" : "added"
  // Follows what needs a person as results stream in, until the person picks a tab.
  const [picked, setShown] = useState<UploadStatus | null>(null)
  const shown = picked ?? first
  const total = items.length
  const added = count("added") + count("warnings")
  const said = ORDER.map((s) => `${count(s)} ${STATUS[s].word.toLowerCase()}`).join(", ")

  return (
    <div data-slot="upload-results" className={cn("@container", className)}>
      {/* What the batch came to: how many made it in, and the split as one bar. */}
      <div className="flex flex-col gap-3 border-b border-hairline px-4 pt-4 pb-3">
        <p className="text-sm text-ink">
          <b className="font-bold tabular-nums">
            {added} of {total}
          </b>{" "}
          {total === 1 ? "file" : "files"} added
          {count("failed") ? <span className="text-ink-secondary">. {count("failed")} need{count("failed") === 1 ? "s" : ""} uploading again.</span> : null}
        </p>
        <div role="img" aria-label={said} className="flex h-1.5 gap-0.5 overflow-hidden rounded-pill">
          {ORDER.filter((s) => count(s)).map((s) => (
            <span key={s} className={cn("h-full rounded-pill first:rounded-s-pill", STATUS[s].fill)} style={{ flexGrow: count(s) }} />
          ))}
          {total === 0 ? <span className="h-full flex-1 bg-w07" /> : null}
        </div>
        <div role="radiogroup" aria-label={`${label}: show`} className="flex flex-wrap gap-1.5">
          {ORDER.map((s) => {
            const t = STATUS[s]
            const on = shown === s
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${count(s)} ${t.word}`}
                onClick={() => setShown(s)}
                className={cn(
                  "inline-flex min-h-7 items-center gap-1.5 rounded-pill px-2.5 text-2xs font-semibold transition-[background-color,box-shadow,color] duration-(--t-fast) ease-out",
                  on ? cn(t.ground, t.edge, t.ink) : "text-ink-secondary shadow-[inset_0_0_0_1px_var(--card-border)] hover:bg-w05 hover:text-ink"
                )}
              >
                <t.Icon aria-hidden="true" strokeWidth={2} className={cn("size-3.5 shrink-0", on ? null : t.ink)} />
                <span className="font-bold text-ink tabular-nums">{count(s)}</span>
                {t.short}
              </button>
            )
          })}
        </div>
      </div>
      <ul aria-label={`${label}: ${STATUS[shown].word}`} className="divide-y divide-hairline">
        {items
          .filter((i) => i.status === shown)
          .map((i) => {
            const t = STATUS[i.status]
            return (
              <li key={i.id} className="flex items-start gap-3 px-4 py-3">
                <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center text-xs">
                  <t.Icon strokeWidth={2} className={cn("size-3.5", t.ink)} />
                </span>
                {/* The words and the fix share a column: on a narrow frame the fix wraps under the
                    reason, on the words' own edge. */}
                <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-2">
                <div className="min-w-0 flex-[1_1_12rem]">
                  <p className="truncate text-xs font-semibold text-ink" title={i.name}>
                    {i.name}
                  </p>
                  {/* The file only when it says something the name doesn't. */}
                  {i.file !== i.name ? (
                    <p className="truncate text-2xs text-ink-secondary" title={i.file}>
                      {i.file}
                    </p>
                  ) : null}
                  {i.message ? <p className="mt-1 text-2xs leading-relaxed text-ink">{i.message}</p> : null}
                </div>
                {onAction ? (
                  <Button size="sm" className="shrink-0" onClick={() => onAction(i)}>
                    {i.status === "failed" ? <RotateCcw aria-hidden="true" /> : null}
                    {t.action}
                  </Button>
                ) : null}
                </div>
              </li>
            )
          })}
        {count(shown) === 0 ? <li className="px-4 py-6 text-center text-meta text-ink-secondary">None.</li> : null}
      </ul>
    </div>
  )
}
