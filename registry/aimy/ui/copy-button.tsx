"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/button"

// Copies a value and says so in words (Knowledge's .set2-wh-copy: the label
// becomes "Copied" for 1.4s, or "Press Ctrl+C" if the browser refuses). The
// icon swaps copy to check with transitions.dev's icon swap (09), and the
// result is announced to screen readers.
type CopyButtonProps = {
  value: string
  /** What is copied, for the accessible name: "the webhook URL". */
  what: string
  size?: "sm" | "md"
  className?: string
}

export function CopyButton({ value, what, size = "sm", className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setState("copied")
    } catch {
      setState("failed")
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState("idle"), 1400)
  }

  const words = state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl+C" : "Copy"
  return (
    <Button size={size} onClick={copy} aria-label={`Copy ${what}`} className={className}>
      <span className="t-icon-swap" data-state={state === "copied" ? "b" : "a"}>
        <Copy className="t-icon" data-icon="a" aria-hidden="true" />
        <Check className="t-icon text-ok-text" data-icon="b" aria-hidden="true" />
      </span>
      <span aria-hidden="true">{words}</span>
      <span role="status" className="sr-only">
        {state === "copied" ? `Copied ${what}` : state === "failed" ? "Copy failed. Press Ctrl+C to copy." : ""}
      </span>
    </Button>
  )
}
