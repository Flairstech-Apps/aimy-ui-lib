"use client"

// React side of the agent bridge, with no UI of its own: the context parts
// read, and the hook a part uses to show itself to AiMY. The provider that
// adds toasts and the approval card is AgentProvider in agent-bridge.tsx.

import { createContext, use, useEffect, useRef } from "react"
import { type AgentAction, type AgentActivity, type AgentBridge, type AgentSurface, type AutonomyLevel } from "./behaviors-agent"
import { useIsoLayoutEffect, useStore } from "./behaviors-react"

export const AgentContext = createContext<AgentBridge | null>(null)

/** The bridge, or null outside an AgentProvider (parts then show nothing to an agent). */
export function useAgent() {
  return use(AgentContext)
}

export type AgentSurfaceInput = {
  kind: string
  label: string
  state: () => unknown
  actions: Record<string, AgentAction>
}

/**
 * Shows a part to AiMY while it is mounted. Pass an id to opt in (no id, no
 * surface). The surface always reads the part's latest state, actions and
 * options, so tool definitions stay current as the part changes.
 */
export function useAgentSurface(id: string | undefined, input: AgentSurfaceInput, element: Element | null) {
  const bridge = useAgent()
  const latest = useRef(input)
  useIsoLayoutEffect(() => {
    latest.current = input
  })
  const el = useRef(element)
  useIsoLayoutEffect(() => {
    el.current = element
  })
  useEffect(() => {
    if (!bridge || !id) return
    const surface: AgentSurface = {
      id,
      get kind() {
        return latest.current.kind
      },
      // No label given: the name the person sees (the field's label, or aria-label).
      get label() {
        return latest.current.label || nameOf(el.current) || id
      },
      state: () => latest.current.state(),
      get actions() {
        return latest.current.actions
      },
      element: () => el.current,
    }
    return bridge.register(surface)
  }, [bridge, id])
}

function nameOf(el: Element | null): string {
  if (!el) return ""
  const control = el.matches("input,button,textarea,[role]") ? el : el.querySelector("input,button,textarea,[role]")
  const own = control?.getAttribute("aria-label") ?? el.getAttribute("aria-label")
  if (own) return own
  const labels = (control as HTMLInputElement | null)?.labels
  return labels?.[0]?.textContent?.trim() ?? ""
}

/**
 * Adds a command for the command bar (and for AiMY, as a tool): "Go to
 * Contacts", "New deal". said is what happened, in the past tense, for the
 * log: "opened Contacts". Return a function to make it undoable.
 *
 * AiMY asks before running a command unless it says it is safe to act on:
 * undoable: true (it returns its undo) or a level. undoable: false asks
 * everyone first, the person included.
 */
export function useCommand(
  id: string,
  command: {
    group: string
    label: string
    said?: string
    run: () => void | (() => void) | Promise<void | (() => void)>
    /** true when run returns its undo; false when it can't be taken back (always asks). */
    undoable?: boolean
    /** How freely AiMY may run it, when undoable isn't false. Default: ask, unless undoable is true. */
    level?: AutonomyLevel
  },
  enabled = true
) {
  useAgentSurface(
    enabled ? id : undefined,
    {
      kind: "command",
      label: command.group,
      state: () => null,
      actions: {
        run: {
          description: command.label,
          say: () => command.said ?? `ran “${command.label}”`,
          run: () => command.run(),
          undoable: command.undoable,
          // An app command can do anything, so AiMY asks unless the app said it is safe.
          level: command.level ?? (command.undoable === true ? undefined : "ask"),
        },
      },
    },
    null
  )
}

/** What AiMY has done, newest first, and what it is working on now. */
export function useAgentActivity() {
  const bridge = useAgent()
  return useStore(bridge ?? NONE)
}

const EMPTY: { activity: AgentActivity[]; acting: string | null; surfaces: number } = { activity: [], acting: null, surfaces: 0 }
const NONE = { get: () => EMPTY, subscribe: () => () => {} }
