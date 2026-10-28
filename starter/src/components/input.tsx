"use client"

import { controlStyles, useField, useShake } from "@/components/field"
import { cn } from "@/lib/utils"

// A one-line text field. variant "box" is Knowledge's settings field
// (.set2-fld: card ground, edge, 36px, brand focus); "line" is the underline
// both products use inside forms and dialogs (Knowledge is-aimy, Sales
// .b-draft-in). Focus is always the brand, never the accent. Put it in a
// Field for the label, help and error; it shakes once when an error appears.
type InputProps = React.ComponentProps<"input"> & { variant?: "box" | "line" }

export function Input({ variant = "box", className, id, ...props }: InputProps) {
  const field = useField()
  const ref = useShake<HTMLInputElement>(field?.error)
  return (
    <input
      ref={ref}
      data-slot="input"
      id={id ?? field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      className={cn(controlStyles.base, controlStyles[variant], variant === "box" && "min-h-9", className)}
      {...props}
    />
  )
}
