"use client"

import { CornerDownLeft, Search, Undo2 } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Kbd } from "@/components/kbd"
import { toast } from "@/components/toast"
import { type AgentCommand } from "@/lib/behaviors-agent"
import { useAgent, useAgentActivity } from "@/lib/behaviors-agent-react"
import { useControllable, useListbox } from "@/lib/behaviors-react"
import * as Dialog from "@/lib/dialog-primitive"
import { cn } from "@/lib/utils"

// One bar for everything on the page: Ctrl+K (Cmd+K) opens it, typing finds
// any action a part offers (choose a company, move a step, rename the deal)
// and any command the app adds with useCommand (go to Contacts). The same
// actions AiMY can take, so people and AiMY share one set of names. What
// needs a value asks for it in the same field. Undo is the first row while
// there is something to take back, and when nothing matches the words go to
// AiMY as a question. Glass-free raised panel, Menu's rows.

type Row =
  | { kind: "command"; id: string; group: string; label: string; command: AgentCommand }
  | { kind: "undo"; id: string; group: string; label: string }
  | { kind: "ask"; id: string; group: string; label: string }

type CommandBarProps = {
  /** When nothing (or not the right thing) matches, the words become a question for AiMY. */
  onAsk?: (question: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Ctrl+K and Cmd+K open it. Default true. */
  shortcut?: boolean
  placeholder?: string
}

export function CommandBar({ onAsk, open: openProp, onOpenChange, shortcut = true, placeholder = "Type a command or a question" }: CommandBarProps) {
  const bridge = useAgent()
  const { activity } = useAgentActivity()
  const [open, setOpen] = useControllable({ value: openProp, defaultValue: false, onChange: onOpenChange })
  const [asking, setAsking] = useState<AgentCommand | null>(null)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  // What is typed, for the rows (the listbox reads them while filtering).
  const typed = useRef("")
  const id = useId()

  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [shortcut, open, setOpen])

  const lastUndo = activity.find((a) => a.status === "done" && a.undo)
  // Read the commands when the bar opens, so they match the page as it is now.
  const commands = useMemo(() => (open && bridge ? bridge.commands() : []), [open, bridge])

  const rows = (query: string): Row[] => {
    const out: Row[] = []
    if (lastUndo && !query) out.push({ kind: "undo", id: "undo", group: "Last change", label: `Undo: ${lastUndo.sentence.replace(/\.$/, "")}` })
    for (const c of commands) out.push({ kind: "command", id: c.id, group: c.group, label: c.label, command: c })
    if (onAsk && query.trim()) out.push({ kind: "ask", id: "ask", group: "AiMY", label: `Ask AiMY: “${query.trim()}”` })
    return out
  }

  const reset = () => {
    setAsking(null)
    setValue("")
    setError(null)
  }
  const close = () => {
    setOpen(false)
    reset()
  }

  const run = async (row: Row) => {
    setError(null)
    if (row.kind === "undo") {
      const done = await bridge?.undoLast()
      if (done) toast(`Took back: ${done.sentence.replace(/\.$/, "")}`)
      return close()
    }
    if (row.kind === "ask") {
      onAsk?.(typed.current.trim())
      return close()
    }
    if (row.command.needs) {
      setAsking(row.command)
      setValue("")
      input.current?.focus()
      return
    }
    const r = await row.command.run()
    if (r.ok) close()
    else setError(r.message)
  }

  const lb = useListbox<Row>({
    items: (): Row[] => rows(typed.current),
    key: (r) => r.id,
    text: (r) => `${r.label} ${r.kind === "command" ? r.command.keywords : ""}`,
    // The ask row matches whatever was typed.
    filter: (r, q) => r.kind === "ask" || q.toLowerCase().split(/\s+/).every((w) => `${r.label} ${r.group} ${r.kind === "command" ? r.command.keywords : ""}`.toLowerCase().includes(w)),
    onSelect: (r) => void run(r),
    onHighlight: (k) => k && document.getElementById(optId(k))?.scrollIntoView?.({ block: "nearest" }),
  })

  // However it opened (Ctrl+K, a button, the open prop): start clean on the first row.
  const { setQuery, first } = lb
  useEffect(() => {
    if (!open) return
    typed.current = ""
    setQuery("")
    first()
  }, [open, setQuery, first])

  const visible = asking ? [] : lb.visible()
  const groups: { name: string; rows: Row[] }[] = []
  for (const r of visible) {
    const g = groups.find((x) => x.name === r.group) ?? groups[groups.push({ name: r.group, rows: [] }) - 1]!
    g.rows.push(r)
  }
  // Command ids hold colons, spaces and JSON; encoded, each is one valid id that getElementById finds.
  const optId = (k: string) => `${id}-${encodeURIComponent(k)}`

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) close()
        else {
          setOpen(true)
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="t-scrim fixed inset-0 z-(--z-modal) bg-scrim" />
        <Dialog.Content
          data-slot="command-bar"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            input.current?.focus()
          }}
          className="t-modal fixed inset-x-0 top-[12vh] z-(--z-modal) mx-auto flex max-h-[76vh] w-[min(38rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-edge-hover bg-raised shadow-xl outline-none"
        >
          <Dialog.Title className="sr-only">Commands</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
            {asking ? (
              <span className="shrink-0 rounded-sm bg-w07 px-2 py-0.5 text-2xs font-semibold text-ink">{asking.label}</span>
            ) : (
              <Search aria-hidden="true" strokeWidth={2} className="size-4 shrink-0 text-ink-secondary" />
            )}
            <input
              ref={input}
              role="combobox"
              aria-expanded={!asking}
              aria-controls={asking ? undefined : `${id}-list`}
              aria-activedescendant={!asking && lb.highlighted ? optId(lb.highlighted) : undefined}
              aria-autocomplete="list"
              aria-label={asking ? asking.needs!.description : "Commands"}
              aria-invalid={!!error || undefined}
              placeholder={asking ? asking.needs!.description : placeholder}
              value={asking ? value : lb.query}
              onChange={(e) => {
                setError(null)
                if (asking) setValue(e.target.value)
                else {
                  typed.current = e.target.value
                  lb.setQuery(e.target.value)
                }
              }}
              onKeyDown={(e) => {
                if (asking) {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void asking.run(value).then((r) => (r.ok ? close() : setError(r.message)))
                  } else if (e.key === "Escape" || (e.key === "Backspace" && !value)) {
                    e.preventDefault()
                    e.stopPropagation()
                    setAsking(null)
                    setError(null)
                  }
                  return
                }
                lb.onKeyDown(e, true)
              }}
              className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-placeholder"
            />
          </div>
          {error ? (
            <p role="alert" className="border-b border-hairline px-4 py-2 text-xs text-err-text">
              {error}
            </p>
          ) : null}
          {asking ? (
            <p className="px-4 py-3 text-xs text-ink-secondary">Enter runs it with what you typed. Escape goes back to the list.</p>
          ) : (
            <div id={`${id}-list`} role="listbox" aria-label="Commands" className="min-h-0 flex-1 overflow-y-auto p-1.5">
              {groups.map((g) => (
                <div key={g.name} role="group" aria-label={g.name}>
                  <div aria-hidden="true" className="px-2.5 pt-2 pb-1 text-2xs font-semibold tracking-wider text-ink-quiet uppercase">
                    {g.name}
                  </div>
                  {g.rows.map((r) => (
                    <div
                      key={r.id}
                      id={optId(r.id)}
                      role="option"
                      aria-selected={lb.highlighted === r.id}
                      data-highlighted={lb.highlighted === r.id ? "" : undefined}
                      onPointerMove={() => lb.highlight(r.id)}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => void run(r)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-ink select-none",
                        "transition-[background-color] duration-(--t-intent) ease-out data-highlighted:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]",
                        "[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-ink-secondary"
                      )}
                    >
                      {r.kind === "undo" ? <Undo2 aria-hidden="true" strokeWidth={2} /> : null}
                      {r.kind === "ask" ? <AimyMark title="" className="h-3.5 w-3" /> : null}
                      <span className="min-w-0 flex-1 truncate">{r.label}</span>
                      {r.kind === "command" && r.command.needs ? <span className="shrink-0 text-2xs text-ink-secondary">asks for a value</span> : null}
                    </div>
                  ))}
                </div>
              ))}
              {!groups.length ? <p className="px-2.5 py-3 text-xs text-ink-secondary">Nothing here does that. {onAsk ? "" : "Try other words."}</p> : null}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline px-4 py-2 text-2xs text-ink-secondary">
            {asking ? null : (
              <span className="flex items-center gap-1.5">
                <Kbd keys={["↑", "↓"]} /> move
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CornerDownLeft aria-hidden="true" strokeWidth={2} className="size-3" /> run
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd keys={["Esc"]} /> close
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd keys={["Ctrl", "Z"]} /> undo
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
