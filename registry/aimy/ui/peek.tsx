"use client"

import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ThinkingIndicator } from "@/components/thinking"
import { cn } from "@/lib/utils"

// AiMY's answer in a card that rises out of the float bar: a quick question
// gets a quick answer without leaving the work (Sales' .b-peek, Knowledge's
// .aimy-peek; the same card in both). It thinks, then the answer arrives;
// three lines show and the rest fades, and pressing the answer opens it in
// the canvas. One-click questions sit under it (Sales' chips).
//
// The grip folds it into the bar and back. Drag it up to open the canvas,
// down to tuck it away; a press anywhere else on the page tucks it too. ×
// dismisses it. Added to the products: Escape tucks it.
//
// Put it in the composer's dock, before the bar:
//   <div className="relative">
//     <Peek status={status} onOpenCanvas={openCanvas} onDismiss={dismiss}
//       actions={<Suggestions variant="follow" items={next} onPick={ask} />}>
//       <StreamingText text={answer} streaming={status === "streaming"} />
//     </Peek>
//     <Composer … />
//   </div>

const STEP = 40
const FAR = 150

type PeekProps = {
  status: "thinking" | "streaming" | "answered"
  /** What AiMY is doing while it thinks. */
  thinkingLabel?: string | string[]
  /** The answer. */
  children?: React.ReactNode
  /** One-click questions or actions, shown once the answer is in. */
  actions?: React.ReactNode
  onOpenCanvas: () => void
  onDismiss: () => void
  className?: string
}

export function Peek({
  status,
  thinkingLabel = "Thinking",
  children,
  actions,
  onOpenCanvas,
  onDismiss,
  className,
}: PeekProps) {
  const [shut, setShut] = useState(false)
  const [clipped, setClipped] = useState(false)
  const [dragging, setDragging] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLSpanElement>(null)
  const inner = useRef<HTMLSpanElement>(null)
  const drag = useRef<{ y: number; down: number; moved: boolean; dragged: boolean } | null>(null)
  const thinking = status === "thinking"

  // Three lines show; a longer answer fades at the third.
  useEffect(() => {
    const el = body.current
    const content = inner.current
    if (!el || !content || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => setClipped(el.scrollHeight - el.clientHeight > 12))
    ro.observe(content)
    return () => ro.disconnect()
  }, [])

  // A press anywhere else on the page tucks it away; it is not dismissed.
  useEffect(() => {
    const away = (e: PointerEvent) => {
      const dock = root.current?.parentElement
      if (dock && !dock.contains(e.target as Node) && !(e.target as Element).closest?.("[data-slot=canvas]"))
        setShut(true)
    }
    document.addEventListener("pointerdown", away, true)
    return () => document.removeEventListener("pointerdown", away, true)
  }, [])

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !card.current) return
    drag.current = { y: e.clientY, down: card.current.offsetHeight - STEP + 14, moved: false, dragged: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || !card.current) return
    const dy = e.clientY - d.y
    if (!d.moved && Math.abs(dy) < 3) return
    d.moved = true
    setDragging(true)
    let y = (shut ? d.down : 0) + dy
    if (y < 0) y = -Math.min(28, Math.sqrt(-y) * 4)
    else if (y > d.down) y = d.down + Math.min(20, Math.sqrt(y - d.down) * 3)
    card.current.style.transform = `translate3d(0, ${y}px, 0)`
  }
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (!d || !d.moved) return
    if (card.current) card.current.style.transform = ""
    setDragging(false)
    e.currentTarget.dataset.dragged = "1"
    const dy = e.clientY - d.y
    if (dy <= -FAR || (dy <= -STEP && !shut)) {
      setShut(false)
      onOpenCanvas()
    } else if (dy <= -STEP) setShut(false)
    else if (dy >= STEP) setShut(true)
  }

  return (
    <div
      ref={root}
      data-slot="peek"
      className={cn(
        "aimy-peek",
        shut && "is-shut",
        thinking && "is-thinking",
        clipped && !thinking && "is-clipped",
        dragging && "is-dragging",
        className
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !shut) {
          e.stopPropagation()
          setShut(true)
        }
      }}
    >
      <div ref={card} className="aimy-peek-card">
        <div className="aimy-peek-lip">
          <button
            type="button"
            className="aimy-peek-grip"
            aria-expanded={!shut}
            aria-label={shut ? "Bring this answer back" : "Put this answer away"}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={(e) => {
              if (e.currentTarget.dataset.dragged) {
                delete e.currentTarget.dataset.dragged
                return
              }
              setShut((s) => !s)
            }}
          >
            <span className="aimy-peek-grip-bar" aria-hidden="true" />
          </button>
          <button type="button" className="aimy-peek-x" aria-label="Dismiss this answer" onClick={onDismiss}>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="aimy-peek-main" inert={shut}>
          <button type="button" className="aimy-peek-open" onClick={onOpenCanvas}>
            <span ref={body} className="aimy-peek-body" role="status" aria-live="polite">
              <span ref={inner} className="block">
                {thinking ? <ThinkingIndicator variant="bare" label={thinkingLabel} /> : children}
              </span>
            </span>
            <span className="sr-only">Open in the AiMY canvas</span>
          </button>
          <div className="aimy-peek-acts">{status === "answered" && actions ? <div>{actions}</div> : null}</div>
        </div>
      </div>
    </div>
  )
}
