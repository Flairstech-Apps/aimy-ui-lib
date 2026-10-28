"use client"

import { FileText, Flag } from "lucide-react"
import { Popover as Primitive } from "radix-ui"
import { useRef, useState } from "react"
import { toast } from "@/components/toast"
import { TrustState } from "@/components/trust-state"
import type { Source } from "@/lib/ai-types"

// A numbered marker in an answer that points at its source, and the preview
// that shows what it stands on. Knowledge's .cite and .cite-preview
// (knowledge.js:9569, 15330): the preview opens on hover and on keyboard
// focus, because a preview reachable only by mouse is not a way to verify.
// It shows the document's title and trust state, the passage quoted, where it
// came from, and Flag: feedback is captured per citation, not per answer.
//
// Numbers run 1 to n per answer and match the rows of its SourceList. Opens
// with the tooltip timing (transitions.dev 17). Added to Knowledge's: Escape
// closes it, and a tap opens it on a touch screen.
//
//   <p>Refunds after activation are not allowed<Citation n={1} source={doc} onFlag={flag} />.</p>

type CitationProps = {
  n: number
  source: Source
  /** Flags this citation as wrong. Opening the source to correct it is up to you. */
  onFlag?: (source: Source) => void
}

const CLOSE_MS = 120

export function Citation({ n, source, onFlag }: CitationProps) {
  const [open, setOpen] = useState(false)
  const t = useRef<number | undefined>(undefined)
  const chip = useRef<HTMLButtonElement>(null)
  const show = () => {
    window.clearTimeout(t.current)
    setOpen(true)
  }
  // A moment's grace, so the pointer can cross from the chip to the card.
  const hide = () => {
    window.clearTimeout(t.current)
    t.current = window.setTimeout(() => setOpen(false), CLOSE_MS)
  }
  const where = [source.type, source.connector, source.collection].filter(Boolean).join(" · ")

  return (
    <Primitive.Root open={open} onOpenChange={setOpen}>
      <Primitive.Anchor asChild>
        <button
          ref={chip}
          type="button"
          data-slot="citation"
          className="cite"
          aria-label={`Source ${n}: ${source.title}`}
          aria-expanded={open}
          onPointerEnter={show}
          onPointerLeave={hide}
          onFocus={show}
          onBlur={hide}
          onClick={show}
        >
          {n}
        </button>
      </Primitive.Anchor>
      <Primitive.Content
        asChild
        side="top"
        sideOffset={8}
        collisionPadding={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        // The chip is the anchor, not a trigger: pressing it is not "outside".
        onInteractOutside={(e) => {
          if (chip.current?.contains(e.target as Node)) e.preventDefault()
        }}
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span className="cite-preview block" aria-label={`What source ${n} says`}>
          <span className="cp-head">
            <span className="cp-title">{source.title}</span>
            {source.status ? <TrustState status={source.status} setByHand={source.setByHand} /> : null}
          </span>
          {source.passage ? <span className="cp-passage block">“{source.passage}”</span> : null}
          <span className="cp-foot">
            <span className="cp-src">
              <span className="tc-kind">
                <FileText aria-hidden="true" />
                {where}
              </span>
            </span>
            {onFlag ? (
              <button
                type="button"
                className="cite-action is-flag"
                onClick={() => {
                  setOpen(false)
                  onFlag(source)
                  toast("Flagged — opened the source so it can be corrected", {
                    sub: "Feedback is captured per citation, not per answer",
                  })
                }}
              >
                <Flag aria-hidden="true" />
                Flag
              </button>
            ) : null}
          </span>
        </span>
      </Primitive.Content>
    </Primitive.Root>
  )
}
