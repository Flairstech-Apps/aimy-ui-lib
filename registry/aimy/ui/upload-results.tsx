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
  added: { word: "Added", Icon: CircleCheck, ink: "text-ok-text", ground: "bg-ok-bg", action: "Open" },
  warnings: { word: "Added, with warnings", Icon: TriangleAlert, ink: "text-warn-text", ground: "bg-warn-bg", action: "See warnings" },
  failed: { word: "Not added", Icon: CircleX, ink: "text-err-text", ground: "bg-err-bg", action: "Upload again" },
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
  const [shown, setShown] = useState<UploadStatus>(first)

  return (
    <div data-slot="upload-results" className={className}>
      <div role="radiogroup" aria-label={`${label}: show`} className="grid grid-cols-3 border-b border-hairline">
        {ORDER.map((s) => {
          const t = STATUS[s]
          const on = shown === s
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setShown(s)}
              className={cn(
                "flex flex-col gap-0.5 border-r border-hairline px-4 py-3 text-left transition-[background-color] duration-(--t-fast) ease-out last:border-r-0",
                on ? t.ground : "hover:bg-w03"
              )}
            >
              <span className="text-xl font-bold text-ink tabular-nums">{count(s)}</span>
              <span className={cn("inline-flex items-start gap-1.5 text-2xs font-semibold", t.ink)}>
                <t.Icon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                {t.word}
              </span>
            </button>
          )
        })}
      </div>
      <ul aria-label={`${label}: ${STATUS[shown].word}`} className="divide-y divide-hairline">
        {items
          .filter((i) => i.status === shown)
          .map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{i.name}</p>
                <p className="truncate text-2xs text-ink-secondary">{i.file}</p>
                {i.message ? <p className="mt-1 text-2xs text-ink">{i.message}</p> : null}
              </div>
              {onAction ? (
                <Button size="sm" onClick={() => onAction(i)}>
                  {i.status === "failed" ? <RotateCcw aria-hidden="true" /> : null}
                  {STATUS[i.status].action}
                </Button>
              ) : null}
            </li>
          ))}
        {count(shown) === 0 ? <li className="px-4 py-6 text-center text-meta text-ink-secondary">None.</li> : null}
      </ul>
    </div>
  )
}
