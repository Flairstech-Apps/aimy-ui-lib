"use client"

import { Archive } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { UserFacingError } from "@/lib/behaviors-feedback"
import { useLeaving, useOptimisticValue } from "@/lib/behaviors-react"
import { Button } from "@/registry/aimy/ui/button"
import { ActionButton, SaveStatus, useUndoable } from "@/registry/aimy/ui/feedback"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { SortableList } from "@/registry/aimy/ui/sortable-list"
import { toast } from "@/registry/aimy/ui/toast"
import { cn } from "@/lib/utils"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** A pretend server: answers after a moment, and fails when asked to. */
function useServer() {
  const [mode, setMode] = useState<"works" | "fails">("works")
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  const call = async (ms = 900, why = "The server didn't answer. Nothing changed.") => {
    await wait(ms)
    if (modeRef.current === "fails") throw new UserFacingError(why)
  }
  const control = (
    <Segmented
      label="The server"
      value={mode}
      onValueChange={(v) => setMode(v as "works" | "fails")}
      options={[
        { value: "works", label: "Saves work" },
        { value: "fails", label: "Saves fail" },
      ]}
    />
  )
  return { call, control }
}

export function ActionButtonDemo() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <ActionButton variant="brand" pendingLabel="Saving" successLabel="Saved" onAction={() => wait(1200)} save>
        Save changes
      </ActionButton>
      <ActionButton pendingLabel="Copying" successLabel="Copied" onAction={() => wait(60)}>
        Copy the link
      </ActionButton>
      <ActionButton pendingLabel="Sending" successLabel="Sent" onAction={() => wait(900).then(() => Promise.reject(new UserFacingError("Couldn't reach the mail server. Nothing was sent.")))}>
        Send the report
      </ActionButton>
    </div>
  )
}

const STAGES = ["Discovery call", "Pricing", "Contract review", "Sign-off"]

export function OptimisticDemo() {
  const server = useServer()
  const steps = useOptimisticValue(STAGES, () => server.call(), {
    onError: (message, retry) => toast("Couldn't save the new order", { tone: "err", sub: `${message}`, action: { label: "Try again", onClick: retry } }),
  })
  const [name, setName] = useState("Kestrel renewal")
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">{server.control}</div>
      <div className="grid gap-5 column:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border border-edge bg-card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-semibold text-ink-secondary">Next steps</p>
            <SaveStatus status={steps.status} error={steps.error} onRetry={() => steps.set(steps.shown)} />
          </div>
          <SortableList label="Next steps" items={steps.shown} getKey={(s) => s} getLabel={(s) => s} onReorder={steps.set} renderItem={(s) => s} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-edge bg-card p-5">
          <p className="text-xs font-semibold text-ink-secondary">Deal name</p>
          <InlineEdit
            label="Deal name"
            size="title"
            value={name}
            onSave={(next) => server.call(900, "That name is already used by another deal.").then(() => setName(next))}
          />
          <p className="text-xs text-ink-secondary">The new name shows at once; if the save fails, the field opens again with what you typed and why.</p>
        </div>
      </div>
    </div>
  )
}

type Row = { id: string; name: string; note: string }
const ROWS: Row[] = [
  { id: "k", name: "Kestrel Logistics", note: "Replied about pricing" },
  { id: "a", name: "Atlas Energy", note: "Asked for a call on Monday" },
  { id: "h", name: "Harbor Health", note: "Opened the proposal twice" },
]

export function UndoableDemo() {
  const server = useServer()
  const [rows, setRows] = useState(ROWS)
  const run = useUndoable()
  const shown = useLeaving(rows, (r) => r.id)
  const archive = (row: Row) => {
    const before = rows
    run({
      title: `Archived ${row.name}`,
      sub: "It's in Archived, with its history.",
      apply: () => setRows((r) => r.filter((x) => x.id !== row.id)),
      revert: () => setRows(before),
      save: () => server.call(900, `${row.name} is locked while someone edits it.`),
    })
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {server.control}
        <Button size="sm" onClick={() => setRows(ROWS)}>
          Put them all back
        </Button>
      </div>
      <ul className="flex max-w-[30rem] flex-col">
        {shown.map(({ item: r, leaving }) => (
          <li
            key={r.id}
            aria-hidden={leaving || undefined}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-(--t-base) ease-out starting:grid-rows-[0fr] starting:opacity-0 motion-reduce:transition-none",
              leaving ? "pointer-events-none grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mb-2 flex items-center gap-3 rounded-lg border border-edge bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-ink-secondary">{r.note}</p>
                </div>
                <Button size="sm" onClick={() => archive(r)} tabIndex={leaving ? -1 : undefined}>
                  <Archive aria-hidden="true" strokeWidth={2} />
                  Archive
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
