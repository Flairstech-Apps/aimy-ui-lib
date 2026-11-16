"use client"

import { Pencil } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { controlStyles } from "@/components/field"
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
}

const sizes = {
  title: "text-xl leading-tight font-bold",
  text: "text-base",
}

export function InlineEdit({ value, onSave, label, validate, size = "text", placeholder = "Add a value", multiline, disabled, className }: InlineEditProps) {
  const edit = useInlineEdit({ value, onCommit: onSave, validate })
  const errorId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const was = useRef(false)
  // Back on the text after saving or putting it back, so focus isn't lost.
  useEffect(() => {
    if (was.current && !edit.editing) button.current?.focus()
    was.current = edit.editing
  }, [edit.editing])

  if (!edit.editing) {
    return (
      <button
        ref={button}
        type="button"
        data-slot="inline-edit"
        disabled={disabled}
        aria-label={`${label}: ${value || placeholder}. Press to change.`}
        onClick={edit.start}
        className={cn(
          "group -mx-2 inline-flex max-w-full items-start gap-2 rounded-md px-2 py-1 text-left text-ink",
          "transition-[background-color] duration-(--t-fast) ease-out hover:not-disabled:bg-w05 disabled:cursor-not-allowed",
          sizes[size],
          className
        )}
      >
        <span className={cn("min-w-0 break-words", !value && "text-ink-placeholder")}>{value || placeholder}</span>
        <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center">
          <Pencil strokeWidth={2} className="size-3.5 text-ink-secondary opacity-0 transition-opacity duration-(--t-fast) group-hover:opacity-100 group-focus-visible:opacity-100" />
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
    className: cn(controlStyles.base, controlStyles.box, "-mx-2 w-[calc(100%+1rem)] px-2 py-1", sizes[size]),
  }
  return (
    <div data-slot="inline-edit" className={cn("flex max-w-full flex-col gap-1", className)}>
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
