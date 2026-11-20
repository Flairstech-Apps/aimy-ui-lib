"use client"

import { Upload } from "lucide-react"
import { useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Where files come in: drop them, or press to choose. Knowledge's settings drop (.set2-drop,
// settings.css 1476-1486: card ground, a dashed edge that turns brand on hover and while files are
// over it, the icon and the words centred) with QA's words and its accepted-formats line
// (.di-dropzone, data-ingestion.html 5440-5480). Files that don't fit (type, size, count) are named
// with the reason, in words, and the rest go through. Keyboard: Tab reaches it, Enter or Space opens
// the file chooser.
//
//   <FileDrop accept={[".csv", ".xlsx"]} maxSize={10_000_000} onFiles={(files) => upload(files)} />

type FileDropProps = {
  /** What it takes, as extensions or types: [".csv", "audio/*"]. Everything by default. */
  accept?: string[]
  /** Bytes per file. */
  maxSize?: number
  /** One file or many. Default many. */
  multiple?: boolean
  /** The files that fit, as soon as they are dropped or chosen. */
  onFiles: (files: File[]) => void
  /** The headline: "Drop files to upload". */
  title?: string
  /** What the files are, for screen readers: "Upload voice files". */
  label?: string
  disabled?: boolean
  className?: string
}

const size = (n: number) => (n >= 1_000_000 ? `${Math.round(n / 100_000) / 10} MB` : `${Math.max(1, Math.round(n / 1000))} KB`)

function fits(file: File, accept: string[] | undefined) {
  if (!accept?.length) return true
  const name = file.name.toLowerCase()
  return accept.some((a) => {
    const t = a.trim().toLowerCase()
    if (t.startsWith(".")) return name.endsWith(t)
    if (t.endsWith("/*")) return file.type.startsWith(t.slice(0, -1))
    return file.type === t
  })
}

export function FileDrop({ accept, maxSize, multiple = true, onFiles, title = "Drop files to upload", label, disabled, className }: FileDropProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [refused, setRefused] = useState<string[]>([])

  const take = (list: FileList | File[] | null) => {
    if (!list || disabled) return
    const all = Array.from(list)
    const kept: File[] = []
    const why: string[] = []
    for (const f of all) {
      if (!fits(f, accept)) why.push(`${f.name} isn't one of ${accept!.join(", ")}.`)
      else if (maxSize && f.size > maxSize) why.push(`${f.name} is ${size(f.size)}; the most is ${size(maxSize)}.`)
      else if (!multiple && kept.length) why.push(`${f.name} wasn't added: this takes one file.`)
      else kept.push(f)
    }
    setRefused(why)
    if (kept.length) onFiles(kept)
  }

  return (
    <div data-slot="file-drop" className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        data-over={over || undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          "grid min-h-36 cursor-pointer place-items-center gap-2 rounded-lg border-[0.09375rem] border-dashed border-edge-hover bg-card p-4 text-center",
          "transition-[border-color,background-color] duration-(--t-fast) ease-out hover:border-brand data-over:border-brand data-over:bg-brand-dim",
          // The ring shows for keyboard focus on the hidden input, as the products' focus does.
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-brand",
          disabled && "cursor-not-allowed opacity-[0.38] hover:border-edge-hover"
        )}
        onDragOver={(e) => {
          if (disabled) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files)
        }}
      >
        <span className="flex flex-col items-center gap-1.5">
          <Upload aria-hidden="true" strokeWidth={2} className="size-5 text-ink-secondary" />
          <span className="text-xs font-semibold text-ink">{title}</span>
          <span className="text-2xs text-ink-secondary">
            or <span className="text-link underline underline-offset-2">choose {multiple ? "files" : "a file"}</span>
          </span>
          {accept?.length || maxSize ? (
            <span className="text-2xs text-ink-secondary">
              {accept?.length ? accept.join(", ") : null}
              {accept?.length && maxSize ? " · " : null}
              {maxSize ? `up to ${size(maxSize)}` : null}
            </span>
          ) : null}
        </span>
        <input
          ref={input}
          id={id}
          type="file"
          aria-label={label ?? title}
          accept={accept?.join(",")}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            take(e.target.files)
            e.target.value = "" // the same file can be chosen again
          }}
        />
      </label>
      {refused.length ? (
        <div role="alert">
          <ul className="flex flex-col gap-0.5 text-2xs text-err-text">
            {refused.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
