"use client"

import { Undo2 } from "lucide-react"
import { useEffect, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Button } from "@/components/button"
import { toast } from "@/components/toast"
import { type AgentActivity, type AgentBridge, type AgentRequest, type AutonomyLevel, createAgentBridge } from "@/lib/behaviors-agent"
import { AgentContext, useAgent, useAgentActivity } from "@/lib/behaviors-agent-react"
import { useFlip, useLatest, useLeaving } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// Lets AiMY see and work the screen. Wrap a page in AgentProvider; parts
// given an agent id (Combobox, Select, InlineEdit, Tree, SortableList)
// become surfaces AiMY can read and act on, and bridge.tools() hands their
// actions to a model as tools. The confirmation ladder decides what happens:
// ask puts a card in AgentAsks until the person accepts, tell acts and
// toasts with Undo, log acts and records it in AgentLog. Whatever AiMY
// touches lights up while it works, so its actions are never invisible.

type AgentProviderProps = {
  children: React.ReactNode
  /** The person's autonomy setting per surface and action (the Autonomy part's value). */
  levelFor?: (surfaceId: string, action: string) => AutonomyLevel | undefined
  /** Offer the actions to the browser's own agent too (WebMCP), where supported. */
  webmcp?: boolean
  /** Use your own bridge (to share it with a command bar or a test). */
  bridge?: AgentBridge
  /** Ctrl+Z (Cmd+Z) outside a text field takes back the last change made through the bridge. Default true. */
  undoShortcut?: boolean
}

type Pending = AgentRequest & { id: number; resolve: (ok: boolean) => void; owner: object }
let pendingId = 0
const listeners = new Set<(p: Pending[]) => void>()
let pending: Pending[] = []
const setPending = (next: Pending[]) => {
  pending = next
  listeners.forEach((l) => l(pending))
}

export function AgentProvider({ children, levelFor, webmcp, bridge: given, undoShortcut = true }: AgentProviderProps) {
  const latest = useLatest({ levelFor })
  const [owner] = useState(() => ({}))
  const [bridge] = useState(
    () =>
      given ??
      createAgentBridge({
        levelFor: (s, a) => latest.current.levelFor?.(s.id, a),
        approve: (req) => new Promise<boolean>((resolve) => setPending([...pending, { ...req, id: ++pendingId, resolve, owner }])),
        onActivity: (e: AgentActivity) => {
          if (e.status === "done" && e.level === "tell") toast(e.sentence, e.undo ? { onUndo: () => void e.undo?.() } : {})
        },
      })
  )
  useEffect(() => (webmcp ? bridge.registerWebMCP() : undefined), [bridge, webmcp])
  // Leaving the page answers its open asks with no, so they don't show up on the next page and the
  // model's call doesn't wait for ever.
  useEffect(
    () => () => {
      const mine = pending.filter((p) => p.owner === owner)
      if (!mine.length) return
      setPending(pending.filter((p) => p.owner !== owner))
      for (const p of mine) p.resolve(false)
    },
    [owner]
  )
  // One undo for the whole page: what AiMY did and what you ran, newest first.
  useEffect(() => {
    if (!undoShortcut) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "z" || !(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.defaultPrevented) return
      const t = e.target as HTMLElement | null
      if (t?.closest("input,textarea,select,[contenteditable]:not([contenteditable=false])")) return
      e.preventDefault()
      void bridge.undoLast().then((done) => done && toast(`Took back: ${done.sentence.replace(/\.$/, "")}`))
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [bridge, undoShortcut])
  return <AgentContext value={bridge}>{children}</AgentContext>
}

const useLeavingAsks = (list: Pending[]) => useLeaving(list, (p) => String(p.id))

/** What AiMY is waiting for the person to accept ("ask" actions), as cards with Accept and Not now. */
export function AgentAsks({ className }: { className?: string }) {
  const [list, setList] = useState<Pending[]>(pending)
  useEffect(() => {
    listeners.add(setList)
    return () => void listeners.delete(setList)
  }, [])
  const shown = useLeavingAsks(list)
  if (!shown.length) return null
  const answer = (p: Pending, ok: boolean) => {
    p.resolve(ok)
    setPending(pending.filter((x) => x.id !== p.id))
  }
  return (
    <ul data-slot="agent-asks" aria-label="Waiting for your answer" className={cn("flex flex-col gap-2", className)}>
      {shown.map(({ item: p, leaving }) => (
        <li
          key={p.id}
          role={leaving ? undefined : "group"}
          aria-hidden={leaving || undefined}
          aria-label={leaving ? undefined : p.sentence}
          className={cn(
            "grid transition-[grid-template-rows,opacity,translate] duration-(--t-slow) ease-out starting:translate-y-1 starting:opacity-0",
            leaving ? "pointer-events-none grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
          <div className="flex items-start gap-3 rounded-lg border border-edge bg-brand-dim p-3">
          <span className="flex h-[1lh] shrink-0 items-center text-meta">
            <AimyMark title="" className="h-3.5 w-3" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-meta text-ink">{p.sentence.replace(/\.$/, "")}?</p>
            <AskValues ask={p} />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="brand" onClick={() => answer(p, true)}>
                Go ahead
              </Button>
              <Button size="sm" onClick={() => answer(p, false)}>
                Not now
              </Button>
            </div>
          </div>
          </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Exactly what AiMY will set, field by field, so the person says yes to the values, not only a sentence. */
function AskValues({ ask }: { ask: Pending }) {
  const declared = Object.hasOwn(ask.surface.actions, ask.action) ? ask.surface.actions[ask.action]?.params : undefined
  const rows = Object.entries(ask.params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  if (!rows.length) return null
  const show = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : JSON.stringify(v))
  return (
    <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-secondary">{declared?.[k]?.description ?? k}</dt>
          <dd className="font-semibold text-ink [overflow-wrap:anywhere]">{show(v)}</dd>
        </div>
      ))}
    </dl>
  )
}

const WORDS: Record<AgentActivity["status"], string> = {
  asked: "Waiting for you",
  done: "Done",
  refused: "You said no",
  failed: "Didn't work",
  undone: "Taken back",
}

/** What AiMY did on this screen, newest first, each with Undo while it can be taken back. */
export function AgentLog({ className, limit = 8, everyone }: { className?: string; limit?: number; /** Also list what the person ran from the command bar. */ everyone?: boolean }) {
  const { activity: all } = useAgentActivity()
  const activity = everyone ? all : all.filter((a) => a.by === "aimy")
  const flipRef = useFlip<HTMLOListElement>(activity.map((a) => a.id + a.status).join(","), { enter: true })
  if (!activity.length) return <p className={cn("text-meta text-ink-secondary", className)}>Nothing yet. What AiMY does here shows up in this list.</p>
  return (
    <ol ref={flipRef} data-slot="agent-log" aria-label={everyone ? "What changed" : "What AiMY did"} className={cn("flex flex-col gap-1", className)}>
      {activity.slice(0, limit).map((a) => (
        <li key={a.id} data-flip={a.id} className="flex items-baseline gap-3 rounded-md px-2 py-1.5 text-meta">
          <span className="min-w-0 flex-1 text-ink">{a.sentence}</span>
          <span
            key={a.status}
            className={cn(
              "shrink-0 text-2xs font-semibold transition-[opacity,translate] duration-(--t-base) ease-out starting:translate-y-0.5 starting:opacity-0",
              a.status === "done" ? "text-ok-text" : a.status === "failed" || a.status === "refused" ? "text-err-text" : "text-ink-secondary"
            )}
          >
            {WORDS[a.status]}
          </span>
          {a.status === "done" && a.undo ? (
            <Button size="sm" variant="text" onClick={() => void a.undo?.()} className="shrink-0">
              <Undo2 aria-hidden="true" strokeWidth={2} />
              Undo
            </Button>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export { useAgent, useAgentActivity }
export { useAgentSurface, useCommand } from "@/lib/behaviors-agent-react"
