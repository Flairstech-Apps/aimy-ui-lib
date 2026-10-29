"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/registry/aimy/ui/button"

// Copies the page as markdown for an AI agent: the parts marked data-ai (the
// title and lead, section titles, install and usage code, rules, where it
// comes from, accessibility), never the live previews.
function pageAsMarkdown() {
  const nodes = [...document.querySelectorAll<HTMLElement>("main [data-ai]")].filter(
    (el) => !el.parentElement?.closest("[data-ai]")
  )
  const out: string[] = []
  for (const el of nodes) {
    const text = el.innerText.trim()
    if (!text) continue
    const kind = el.dataset.ai
    if (kind === "h1") out.push(`# ${text}`)
    else if (kind === "h2") out.push(`## ${text}`)
    else if (kind === "h3") out.push(`### ${text}`)
    else if (kind === "code") out.push("```tsx\n" + text + "\n```")
    else if (kind === "li") out.push(`- ${text.replace(/\s*\n\s*/g, " ")}`)
    else out.push(text)
  }
  out.push(`Source: ${location.href}`)
  return out.join("\n\n").replace(/\n(- [^\n]+)\n\n(?=- )/g, "\n$1\n") + "\n"
}

export function CopyForAi() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <Button
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(pageAsMarkdown())
          setState("copied")
        } catch {
          setState("failed")
        }
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setState("idle"), 2000)
      }}
    >
      {state === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">
        {state === "copied" ? "Copied for AI" : state === "failed" ? "Couldn’t copy" : "Copy for AI"}
      </span>
    </Button>
  )
}
