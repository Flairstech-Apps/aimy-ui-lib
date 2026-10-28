import { AudioLines, Check, FileText, Mic, Paperclip, Send, X } from "lucide-react"
import { Popover } from "radix-ui"
import { useEffect, useId, useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { CountBadge } from "@/components/count-badge"
import { useDictation, voiceClock } from "@/hooks/use-voice"
import type { Attachment } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

export type Usage = {
  /** How full the current slice is, 0 to 1. */
  fill: number
  tone?: "warn" | "err"
  /** Said to screen readers: "Your usage: 67% of this slice, past your share". */
  label: string
  /** The popover: usually <UsageSummary />. */
  content: React.ReactNode
}

/* The mark with its ring. Hover opens the numbers after 220ms and leaves a
   240ms grace to reach them; focus opens them; a press pins them; Escape
   closes them and returns to the mark (Knowledge's usage widget). */
function UsageMark({ usage, badge }: { usage: Usage; badge?: number }) {
  const [open, setOpen] = useState(false)
  const t = useRef<number | undefined>(undefined)
  const later = (fn: () => void, ms: number) => {
    window.clearTimeout(t.current)
    t.current = window.setTimeout(fn, ms)
  }
  const hover = typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn("aimy-float-icon has-use", usage.tone && `is-${usage.tone}`)}
          style={{ "--use": Math.min(1, Math.max(0, usage.fill)) } as React.CSSProperties}
          aria-label={usage.label}
          onPointerEnter={() => hover && later(() => setOpen(true), 220)}
          onPointerLeave={() => hover && later(() => setOpen(false), 240)}
          onFocus={() => setOpen(true)}
          // A press pins it open (Radix would toggle it shut after focus opened it).
          onClick={(e) => {
            e.preventDefault()
            setOpen(true)
          }}
        >
          <AimyMark title="" />
          {badge ? <CountBadge count={badge} label="alerts from AiMY" /> : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          aria-label="Your usage"
          className="use-pop outline-none"
          onPointerEnter={() => window.clearTimeout(t.current)}
          onPointerLeave={() => hover && later(() => setOpen(false), 240)}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {usage.content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// Where a person asks AiMY: one composer, everywhere, as the products' live
// voice.js arranges it (ai.css draws the bar, voice.css the rest).
//
//   at rest    [mark] [ field ............. ] [clip][mic] (◉ voice)
//   typing     [mark] [ field ............. ] [clip][mic] (➤ send)
//   dictating  [mark] [ ▁▂▅▇▅▂ waveform  0:07 ]  [✕] [✓]
//
// "float" is the single-line bar over the work; "canvas" is the bar at the
// foot of the canvas, which takes several lines (Shift+Enter). Enter sends;
// nothing empty is sent.
//
// The mic dictates (Sales' "Say it instead of typing"): the field gives way to
// a waveform and a clock in recording red, and the way out is two buttons,
// cancel and keep. Keep puts the words in the field to edit; nothing is sent.
// Empty, the send slot is the voice button when you pass onVoice (a voice
// session, see VoiceStage); with text in the field it is send again. While
// AiMY answers, the beam rides the border and send becomes stop; stop keeps
// whatever was already written.
//
// A file is a row of its own inside the bar, which grows to hold it, and says
// what happened to it ("not uploaded" until you upload it).
//
//   <Composer onSubmit={ask} generating={busy} onStop={stop} onVoice={voice.start} />

type ComposerProps = {
  variant?: "float" | "canvas"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called with the trimmed text. An uncontrolled composer then clears. */
  onSubmit: (text: string) => void
  /** True while AiMY is answering. */
  generating?: boolean
  onStop?: () => void
  /** Starts a voice session from the empty bar. Leave out for no voice button. */
  onVoice?: () => void
  /** Shows the mic for dictation. On by default. */
  dictate?: boolean
  /**
   * AiMY can't answer right now. Pass what still works, in the placeholder's
   * words: "AiMY is unavailable — the filters still work". The bar stays, the
   * text stays, and a question sent now goes when AiMY is back.
   */
  unavailable?: string
  placeholder?: string
  /** Accessible name for the text box. Defaults to the placeholder. */
  label?: string
  /** A count on the AiMY icon, such as unread alerts (Knowledge's .float-badge, drawn as CountBadge). */
  badge?: number
  attachments?: Attachment[]
  onAttach?: (file: File) => void
  onRemoveAttachment?: (id: string) => void
  /**
   * The usage ring on the AiMY mark (Knowledge's, ported to Sales): how full
   * the current slice is, and a popover with the numbers (UsageSummary).
   */
  usage?: Usage
  /** What the send button says to a screen reader. Sales' float bar says "Run". */
  sendLabel?: string
  className?: string
}

/** The waveform's bars: enough to run edge to edge in the widest bar. */
const BARS = 200
/** The attachment row's collapse, matched to --t-fast in voice.css. */
const CHIP_OUT_MS = 150

export function Composer({
  variant = "float",
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  generating = false,
  onStop,
  onVoice,
  dictate = true,
  unavailable,
  placeholder = variant === "float" ? "Ask, filter, or name a contact…" : "Ask AiMY anything…",
  label,
  badge,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  sendLabel = "Send",
  usage,
  className,
}: ComposerProps) {
  const [inner, setInner] = useState(defaultValue)
  const text = value ?? inner
  const [leaving, setLeaving] = useState<string[]>([])
  // A question sent while AiMY is unavailable waits here, and goes when it is back.
  const [queued, setQueued] = useState<string | null>(null)
  const [wasDown, setWasDown] = useState(!!unavailable)
  const [flush, setFlush] = useState<{ text: string } | null>(null)
  if (!!unavailable !== wasDown) {
    setWasDown(!!unavailable)
    if (!unavailable && queued) {
      setQueued(null)
      setFlush({ text: queued })
      if (value === undefined) setInner("")
    }
  }
  const submit = useRef(onSubmit)
  useEffect(() => {
    submit.current = onSubmit
  })
  useEffect(() => {
    if (flush) submit.current(flush.text)
  }, [flush])
  const fileRef = useRef<HTMLInputElement>(null)
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const keep = useRef<HTMLButtonElement>(null)
  const closeNote = useRef<HTMLButtonElement>(null)
  const prefix = useRef("")
  const id = useId()
  const float = variant === "float"
  const empty = !text.trim()
  const voiceFace = !!onVoice && empty && !generating && !unavailable

  const set = (v: string) => {
    if (value === undefined) setInner(v)
    onValueChange?.(v)
  }

  const focusEnd = () =>
    window.setTimeout(() => {
      const f = field.current
      if (!f) return
      f.focus()
      f.setSelectionRange(f.value.length, f.value.length)
    })

  const dictation = useDictation({
    bars: BARS,
    onText: (said) => set((prefix.current ? prefix.current + " " : "") + said),
  })
  const vx = dictation.state === "idle" ? undefined : dictation.state

  const startDictation = async () => {
    prefix.current = text.replace(/\s+$/, "")
    window.setTimeout(() => (keep.current ?? closeNote.current)?.focus())
    await dictation.start()
    window.setTimeout(() => closeNote.current?.focus())
  }
  const stopDictation = (k: boolean) => {
    dictation.stop(k)
    focusEnd()
  }

  const send = () => {
    if (generating) {
      onStop?.()
      return
    }
    const t = text.trim()
    if (unavailable) {
      if (t) setQueued(t)
      return
    }
    if (!t) {
      onVoice?.()
      return
    }
    onSubmit(t)
    if (value === undefined) setInner("")
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (!generating && !empty) send()
    }
  }

  // Escape cancels dictation or closes its note; Enter on keep is keep.
  const onVxKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return
    e.stopPropagation()
    if (dictation.state === "rec") stopDictation(false)
    else {
      dictation.closeNote()
      focusEnd()
    }
  }

  const removeFile = (fileId: string) => {
    setLeaving((l) => [...l, fileId])
    window.setTimeout(() => {
      setLeaving((l) => l.filter((x) => x !== fileId))
      onRemoveAttachment?.(fileId)
      focusEnd()
    }, CHIP_OUT_MS)
  }

  const fieldProps = {
    id: `${id}-input`,
    ref: field,
    value: text,
    placeholder: unavailable ?? (generating ? "Generating…" : placeholder),
    "aria-label": label ?? placeholder,
    onKeyDown,
  }

  const sendName = unavailable
    ? queued
      ? "Sends when AiMY is back"
      : "AiMY is unavailable"
    : generating
      ? "Stop generating"
      : voiceFace
        ? "Start a voice session"
        : sendLabel

  const bar = (
    <div
      data-slot="composer"
      data-variant={variant}
      data-vx={vx}
      className={cn(
        float ? "aimy-float-bar" : "overlay-input-bar",
        generating && "is-generating",
        unavailable && "is-degraded",
        onVoice && empty && !unavailable && "vx-empty",
        attachments.length > 0 && "vx-has-file",
        float && className
      )}
    >
      <span className="beam" aria-hidden="true">
        <i />
      </span>
      {usage ? (
        <UsageMark usage={usage} badge={badge} />
      ) : (
        <span className="aimy-float-icon">
          <AimyMark title="" />
          {badge ? <CountBadge count={badge} label="alerts from AiMY" /> : null}
        </span>
      )}
      {float ? (
        <input {...fieldProps} className="aimy-float-input" onChange={(e) => set(e.target.value)} />
      ) : (
        <textarea {...fieldProps} rows={1} className="overlay-input" onChange={(e) => set(e.target.value)} />
      )}

      {dictation.state === "rec" ? (
        <span className="vx-read" onKeyDown={onVxKey}>
          <span className="vx-wave" aria-hidden="true">
            {dictation.levels.map((l, i) => (
              <i key={i} style={{ transform: `scaleY(${Math.max(0.12, l).toFixed(3)})` }} />
            ))}
          </span>
          <span className="vx-clock" role="timer" aria-label="Dictating for">
            {voiceClock(dictation.seconds)}
          </span>
          <button
            type="button"
            className="vx-ctl vx-drop"
            aria-label="Cancel dictation"
            title="Cancel"
            onClick={() => stopDictation(false)}
          >
            <X aria-hidden="true" />
          </button>
          <button
            ref={keep}
            type="button"
            className="vx-ctl vx-keep"
            aria-label="Use what I said"
            title="Done"
            onClick={() => stopDictation(true)}
          >
            <Check aria-hidden="true" />
          </button>
        </span>
      ) : null}
      {dictation.state === "note" ? (
        <span className="vx-note" role="alert" onKeyDown={onVxKey}>
          <span className="vx-note-t">{dictation.note}</span>
          <button
            ref={closeNote}
            type="button"
            className="vx-ctl vx-note-x"
            aria-label="Close this message"
            title="Close"
            onClick={() => {
              dictation.closeNote()
              focusEnd()
            }}
          >
            <X aria-hidden="true" />
          </button>
        </span>
      ) : null}

      {onAttach || dictate ? (
        <span className="vx-tools">
          {onAttach ? (
            <>
              <button
                type="button"
                className="clip-btn vx-clip"
                aria-label="Attach a file"
                title="Attach a file"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip aria-hidden="true" />
              </button>
              <input
                ref={fileRef}
                type="file"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onAttach(f)
                  e.target.value = ""
                }}
              />
            </>
          ) : null}
          {dictate ? (
            <button
              type="button"
              className="vx-mic"
              aria-pressed={dictation.state === "rec"}
              aria-label="Dictate"
              title="Dictate"
              onClick={startDictation}
            >
              <Mic aria-hidden="true" />
            </button>
          ) : null}
        </span>
      ) : null}

      <button
        type="button"
        className={float ? "aimy-float-send" : "overlay-send"}
        aria-label={sendName}
        title={unavailable ? sendName : generating ? "Stop generating" : voiceFace ? "Voice" : sendLabel}
        onClick={send}
      >
        <Send className="vx-i-send" aria-hidden="true" />
        {onVoice ? <AudioLines className="vx-i-voice" aria-hidden="true" /> : null}
        <span className="vx-i-stop aimy-stop-square" aria-hidden="true" />
      </button>

      {attachments.map((a) => (
        <div key={a.id} className={cn("vx-att", leaving.includes(a.id) && "is-leaving")}>
          <div className="vx-att-in">
            <span className="vx-chip">
              <FileText aria-hidden="true" />
              <span className="vx-chip-n">{a.name}</span>
              {a.note ? <span className="vx-chip-note">{a.note}</span> : null}
              {onRemoveAttachment ? (
                <button
                  type="button"
                  className="vx-chip-x"
                  aria-label={`Remove ${a.name}`}
                  title="Remove"
                  onClick={() => removeFile(a.id)}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              ) : null}
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  if (float) return bar
  return (
    <div data-slot="composer-wrap" className={cn("mx-auto w-full max-w-[45rem] px-3", className)}>
      {bar}
    </div>
  )
}
