"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// Voice, ported from the products' voice.js (Knowledge and Sales ship the
// same file). Two uses of the microphone:
//
// - Dictation: the composer's mic. The field gives way to a waveform and a
//   clock; keep puts the words in the field to edit, nothing is sent.
// - A voice session: the stage. AiMY listens, sends your question once you
//   pause, thinks, and reads the answer aloud; tap the orb to cut it off.
//
// Real or it says so: this uses the browser's own speech recognition (Chrome,
// Edge, Safari) and speech synthesis. Where recognition is missing or the
// microphone is refused, it says that in words and stops. It never makes up
// a sentence you did not say.

/** What the stage and the bars say, in one table so the words read together. */
export const VOICE_SAY = {
  connecting: "Starting the microphone",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Answering",
  muted: "You’re muted",
  hintSpeak: "Tap the circle to interrupt",
  hintMuted: "AiMY can’t hear you until you unmute",
  noSR: "Voice needs Chrome, Edge or Safari. This browser can’t turn speech into text.",
  blocked: "The microphone is blocked. Allow it from the address bar, then try again.",
  noMic: "No microphone was found.",
  network: "Speech recognition couldn’t reach its service. Check the connection and try again.",
  failed: "The microphone stopped unexpectedly. Try again.",
}

export type VoicePhase = "connecting" | "listening" | "thinking" | "speaking" | "muted" | "error"

/** How often the microphone level is read, and the waveform moves. */
const TICK_MS = 70
/** How long a pause has to be before a spoken turn is sent. Shorter cuts
 *  people off mid-thought; longer feels like the call dropped. */
const SETTLE_MS = 900

/* The browser's recognition API is not in TypeScript's DOM library. */
type RecResult = { isFinal: boolean; 0: { transcript: string } }
type Rec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<RecResult> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}
type RecCtor = new () => Rec
const SRC = (): RecCtor | undefined =>
  typeof window === "undefined"
    ? undefined
    : ((window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition)

/** True where the browser can turn speech into text. */
export const canDictate = () => !!SRC()

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/** m:ss, as both products show a recording's length. */
export const voiceClock = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0")

function micError(err: unknown) {
  const e = err as { name?: string; error?: string } | null
  const n = e && (e.name || e.error)
  if (n === "NotAllowedError" || n === "not-allowed" || n === "service-not-allowed" || n === "SecurityError")
    return VOICE_SAY.blocked
  if (n === "NotFoundError" || n === "audio-capture" || n === "OverconstrainedError") return VOICE_SAY.noMic
  if (n === "network") return VOICE_SAY.network
  return VOICE_SAY.failed
}

/* A language with a region, always. Edge answers a bare `en` with the error
   `network` the moment the mic opens; `en-US` works. The page's language
   chooses which language, the person's own browser list gives the region. */
function speechLang() {
  const page = (document.documentElement.lang || "").trim()
  if (/^[a-z]{2,3}-[A-Za-z]{2,4}$/i.test(page)) return page
  const mine = ([] as string[]).concat(navigator.languages || [], navigator.language || [])
  const base = (page || mine[0] || "en").split("-")[0]!.toLowerCase()
  const near = mine.find((l) => l.toLowerCase().indexOf(base + "-") === 0)
  return (
    near ||
    ({ en: "en-US", ar: "ar-EG", fr: "fr-FR", de: "de-DE", es: "es-ES" } as Record<string, string>)[base] ||
    base
  )
}

/* The microphone and its level, shared by dictation and the session. The
   level is the RMS of the last window, lifted so ordinary speech reaches the
   top third rather than hugging the floor. */
function useMic() {
  const m = useRef<{
    stream?: MediaStream
    ctx?: AudioContext
    analyser?: AnalyserNode
    buf?: Uint8Array<ArrayBuffer>
  }>({})
  const open = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) throw { name: "NotFoundError" }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    })
    m.current.stream = stream
    const AC =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC) {
      const ctx = new AC()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      m.current = { stream, ctx, analyser, buf: new Uint8Array(analyser.fftSize) }
    }
  }, [])
  const close = useCallback(() => {
    m.current.stream?.getTracks().forEach((t) => t.stop())
    m.current.ctx?.close().catch(() => {})
    m.current = {}
  }, [])
  const level = useCallback(() => {
    const { analyser, buf } = m.current
    if (!analyser || !buf) return 0
    analyser.getByteTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i]! - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / buf.length) * 5.5)
  }, [])
  return useMemo(() => ({ open, close, level }), [open, close, level])
}

/* Recognition that keeps going: Chrome ends a continuous session on its own
   after a minute or a long silence, so while we still want to hear it is
   restarted. */
function useRecognition(onWords: (finals: string, interim: string) => void, onFail: (msg: string) => void) {
  const r = useRef<{ rec: Rec | null; want: boolean; finals: string }>({ rec: null, want: false, finals: "" })
  const words = useRef(onWords)
  const fail = useRef(onFail)
  useEffect(() => {
    words.current = onWords
    fail.current = onFail
  })
  const listen = useCallback(() => {
    const Ctor = SRC()
    if (!Ctor) return
    r.current.want = true
    if (!r.current.rec) {
      const rec = new Ctor()
      rec.lang = speechLang()
      rec.continuous = true
      rec.interimResults = true
      rec.onresult = (e) => {
        let interim = ""
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i]!
          const t = res[0].transcript
          if (res.isFinal) r.current.finals += (r.current.finals && !/\s$/.test(r.current.finals) ? " " : "") + t.trim()
          else interim += t
        }
        words.current(r.current.finals, interim.trim())
      }
      // Silence and our own stops are not faults.
      rec.onerror = (e) => {
        if (e.error === "no-speech" || e.error === "aborted") return
        r.current.want = false
        r.current.rec = null
        fail.current(micError(e))
      }
      rec.onend = () => {
        if (r.current.want && r.current.rec === rec) {
          try {
            rec.start()
          } catch {
            /* already running */
          }
        }
      }
      r.current.rec = rec
    }
    try {
      r.current.rec.start()
    } catch {
      /* already running */
    }
  }, [])
  const deafen = useCallback(() => {
    r.current.want = false
    try {
      r.current.rec?.abort()
    } catch {
      /* gone */
    }
    r.current.rec = null
  }, [])
  const reset = useCallback(() => {
    r.current.finals = ""
  }, [])
  return useMemo(() => ({ listen, deafen, reset }), [listen, deafen, reset])
}

function useSeconds(running: boolean) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [running])
  return [secs, setSecs] as const
}

export type DictationState = "idle" | "rec" | "note"

/**
 * The composer's mic. `start` opens the microphone and shows the waveform;
 * `stop(true)` hands what was said to `onText`, `stop(false)` drops it. A
 * dictation that cannot start says why (`note`) and leaves the field alone.
 */
export function useDictation({ onText, bars = 48 }: { onText: (said: string) => void; bars?: number }) {
  const [state, setState] = useState<DictationState>("idle")
  const [note, setNote] = useState("")
  const [levels, setLevels] = useState<number[]>(() => new Array(bars).fill(0))
  const [seconds, setSeconds] = useSeconds(state === "rec")
  const said = useRef({ finals: "", interim: "" })
  const mic = useMic()
  const live = useRef(false)

  const showNote = useCallback((msg: string) => {
    setNote(msg)
    setState("note")
  }, [])

  const rec = useRecognition(
    (finals, interim) => {
      said.current = { finals, interim }
    },
    (msg) => {
      live.current = false
      mic.close()
      showNote(msg)
    }
  )

  const start = useCallback(async () => {
    if (live.current) return
    if (!SRC()) {
      showNote(VOICE_SAY.noSR)
      return
    }
    live.current = true
    said.current = { finals: "", interim: "" }
    rec.reset()
    setSeconds(0)
    setLevels(new Array(bars).fill(0))
    setState("rec")
    try {
      await mic.open()
    } catch (err) {
      if (!live.current) return
      live.current = false
      showNote(micError(err))
      setState("note")
      return
    }
    if (!live.current) {
      mic.close()
      return
    }
    rec.listen()
  }, [bars, mic, rec, setSeconds, showNote])

  const stop = useCallback(
    (keep: boolean) => {
      if (!live.current) return
      live.current = false
      const words = (said.current.finals + (said.current.interim ? " " + said.current.interim : "")).trim()
      rec.deafen()
      mic.close()
      setState("idle")
      if (keep && words) onText(words)
    },
    [mic, onText, rec]
  )

  const closeNote = useCallback(() => setState("idle"), [])

  // The waveform: the last few seconds of your voice, newest at the right.
  useEffect(() => {
    if (state !== "rec" || reduced()) return
    const t = window.setInterval(() => setLevels((l) => [...l.slice(1), mic.level()]), TICK_MS)
    return () => window.clearInterval(t)
  }, [state, mic])

  useEffect(
    () => () => {
      rec.deafen()
      mic.close()
    },
    [mic, rec]
  )

  return { state, note, levels, seconds, start, stop, closeNote }
}

/**
 * A voice conversation. Pass `ask`, which sends the question the way a typed
 * one is sent and resolves with the answer's text to read aloud; the thread
 * keeps the record. `start` must run from a click: it also unlocks speech.
 */
export function useVoiceSession({ ask }: { ask: (question: string) => Promise<string> }) {
  const [active, setActive] = useState(false)
  const [phase, setPhaseState] = useState<VoicePhase>("connecting")
  const [heard, setHeard] = useState("")
  const [error, setError] = useState("")
  const [level, setLevel] = useState(0)
  const [seconds, setSeconds] = useSeconds(active && phase !== "error")
  const s = useRef({ active: false, phase: "connecting" as VoicePhase, settle: 0, turn: 0 })
  const mic = useMic()
  const askRef = useRef(ask)
  useEffect(() => {
    askRef.current = ask
  })

  const setPhase = useCallback((p: VoicePhase) => {
    s.current.phase = p
    setPhaseState(p)
    setHeard(p === "speaking" ? VOICE_SAY.hintSpeak : p === "muted" ? VOICE_SAY.hintMuted : "")
  }, [])

  const tts = typeof window !== "undefined" ? window.speechSynthesis : undefined

  // Recognition calls back into handlers declared further down.
  const later = useRef<{ askNow: (q: string) => void; fail: (msg: string) => void }>({
    askNow: () => {},
    fail: () => {},
  })
  const rec = useRecognition(
    (finals, interim) => {
      if (!s.current.active || s.current.phase !== "listening") return
      const t = (finals + (interim ? " " + interim : "")).trim()
      // What you are saying is read at its newest end.
      setHeard(t.length > 120 ? "…" + t.slice(-120).replace(/^\S*\s/, "") : t)
      window.clearTimeout(s.current.settle)
      if (finals && !interim) s.current.settle = window.setTimeout(() => later.current.askNow(finals), SETTLE_MS)
    },
    (msg) => later.current.fail(msg)
  )

  const resume = useCallback(() => {
    if (!s.current.active) return
    setPhase("listening")
    rec.reset()
    rec.listen()
  }, [rec, setPhase])

  const speak = useCallback(
    (text: string) => {
      if (!s.current.active) return
      if (!tts || !text) {
        resume()
        return
      }
      setPhase("speaking")
      const u = new SpeechSynthesisUtterance(text)
      u.lang = speechLang()
      u.rate = 1.04
      u.onend = u.onerror = () => {
        if (s.current.active && s.current.phase === "speaking") resume()
      }
      tts.cancel()
      tts.speak(u)
    },
    [resume, setPhase, tts]
  )

  // Not listening while AiMY answers: its own voice would be heard as yours.
  // The mic stays open, so picking up again is instant.
  const askNow = (q: string) => {
    if (!s.current.active || s.current.phase !== "listening" || !q.trim()) return
    rec.deafen()
    setPhase("thinking")
    setHeard(q)
    const turn = ++s.current.turn
    askRef
      .current(q.trim())
      .then((answer) => {
        if (s.current.active && s.current.turn === turn && s.current.phase === "thinking") speak(answer)
      })
      .catch(() => {
        if (s.current.active && s.current.turn === turn) resume()
      })
  }

  const fail = (msg: string) => {
    rec.deafen()
    mic.close()
    window.clearTimeout(s.current.settle)
    tts?.cancel()
    setError(msg)
    setPhase("error")
  }

  useEffect(() => {
    later.current = { askNow, fail }
  })

  const start = useCallback(async () => {
    if (s.current.active) return
    s.current.active = true
    setActive(true)
    setError("")
    setSeconds(0)
    if (!SRC()) {
      setError(VOICE_SAY.noSR)
      setPhase("error")
      return
    }
    setPhase("connecting")
    // Speech synthesis needs a user gesture to unlock; this click is the one.
    try {
      tts?.cancel()
      tts?.speak(new SpeechSynthesisUtterance(""))
    } catch {
      /* no speech */
    }
    try {
      await mic.open()
    } catch (err) {
      if (s.current.active) later.current.fail(micError(err))
      return
    }
    if (!s.current.active) {
      mic.close()
      return
    }
    resume()
  }, [mic, resume, setPhase, setSeconds, tts])

  const end = useCallback(() => {
    s.current.active = false
    s.current.turn++
    rec.deafen()
    mic.close()
    window.clearTimeout(s.current.settle)
    tts?.cancel()
    setActive(false)
    setLevel(0)
  }, [mic, rec, tts])

  /** Tapping the orb while it answers. */
  const interrupt = useCallback(() => {
    if (s.current.phase !== "speaking") return
    tts?.cancel()
    resume()
  }, [resume, tts])

  const toggleMute = useCallback(() => {
    if (!s.current.active) return
    if (s.current.phase === "muted") {
      resume()
      return
    }
    window.clearTimeout(s.current.settle)
    rec.deafen()
    tts?.cancel()
    setPhase("muted")
  }, [rec, resume, setPhase, tts])

  // The orb only hears you while it is listening: its own voice is not yours.
  useEffect(() => {
    if (!active || phase !== "listening") return
    const t = window.setInterval(() => setLevel(mic.level()), TICK_MS)
    return () => {
      window.clearInterval(t)
      setLevel(0)
    }
  }, [active, phase, mic])

  useEffect(() => end, [end])

  return { active, phase, heard, error, level, seconds, start, end, interrupt, toggleMute }
}
