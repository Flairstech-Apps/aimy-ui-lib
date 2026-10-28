import {
  Calendar,
  Check,
  FileText,
  ListTodo,
  LoaderCircle,
  Lock,
  Maximize2,
  Minimize2,
  Pen,
  RotateCcw,
  Send,
  Square,
  TriangleAlert,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Button } from "@/components/button"
import { Orb } from "@/components/orb"
import { voiceClock } from "@/hooks/use-voice"
import { cn } from "@/lib/utils"

// The note taker: AiMY takes notes in a meeting (Knowledge's notetaker.js,
// AIMY-2684; drawn by notetaker.css). It is started from a voice session
// ("Take meeting notes" on VoiceStage), asks once for consent on the stage
// (NoteTakerConsent), and then the orb floats in the corner, still listening.
//
// AiMY hears only you. It is not a guest in the meeting: it listens through
// your microphone, so the transcript is what you said. What others say gets
// in through your notes, and the summary is written from both.
//
//   fold    the Silk orb, whether you are speaking, a count of new notes.
//           Drag it anywhere; it settles on the nearer side.
//   card    Transcription (what you said, your notes, your questions and
//           AiMY's answers) and Notes (yours, then the summary), with one bar
//           that asks AiMY or adds a note.
//
// After End, three steps in the chat (processing, analysing, summarising),
// each ticking off with what it found, then the notes. The phases:
//   live     Taking notes        writing  Writing the notes
//   ended    Meeting ended       ready    Notes ready
//   short    Too short to summarise (under 30 seconds)
//   failed   Notes not written (the transcript is safe; Try again)
//
// The product drives it: pass the phase, the items, the steps and the
// summary, and handle onSend, onEnd, onRetry and onClose.

export type NotePhase = "live" | "ended" | "writing" | "ready" | "short" | "failed"
export type NoteView = "fold" | "card"
export type NoteTab = "chat" | "notes"
export type StepState = "wait" | "run" | "done" | "fail"

export type NoteItem =
  /** Something you said, at a second into the meeting. */
  | { type: "line"; id: string; at: number; text: string }
  /** A note you wrote. Only you see it. */
  | { type: "mine"; id: string; at: number; text: string }
  /** A question you asked, and AiMY's answer from what you said and noted. */
  | { type: "ask"; id: string; question: string; answer: string }
  /** The three steps after the meeting (drawn from `steps`). */
  | { type: "steps"; id: string }
  /** The finished notes (drawn from `summary`). */
  | { type: "result"; id: string }
  | { type: "fail"; id: string }
  | { type: "short"; id: string }

export type NoteStep = { state: StepState; run: string; done: string; sub?: string }

export type MeetingSummary = {
  text: string
  decided: string[]
  /** Yours only: AiMY heard what you took on, not what the others did. */
  todos: { text: string; when?: string }[]
}

const STATUS: Record<NotePhase, string> = {
  live: "Taking notes",
  ended: "Meeting ended",
  writing: "Writing the notes",
  ready: "Notes ready",
  short: "Too short to summarise",
  failed: "Notes not written",
}

/** The products' three steps, ready to fill in with what each found. */
export const NOTE_STEPS: Omit<NoteStep, "state">[] = [
  { run: "Processing the recording", done: "Recording processed" },
  { run: "Analyzing what was said", done: "Analysis done" },
  { run: "Summarizing", done: "Summary written", sub: "Posted below and in Notes" },
]

const ASK = "Ask AiMY about this meeting"
const NOTE = "Note what others say or decide"
const WORD_MS = 150

/* The product's mark at its three sizes in this widget (width × 1.11 high). */
const MARK_SIZE = { 14: "h-[16px] w-[14px]", 15: "h-[17px] w-[15px]", 16: "h-[18px] w-[16px]" } as const
const Mark = ({ size = 15 }: { size?: keyof typeof MARK_SIZE }) => (
  <AimyMark title="" className={cn("nt-mk", MARK_SIZE[size])} />
)

const Only = () => (
  <span className="nt-only">
    <Lock className="size-[11px]" aria-hidden="true" />
    Only you
  </span>
)

/* Words resolve one after another at the pace of speech, the first time an
   item is drawn. Under reduced motion they are simply there. */
function Words({ text, animate }: { text: string; animate: boolean }) {
  const words = text.split(" ")
  const [shown, setShown] = useState(animate ? 0 : words.length)
  useEffect(() => {
    if (shown >= words.length) return
    const t = window.setTimeout(() => setShown((n) => n + 1), WORD_MS)
    return () => window.clearTimeout(t)
  }, [shown, words.length])
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className={cn("nt-wd", i >= shown && "is-pre")}>{w}</span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  )
}

function FinalNotes({
  summary,
  onOpenDocument,
  onMakeTasks,
}: {
  summary: MeetingSummary
  onOpenDocument?: () => void
  onMakeTasks?: () => void
}) {
  return (
    <>
      <div className="nt-sum">
        <p>{summary.text}</p>
      </div>
      <div className="nt-rs">
        <h6>Decided</h6>
        <ul>
          {summary.decided.map((d) => (
            <li key={d}>
              <Check className="nt-ic size-[15px]" aria-hidden="true" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <h6>Your to-dos</h6>
        <ul>
          {summary.todos.map((t) => (
            <li key={t.text}>
              <Square className="nt-ic nt-i-todo size-[15px]" aria-hidden="true" />
              <span>
                {t.text}
                {t.when ? <small>{t.when}</small> : null}
              </span>
            </li>
          ))}
        </ul>
        <div className="nt-btns">
          {onOpenDocument ? (
            <Button variant="brand" size="sm" onClick={onOpenDocument}>
              <FileText aria-hidden="true" />
              Open as a document
            </Button>
          ) : null}
          {onMakeTasks ? (
            <Button size="sm" onClick={onMakeTasks}>
              <ListTodo aria-hidden="true" />
              Make {summary.todos.length} tasks
            </Button>
          ) : null}
        </div>
      </div>
    </>
  )
}

type NoteTakerProps = {
  /** The meeting, from your calendar: "Upland weekly check-in". */
  meeting: string
  phase: NotePhase
  view?: NoteView
  defaultView?: NoteView
  onViewChange?: (view: NoteView) => void
  /** Seconds since notes started. */
  seconds: number
  /** True while you are talking: the orb swells and the line says so. */
  speaking?: boolean
  /** Who ended notes: you, or the meeting's time on your calendar. */
  endedBy?: "you" | "calendar"
  items: NoteItem[]
  steps?: NoteStep[]
  summary?: MeetingSummary
  /** New results while folded, shown as a count on the orb. */
  unread?: number
  /** Questions to ask in one click while the meeting runs. */
  quickAsks?: string[]
  /** A question (tab "chat") or a note (tab "notes"). */
  onSend: (text: string, tab: NoteTab) => void
  /** End notes now. Otherwise they end when the meeting's time is up. */
  onEnd: () => void
  onRetry?: () => void
  /** Close the widget after the meeting. */
  onClose?: () => void
  /** Shows "Open in the canvas" in the card's header. */
  onOpenCanvas?: () => void
  onOpenDocument?: () => void
  onMakeTasks?: () => void
}

export function NoteTaker({
  meeting,
  phase,
  view,
  defaultView = "fold",
  onViewChange,
  seconds,
  speaking = false,
  endedBy = "calendar",
  items,
  steps = [],
  summary,
  unread = 0,
  quickAsks = ["Recap so far", "What did I promise?", "Decided so far"],
  onSend,
  onEnd,
  onRetry,
  onClose,
  onOpenCanvas,
  onOpenDocument,
  onMakeTasks,
}: NoteTakerProps) {
  const [innerView, setInnerView] = useState<NoteView>(defaultView)
  const v = view ?? innerView
  const [tab, setTab] = useState<NoteTab>("chat")
  const [drafts, setDrafts] = useState<Record<NoteTab, string>>({ chat: "", notes: "" })
  const [place, setPlace] = useState<{ side: "l" | "r"; vert: "t" | "b"; y: number | null }>({
    side: "r",
    vert: "b",
    y: null,
  })
  const [level, setLevel] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const fold = useRef<HTMLButtonElement>(null)
  const stream = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  // Items already there when the widget mounted are drawn still.
  const [seen] = useState(() => new Set(items.map((i) => i.id)))
  const drag = useRef<{ x: number; y: number; l: number; t: number; w: number; h: number; moved: boolean } | null>(null)
  const live = phase === "live"
  const hint = tab === "notes" ? NOTE : ASK
  const mine = items.filter((i): i is Extract<NoteItem, { type: "mine" }> => i.type === "mine")
  const noted = mine.length

  const setView = (next: NoteView) => {
    if (view === undefined) setInnerView(next)
    onViewChange?.(next)
    if (next === "card") window.setTimeout(() => input.current?.focus({ preventScroll: true }), 30)
  }

  // Your voice swells the orb while you speak.
  useEffect(() => {
    if (!speaking) return
    const t = window.setInterval(() => setLevel(0.35 + Math.random() * 0.45), WORD_MS)
    return () => {
      window.clearInterval(t)
      setLevel(0)
    }
  }, [speaking])

  // New things land at the bottom; keep them in view when you were already there.
  useEffect(() => {
    const box = stream.current
    if (box && box.scrollHeight - box.scrollTop - box.clientHeight < 160) box.scrollTop = box.scrollHeight
  }, [items, steps, tab, v])

  const send = () => {
    const x = drafts[tab].trim()
    if (!x) return
    setDrafts((d) => ({ ...d, [tab]: "" }))
    onSend(x, tab)
  }

  /* Folded, the orb can be dragged anywhere and settles on the nearer side,
     the way a chat head does. A press that does not move still opens it. */
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (v !== "fold" || e.button !== 0 || !root.current) return
    const r = root.current.getBoundingClientRect()
    drag.current = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    const el = root.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    d.moved = true
    el.classList.add("is-dragging")
    el.style.right = el.style.bottom = "auto"
    el.style.left = Math.max(8, Math.min(innerWidth - d.w - 8, d.l + dx)) + "px"
    el.style.top = Math.max(8, Math.min(innerHeight - d.h - 8, d.t + dy)) + "px"
  }
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    const el = root.current
    drag.current = null
    if (!d || !el) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (!d.moved) return
    const r = el.getBoundingClientRect()
    el.classList.remove("is-dragging")
    el.style.left = el.style.right = el.style.top = el.style.bottom = ""
    setPlace({
      side: r.left + r.width / 2 < innerWidth / 2 ? "l" : "r",
      vert: r.top + r.height / 2 < innerHeight / 2 ? "t" : "b",
      y: Math.round(r.top),
    })
    // The click that ends a drag is not a press.
    e.currentTarget.dataset.dragged = "1"
  }

  const who = live
    ? speaking
      ? "You’re speaking"
      : "Listening to you"
    : endedBy === "you"
      ? "You ended notes"
      : "The meeting has ended"
  const badge = v === "fold" && (unread > 0 || phase === "ready")
  const npState = {
    short: "The meeting ran under 30 seconds, so there is nothing to summarise. What you said is kept.",
    failed: "AiMY couldn’t write the summary. The recording and the transcript are safe. Try again from the chat.",
    writing: "Writing the notes. They show here when the summary is done.",
  }[phase as "short" | "failed" | "writing"]

  const item = (it: NoteItem) => {
    const fresh = !seen.has(it.id)
    if (it.type === "line")
      return (
        <div key={it.id} className="nt-cl">
          <time>{voiceClock(it.at)}</time>
          <p>
            <Words text={it.text} animate={fresh} />
          </p>
        </div>
      )
    if (it.type === "mine")
      return (
        <div key={it.id} className="nt-yn">
          <Pen className="nt-ic size-3.5" aria-hidden="true" />
          <div>
            <div className="nt-yn-h">
              Your note, {voiceClock(it.at)} <Only />
            </div>
            <p>{it.text}</p>
          </div>
        </div>
      )
    if (it.type === "ask")
      return (
        <div key={it.id} className="contents">
          <div className="nt-q">
            <span>{it.question}</span>
            <Only />
          </div>
          <div className="nt-am">
            <Mark />
            <div className="nt-am-b">
              <p>
                <Words text={it.answer} animate={fresh} />
              </p>
            </div>
          </div>
        </div>
      )
    if (it.type === "steps")
      return (
        <div key={it.id} className="nt-am">
          <Mark />
          <div className="nt-am-b">
            <p>
              {endedBy === "you" ? "You ended notes" : "The meeting’s time on your calendar is up, so notes ended"} at{" "}
              {voiceClock(seconds)}. Writing them up now from what you said{noted ? " and your notes" : ""}. I’ll tell
              you when each part is done.
            </p>
            <ol className="nt-steps" aria-label="Writing the notes">
              {steps.map((s) => (
                <li key={s.run} className="nt-step" data-s={s.state}>
                  <span className="nt-step-i">
                    <LoaderCircle className="nt-ic nt-i-run size-[15px]" aria-hidden="true" />
                    <Check className="nt-ic nt-i-done size-[15px]" aria-hidden="true" />
                    <TriangleAlert className="nt-ic nt-i-fail size-[15px]" aria-hidden="true" />
                  </span>
                  <span>
                    <b>{s.state === "done" ? s.done : s.state === "fail" ? "Summary didn’t finish" : s.run}</b>
                    {s.state === "done" && s.sub ? <small>{s.sub}</small> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    if (it.type === "result" && summary)
      return (
        <div key={it.id} className="nt-am">
          <Mark />
          <div className="nt-am-b">
            <p>
              <b>Your notes for {meeting}</b>
            </p>
            <FinalNotes summary={summary} onOpenDocument={onOpenDocument} onMakeTasks={onMakeTasks} />
          </div>
        </div>
      )
    if (it.type === "fail")
      return (
        <div key={it.id} className="nt-am">
          <Mark />
          <div className="nt-am-b">
            <p className="nt-err">The summary didn’t finish.</p>
            <p>The recording and the transcript are safe. Nothing was sent to anyone.</p>
            {onRetry ? (
              <div className="nt-btns">
                <Button variant="brand" size="sm" onClick={onRetry}>
                  <RotateCcw aria-hidden="true" />
                  Try again
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )
    if (it.type === "short")
      return (
        <div key={it.id} className="nt-am">
          <Mark />
          <div className="nt-am-b">
            <p>The meeting ran under 30 seconds, so there is nothing to summarise. What you said is kept above.</p>
          </div>
        </div>
      )
    return null
  }

  return (
    <div
      ref={root}
      data-slot="note-taker"
      className="nt-w"
      data-view={v}
      data-phase={phase}
      data-tab={tab}
      data-side={place.side}
      data-vert={place.vert}
      style={
        place.y == null
          ? undefined
          : place.side === "l"
            ? { left: 20, top: place.y, bottom: "auto" }
            : { right: 20, top: place.y, bottom: "auto" }
      }
      onKeyDown={(e) => {
        if (e.key !== "Escape" || v !== "card") return
        e.stopPropagation()
        setView("fold")
        fold.current?.focus()
      }}
    >
      <button
        ref={fold}
        type="button"
        className="nt-fold"
        aria-label="Open the meeting notes"
        aria-expanded={v !== "fold"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => {
          if (e.currentTarget.dataset.dragged) {
            delete e.currentTarget.dataset.dragged
            return
          }
          setView("card")
        }}
      >
        <span className="nt-orb">
          <Orb
            phase={live ? "listening" : phase === "writing" ? "thinking" : "muted"}
            level={level}
            running={v === "fold"}
          />
        </span>
        <span className={cn("nt-badge", badge && "is-on", phase === "ready" && !unread && "is-ok")}>
          {unread ? unread : phase === "ready" ? <Check className="size-[11px]" aria-hidden="true" /> : null}
        </span>
        <span className="nt-who-pill">
          {live ? <span className="nt-rec" aria-hidden="true" /> : null}
          <span>{who}</span>
        </span>
      </button>
      {!live && onClose ? (
        <button type="button" className="nt-x" aria-label="Close the meeting notes" title="Close" onClick={onClose}>
          <X className="size-3" aria-hidden="true" />
        </button>
      ) : null}

      <div className="nt-card" role="dialog" aria-label="Meeting notes" inert={v !== "card"}>
        <div className="nt-h">
          <span className="nt-orb is-sm">
            <Orb
              phase={live ? "listening" : phase === "writing" ? "thinking" : "muted"}
              level={level}
              running={v === "card"}
            />
          </span>
          <div className="nt-ht">
            <b>{meeting}</b>
            <span className="nt-ps">
              {live ? <span className="nt-rec" aria-hidden="true" /> : null}
              <span className="nt-st">{STATUS[phase]}</span>
              {live ? <span className="nt-tm">{voiceClock(seconds)}</span> : null}
            </span>
            <span className="nt-who">{who}</span>
          </div>
          <div className="nt-hb">
            {onOpenCanvas ? (
              <button
                type="button"
                className="nt-ib"
                aria-label="Open in the canvas"
                title="Open in the canvas"
                onClick={onOpenCanvas}
              >
                <Maximize2 className="size-4" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              className="nt-ib"
              aria-label="Collapse to the orb"
              title="Collapse"
              onClick={() => {
                setView("fold")
                fold.current?.focus()
              }}
            >
              <Minimize2 className="size-4" aria-hidden="true" />
            </button>
            {!live && onClose ? (
              <button
                type="button"
                className="nt-ib"
                aria-label="Close the meeting notes"
                title="Close"
                onClick={onClose}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="nt-tabs" role="tablist" aria-label="Meeting notes">
          {(["chat", "notes"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
              {t === "chat" ? "Transcription" : "Notes"}
            </button>
          ))}
          {live ? (
            <span className="nt-ctl">
              <button
                type="button"
                className="nt-pill nt-end"
                title="End notes now. Otherwise they end when the meeting’s time on your calendar is up."
                onClick={onEnd}
              >
                <Square className="nt-ic size-[11px]" aria-hidden="true" />
                End notes
              </button>
            </span>
          ) : null}
        </div>

        <div className="nt-body" role="tabpanel">
          {tab === "chat" ? (
            <div ref={stream} className="nt-stream" aria-live="polite">
              {items.map(item)}
            </div>
          ) : (
            <div className="nt-np" data-done={phase === "ready"}>
              {npState ? <p className="nt-np-state">{npState}</p> : null}
              {phase === "ready" && summary ? (
                <div className="nt-np-final">
                  <FinalNotes summary={summary} onOpenDocument={onOpenDocument} onMakeTasks={onMakeTasks} />
                </div>
              ) : (
                <div className="nt-np-live">
                  <p className="nt-np-wait">
                    <Mark size={14} />
                    <span>
                      AiMY hears only you, so your notes are how the rest of the meeting gets in. Write down what others
                      say or decide, and AiMY uses it in the summary when the meeting ends.
                    </span>
                  </p>
                </div>
              )}
              <section>
                <h5>
                  <Pen className="nt-ic size-3.5" aria-hidden="true" />
                  Your notes
                  <Only />
                </h5>
                <ul>
                  {mine.length ? (
                    mine.map((m) => (
                      <li key={m.id}>
                        {m.text}
                        <small>{voiceClock(m.at)}</small>
                      </li>
                    ))
                  ) : (
                    <li className="is-none">Write one in the bar below. Only you see them.</li>
                  )}
                </ul>
              </section>
            </div>
          )}
        </div>

        <form
          className="nt-cz"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          {live && tab === "chat" ? (
            <div className="nt-chips">
              {quickAsks.map((q) => (
                <button key={q} type="button" className="nt-chip" onClick={() => onSend(q, "chat")}>
                  {q}
                </button>
              ))}
            </div>
          ) : null}
          <div className="overlay-input-bar nt-ask-bar">
            <span className="nt-ask-mark" aria-hidden="true">
              <Mark size={16} />
            </span>
            <input
              ref={input}
              className="overlay-input nt-in"
              value={drafts[tab]}
              onChange={(e) => setDrafts((d) => ({ ...d, [tab]: e.target.value }))}
              placeholder={hint}
              aria-label={hint}
              autoComplete="off"
            />
            <button type="submit" className="overlay-send" aria-label={tab === "notes" ? "Add the note" : "Ask"}>
              <Send aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** The question asked on the voice stage before notes start (VoiceStage `asking`). */
export function NoteTakerConsent({
  meeting,
  when = "Now, on your calendar",
  onStart,
  onNotNow,
}: {
  meeting: string
  when?: string
  onStart: () => void
  onNotNow: () => void
}) {
  const start = useRef<HTMLButtonElement>(null)
  useEffect(() => start.current?.focus(), [])
  return (
    <div
      className="nt-cons"
      role="group"
      aria-labelledby="nt-cons-h"
      onKeyDown={(e) => {
        if (e.key !== "Escape") return
        e.stopPropagation()
        onNotNow()
      }}
    >
      <span className="nt-cons-meet">
        <Calendar className="nt-ic size-3.5" aria-hidden="true" />
        {meeting}
        <span>{when}</span>
      </span>
      <p className="nt-cons-h" id="nt-cons-h">
        Take notes in this meeting?
      </p>
      <p className="nt-cons-p">
        AiMY hears only you, through your microphone. Add notes for what others say, and AiMY sums it all up when the
        meeting ends. Only you see the notes.
      </p>
      <div className="nt-cons-go">
        <Button ref={start} variant="brand" className="nt-cons-start" onClick={onStart}>
          <Pen aria-hidden="true" />
          Start taking notes
        </Button>
        <Button onClick={onNotNow}>Not now</Button>
      </div>
    </div>
  )
}
