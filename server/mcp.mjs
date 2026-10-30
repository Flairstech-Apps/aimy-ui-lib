// The AiMY UI MCP server, at /mcp on the Coolify server: Streamable HTTP,
// stateless, JSON responses (no SSE stream), no dependencies.
//
//   claude mcp add --transport http aimy-ui https://<site>/mcp
//
// Tools search the components, return one with its code and install commands,
// and give the rules; the task skills are offered as prompts. Everything is
// read from the build (out/): agents/components.json, r/<name>.json,
// AGENTS.md and skills/<name>/SKILL.md, all written by scripts/agent-files.mjs.

import { readFile } from "node:fs/promises"
import { join } from "node:path"

const VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"]
const SKILLS = {
  "aimy-ui-build": "Build a screen, panel or flow from a screenshot, a mock-up or a description, using only AiMY UI.",
  "aimy-ui-review": "Review a screen, component or diff against AiMY UI's rules and report each break with its fix.",
  "aimy-ui-upgrade": "Bring an app up to the latest AiMY UI release without losing its own edits.",
}
const SKILL_ARG = {
  "aimy-ui-build": {
    name: "brief",
    description: "What to build: a description, or where the screenshot or mock-up is.",
  },
  "aimy-ui-review": {
    name: "target",
    description: "What to review: files, a diff, or a screen. Leave empty for the current diff.",
  },
  "aimy-ui-upgrade": null,
}

const TOOLS = [
  {
    name: "search_components",
    description:
      'Search AiMY UI\'s components by what you need ("a table that sorts", "AI proposes a change", "voice"). Returns each match\'s name, group, what it is and its docs page. Leave query empty to list them all.',
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What the screen needs, in plain words. Empty lists every component." },
        limit: { type: "number", description: "Most results to return. Default 12; ignored when listing all." },
      },
    },
  },
  {
    name: "get_component",
    description:
      "Get one AiMY UI component by name: what it is, its docs page, how to install it, what it depends on, and its full source code.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: 'The component\'s name, as search_components returns it, e.g. "button".' },
      },
      required: ["name"],
    },
  },
  {
    name: "get_rules",
    description:
      "Get the rules every AiMY screen follows (doctrine, accessibility, writing, what never to do) and the index of which component to use for what. Read before building or reviewing AiMY UI.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_skill",
    description:
      "Get one of the AiMY UI task skills as instructions: aimy-ui-build (build a screen from a brief), aimy-ui-review (check a screen against the rules) or aimy-ui-upgrade (take a new release).",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", enum: Object.keys(SKILLS), description: "Which skill." } },
      required: ["name"],
    },
  },
]

const text = (t) => ({ content: [{ type: "text", text: t }] })
const fail = (t) => ({ content: [{ type: "text", text: t }], isError: true })

async function load(ctx, path) {
  return (await readFile(join(ctx.root, path), "utf8")).replaceAll(ctx.baked, ctx.origin)
}

const components = async (ctx) => JSON.parse(await load(ctx, "agents/components.json"))

// A plain score: whole words in the name and title count most, then the group, then the description.
function score(c, words) {
  const name = `${c.name} ${c.title}`.toLowerCase()
  const group = c.group.toLowerCase()
  const desc = (c.description ?? "").toLowerCase()
  let s = 0
  for (const w of words) {
    if (name.includes(w)) s += 5
    if (group.includes(w)) s += 2
    if (desc.includes(w)) s += 1
  }
  return s
}

const line = (c) =>
  `- ${c.name} (${c.group}): ${(c.description ?? "").split(/(?<=[.!?])\s/)[0]}${c.docs ? ` Docs: ${c.docs}` : ""}`

async function searchComponents(ctx, { query = "", limit = 12 } = {}) {
  const all = await components(ctx)
  const words = String(query)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
  if (!words.length) return text(`${all.length} components:\n\n${all.map(line).join("\n")}`)
  const hits = all
    .map((c) => ({ c, s: score(c, words) }))
    .filter((h) => h.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, Math.max(1, Math.min(Number(limit) || 12, 50)))
  if (!hits.length) {
    return text(
      `No component matches "${query}". Call search_components with an empty query to see them all. If the screen needs a part the library does not have, say so rather than building a lookalike.`
    )
  }
  return text(
    `${hits.length} matches for "${query}":\n\n${hits.map((h) => line(h.c)).join("\n")}\n\nCall get_component with a name for its code.`
  )
}

async function getComponent(ctx, { name } = {}) {
  const slug = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@aimy\//, "")
  if (!/^[a-z0-9-]+$/.test(slug)) return fail('Give a component name, e.g. "button".')
  const meta = (await components(ctx)).find((c) => c.name === slug)
  let item
  try {
    item = JSON.parse(await load(ctx, `r/${slug}.json`))
  } catch {
    return fail(`There is no component called "${slug}". Call search_components to find the right name.`)
  }
  const deps = (item.registryDependencies ?? []).map((d) => d.replace(/^.*\/r\/(.+)\.json$/, "$1"))
  const parts = [
    `# ${item.title ?? slug}`,
    item.description ?? "",
    meta?.docs ? `Docs, with previews and rules: ${meta.docs}` : "",
    "## Install",
    `- Copy it in, no setup needed: \`npx shadcn@latest add ${ctx.origin}/r/${slug}.json\``,
    `- With the @aimy registry in components.json: \`npx shadcn@latest add @aimy/${slug}\``,
    "- Or import it from the package: `@flairstech-aimy/ui` (with `@flairstech-aimy/ui/styles.css`).",
    deps.length ? `It brings these AiMY UI parts with it: ${deps.join(", ")}.` : "",
    item.dependencies?.length ? `npm packages it needs: ${item.dependencies.join(", ")}.` : "",
    "## Source",
    ...(item.files ?? []).map(
      (f) => `### ${f.target ?? f.path}\n\n\`\`\`${f.path.endsWith(".css") ? "css" : "tsx"}\n${f.content ?? ""}\n\`\`\``
    ),
  ]
  return text(parts.filter(Boolean).join("\n\n"))
}

async function getSkill(ctx, name) {
  if (!SKILLS[name]) return null
  return load(ctx, `skills/${name}/SKILL.md`)
}

async function call(ctx, method, params = {}) {
  switch (method) {
    case "initialize": {
      const asked = params.protocolVersion
      return {
        protocolVersion: VERSIONS.includes(asked) ? asked : VERSIONS[0],
        capabilities: { tools: { listChanged: false }, prompts: { listChanged: false } },
        serverInfo: { name: "aimy-ui", title: "AiMY UI", version: ctx.version },
        instructions:
          "AiMY UI is the component library for AiMY products. Before building or reviewing AiMY UI, read get_rules. Find parts with search_components and take their code with get_component. Never build a lookalike of a library component; if a part is missing, say so.",
      }
    }
    case "ping":
      return {}
    case "tools/list":
      return { tools: TOOLS }
    case "tools/call": {
      const args = params.arguments ?? {}
      if (params.name === "search_components") return searchComponents(ctx, args)
      if (params.name === "get_component") return getComponent(ctx, args)
      if (params.name === "get_rules") return text(await load(ctx, "AGENTS.md"))
      if (params.name === "get_skill") {
        const s = await getSkill(ctx, args.name)
        return s ? text(s) : fail(`Unknown skill. Choose one of: ${Object.keys(SKILLS).join(", ")}.`)
      }
      throw Object.assign(new Error(`Unknown tool: ${params.name}`), { code: -32602 })
    }
    case "prompts/list":
      return {
        prompts: Object.entries(SKILLS).map(([name, description]) => ({
          name,
          description,
          arguments: SKILL_ARG[name] ? [{ ...SKILL_ARG[name], required: false }] : [],
        })),
      }
    case "prompts/get": {
      const s = await getSkill(ctx, params.name)
      if (!s) throw Object.assign(new Error(`Unknown prompt: ${params.name}`), { code: -32602 })
      const arg = SKILL_ARG[params.name]
      const given = arg ? params.arguments?.[arg.name] : ""
      const ask = given ? `\n\n## This time\n\n${arg.name === "brief" ? "Build" : "Review"}: ${given}` : ""
      return {
        description: SKILLS[params.name],
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${s.replace(/^---\n[\s\S]*?\n---\n\s*(<!--[\s\S]*?-->\s*)?/, "").trim()}${ask}`,
            },
          },
        ],
      }
    }
    default:
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 })
  }
}

async function one(ctx, msg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return { jsonrpc: "2.0", id: msg?.id ?? null, error: { code: -32600, message: "Invalid request" } }
  }
  // A notification gets no answer.
  if (msg.id === undefined || msg.id === null) return null
  try {
    return { jsonrpc: "2.0", id: msg.id, result: await call(ctx, msg.method, msg.params) }
  } catch (error) {
    return { jsonrpc: "2.0", id: msg.id, error: { code: error.code ?? -32603, message: error.message } }
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

/** Answers one HTTP request to /mcp. ctx: { root, origin, baked, version, body } */
export async function handleMcp(req, res, ctx) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS)
    return res.end()
  }
  if (req.method !== "POST") {
    // No server-to-client stream: everything is answered on the POST.
    res.writeHead(405, { ...CORS, Allow: "POST, OPTIONS", "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: "Send MCP messages with POST." }))
  }
  let msg
  try {
    msg = JSON.parse(await ctx.body())
  } catch {
    res.writeHead(400, { ...CORS, "Content-Type": "application/json" })
    return res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }))
  }
  const answers = Array.isArray(msg)
    ? (await Promise.all(msg.map((m) => one(ctx, m)))).filter(Boolean)
    : await one(ctx, msg)
  if (!answers || (Array.isArray(answers) && !answers.length)) {
    res.writeHead(202, CORS)
    return res.end()
  }
  res.writeHead(200, { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" })
  res.end(JSON.stringify(answers))
}
