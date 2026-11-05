"use client"

import { Pause, Play } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Sales' recording strip from the call log (vmStrip in bdr.js, .b-log-vm in
// bdr.css). Something said on a call, with a length, that you can listen to:
// the recording of a call where somebody spoke, or the message they left on a
// missed one. To the reader they are the same object, so they are one strip.
//
// - A voice note, drawn the way messaging apps draw one: play, a waveform and
//   how long is left, counting down. No transcript: the words are what playing
//   it is for.
// - The waveform is the recording's own: 28 bars seeded by its id, so one
//   looks the same every time it is drawn and two never look alike. It is not
//   the audio's amplitude.
// - One plays at a time across the page. Starting one stops the last, and
//   pressing the one that is playing stops it.
// - It hangs under the row it belongs to, indented to the row's text, and is
//   capped at 340px: a waveform stretched across a wide page is a rule with a
//   button on the end.
//
//   <CallRecording id={call.id} seconds={call.seconds} src={call.audioUrl} />
//   <CallRecording id={call.id} seconds={42} kind="message" src={call.voicemailUrl} />

type CallRecordingProps = {
  /** The call's id. Seeds the waveform, so the same recording always draws the same shape. */
  id: string
  /** How long it is, in seconds. */
  seconds: number
  /** The audio. Without it the strip runs for its length and plays nothing, for demos. */
  src?: string
  /** The recording of a call, or the message they left on a missed one. Names the button. */
  kind?: "call" | "message"
  className?: string
}

const BARS = 28

// FNV-1a, Sales' hash: a stable number per string.
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h | 0
}

// 18% to 96% of the strip's height, each bar off its own salt.
const wave = (id: string) => Array.from({ length: BARS }, (_, b) => 18 + (Math.abs(hash(`${id}:w${b}`)) % 79))

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

// The strip that is playing, so the next one to start can stop it.
let playingNow: { owner: object; stop: () => void } | null = null

export function CallRecording({ id, seconds, src, kind = "call", className }: CallRecordingProps) {
  const [playing, setPlaying] = useState(false)
  const [left, setLeft] = useState(seconds)
  const fill = useRef<HTMLSpanElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const run = useRef<{ tick: number; anim?: Animation }>(null)
  const self = useRef({})

  const stop = useCallback(() => {
    if (run.current) {
      clearInterval(run.current.tick)
      run.current.anim?.cancel()
      run.current = null
    }
    const a = audio.current
    if (a) {
      a.pause()
      a.currentTime = 0
    }
    if (playingNow?.owner === self.current) playingNow = null
    setPlaying(false)
    setLeft(seconds)
  }, [seconds])

  const start = () => {
    playingNow?.stop()
    playingNow = { owner: self.current, stop }
    setPlaying(true)
    const t0 = performance.now()
    const a = audio.current
    a?.play().catch(stop)
    // The fill runs as one animation over the whole length, as Sales' does: smooth, and off the main
    // thread. Under reduced motion there is none, and the class below shows it whole.
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const anim =
      still || typeof fill.current?.animate !== "function"
        ? undefined
        : fill.current.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], {
            duration: seconds * 1000,
            easing: "linear",
            fill: "forwards",
          })
    // The clock is what is left, read four times a second, as Sales' is. With audio it follows the audio,
    // and keeps the fill in step with it when the audio stalls to load.
    const tick = window.setInterval(() => {
      const at = a ? a.currentTime : (performance.now() - t0) / 1000
      if (at >= seconds || a?.ended) {
        stop()
        return
      }
      if (a && anim) anim.currentTime = at * 1000
      setLeft(Math.max(0, Math.ceil(seconds - at)))
    }, 250)
    run.current = { tick, anim }
  }

  // Stops when it leaves the page, or when its length changes under it.
  useEffect(() => stop, [stop])

  const bars = wave(id)
  const drawBars = (played: boolean) =>
    bars.map((h, b) => (
      <i
        key={b}
        style={{ height: `${h}%` }}
        className={cn(
          "min-w-0 flex-1 rounded-pill",
          played
            ? "bg-accent-text"
            : "bg-[color-mix(in_srgb,var(--accent)_30%,transparent)] in-data-[theme=light]:bg-[color-mix(in_srgb,var(--accent)_26%,transparent)]"
        )}
      />
    ))

  return (
    <button
      type="button"
      data-slot="call-recording"
      aria-pressed={playing}
      aria-label={`${kind === "message" ? "Play the message they left" : "Play the recording of the call"}, ${clock(seconds)}`}
      onClick={() => (playing ? stop() : start())}
      className={cn(
        "flex h-10 w-full max-w-[340px] cursor-pointer items-center gap-2.5 rounded-pill border-0 pr-3 pl-2 text-left",
        "bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] transition-[background-color] duration-(--t-fast) ease-out hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] motion-reduce:transition-none",
        className
      )}
    >
      {src ? <audio ref={audio} src={src} preload="none" /> : null}
      <span className="flex size-6.5 flex-none items-center justify-center rounded-pill bg-accent-text text-(--body-bg)">
        {/* The triangle is optically left-heavy in its box, so it is nudged back onto the circle's centre. */}
        {playing ? (
          <Pause aria-hidden="true" className="size-3 fill-current stroke-0" />
        ) : (
          <Play aria-hidden="true" className="ml-px size-3 fill-current stroke-0" />
        )}
      </span>
      <span aria-hidden="true" className="relative h-5.5 min-w-0 flex-1">
        <span className="absolute inset-0 flex items-center gap-0.5">{drawBars(false)}</span>
        {/* The played half: the same bars, clipped from the right as it plays. Clipping is paint-only,
            so the two stay in register. Reduced motion states the fill instead of travelling to it. */}
        <span
          ref={fill}
          className={cn(
            "absolute inset-0 flex items-center gap-0.5 [clip-path:inset(0_100%_0_0)]",
            playing ? "motion-reduce:[clip-path:inset(0)]" : null
          )}
        >
          {drawBars(true)}
        </span>
      </span>
      <span className="min-w-8 flex-none text-right text-2xs font-semibold text-ink-secondary tabular-nums">
        {clock(left)}
      </span>
    </button>
  )
}
