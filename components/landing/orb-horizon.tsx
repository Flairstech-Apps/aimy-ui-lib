"use client"

// The float bar's dock (the Peek over the Composer) and the orb horizon scene:
// the orb rising behind the curve of a lit ground (.horizon-glow and
// .horizon-ground in app/globals.css), with the dock resting on the line. The
// landing's footer and the lab's variants use both.

import { useState } from "react"
import type { VoicePhase } from "@/registry/aimy/hooks/use-voice"
import { Composer } from "@/registry/aimy/ui/composer"
import { Orb } from "@/registry/aimy/ui/orb"
import { Peek } from "@/registry/aimy/ui/peek"
import { StreamingText } from "@/registry/aimy/ui/streaming-text"
import { ASKS, type useAsk } from "./ask"

/** C's dock: the Peek rising over the float bar. */
export function FloatDock({
  a,
  onAsk,
  onOpen,
  peek = true,
}: {
  a: ReturnType<typeof useAsk>
  onAsk: (q: string) => void
  onOpen?: () => void
  /** Off while the canvas is open: the peek has become the canvas. */
  peek?: boolean
}) {
  const [gone, setGone] = useState(false)
  const ask = (q: string) => {
    setGone(false)
    onAsk(q)
  }
  const status = a.phase === "thinking" ? "thinking" : a.phase === "speaking" ? "streaming" : "answered"
  return (
    <div className="relative w-full">
      {a.question && !gone && peek ? (
        <Peek
          status={status}
          thinkingLabel={["Searching the library", "Reading its rules"]}
          onOpenCanvas={() => onOpen?.()}
          onDismiss={() => setGone(true)}
        >
          <StreamingText text={a.shown} streaming={a.phase === "speaking"} />
        </Peek>
      ) : null}
      <Composer
        placeholder="Ask AiMY for a part"
        dictate={false}
        generating={a.busy}
        onStop={a.stop}
        onSubmit={(q) => ask(q.trim() || ASKS[0]!)}
        onVoice={() => ask(ASKS[0]!)}
      />
    </div>
  )
}

/** The orb on the horizon: it rises behind the curve of a lit ground, half
    hidden, and whatever is docked sits on the line. Used by Hero C3 and Footer H. */
export function OrbHorizon({
  phase,
  level,
  running,
  line,
  orb = "min(28rem, 80vw)",
  dock,
  children,
}: {
  phase: VoicePhase
  level: number
  running: boolean
  /** Distance from the scene's top to the horizon. */
  line: string
  orb?: string
  /** Rests on the line, half above it (the float bar). */
  dock?: React.ReactNode
  /** Sits in the ground, under the line. */
  children?: React.ReactNode
}) {
  return (
    <div className="relative w-full" style={{ "--line": line } as React.CSSProperties}>
      <div aria-hidden="true" className="horizon-glow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: `calc(var(--line) - ${orb} * 0.72)`, width: orb, height: orb }}
      >
        <Orb phase={phase} level={level} running={running} />
      </div>
      <div aria-hidden="true" className="horizon-ground" />
      {dock ? (
        <div className="absolute inset-x-0 z-[1] px-5" style={{ top: "calc(var(--line) - 1.625rem)" }}>
          <div className="mx-auto w-full max-w-[40rem]">{dock}</div>
        </div>
      ) : null}
      <div className="relative z-[1]" style={{ paddingTop: `calc(var(--line) + ${dock ? "4rem" : "2.5rem"})` }}>
        {children}
      </div>
    </div>
  )
}
