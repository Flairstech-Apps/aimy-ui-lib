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

/** What an action returns: how to take it back. An action that can't be taken back says undoable: false, and then always asks first. */
export type AgentUndo = () => void | Promise<void>

export type AgentAction = {
  /** What it does, as a command: "Choose a company". */
  description: string
  /** Other words people use for it, so the command bar finds it: "rename edit". */
  keywords?: string
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
  /** Who did it: AiMY through a tool call, or the person through the command bar. */
  by: "aimy" | "person"
  level: AutonomyLevel
  status: AgentStatus
  at: number
  undo?: () => Promise<void>
}

export type AgentResult = { ok: true; message: string; state: unknown } | { ok: false; message: string }

/** One thing a person can run from the command bar: an action with its choices filled in, or one that asks for a value. */
export type AgentCommand = {
  id: string
  /** The part's name, as the group heading: "Company". */
  group: string
  /** What it does: "Choose Atlas Energy". */
  label: string
  /** Extra words that should find it. */
  keywords: string
  /** When set, the command bar asks for this before running. */
  needs?: { param: string; description: string; type: "string" | "number" }
  run: (value?: string) => Promise<AgentResult>
}

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
        {
          name: "do_steps",
          description: `Do several of these actions in one call, in order: fill a form, set three fields. Each step is a tool name from this list and its input. It stops at the first step that fails or that the person refuses, and says which; the ones before it stay done (each can be undone).`,
          input_schema: {
            type: "object",
            properties: {
              steps: {
                type: "array",
                description: "The actions, in order.",
                items: { type: "object", properties: { tool: { type: "string", description: "A tool name from this list." }, input: { type: "object", description: "Its input." } }, required: ["tool"] },
              },
            },
            required: ["steps"],
          },
        },
        {
          name: "find",
          description: `Find things on the screen by words, without opening anything: the choices a field accepts (a company, an owner) and the parts whose name or state mention the words. Use it before choosing, instead of reading the whole screen.`,
          input_schema: { type: "object", properties: { words: { type: "string", description: "What to look for." } }, required: ["words"] },
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
    async act(name: string | { surface: string; action: string }, input: Record<string, unknown> = {}, opts: { by?: "aimy" | "person" } = {}): Promise<AgentResult> {
      const person = opts.by === "person"
      if (name === "read_screen") return { ok: true, message: "Here is the screen.", state: bridge.snapshot() }
      if (name === "do_steps") {
        // Several actions in one call: one round trip for a whole form. Each still goes through the
        // ladder (asking where it must), and a refusal or a failure stops the rest.
        const steps = Array.isArray(input.steps) ? (input.steps as { tool?: unknown; input?: unknown }[]) : []
        if (!steps.length) return { ok: false, message: "Give the steps to do, each a tool name and its input." }
        const done: { tool: string; ok: boolean; message: string }[] = []
        for (const step of steps) {
          const tool = typeof step.tool === "string" ? step.tool : ""
          if (!tool || tool === "do_steps") return { ok: false, message: `Step ${done.length + 1} has no tool to run.` }
          const r = await bridge.act(tool, (step.input && typeof step.input === "object" ? step.input : {}) as Record<string, unknown>, opts)
          done.push({ tool, ok: r.ok, message: r.message })
          if (!r.ok) return { ok: false, message: `Stopped at step ${done.length} of ${steps.length} (${tool}): ${r.message} The steps before it are done.` }
        }
        return { ok: true, message: `Did all ${steps.length} steps.`, state: { steps: done, screen: bridge.snapshot() } }
      }
      if (name === "find") {
        const words = String(input.words ?? "").toLowerCase().trim()
        if (!words) return { ok: false, message: "Say what to look for." }
        const hits: { surface: string; label: string; tool?: string; param?: string; options?: string[]; state?: unknown }[] = []
        for (const s of surfaces.values()) {
          for (const [action, a] of Object.entries(s.actions))
            for (const [param, p] of Object.entries(a.params ?? {})) {
              const options = (p.enum ?? []).filter((o) => o.toLowerCase().includes(words)).slice(0, 50)
              if (options.length) hits.push({ surface: s.id, label: s.label, tool: toolName(s.id, action), param, options })
            }
          const state = s.state()
          if (s.label.toLowerCase().includes(words) || JSON.stringify(state ?? "").toLowerCase().includes(words)) hits.push({ surface: s.id, label: s.label, state })
          if (hits.length >= 50) break
        }
        return { ok: true, message: hits.length ? `Found ${hits.length} match${hits.length === 1 ? "" : "es"}.` : "Nothing on the screen matches. Try fewer words.", state: hits }
      }
      let surface: AgentSurface | undefined
      let actionName = ""
      if (typeof name === "string") {
        let matches = 0
        for (const s of surfaces.values())
          for (const a of Object.keys(s.actions))
            if (toolName(s.id, a) === name) {
              surface = s
              actionName = a
              matches++
            }
        // Ids that read the same once cleaned ("deal.title", "deal_title") must not run the wrong one.
        if (matches > 1) return { ok: false, message: `Two parts on the screen answer to ${name}, so it wasn't run. Give the parts ids that differ by more than punctuation.` }
      } else {
        surface = surfaces.get(name.surface)
        actionName = name.action
      }
      const action = surface && Object.hasOwn(surface.actions, actionName) ? surface.actions[actionName] : undefined
      if (!surface || !action) return { ok: false, message: `There is no ${typeof name === "string" ? name : `${name.surface}.${name.action}`} on the screen now. Read the screen again.` }

      const problem = checkParams(action.params, input)
      if (problem) return { ok: false, message: problem }
      // Only the declared params reach the action: anything else the model sent is dropped.
      input = Object.fromEntries(Object.entries(input).filter(([k]) => Object.hasOwn(action.params ?? {}, k)))

      const said = action.say?.(input) ?? `${action.description.charAt(0).toLowerCase()}${action.description.slice(1)}`
      // "AiMY chose Atlas Energy in Company." — unless the words already name the part.
      const actor = person ? "You" : who
      const sentence = said.toLowerCase().includes(surface.label.toLowerCase()) ? `${actor} ${said}.` : `${actor} ${said} in ${surface.label}.`
      // What can't be undone always asks, whatever the setting, and for a person too: one Enter in a
      // fuzzy-matched command bar must not send or delete with nothing to take it back. Otherwise a
      // person running a command has already chosen: it acts, then tells with Undo.
      const level: AutonomyLevel =
        action.undoable === false ? "ask" : person ? "tell" : (options.levelFor?.(surface, actionName) ?? action.level ?? "tell")
      const entry: AgentActivity = { id: nextId("agent"), surface: surface.id, label: surface.label, sentence, by: person ? "person" : "aimy", level, status: "asked", at: Date.now() }

      if (level === "ask") {
        log(entry)
        const ok = options.approve ? await options.approve({ surface, action: actionName, params: input, sentence }) : false
        if (!ok) {
          log({ ...entry, status: "refused" })
          return { ok: false, message: options.approve ? "The person said no. Don't try again unless they ask." : "This needs the person's approval, and there is no way to ask here." }
        }
        // The part may have left the screen while the person decided.
        if (!surfaces.has(surface.id)) {
          log({ ...entry, status: "refused" })
          return { ok: false, message: `${surface.label} is no longer on the screen, so nothing was done. Read the screen again.` }
        }
      }

      store.set({ acting: surface.id })
      const unlight = light(surface)
      if (!person) announce(`${who} is working on ${surface.label}.`)
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

    /**
     * Everything a person can run, for the command bar: an action whose
     * params are all choices becomes one command per choice ("Choose Atlas
     * Energy"); one free text or number param is asked for when it runs.
     */
    commands(): AgentCommand[] {
      const out: AgentCommand[] = []
      for (const s of surfaces.values()) {
        for (const [name, a] of Object.entries(s.actions)) {
          const params = Object.entries(a.params ?? {})
          const free = params.filter(([, p]) => !p.enum && p.type !== "boolean" && !p.optional)
          if (free.length > 1) continue
          // Every combination of the choice params, at most 60 per action.
          let combos: Record<string, unknown>[] = [{}]
          for (const [k, p] of params) {
            if (p.enum) combos = combos.flatMap((c) => p.enum!.map((v) => ({ ...c, [k]: p.type === "number" ? Number(v) : v })))
            else if (p.type === "boolean") combos = combos.flatMap((c) => [{ ...c, [k]: true }, { ...c, [k]: false }])
            if (combos.length > 60) combos = combos.slice(0, 60)
          }
          const verb = a.description
          for (const c of combos) {
            const chosen = Object.entries(c)
            // One choice reads as a sentence: "Choose an option" → "Choose Atlas Energy".
            const placeholder = / (an option|an item|a folder|an owner|a person)\b/
            const one = chosen.length === 1 && typeof chosen[0]![1] !== "boolean" && placeholder.test(verb)
            const label = one
              ? verb.replace(placeholder, ` ${String(chosen[0]![1])}`)
              : chosen.length
                ? `${verb}: ${chosen.map(([, v]) => (typeof v === "boolean" ? (v ? "yes" : "no") : String(v))).join(", ")}`
                : verb
            const needs = free[0] ? { param: free[0][0], description: free[0][1].description, type: free[0][1].type as "string" | "number" } : undefined
            out.push({
              id: `${s.id}:${name}:${JSON.stringify(c)}`,
              group: s.label,
              label,
              keywords: `${s.label} ${s.kind} ${verb} ${a.keywords ?? ""}`,
              needs,
              run: (value?: string) =>
                bridge.act({ surface: s.id, action: name }, needs ? { ...c, [needs.param]: needs.type === "number" ? Number(value) : value } : c, { by: "person" }),
            })
          }
        }
      }
      return out
    },

    /** Undoes the most recent action that can be undone. */
    /** Undoes the most recent action that can be undone; returns it, or null when there was none. */
    async undoLast(): Promise<AgentActivity | null> {
      const last = store.get().activity.find((a) => a.status === "done" && a.undo)
      await last?.undo?.()
      return last ?? null
    },

    /**
     * Offers the tools to the browser's own agent through WebMCP, where the
     * browser supports it (navigator.modelContext). Returns the cleanup.
     */
    registerWebMCP(): Cleanup {
      const mc = isBrowser ? (navigator as Navigator & { modelContext?: WebModelContext }).modelContext : undefined
      if (!mc) return () => {}
      const make = () =>
        bridge.tools().map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.input_schema,
          execute: async (input: Record<string, unknown>) => {
            const r = await bridge.act(t.name, input ?? {})
            return { content: [{ type: "text", text: JSON.stringify(r) }] }
          },
        }))
      let offs: ReturnType<NonNullable<WebModelContext["registerTool"]>>[] = []
      const withdraw = () => offs.forEach((o) => (typeof o === "function" ? o() : o?.unregister?.()))
      const offer = () => {
        const tools = make()
        if (typeof mc.provideContext === "function") return mc.provideContext({ tools })
        withdraw()
        offs = tools.map((t) => mc.registerTool?.(t))
      }
      // The tools follow the screen: parts that mount later are offered, parts that leave are withdrawn.
      let names = ""
      const sync = () => {
        const now = bridge.tools().map((t) => t.name).join(" ")
        if (now === names) return
        names = now
        offer()
      }
      sync()
      const off = store.subscribe(sync)
      return () => {
        off()
        if (typeof mc.provideContext === "function") mc.provideContext({ tools: [] })
        else withdraw()
      }
    },
  }
  return bridge
}

type WebModelContext = {
  provideContext?: (ctx: { tools: unknown[] }) => void
  registerTool?: (tool: unknown) => (() => void) | { unregister?: () => void } | void
}

export type AgentBridge = ReturnType<typeof createAgentBridge>
