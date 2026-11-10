"use client"

// What the float bar's peek becomes when it is dragged up (lab heroes C and
// C3): one wide canvas, not three cramped columns. The part gets the room
// (a dotted stage, never truncated), AiMY's answer sits beside it in full,
// and the install command runs on one line along the foot.

import { ArrowUpRight, SquareTerminal, X } from "lucide-react"
import Link from "next/link"
import type { VoicePhase } from "@/registry/aimy/hooks/use-voice"
import { CopyButton } from "@/registry/aimy/ui/copy-button"
import { IconButton } from "@/registry/aimy/ui/icon-button"
import { Orb } from "@/registry/aimy/ui/orb"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { ThinkingIndicator } from "@/registry/aimy/ui/thinking"

export type CanvasPart = { name: string; href: string; preview: React.ReactNode; command: string }

/** A command on one line with its Copy, for heroes and canvases (not the docs' code block). */
export function CommandLine({ command, what = "the command" }: { command: string; what?: string }) {
  return (
    <div
      data-theme="dark"
      className="flex min-w-0 items-center gap-3 rounded-xl border border-edge bg-code py-1.5 pr-1.5 pl-4 column:rounded-pill"
    >
      <SquareTerminal aria-hidden="true" strokeWidth={2} className="size-4 shrink-0 text-ink-secondary" />
      {/* Never clipped and never under Copy: it breaks only when the line runs out of room. */}
      <code className="min-w-0 flex-1 py-1 font-mono text-xs text-[var(--syn-base)] [overflow-wrap:anywhere]">
        {command}
      </code>
      <CopyButton value={command} what={what} className="shrink-0" />
    </div>
  )
}

export function AnswerCanvas({
  part,
  question,
  answer,
  phase,
  speaker = true,
  onClose,
}: {
  part: CanvasPart | null
  question: string
  answer: string
  phase: VoicePhase
  /** Draw the orb small in the head, as the voice that answered (off when the scene keeps its own orb). */
  speaker?: boolean
  onClose: () => void
}) {
  const thinking = phase === "thinking"
  return (
    <section
      aria-label={part ? part.name : "AiMY's answer"}
      className="w-full overflow-hidden rounded-2xl border border-edge bg-card/85 text-left shadow-lg backdrop-blur-md"
    >
      <header className="flex items-center gap-3 border-b border-hairline py-3 pr-3 pl-4">
        {speaker ? (
          <div className="size-10 shrink-0">
            <Orb phase={phase} level={0} running />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold text-ink">{thinking || !part ? "Finding the part" : part.name}</p>
          <p className="truncate text-meta text-ink-secondary">You asked: {question}</p>
        </div>
        {part && !thinking ? (
          <Link
            href={part.href}
            className="group hidden shrink-0 items-center gap-1 rounded-sm text-meta font-semibold text-ink-action phone:inline-flex"
          >
            Open its page
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={2}
              className="size-4 transition-transform duration-(--t-fast) ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
        <IconButton label="Close the canvas" onClick={onClose}>
          <X />
        </IconButton>
      </header>
      <div className="grid column:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="docs-stage flex min-h-[19rem] items-center justify-center p-6 phone:p-10">
          {thinking || !part ? (
            <ThinkingIndicator label={["Searching the library", "Reading its rules"]} />
          ) : (
            <div className="w-full max-w-[36rem]">{part.preview}</div>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-hairline p-5 column:border-t-0 column:border-l">
          <p className="text-xs font-semibold text-ink-secondary">AiMY</p>
          {answer ? (
            <StreamingText text={answer} streaming={phase === "speaking"} className="text-body text-ink" />
          ) : (
            <p className="text-body text-ink-secondary">Reading the library…</p>
          )}
        </div>
      </div>
      {part && !thinking ? (
        <footer className="border-t border-hairline p-3">
          <CommandLine command={part.command} what="the install command" />
        </footer>
      ) : null}
    </section>
  )
}
