"use client"

import { useState } from "react"
import { controlStyles, useField, useShake } from "@/components/field"
import { useAgentTextField } from "@/lib/behaviors-agent-react"
import { composeRefs } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// Several lines of text that grow with what's written (Sales .b-draft-area:
// field-sizing: content, no resize handle, 68ch at most), up to 12 lines,
// then it scrolls. variant as Input: "box" or "line".
type TextareaProps = React.ComponentProps<"textarea"> & {
  variant?: "box" | "line"
  /** Shows this field to AiMY under this id (inside an AgentProvider), so it can read it and fill it. */
  agent?: string
}

export function Textarea({ variant = "box", className, id, rows = 3, agent, ...props }: TextareaProps) {
  const field = useField()
  const ref = useShake<HTMLTextAreaElement>(field?.error)
  const [node, setNode] = useState<HTMLTextAreaElement | null>(null)
  useAgentTextField(agent, node)
  return (
    <textarea
      ref={composeRefs(ref, setNode)}
      data-slot="textarea"
      // Inside a Field the Field's id wins, so its label always reaches the control (give the Field the id).
      id={field?.id ?? id}
      rows={rows}
      aria-invalid={field?.invalid || undefined}
      aria-required={field?.required || undefined}
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
