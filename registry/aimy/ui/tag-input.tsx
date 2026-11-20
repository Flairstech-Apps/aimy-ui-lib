"use client"

import { X } from "lucide-react"
import { useId, useState } from "react"
import { useField } from "@/components/field"
import { cn } from "@/lib/utils"

// Values typed in as tags: Knowledge's .tag-input (aimy-ds.css 2780-2797): a field on the raised
// ground with tokens on the accent's dim ground, each with its own remove control, and the text box
// after them. Enter or a comma adds what was typed; Backspace in an empty box takes the last tag
// back; pasting "a, b, c" adds three. An input method's Enter confirms its characters, never adds.
//
//   <TagInput label="Regions" value={regions} onValueChange={setRegions} placeholder="Add a region" />

type TagInputProps = {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** Accessible name when it is not inside a Field. */
  label?: string
  /** Refuses a tag with a sentence saying why ("Use a region code, like EMEA"), or null to take it. */
  validate?: (tag: string) => string | null
  /** Sends each tag with a form under this name. */
  name?: string
  disabled?: boolean
  className?: string
}

export function TagInput({ value, defaultValue = [], onValueChange, placeholder = "Add", label, validate, name, disabled, className }: TagInputProps) {
  const field = useField()
  const errorId = useId()
  const [own, setOwn] = useState<string[]>(defaultValue)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const tags = value ?? own
  const set = (next: string[]) => {
    if (value === undefined) setOwn(next)
    onValueChange?.(next)
  }
  const add = (text: string) => {
    const parts = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    if (!parts.length) return
    const next = [...tags]
    for (const p of parts) {
      const why = validate?.(p) ?? null
      if (why) {
        setError(why)
        setDraft(p)
        set(next)
        return
      }
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p)
    }
    setError(null)
    setDraft("")
    set(next)
  }
  const remove = (t: string) => set(tags.filter((x) => x !== t))

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        data-slot="tag-input"
        aria-disabled={disabled || undefined}
        className={cn(
          "flex max-w-full flex-wrap items-center gap-1.5 rounded-md border border-edge bg-raised px-2 py-1.5",
          "transition-[border-color,box-shadow] duration-(--t-fast) ease-out focus-within:border-edge-focus focus-within:shadow-[0_0_0_3px_var(--brand-glow)]",
          (error || field?.invalid) && "border-err",
          disabled && "opacity-[0.38]"
        )}
      >
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex max-w-full items-center gap-1 rounded-sm border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-accent-dim py-0.5 ps-2 pe-1 text-xs font-semibold text-[color-mix(in_oklab,var(--accent-text)_70%,var(--ink-primary))]"
          >
            <span className="min-w-0 [overflow-wrap:anywhere]">{t}</span>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${t}`}
              onClick={() => remove(t)}
              className="relative grid size-4 shrink-0 place-items-center rounded-xs text-current after:absolute after:-inset-1 hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
            >
              <X aria-hidden="true" strokeWidth={2.5} className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={field?.id}
          aria-label={field ? undefined : label}
          aria-invalid={error || field?.invalid ? true : undefined}
          aria-describedby={[error ? errorId : null, field?.describedBy].filter(Boolean).join(" ") || undefined}
          disabled={disabled}
          value={draft}
          placeholder={tags.length ? undefined : placeholder}
          onChange={(e) => {
            setError(null)
            if (e.target.value.endsWith(",")) add(e.target.value)
            else setDraft(e.target.value)
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text")
            if (!text.includes(",")) return
            e.preventDefault()
            add(draft + text)
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault()
              add(draft)
            } else if (e.key === "Backspace" && !draft && tags.length) {
              e.preventDefault()
              remove(tags[tags.length - 1]!)
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          className="min-w-20 flex-1 bg-transparent p-1 text-xs text-ink outline-none placeholder:text-ink-placeholder"
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-err-text">
          {error}
        </p>
      ) : null}
      {name ? tags.map((t) => <input key={t} type="hidden" name={name} value={t} disabled={disabled} />) : null}
    </div>
  )
}
