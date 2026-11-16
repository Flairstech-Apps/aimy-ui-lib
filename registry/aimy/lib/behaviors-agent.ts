// The agent bridge: what lets AiMY see and work the interface. Parts
// register as surfaces (what they are, the state they show, the actions they
// can take); an agent reads the screen as plain data and calls those
// actions as tools. Every action goes through the confirmation ladder the
// Autonomy part sets (doctrine §3.1):
//   ask   AiMY proposes; nothing happens until the person accepts
//   tell  AiMY acts, the part it touched lights up, and a toast offers Undo
//   log   AiMY acts quietly; Activity records it with Undo
// An action that can't be undone always asks, whatever the level. Plain
// TypeScript: the same bridge serves a model's tool use, a command bar, a
// test, and the browser's own agent through WebMCP.

import { type Cleanup, announce, createStore, isBrowser, nextId, tokenMs } from "./behaviors-core"

export type AutonomyLevel = "ask" | "tell" | "log"

export type AgentParam = {
  type: "string" | "number" | "boolean"
  description: string
  /** The only values allowed (the options of a select, say). */
  enum?: readonly string[]
  optional?: boolean
}

/** What an action returns: how to take it back. Returning nothing means it can't be undone, so it always asks. */
export type AgentUndo = () => void | Promise<void>

export type AgentAction = {
  /** What it does, as a command: "Choose a company". */
  description: string
  params?: Record<string, AgentParam>
  /** The level this action asks for. The bridge's levelFor can lower or raise it. Default "tell". */
  level?: AutonomyLevel
  /** False when it can't be taken back (sending, deleting): then it always asks. */
  undoable?: boolean
  /** What happened, in past tense, for the person: "chose Kestrel Logistics". */
  say?: (params: Record<string, unknown>) => string
  run: (params: Record<string, unknown>) => void | AgentUndo | Promise<void | AgentUndo>
}

export type AgentSurface = {
  /** Stable and unique on the page: "deal-company". */
  id: string
  /** What sort of part: "combobox", "tree", "list". */
  kind: string
  /** Its name as the person sees it: "Company". */
  label: string
  /** The state it shows now, as plain data. */
  state: () => unknown
  actions: Record<string, AgentAction>
  /** The element to light up while AiMY acts on it. */
  element?: () => Element | null
}

export type AgentRequest = { surface: AgentSurface; action: string; params: Record<string, unknown>; sentence: string }

export type AgentStatus = "asked" | "done" | "refused" | "failed" | "undone"

export type AgentActivity = {
  id: string
  surface: string
  label: string
  /** "AiMY chose Kestrel Logistics in Company." */
  sentence: string
  level: AutonomyLevel
  status: AgentStatus
  at: number
  undo?: () => Promise<void>
}

export type AgentResult = { ok: true; message: string; state: unknown } | { ok: false; message: string }

export type AgentTool = {
  name: string
  description: string
  input_schema: { type: "object"; properties: Record<string, unknown>; required: string[] }
}

export type AgentBridgeOptions = {
  /** Asked for every "ask" action. Resolve true to go ahead. Without it, "ask" actions are refused and say so. */
  approve?: (request: AgentRequest) => Promise<boolean> | boolean
  /** The person's autonomy setting per surface and action (from the Autonomy part). */
  levelFor?: (surface: AgentSurface, action: string) => AutonomyLevel | undefined
  /** Every activity entry as it is added or changes (to show a toast for "tell"). */
  onActivity?: (entry: AgentActivity) => void
  /** Who is acting, in sentences. Default "AiMY". */
  name?: string
}

const toolName = (surface: string, action: string) => `${surface}__${action}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64)

/** Checks a tool call's input against an action's params; returns a sentence when it doesn't fit. */
export function checkParams(params: Record<string, AgentParam> | undefined, input: Record<string, unknown>): string | null {
  for (const [key, p] of Object.entries(params ?? {})) {
    const v = input[key]
    if (v === undefined || v === null || v === "") {
      if (p.optional) continue
      return `${key} is needed: ${p.description}`
    }
    if (typeof v !== p.type) return `${key} should be a ${p.type}.`
    if (p.enum && !p.enum.includes(String(v))) return `${key} must be one of: ${p.enum.slice(0, 20).join(", ")}${p.enum.length > 20 ? ", …" : ""}.`
  }
  return null
}

export function createAgentBridge(options: AgentBridgeOptions = {}) {
  const who = options.name ?? "AiMY"
  const surfaces = new Map<string, AgentSurface>()
  const store = createStore<{ activity: AgentActivity[]; acting: string | null; surfaces: number }>({ activity: [], acting: null, surfaces: 0 })

  const log = (entry: AgentActivity) => {
    store.set((s) => ({ activity: [entry, ...s.activity.filter((a) => a.id !== entry.id)].slice(0, 50) }))
    options.onActivity?.(entry)
  }

  const light = (surface: AgentSurface) => {
    const el = surface.element?.()
    if (!el) return () => {}
    el.setAttribute("data-agent-acting", "")
    ;(el as HTMLElement).scrollIntoView?.({ block: "nearest", behavior: "smooth" })
    return () => {
      const hold = tokenMs("--duration-very-slow", 500) * 2
      setTimeout(() => el.removeAttribute("data-agent-acting"), hold)
    }
  }

  const bridge = {
    ...store,
    /** Adds a part to what the agent can see; returns the cleanup. */
    register(surface: AgentSurface): Cleanup {
      surfaces.set(surface.id, surface)
      store.set({ surfaces: surfaces.size })
      return () => {
        if (surfaces.get(surface.id) === surface) surfaces.delete(surface.id)
        store.set({ surfaces: surfaces.size })
      }
    },

    surfaces: () => [...surfaces.values()],

    /** The screen as plain data: every surface, its state and what it can do. */
    snapshot() {
      return [...surfaces.values()].map((s) => ({
        id: s.id,
        kind: s.kind,
        label: s.label,
        state: s.state(),
        actions: Object.fromEntries(
          Object.entries(s.actions).map(([name, a]) => [name, { description: a.description, params: a.params ?? {} }])
        ),
      }))
    },

    /** Tool definitions for a model's tool use (and WebMCP): one per action, plus read_screen. */
    tools(): AgentTool[] {
      const out: AgentTool[] = [
        {
          name: "read_screen",
          description: `Read what is on the screen: every part ${who} can work with, the state it shows, and the actions it takes.`,
          input_schema: { type: "object", properties: {}, required: [] },
        },
      ]
      for (const s of surfaces.values()) {
        for (const [name, a] of Object.entries(s.actions)) {
          const properties: Record<string, unknown> = {}
          const required: string[] = []
          for (const [k, p] of Object.entries(a.params ?? {})) {
            properties[k] = { type: p.type, description: p.description, ...(p.enum ? { enum: [...p.enum] } : {}) }
            if (!p.optional) required.push(k)
          }
          out.push({ name: toolName(s.id, name), description: `${a.description} in ${s.label} (${s.kind}).`, input_schema: { type: "object", properties, required } })
        }
      }
      return out
    },

    /** Runs a tool call by name (from tools()), or an action on a surface. */
    async act(name: string | { surface: string; action: string }, input: Record<string, unknown> = {}): Promise<AgentResult> {
      if (name === "read_screen") return { ok: true, message: "Here is the screen.", state: bridge.snapshot() }
      let surface: AgentSurface | undefined
      let actionName = ""
      if (typeof name === "string") {
        for (const s of surfaces.values())
          for (const a of Object.keys(s.actions))
            if (toolName(s.id, a) === name) {
              surface = s
              actionName = a
            }
      } else {
        surface = surfaces.get(name.surface)
        actionName = name.action
      }
      const action = surface?.actions[actionName]
      if (!surface || !action) return { ok: false, message: `There is no ${typeof name === "string" ? name : `${name.surface}.${name.action}`} on the screen now. Read the screen again.` }

      const problem = checkParams(action.params, input)
      if (problem) return { ok: false, message: problem }

      const said = action.say?.(input) ?? `${action.description.charAt(0).toLowerCase()}${action.description.slice(1)}`
      // "AiMY chose Atlas Energy in Company." — unless the words already name the part.
      const sentence = said.toLowerCase().includes(surface.label.toLowerCase()) ? `${who} ${said}.` : `${who} ${said} in ${surface.label}.`
      // What can't be undone always asks, whatever the setting.
      const level = action.undoable === false ? "ask" : (options.levelFor?.(surface, actionName) ?? action.level ?? "tell")
      const entry: AgentActivity = { id: nextId("agent"), surface: surface.id, label: surface.label, sentence, level, status: "asked", at: Date.now() }

      if (level === "ask") {
        log(entry)
        const ok = options.approve ? await options.approve({ surface, action: actionName, params: input, sentence }) : false
        if (!ok) {
          log({ ...entry, status: "refused" })
          return { ok: false, message: options.approve ? "The person said no. Don't try again unless they ask." : "This needs the person's approval, and there is no way to ask here." }
        }
      }

      store.set({ acting: surface.id })
      const unlight = light(surface)
      announce(`${who} is working on ${surface.label}.`)
      try {
        const undo = await action.run(input)
        const done: AgentActivity = { ...entry, status: "done" }
        if (typeof undo === "function") {
          done.undo = async () => {
            await undo()
            log({ ...done, status: "undone", undo: undefined })
          }
        }
        log(done)
        announce(sentence)
        return { ok: true, message: sentence, state: surface.state() }
      } catch (e) {
        log({ ...entry, status: "failed" })
        return { ok: false, message: e instanceof Error ? e.message : "That didn't work." }
      } finally {
        unlight()
        store.set({ acting: null })
      }
    },

    /** Undoes the most recent action that can be undone. */
    async undoLast() {
      const last = store.get().activity.find((a) => a.status === "done" && a.undo)
      await last?.undo?.()
      return !!last
    },

    /**
     * Offers the tools to the browser's own agent through WebMCP, where the
     * browser supports it (navigator.modelContext). Returns the cleanup.
     */
    registerWebMCP(): Cleanup {
      const mc = isBrowser ? (navigator as Navigator & { modelContext?: WebModelContext }).modelContext : undefined
      if (!mc) return () => {}
      const tools = bridge.tools().map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.input_schema,
        execute: async (input: Record<string, unknown>) => {
          const r = await bridge.act(t.name, input ?? {})
          return { content: [{ type: "text", text: JSON.stringify(r) }] }
        },
      }))
      if (typeof mc.provideContext === "function") {
        mc.provideContext({ tools })
        return () => mc.provideContext?.({ tools: [] })
      }
      const offs = tools.map((t) => mc.registerTool?.(t))
      return () => offs.forEach((o) => (typeof o === "function" ? o() : o?.unregister?.()))
    },
  }
  return bridge
}

type WebModelContext = {
  provideContext?: (ctx: { tools: unknown[] }) => void
  registerTool?: (tool: unknown) => (() => void) | { unregister?: () => void } | void
}

export type AgentBridge = ReturnType<typeof createAgentBridge>
