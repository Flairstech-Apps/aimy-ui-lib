#!/usr/bin/env node
// Writes the files AI coding agents read, from the library itself, so they
// cannot drift from it: the product rules (agents/rules.md) plus an index of
// every component (registry.json, grouped as the docs nav groups them).
//
//   agents/AGENTS.md                          the rules and the index, for any product
//   starter/AGENTS.md                         the same, inside the starter
//   starter/.claude/skills/aimy-ui/SKILL.md   the same as a Claude skill
//   starter-next/…                             both again, in the Next.js starter
//   public/llms.txt                           the docs site's index for agents
//   …/.claude/skills/aimy-ui-*/SKILL.md       the task skills (agents/skills/*.md), in both starters
//   public/skills/<name>/SKILL.md             every skill, served for init and the MCP server
//   public/agents/components.json             every component with its group and docs page, for the MCP server
//
// Run by `pnpm build`; `node scripts/agent-files.mjs --check` fails if any is stale.

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SITE = "https://aimy-ui-lib.aimy.flairstech.com"
const read = (p) => readFileSync(path.join(ROOT, p), "utf8")

const registry = JSON.parse(read("registry.json"))
const byName = new Map(registry.items.map((i) => [i.name, i]))
const firstSentence = (s = "") => {
  const m = s.match(/^.*?[.!?](?=\s|$)/)
  return (m ? m[0] : s).trim()
}

// The docs nav: groups of { label, href }.
const nav = read("components/docs/nav.ts")
const groups = []
for (const block of nav.split(/\n {2}\{\n {4}label: /).slice(1)) {
  const label = block.match(/^"([^"]+)"/)?.[1]
  const items = [...block.matchAll(/\{ href: "([^"]+)", label: "([^"]+)" \}/g)].map((m) => ({
    href: m[1],
    label: m[2],
  }))
  if (label && items.length) groups.push({ label, items })
}

const index = []
const listed = new Set()
for (const g of groups) {
  if (g.label === "Start here" || g.label === "Foundations") continue
  index.push(`### ${g.label}`, "")
  for (const it of g.items) {
    const slug = it.href.replace(/^\/components\//, "").replace(/\/$/, "")
    const item = byName.get(slug)
    listed.add(slug)
    const install = item ? ` (\`@aimy/${slug}\`)` : ""
    const what = item ? ` ${firstSentence(item.description)}` : ""
    index.push(`- **${it.label}**${install}:${what} ${SITE}${it.href}`.replace(/: {2}/, ": "))
  }
  index.push("")
}
const others = registry.items.filter((i) => !listed.has(i.name) && i.type === "registry:component")

// The same, as data: every component with its group and docs page.
const components = []
for (const g of groups) {
  if (g.label === "Start here" || g.label === "Foundations") continue
  for (const it of g.items) {
    const name = it.href.replace(/^\/components\//, "").replace(/\/$/, "")
    const item = byName.get(name)
    if (item)
      components.push({ name, title: it.label, group: g.label, description: item.description, docs: SITE + it.href })
  }
}
for (const i of others) {
  components.push({ name: i.name, title: i.title, group: "Also in the registry", description: i.description })
}

if (others.length) {
  index.push("### Also in the registry", "")
  for (const i of others) index.push(`- **${i.title}** (\`@aimy/${i.name}\`): ${firstSentence(i.description)}`)
  index.push("")
}

// The task skills: agents/skills/<name>.md, with {{SITE}} and {{INDEX}} filled in.
const SKILLS = readdirSync(path.join(ROOT, "agents/skills"))
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((f) => {
    const src = read(`agents/skills/${f}`)
    const m = src.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/)
    if (!m) throw new Error(`agents/skills/${f} needs front matter`)
    const name = m[1].match(/^name: (.+)$/m)?.[1]
    const note = `<!-- Written by scripts/agent-files.mjs from agents/skills/${f}. Edit that, not this. -->`
    const text = `${m[1]}\n${note}\n${m[2]}`
      .replaceAll("{{SITE}}", SITE)
      .replaceAll("{{INDEX}}", index.join("\n").trim())
    return { name, text }
  })

const rules = read("agents/rules.md").trim()
const header = `<!-- Written by scripts/agent-files.mjs from agents/rules.md and registry.json. Edit those, not this. -->`
const agents = `${header}

# AiMY UI: rules for agents

${rules}

## Which component

${index.join("\n").trim()}
`
const skill = `---
name: aimy-ui
description: Build AiMY product screens from the AiMY UI library, following AiMY's doctrine, accessibility and writing rules. Use when building or changing any UI in an AiMY product (Sales, Knowledge, QA, Talent or a new one), choosing a component, or writing UI copy.
---

${header}

${rules}

## Which component

${index.join("\n").trim()}
`
const llms = `# AiMY UI

> The AI-native component library for AiMY products at FlairsTech: React and TypeScript, Tailwind v4 tokens, copied in with shadcn or imported from @flairstech-aimy/ui. Every component documents what AiMY Sales and Knowledge already draw.

Install by address, with no setup: \`npx shadcn@latest add ${SITE}/r/<name>.json\`. Rules for agents: ${SITE}/AGENTS.md. MCP server: ${SITE}/mcp. Skills: ${["aimy-ui", ...SKILLS.map((k) => k.name)].map((n) => `${SITE}/skills/${n}/SKILL.md`).join(", ")}.

${index.join("\n").replace(/^### /gm, "## ").trim()}
`

const out = {
  "agents/AGENTS.md": agents,
  "starter/AGENTS.md": agents,
  "starter/.claude/skills/aimy-ui/SKILL.md": skill,
  "starter-next/AGENTS.md": agents,
  "starter-next/.claude/skills/aimy-ui/SKILL.md": skill,
  "public/llms.txt": llms,
  "public/AGENTS.md": agents,
}
out["public/agents/components.json"] = JSON.stringify(components, null, 2) + "\n"
out["public/skills/aimy-ui/SKILL.md"] = skill
for (const k of SKILLS) {
  out[`starter/.claude/skills/${k.name}/SKILL.md`] = k.text
  out[`starter-next/.claude/skills/${k.name}/SKILL.md`] = k.text
  out[`public/skills/${k.name}/SKILL.md`] = k.text
}

const check = process.argv.includes("--check")
let stale = 0
for (const [p, text] of Object.entries(out)) {
  const full = path.join(ROOT, p)
  if (check) {
    if (!existsSync(full) || readFileSync(full, "utf8") !== text) {
      console.error(`stale: ${p}`)
      stale++
    }
    continue
  }
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, text)
}
if (check && stale) process.exit(1)
console.log(check ? "Agent files: current." : `Agent files: wrote ${Object.keys(out).length}.`)
