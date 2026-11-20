"use client"

import { useState } from "react"
import { controlStyles, useField, useShake } from "@/components/field"
import { useAgentTextField } from "@/lib/behaviors-agent-react"
import { composeRefs } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// A one-line text field. variant "box" is Knowledge's settings field
// (.set2-fld: card ground, edge, 36px, brand focus); "line" is the underline
// both products use inside forms and dialogs (Knowledge is-aimy, Sales
// .b-draft-in). Focus is always the brand, never the accent. Put it in a
// Field for the label, help and error; it shakes once when an error appears.
type InputProps = React.ComponentProps<"input"> & {
  variant?: "box" | "line"
  /** Shows this field to AiMY under this id (inside an AgentProvider), so it can read it and fill it. */
  agent?: string
}

export function Input({ variant = "box", className, id, agent, ...props }: InputProps) {
  const field = useField()
  const ref = useShake<HTMLInputElement>(field?.error)
  const [node, setNode] = useState<HTMLInputElement | null>(null)
  useAgentTextField(agent, node)
  return (
    <input
      ref={composeRefs(ref, setNode)}
      data-slot="input"
      // Inside a Field the Field's id wins, so its label always reaches the control (give the Field the id).
      id={field?.id ?? id}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
      aria-describedby={field?.describedBy}
      className={cn(controlStyles.base, controlStyles[variant], variant === "box" && "min-h-9", className)}
      {...props}
    />
  )
}
