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
    // On a phone it changes form: the command as an even block across the full width, Copy
    // under it at the right. From the phone rung up it is one row, breaking only when the line
    // runs out of room, and a pill once it fits on one line. Never clipped, never under Copy.
    <div
      data-theme="dark"
      className="flex min-w-0 flex-col gap-2 rounded-xl border border-edge bg-code p-3 text-left phone:flex-row phone:items-center phone:gap-3 phone:py-1.5 phone:pr-1.5 phone:pl-4 column:rounded-pill"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 phone:items-center">
        <SquareTerminal aria-hidden="true" strokeWidth={2} className="mt-1.5 size-4 shrink-0 text-ink-secondary phone:mt-0" />
        <code className="min-w-0 flex-1 py-1 font-mono text-xs leading-relaxed break-all text-[var(--syn-base)] phone:break-normal phone:[overflow-wrap:anywhere]">
          {command}
        </code>
      </div>
      <CopyButton value={command} what={what} className="shrink-0 self-end phone:self-auto" />
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
          <p className="text-meta text-ink-secondary">You asked: {question}</p>
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
