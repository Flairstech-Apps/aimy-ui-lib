"use client"

import { Mic, MicOff, NotebookPen, X } from "lucide-react"
import { Dialog as Primitive } from "radix-ui"
import { useRef } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Orb } from "@/components/orb"
import { VOICE_SAY, voiceClock, type VoicePhase } from "@/hooks/use-voice"
import { cn } from "@/lib/utils"

// A voice conversation is a place, not a row (both products' voice.js): the
// page goes away and one orb stays, with a line saying what it is doing and
// two round buttons, mute and end. No transcript on screen; the thread keeps
// the record behind the stage, so ending it lands you on what was said.
//
// Drive it with useVoiceSession, or with your own state:
//
//   const v = useVoiceSession({ ask })
//   <Composer onVoice={v.start} … />
//   <VoiceStage open={v.active} phase={v.phase} heard={v.heard} error={v.error}
//     level={v.level} seconds={v.seconds} onEnd={v.end} onMute={v.toggleMute}
//     onInterrupt={v.interrupt} />
//
// The orb is a button only while AiMY answers: tapping it cuts the answer off,
// the way you would interrupt a person. Red means recording, so a muted mic is
// red; ending is the ink inverted, not red, because ending is not an alarm.

type VoiceStageProps = {
  open: boolean
  phase: VoicePhase
  /** What you are saying, or what AiMY is doing, under the state line. */
  heard?: string
  /** Shown in place of the state when phase is "error". */
  error?: string
  /** Your voice, 0 to 1, for the orb. */
  level?: number
  /** Session length in seconds. */
  seconds?: number
  onEnd: () => void
  onMute?: () => void
  onInterrupt?: () => void
  /** Shows "Take meeting notes" under mute and end (Knowledge's note taker). */
  onTakeNotes?: () => void
  /** Replaces the state line, e.g. the note taker's consent (NoteTakerConsent). */
  asking?: React.ReactNode
  className?: string
}

export function VoiceStage({
  open,
  phase,
  heard,
  error,
  level = 0,
  seconds = 0,
  onEnd,
  onMute,
  onInterrupt,
  onTakeNotes,
  asking,
  className,
}: VoiceStageProps) {
  const end = useRef<HTMLButtonElement>(null)
  const failed = phase === "error"
  const muted = phase === "muted"
  return (
    <Primitive.Root open={open} onOpenChange={(o) => !o && onEnd()}>
      <Primitive.Portal>
        <Primitive.Content
          data-slot="voice-stage"
          data-phase={phase}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            end.current?.focus()
          }}
          className={cn("vx-stage outline-none", asking ? "nt-asking" : null, className)}
        >
          <Primitive.Title className="sr-only">Voice conversation with AiMY</Primitive.Title>
          <div className="vx-top">
            <span className="vx-logo">
              <AimyMark variant="lockup" className="h-8" />
            </span>
            {!failed ? (
              <span className="vx-clock vx-live-clock" role="timer" aria-label="Session length">
                {voiceClock(seconds)}
              </span>
            ) : null}
          </div>
          <div className="vx-center">
            <button
              type="button"
              className="vx-orb"
              aria-label="Interrupt AiMY"
              disabled={phase !== "speaking"}
              onClick={onInterrupt}
            >
              <Orb phase={phase} level={level} running={open} className="vx-silk" />
            </button>
            {asking ?? (
              <p className="vx-state" role="status" aria-live="polite">
                <b className="vx-state-n">{failed ? error : VOICE_SAY[phase]}</b>
                <span className="vx-heard">{failed ? "" : heard}</span>
              </p>
            )}
          </div>
          <div className="vx-dock">
            {!failed ? (
              <button
                type="button"
                className="vx-round vx-mute"
                aria-pressed={muted}
                aria-label={muted ? "Unmute" : "Mute"}
                title={muted ? "Unmute" : "Mute"}
                disabled={phase === "connecting"}
                onClick={onMute}
              >
                <Mic className="vx-i-on" aria-hidden="true" />
                <MicOff className="vx-i-off" aria-hidden="true" />
              </button>
            ) : null}
            <button
              ref={end}
              type="button"
              className="vx-round vx-end"
              aria-label={failed ? "Close" : "End the voice session"}
              title={failed ? "Close" : "End"}
              onClick={onEnd}
            >
              <X aria-hidden="true" />
            </button>
            {onTakeNotes && !failed ? (
              <>
                <span className="vx-dock-br" aria-hidden="true" />
                <button type="button" className="vx-notes" onClick={onTakeNotes}>
                  <NotebookPen aria-hidden="true" />
                  Take meeting notes
                </button>
              </>
            ) : null}
          </div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}
