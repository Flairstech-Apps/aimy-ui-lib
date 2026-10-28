"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { controlStyles, useField, useShake } from "@/components/field"
import { cn } from "@/lib/utils"

// A secret: an API key, a webhook token, a password. Masked by default, with
// a show/hide control inside the field (Knowledge's settings token field,
// .set2-wh-f with .set2-wh-help[data-reveal]). The eye swaps with
// transitions.dev's icon swap (09); the control says what it will do.
type PasswordFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  variant?: "box" | "line"
  /** What the secret is, for the show/hide control: "the token". */
  secretName?: string
}

export function PasswordField({ variant = "box", secretName = "the password", className, id, ...props }: PasswordFieldProps) {
  const field = useField()
  const ref = useShake<HTMLDivElement>(field?.error)
  const [shown, setShown] = useState(false)
  return (
    <div ref={ref} data-slot="password-field" className="t-input relative w-full">
      <input
        type={shown ? "text" : "password"}
        id={id ?? field?.id}
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        autoComplete="off"
        spellCheck={false}
        className={cn(controlStyles.base, controlStyles[variant], variant === "box" && "min-h-9", "pr-10 font-mono", className)}
        {...props}
      />
      <button
        type="button"
        aria-pressed={shown}
        aria-label={shown ? `Hide ${secretName}` : `Show ${secretName}`}
        title={shown ? `Hide ${secretName}` : `Show ${secretName}`}
        onClick={() => setShown((v) => !v)}
        className="absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
      >
        <span className="t-icon-swap" data-state={shown ? "b" : "a"}>
          <Eye className="t-icon size-4" data-icon="a" strokeWidth={2} aria-hidden="true" />
          <EyeOff className="t-icon size-4" data-icon="b" strokeWidth={2} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}
