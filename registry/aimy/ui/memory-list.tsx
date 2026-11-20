"use client"

import { X } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/button"
import { toast } from "@/components/toast"
import { cn } from "@/lib/utils"

// Everything AiMY remembers about a person or an account, and the way to make
// it forget. Neither product nor the design system has this; it is built from
// the plan's forgetting control and the memory rule (memory the person cannot
// decline is surveillance). Each fact says where it came from and when; each
// can be forgotten in one click, with Undo. Forgetting all of it asks once,
// in place (several things at once: the ladder's inline confirm), then
// offers Undo too.
//
//   <MemoryList title="What AiMY remembers about Dana" facts={facts}
//     onForget={(ids) => forget(ids)} onRestore={(ids) => restore(ids)} />

export type MemoryFact = { id: string; text: string; from: string }

type MemoryListProps = {
  title: string
  facts: MemoryFact[]
  onForget: (ids: string[]) => void
  onRestore?: (ids: string[]) => void
  className?: string
}

export function MemoryList({ title, facts, onForget, onRestore, className }: MemoryListProps) {
  const [confirming, setConfirming] = useState(false)
  // Each step swaps out the button that had focus; focus goes to what comes next, never to the page.
  const root = useRef<HTMLElement>(null)
  const focusNext = (selector: string) =>
    requestAnimationFrame(() => (root.current?.querySelector<HTMLElement>(selector) ?? root.current?.querySelector<HTMLElement>("h3"))?.focus())
  const forget = (ids: string[], what: string) => {
    onForget(ids)
    toast(what, { sub: "AiMY won't use it again", onUndo: onRestore ? () => onRestore(ids) : undefined })
  }
  return (
    <section
      ref={root}
      data-slot="memory-list"
      aria-label={title}
      className={cn("flex flex-col rounded-lg border border-edge bg-card", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-3">
        <h3 tabIndex={-1} className="text-sm font-semibold text-ink outline-none">
          {title}
        </h3>
        {facts.length > 1 ? (
          confirming ? (
            <span className="flex flex-wrap items-center gap-2" role="group" aria-label="Forget all of it?">
              <span className="text-xs font-semibold text-ink">Forget all {facts.length}?</span>
              <Button
                size="sm"
                variant="err"
                onClick={() => {
                  setConfirming(false)
                  focusNext("h3")
                  forget(
                    facts.map((f) => f.id),
                    `Forgot all ${facts.length}`
                  )
                }}
              >
                Yes, forget them
              </Button>
              <Button
                size="sm"
                data-mem-keep=""
                onClick={() => {
                  setConfirming(false)
                  focusNext("[data-mem-all]")
                }}
              >
                Keep them
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="text"
              data-mem-all=""
              onClick={() => {
                setConfirming(true)
                focusNext("[data-mem-keep]")
              }}
            >
              Forget all of it
            </Button>
          )
        ) : null}
      </div>
      {facts.length ? (
        <ul className="flex flex-col divide-y divide-hairline">
          {facts.map((f, i) => (
            <li key={f.id} className="flex items-start gap-3 px-4 py-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-xs text-ink">{f.text}</span>
                <span className="text-2xs text-ink-secondary">{f.from}</span>
              </div>
              <button
                type="button"
                className="mem-forget"
                aria-label={`Forget: ${f.text}`}
                title="Forget this"
                onClick={() => {
                  // The next fact's ×, or the one before when it was the last, or the heading.
                  const next = facts[i + 1] ?? facts[i - 1]
                  focusNext(next ? `[data-mem-id="${CSS.escape(next.id)}"]` : "h3")
                  forget([f.id], "Forgotten")
                }}
                data-mem-id={f.id}
              >
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-xs text-ink-secondary">AiMY isn&apos;t carrying anything forward.</p>
      )}
    </section>
  )
}
