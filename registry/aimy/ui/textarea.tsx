"use client"

import { controlStyles, useField, useShake } from "@/components/field"
import { cn } from "@/lib/utils"

// Several lines of text that grow with what's written (Sales .b-draft-area:
// field-sizing: content, no resize handle, 68ch at most), up to 12 lines,
// then it scrolls. variant as Input: "box" or "line".
type TextareaProps = React.ComponentProps<"textarea"> & { variant?: "box" | "line" }

export function Textarea({ variant = "box", className, id, rows = 3, ...props }: TextareaProps) {
  const field = useField()
  const ref = useShake<HTMLTextAreaElement>(field?.error)
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      id={id ?? field?.id}
      rows={rows}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      className={cn(
        controlStyles.base,
        controlStyles[variant],
        "max-h-[calc(12lh+1rem)] resize-none leading-base [field-sizing:content]",
        className
      )}
      style={{ minHeight: `calc(${rows}lh + 1rem)` }}
      {...props}
    />
  )
}
