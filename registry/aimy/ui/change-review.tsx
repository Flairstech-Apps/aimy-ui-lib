"use client"

import { ArrowRight, Check, CircleMinus, ShieldCheck, TriangleAlert } from "lucide-react"
import { useId, useState } from "react"
import { Button } from "@/components/button"
import { Dialog, DialogClose, DialogContent } from "@/components/dialog"
import { Field } from "@/components/field"
import { Input } from "@/components/input"
import { toast } from "@/components/toast"

// A change with consequences, reviewed before it runs: Knowledge's commit
// surface (knowledge.js:10262). What it is now and what it will be, why, and
// "What this will do": what changes, what needs care, and what is skipped and
// why. The doctrine's ladder puts governed and irreversible changes here; a
// destructive one also asks for the word to be typed, and every one is
// logged. Running it says so in a toast with Undo, "Logged to the audit
// trail".
//
// It states its scope the way both products do: the count it will act on,
// and what it leaves alone, in a sentence ("3 are already excluded from
// retrieval, so answers do not change").
//
//   <ChangeReview open={open} onOpenChange={setOpen} title="Archive documents"
//     now="12 documents on the surface" after="9 archived" confirmLabel="Archive" word="archive"
//     rationale={<>You typed <strong>“archive the old ones”</strong>…</>}
//     effects={[{ tone: "ok", children: <><strong>9</strong> documents will be archived.</> },
//               { tone: "skip", children: <><strong>3</strong> are already excluded…</> }]}
//     onConfirm={archive} onUndo={unarchive} />

export type Effect = { tone: "ok" | "warn" | "skip"; children: React.ReactNode }

type ChangeReviewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  now: React.ReactNode
  after: React.ReactNode
  /** Why, and what AiMY resolved the request to. */
  rationale?: React.ReactNode
  effects?: Effect[]
  /** The closing line of "What this will do". False when it cannot be undone. */
  reversible?: React.ReactNode | false
  /** Typed to confirm a destructive or governed change. */
  word?: string
  confirmLabel: string
  /** What the toast says once it runs: "9 documents archived". Defaults to the title. */
  done?: string
  /** Destructive: the confirm button is the error button. */
  danger?: boolean
  onConfirm: () => void
  /** Offered in the toast after it runs. */
  onUndo?: () => void
}

const loose = (s: string) => s.toLowerCase().replace(/[\s,]/g, "")
const ICON = { ok: Check, warn: TriangleAlert, skip: CircleMinus } as const

export function ChangeReview({
  open,
  onOpenChange,
  title,
  now,
  after,
  rationale,
  effects = [],
  reversible = "Reversible for 24h · logged to the audit trail",
  word,
  confirmLabel,
  done,
  danger,
  onConfirm,
  onUndo,
}: ChangeReviewProps) {
  const [typed, setTyped] = useState("")
  const id = useId()
  const ready = !word || loose(typed) === loose(word)
  const change = (o: boolean) => {
    if (!o) setTyped("")
    onOpenChange(o)
  }
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent
        title={title}
        footer={
          <>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              variant={danger ? "err" : "brand"}
              disabled={!ready}
              onClick={() => {
                change(false)
                onConfirm()
                toast(done ?? title, { sub: "Logged to the audit trail", onUndo })
              }}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="gov-cr-diff">
            <div className="gov-cr-current">
              <span className="gov-cr-label">Now</span>
              <span className="gov-cr-val">{now}</span>
            </div>
            <ArrowRight className="gov-cr-arrow" aria-hidden="true" />
            <div className="gov-cr-proposed">
              <span className="gov-cr-label">After</span>
              <span className="gov-cr-val">{after}</span>
            </div>
          </div>
          {rationale ? <p className="gov-cr-rationale">{rationale}</p> : null}
          {effects.length || reversible ? (
            <section className="ss-preview" aria-labelledby={`${id}-what`}>
              <h3 className="ss-preview-head" id={`${id}-what`}>
                What this will do
              </h3>
              {effects.map((e, i) => {
                const Icon = ICON[e.tone]
                return (
                  <p key={i} className={`ss-effect is-${e.tone}`}>
                    <Icon aria-hidden="true" />
                    <span>{e.children}</span>
                  </p>
                )
              })}
              {reversible ? (
                <p className="ss-effect is-ok">
                  <ShieldCheck aria-hidden="true" />
                  <span>{reversible}</span>
                </p>
              ) : null}
            </section>
          ) : null}
          {word ? (
            <Field label={`Type ${word} to confirm`}>
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
            </Field>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
