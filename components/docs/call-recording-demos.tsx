"use client"

import { PhoneIncoming, PhoneOutgoing } from "lucide-react"
import { CallRecording } from "@/registry/aimy/ui/call-recording"

/** A recording on its own, and a message left on a missed call. */
export function RecordingAlone() {
  return <CallRecording id="call-1042" seconds={154} />
}

export function MessageAlone() {
  return <CallRecording id="vm-2210" seconds={23} kind="message" />
}

// Two rows of a call log as Sales draws them (logRow): the glyph chip, the name, how the call went, and the
// recording hanging under the row, indented to the row's text (the 36px chip and its 10px gap).
const CALLS = [
  { id: "vm-3301", who: "Dana Whitfield", meta: "Missed · 020 7946 0321 · 09:14", secs: 31, kind: "message" as const, missed: true },
  { id: "call-3302", who: "Marcus Hale", meta: "Called out · 4:12 · 10:40", secs: 252, kind: "call" as const, missed: false },
]

export function RecordingLog() {
  return (
    <div className="flex w-full max-w-[36rem] flex-col gap-4">
      {CALLS.map((c) => (
        <div key={c.id} className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span
              className={
                c.missed
                  ? "grid size-9 flex-none place-items-center rounded-pill bg-err-bg text-err-text"
                  : "grid size-9 flex-none place-items-center rounded-pill bg-ok-bg text-ok-text"
              }
            >
              {c.missed ? <PhoneIncoming aria-hidden="true" className="size-4" /> : <PhoneOutgoing aria-hidden="true" className="size-4" />}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold text-ink">{c.who}</span>
              <span className="text-meta text-ink-secondary">{c.meta}</span>
            </span>
          </div>
          <CallRecording id={c.id} seconds={c.secs} kind={c.kind} className="ml-[46px] w-[calc(100%-46px)]" />
        </div>
      ))}
    </div>
  )
}
