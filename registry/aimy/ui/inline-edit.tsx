"use client"

import { LoaderCircle, Pencil } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { controlStyles } from "@/components/field"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
import { useInlineEdit } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// Rename or change one value where it sits: a list's name, a deal's title, a
// note. At rest it reads as the text it is, with a pencil on hover and focus;
// pressed, it becomes the box field in the same type size. Enter or leaving
// the field saves; Escape puts it back. A check can refuse a value with a
// reason, and a failed save keeps the field open with what went wrong.

type InlineEditProps = {
  value: string
  /** Save. Return a promise to show saving; reject it with an Error to keep the field open with its message. */
  onSave: (value: string) => void | Promise<void>
  /** What the value is, for screen readers: "List name". */
  label: string
  /** Return a sentence to refuse a value ("Give it a name."), or null. */
  validate?: (value: string) => string | null
  /** "title" for a heading-sized value, "text" for body text. */
  size?: "title" | "text"
  /** Shown when the value is empty. */
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
  className?: string
  /** Shows this part to AiMY under this id (inside an AgentProvider), so it can read it and act on it. */
  agent?: string
}

const sizes = {
  title: "text-xl leading-tight font-bold",
  text: "text-base",
}

export function InlineEdit({ value, onSave, label, validate, size = "text", placeholder = "Add a value", multiline, disabled, className, agent }: InlineEditProps) {
  const edit = useInlineEdit({ value, onCommit: onSave, validate })
  const [root, setRoot] = useState<HTMLElement | null>(null)
  useAgentSurface(
    agent,
    {
      kind: "editable text",
      label,
      state: () => ({ value }),
      actions: {
        set: {
          description: `Change the ${label.toLowerCase()}`,
          keywords: "rename edit set update",
          params: { value: { type: "string", description: `The new ${label.toLowerCase()}` } },
          say: (p) => `changed the ${label.toLowerCase()} to \u201c${p.value}\u201d`,
          run: async (p) => {
            const next = String(p.value)
            const refusal = validate?.(next)
            if (refusal) throw new Error(refusal)
            const prev = value
            await onSave(next)
            return () => onSave(prev)
          },
        },
      },
    },
    root
  )
  const errorId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const was = useRef(false)
  // Back on the text after saving or putting it back, so focus isn't lost.
  useEffect(() => {
    if (was.current && !edit.editing) button.current?.focus()
    was.current = edit.editing
  }, [edit.editing])

  if (!edit.editing) {
    const shown = edit.pending ?? value
    return (
      <button
        ref={(node) => {
          button.current = node
          setRoot(node)
        }}
        type="button"
        data-slot="inline-edit"
        disabled={disabled}
        aria-label={`${label}: ${shown || placeholder}.${edit.saving ? " Saving." : ""} Press to change.`}
        aria-busy={edit.saving || undefined}
        onClick={edit.start}
        className={cn(
          "group/edit -mx-2 inline-flex max-w-full items-start gap-2 rounded-md px-2 py-1 text-left text-ink starting:opacity-0",
          "transition-[background-color,opacity] duration-(--t-fast) ease-out hover:not-disabled:bg-w05 disabled:cursor-not-allowed",
          sizes[size],
          className
        )}
      >
        <span className={cn("min-w-0 break-words", !shown && "text-ink-placeholder")}>{shown || placeholder}</span>
        <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center">
          {edit.saving ? (
            // Saving behind: the new value is already shown.
            <LoaderCircle strokeWidth={2} className="size-3.5 animate-spin text-ink-secondary motion-reduce:animate-none" />
          ) : (
            <Pencil strokeWidth={2} className="size-3.5 text-ink-secondary opacity-0 transition-opacity duration-(--t-fast) group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100" />
          )}
        </span>
      </button>
    )
  }

  const common = {
    autoFocus: true,
    "aria-label": label,
    "aria-invalid": !!edit.error || undefined,
    "aria-describedby": edit.error ? errorId : undefined,
    "aria-busy": edit.saving || undefined,
    value: edit.draft,
    disabled: edit.saving,
    onKeyDown: (e: React.KeyboardEvent) => edit.onKeyDown(e, multiline),
    onBlur: () => void edit.commit(),
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.select(),
    className: cn(controlStyles.base, controlStyles.box, "-mx-2 w-[calc(100%+1rem)] px-2 py-1 starting:scale-[0.98] starting:opacity-0", sizes[size]),
  }
  return (
    <div ref={setRoot} data-slot="inline-edit" className={cn("flex max-w-full flex-col gap-1", className)}>
      {multiline ? (
        <textarea rows={3} {...common} onChange={(e) => edit.change(e.target.value)} />
      ) : (
        <input {...common} onChange={(e) => edit.change(e.target.value)} />
      )}
      {edit.error ? (
        <p id={errorId} role="alert" className="text-xs text-err-text">
          {edit.error}
        </p>
      ) : (
        <p className="text-2xs text-ink-secondary">{multiline ? "Ctrl+Enter saves" : "Enter saves"}, Escape puts it back.</p>
      )}
    </div>
  )
}
