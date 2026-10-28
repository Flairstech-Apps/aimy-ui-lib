"use client"

import { FileText, Paperclip, Send, X } from "lucide-react"
import { useId, useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { CountBadge } from "@/components/count-badge"
import type { Attachment } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// Where a person asks AiMY. Both products draw two bars from one control
// (ai.css): "float", the single-line bar that floats over the work, and
// "canvas", the bar at the foot of the canvas, which takes several lines.
// Enter sends; in the canvas Shift+Enter starts a new line. Nothing empty is
// sent.
//
// While AiMY answers, pass `generating`: the beam rides the bar's border (the
// same fact the think-mark carries in the thread, put where the eye already
// is), the placeholder says "Generating…", and send becomes stop through
// transitions.dev's icon swap (09). Stop keeps whatever was already written.
//
// Attachments are Knowledge's paperclip: pass onAttach to show it. A file
// shows as a chip above the bar until it is sent or removed. Sales has none.
//
//   <Composer onSubmit={ask} generating={busy} onStop={stop} />
//   <Composer variant="canvas" onSubmit={ask} attachments={files}
//     onAttach={(f) => add(f)} onRemoveAttachment={remove} />

type ComposerProps = {
  variant?: "float" | "canvas"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called with the trimmed text. An uncontrolled composer then clears. */
  onSubmit: (text: string) => void
  /** True while AiMY is answering. */
  generating?: boolean
  onStop?: () => void
  placeholder?: string
  /** Accessible name for the text box. Defaults to the placeholder. */
  label?: string
  /** A count on the AiMY icon, such as unread alerts (Knowledge's .float-badge, drawn as CountBadge). */
  badge?: number
  attachments?: Attachment[]
  onAttach?: (file: File) => void
  onRemoveAttachment?: (id: string) => void
  /** What the send button says to a screen reader. Sales' float bar says "Run". */
  sendLabel?: string
  className?: string
}

export function Composer({
  variant = "float",
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  generating = false,
  onStop,
  placeholder = variant === "float" ? "Ask, filter, or name a contact…" : "Ask AiMY anything…",
  label,
  badge,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  sendLabel = "Send",
  className,
}: ComposerProps) {
  const [inner, setInner] = useState(defaultValue)
  const text = value ?? inner
  const fileRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const float = variant === "float"

  const set = (v: string) => {
    if (value === undefined) setInner(v)
    onValueChange?.(v)
  }

  const send = () => {
    if (generating) {
      onStop?.()
      return
    }
    const t = text.trim()
    if (!t) return
    onSubmit(t)
    if (value === undefined) setInner("")
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (!generating) send()
    }
  }

  const field = {
    id: `${id}-input`,
    value: text,
    placeholder: generating ? "Generating…" : placeholder,
    "aria-label": label ?? placeholder,
    onKeyDown,
  }

  const bar = (
    <div
      data-slot="composer"
      data-variant={variant}
      className={cn(float ? "aimy-float-bar" : "overlay-input-bar", generating && "is-generating", float && className)}
    >
      <span className="beam" aria-hidden="true">
        <i />
      </span>
      <span className="aimy-float-icon">
        <AimyMark title="" />
        {badge ? <CountBadge count={badge} label="alerts from AiMY" /> : null}
      </span>
      {float ? (
        <input {...field} className="aimy-float-input" onChange={(e) => set(e.target.value)} />
      ) : (
        <textarea {...field} rows={1} className="overlay-input" onChange={(e) => set(e.target.value)} />
      )}
      {onAttach ? (
        <>
          <button
            type="button"
            aria-label="Attach a file"
            title="Attach a file"
            onClick={() => fileRef.current?.click()}
            className="grid size-7 shrink-0 place-items-center rounded-sm text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w06 hover:text-ink"
          >
            <Paperclip className="size-4" aria-hidden="true" />
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onAttach(f)
              e.target.value = ""
            }}
          />
        </>
      ) : null}
      <button
        type="button"
        className={float ? "aimy-float-send" : "overlay-send"}
        aria-label={generating ? "Stop generating" : sendLabel}
        title={generating ? "Stop generating" : sendLabel}
        onClick={send}
      >
        <span className="t-icon-swap" data-state={generating ? "b" : "a"}>
          <Send className="t-icon" data-icon="a" aria-hidden="true" />
          <span className="t-icon grid place-items-center" data-icon="b" aria-hidden="true">
            <span className="aimy-stop-square" />
          </span>
        </span>
      </button>
    </div>
  )

  if (float && !attachments.length) return bar

  return (
    <div
      data-slot="composer-wrap"
      className={cn("flex w-full flex-col gap-2", !float && "mx-auto max-w-[45rem] px-3", className)}
    >
      {attachments.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Attached">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-sm border border-edge bg-card py-1 pr-1 pl-2 text-2xs text-ink"
            >
              <FileText className="size-3 shrink-0 text-ink-secondary" aria-hidden="true" />
              <span className="font-semibold">{a.name}</span>
              {a.note ? <span className="text-ink-secondary">{a.note}</span> : null}
              {onRemoveAttachment ? (
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => onRemoveAttachment(a.id)}
                  className="grid size-5 place-items-center rounded-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w06 hover:text-ink"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {bar}
    </div>
  )
}
