"use client"

import { Undo2 } from "lucide-react"
import { useEffect, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Button } from "@/components/button"
import { toast } from "@/components/toast"
import { type AgentActivity, type AgentBridge, type AgentRequest, type AutonomyLevel, createAgentBridge } from "@/lib/behaviors-agent"
import { AgentContext, useAgent, useAgentActivity } from "@/lib/behaviors-agent-react"
import { useFlip, useLatest } from "@/lib/behaviors-react"
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

type Pending = AgentRequest & { id: number; resolve: (ok: boolean) => void }
let pendingId = 0
const listeners = new Set<(p: Pending[]) => void>()
let pending: Pending[] = []
const setPending = (next: Pending[]) => {
  pending = next
  listeners.forEach((l) => l(pending))
}

export function AgentProvider({ children, levelFor, webmcp, bridge: given, undoShortcut = true }: AgentProviderProps) {
  const latest = useLatest({ levelFor })
  const [bridge] = useState(
    () =>
      given ??
      createAgentBridge({
        levelFor: (s, a) => latest.current.levelFor?.(s.id, a),
        approve: (req) => new Promise<boolean>((resolve) => setPending([...pending, { ...req, id: ++pendingId, resolve }])),
        onActivity: (e: AgentActivity) => {
          if (e.status === "done" && e.level === "tell") toast(e.sentence, e.undo ? { onUndo: () => void e.undo?.() } : {})
        },
      })
  )
  useEffect(() => (webmcp ? bridge.registerWebMCP() : undefined), [bridge, webmcp])
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

/** What AiMY is waiting for the person to accept ("ask" actions), as cards with Accept and Not now. */
export function AgentAsks({ className }: { className?: string }) {
  const [list, setList] = useState<Pending[]>(pending)
  useEffect(() => {
    listeners.add(setList)
    return () => void listeners.delete(setList)
  }, [])
  if (!list.length) return null
  const answer = (p: Pending, ok: boolean) => {
    p.resolve(ok)
    setPending(pending.filter((x) => x.id !== p.id))
  }
  return (
    <ul data-slot="agent-asks" aria-label="Waiting for your answer" className={cn("flex flex-col gap-2", className)}>
      {list.map((p) => (
        <li key={p.id} role="group" aria-label={p.sentence} className="flex items-start gap-3 rounded-lg border border-edge bg-brand-dim p-3 transition-[opacity,translate] duration-(--t-slow) ease-out starting:translate-y-1 starting:opacity-0">
          <span className="flex h-[1lh] shrink-0 items-center text-meta">
            <AimyMark title="" className="h-3.5 w-3" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-meta text-ink">{p.sentence.replace(/\.$/, "")}?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="brand" onClick={() => answer(p, true)}>
                Go ahead
              </Button>
              <Button size="sm" onClick={() => answer(p, false)}>
                Not now
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
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
          <span className={cn("shrink-0 text-2xs font-semibold", a.status === "done" ? "text-ok-text" : a.status === "failed" || a.status === "refused" ? "text-err-text" : "text-ink-secondary")}>
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
