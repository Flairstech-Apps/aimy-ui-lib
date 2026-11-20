// Generative UI: AiMY answers with interface, not just words, and only ever
// with library parts. A model returns a small UI spec ({ type, props,
// children }); this checks it against a catalogue of parts and their props,
// repairs half-streamed JSON so the answer can render as it arrives, and
// writes the catalogue as a prompt and as a tool for the model. No code
// from the model ever runs: unknown parts and props are dropped and named,
// so the reply can be corrected. Plain TypeScript; the renderer is
// GenerativeUI in generative-ui-view.tsx.

export type UiField =
  | { type: "string" | "number" | "boolean"; description: string; enum?: readonly (string | number)[]; optional?: boolean }
  | { type: "array"; description: string; items: UiField; optional?: boolean; max?: number }
  | { type: "object"; description: string; props: Record<string, UiField>; optional?: boolean }
  /** A free-form row: keys to strings or numbers (a table row). */
  | { type: "record"; description: string; optional?: boolean }

export type UiPart = {
  /** When to use it, for the model. */
  description: string
  props: Record<string, UiField>
  /** It holds other parts. */
  children?: boolean
}

export type UiCatalog = Record<string, UiPart>

export type UiNode = { type: string; props: Record<string, unknown>; children?: UiNode[] }

export type UiCheck = { node: UiNode | null; problems: string[] }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function checkValue(f: UiField, v: unknown, path: string, problems: string[], partial: boolean): { ok: boolean; value?: unknown } {
  const fail = (msg: string) => {
    if (!partial) problems.push(`${path}: ${msg}`)
    return { ok: false }
  }
  switch (f.type) {
    case "string":
      if (typeof v === "number") v = String(v)
      if (typeof v !== "string") return fail(`should be text`)
      if (f.enum && !f.enum.includes(v)) return fail(`should be one of ${f.enum.join(", ")}`)
      return { ok: true, value: v }
    case "number": {
      const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v
      if (typeof n !== "number" || !Number.isFinite(n)) return fail(`should be a number`)
      if (f.enum && !f.enum.includes(n)) return fail(`should be one of ${f.enum.join(", ")}`)
      return { ok: true, value: n }
    }
    case "boolean":
      if (typeof v !== "boolean") return fail(`should be true or false`)
      return { ok: true, value: v }
    case "record": {
      if (!isObj(v)) return fail(`should be an object of text and numbers`)
      const out: Record<string, string | number> = {}
      for (const [k, x] of Object.entries(v)) if (typeof x === "string" || typeof x === "number") out[k] = x
      return { ok: true, value: out }
    }
    case "array": {
      if (!Array.isArray(v)) return fail(`should be a list`)
      const out: unknown[] = []
      v.slice(0, f.max ?? 200).forEach((x, i) => {
        const r = checkValue(f.items, x, `${path}[${i}]`, problems, partial)
        if (r.ok) out.push(r.value)
      })
      if (f.max && v.length > f.max && !partial) problems.push(`${path}: only the first ${f.max} are shown`)
      return { ok: true, value: out }
    }
    case "object": {
      if (!isObj(v)) return fail(`should be an object`)
      const r = checkProps(f.props, v, path, problems, partial)
      return r.ok ? { ok: true, value: r.value } : { ok: false }
    }
  }
}

function checkProps(spec: Record<string, UiField>, given: Record<string, unknown>, path: string, problems: string[], partial: boolean) {
  const out: Record<string, unknown> = {}
  let ok = true
  for (const [k, f] of Object.entries(spec)) {
    const v = given[k]
    if (v === undefined || v === null) {
      if (!f.optional) {
        if (!partial) problems.push(`${path}.${k}: is needed (${f.description})`)
        ok = false
      }
      continue
    }
    const r = checkValue(f, v, `${path}.${k}`, problems, partial)
    if (r.ok) out[k] = r.value
    else if (!f.optional) ok = false
  }
  if (!partial) for (const k of Object.keys(given)) if (!Object.hasOwn(spec, k)) problems.push(`${path}.${k}: not a prop of this part, left out`)
  return { ok, value: out }
}

/**
 * Checks a spec against the catalogue. Returns the parts that can be drawn
 * and, unless partial, a sentence for everything left out (send them back
 * to the model so it can fix its answer). partial is for a spec still
 * streaming: incomplete parts are skipped quietly.
 */
export function checkUi(spec: unknown, catalog: UiCatalog, options: { partial?: boolean; maxNodes?: number } = {}): UiCheck {
  const problems: string[] = []
  const partial = !!options.partial
  let count = 0
  const max = options.maxNodes ?? 80
  const walk = (raw: unknown, path: string): UiNode | null => {
    if (!isObj(raw) || typeof raw.type !== "string") {
      if (!partial) problems.push(`${path}: each part needs a type`)
      return null
    }
    // Own keys only: a model that names "constructor" or "__proto__" gets "no such part", not the
    // object's prototype (which crashed the whole answer).
    const part = Object.hasOwn(catalog, raw.type) ? catalog[raw.type] : undefined
    if (!part) {
      if (!partial) problems.push(`${path}: there is no part called ${raw.type}; use one of ${Object.keys(catalog).join(", ")}`)
      return null
    }
    if (++count > max) {
      if (!partial && count === max + 1) problems.push(`${path}: more than ${max} parts; the rest are left out`)
      return null
    }
    const here = `${path}(${raw.type})`
    const props = checkProps(part.props, isObj(raw.props) ? raw.props : {}, here, problems, partial)
    if (!props.ok) return null
    const node: UiNode = { type: raw.type, props: props.value }
    if (part.children) {
      const kids = Array.isArray(raw.children) ? raw.children : []
      node.children = kids.map((k, i) => walk(k, `${here}.children[${i}]`)).filter((n): n is UiNode => !!n)
    } else if (raw.children !== undefined && !partial) problems.push(`${here}: this part holds no other parts; children left out`)
    return node
  }
  return { node: walk(spec, "ui"), problems }
}

// ── Streaming ───────────────────────────────────────────────

/**
 * Parses JSON that is still arriving: closes the open string, drops a
 * half-written key, number or literal, and closes open lists and objects.
 * Returns undefined when nothing usable has arrived yet.
 */
export function parsePartialJson(text: string): unknown {
  const start = text.search(/[[{]/)
  if (start < 0) return undefined
  let src = text.slice(start)
  try {
    return JSON.parse(src)
  } catch {
    /* still arriving */
  }
  for (let attempt = 0; attempt < 8 && src.length; attempt++) {
    const stack: string[] = []
    let inString = false
    let escaped = false
    for (const ch of src) {
      if (inString) {
        if (escaped) escaped = false
        else if (ch === "\\") escaped = true
        else if (ch === '"') inString = false
        continue
      }
      if (ch === '"') inString = true
      else if (ch === "{" || ch === "[") stack.push(ch)
      else if (ch === "}" || ch === "]") stack.pop()
    }
    let fixed = src
    // Close an open string (dropping a lone trailing backslash).
    if (inString) fixed = (escaped ? fixed.slice(0, -1) : fixed) + '"'
    // What can't be closed is trimmed: a trailing comma, a key with no value
    // yet, or half a number or literal.
    for (let prev = ""; prev !== fixed; ) {
      prev = fixed
      fixed = fixed
        .replace(/\s+$/, "")
        .replace(/,$/, "")
        .replace(/,?\s*"(?:[^"\\]|\\.)*"\s*:$/, "")
        .replace(/([{,])\s*"(?:[^"\\]|\\.)*"$/, (m, lead: string) => (stack[stack.length - 1] === "{" ? (lead === "{" ? "{" : "") : m))
        .replace(/(?<=[:,[]\s*)(-|-?\d+\.|t|tr|tru|f|fa|fal|fals|n|nu|nul)$/, "")
    }
    for (let i = stack.length - 1; i >= 0; i--) fixed += stack[i] === "{" ? "}" : "]"
    try {
      return JSON.parse(fixed)
    } catch {
      // Cut back to the last complete value and try again.
      const cut = Math.max(src.lastIndexOf(","), src.lastIndexOf("{", src.length - 2), src.lastIndexOf("[", src.length - 2))
      if (cut <= 0) return undefined
      src = src.slice(0, cut)
    }
  }
  return undefined
}

// ── For the model ───────────────────────────────────────────

function describe(f: UiField): string {
  const opt = f.optional ? "?" : ""
  switch (f.type) {
    case "string":
    case "number":
      return f.enum ? f.enum.map((e) => JSON.stringify(e)).join(" | ") : f.type === "string" ? "text" : "number"
    case "boolean":
      return "true | false"
    case "record":
      return "{ column key: text or number }"
    case "array":
      return `list of ${describe(f.items)}${f.max ? ` (at most ${f.max})` : ""}`
    case "object":
      return `{ ${Object.entries(f.props).map(([k, p]) => `${k}${p.optional ? "?" : ""}: ${describe(p)}`).join("; ")} }${opt}`
  }
}

/** The catalogue as text for a system prompt: what each part is for and its props. */
export function uiPrompt(catalog: UiCatalog, name = "AiMY"): string {
  const parts = Object.entries(catalog).map(([type, p]) => {
    const props = Object.entries(p.props)
      .map(([k, f]) => `    ${k}${f.optional ? "?" : ""}: ${describe(f)}. ${f.description}`)
      .join("\n")
    return `- ${type}: ${p.description}${p.children ? " Holds other parts in children." : ""}\n${props}`
  })
  return [
    `${name} can answer with interface. Call show_ui with a spec: { "type": part, "props": { … }, "children": [ … ] }.`,
    "Use only these parts and props; anything else is left out and named back to you.",
    "Every number says what it means beside it (against a usual day, what is needed, or a target someone set); never a bare figure, never an invented target.",
    "Write in plain words. One clear widget beats several. Put the action that uses a number beside it.",
    "",
    ...parts,
  ].join("\n")
}

function jsonSchema(f: UiField): Record<string, unknown> {
  const d = { description: f.description }
  switch (f.type) {
    case "string":
    case "number":
      return { type: f.type, ...d, ...(f.enum ? { enum: [...f.enum] } : {}) }
    case "boolean":
      return { type: "boolean", ...d }
    case "record":
      return { type: "object", ...d, additionalProperties: { type: ["string", "number"] } }
    case "array":
      return { type: "array", ...d, items: jsonSchema(f.items), ...(f.max ? { maxItems: f.max } : {}) }
    case "object":
      return {
        type: "object",
        ...d,
        properties: Object.fromEntries(Object.entries(f.props).map(([k, p]) => [k, jsonSchema(p)])),
        required: Object.entries(f.props).filter(([, p]) => !p.optional).map(([k]) => k),
      }
  }
}

/** The JSON Schema of a spec: one shape per part, children by reference. */
export function uiSchema(catalog: UiCatalog): Record<string, unknown> {
  return {
    $defs: {
      node: {
        anyOf: Object.entries(catalog).map(([type, p]) => ({
          type: "object",
          description: p.description,
          properties: {
            type: { const: type },
            props: jsonSchema({ type: "object", description: `${type}'s props`, props: p.props }),
            ...(p.children ? { children: { type: "array", items: { $ref: "#/$defs/node" } } } : {}),
          },
          required: ["type", "props"],
        })),
      },
    },
    $ref: "#/$defs/node",
  }
}

/** A tool the model calls to answer with interface. */
export function showUiTool(catalog: UiCatalog, name = "AiMY") {
  const { $defs, ...node } = uiSchema(catalog)
  return {
    name: "show_ui",
    description: `Show the person an answer as interface made of ${name}'s parts. Use it when a table, figures, a chart or a list says it better than sentences.`,
    input_schema: { type: "object", $defs, properties: { ui: node }, required: ["ui"] },
  }
}
