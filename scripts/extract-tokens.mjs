#!/usr/bin/env node
// Extracts the AiMY tokens from the design system, the colour source of truth.
//
//   node scripts/extract-tokens.mjs           write package/tokens/aimy.css
//   node scripts/extract-tokens.mjs --check   fail if aimy.css is out of date
//
// Reads design-system/index.html fresh every run (the file changes under us),
// finds the dark `:root` and light `:root[data-theme="light"]` blocks by
// selector and brace depth (never by line numbers or computed offsets),
// applies the listed patches in scripts/token-patches.mjs, and prints every
// value that changed since the last extraction so nothing slips in unseen.

import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PATCHES } from "./token-patches.mjs"

const ROOT = path.resolve(import.meta.dirname, "..")
const SOURCE = path.resolve(ROOT, "..", "design-system", "index.html")
const OUT = path.join(ROOT, "package", "tokens", "aimy.css")

function fail(message) {
  console.error(`extract-tokens: ${message}`)
  process.exit(1)
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
}

// Returns the body of the first rule whose selector matches exactly.
function blockBody(css, selector) {
  const re = new RegExp(`(^|[\\s}])${selector.replace(/[[\]"=]/g, "\\$&")}\\s*\\{`, "g")
  const match = re.exec(css)
  if (!match) fail(`could not find the ${selector} block`)
  let depth = 1
  let i = match.index + match[0].length
  const start = i
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") depth--
  }
  if (depth !== 0) fail(`braces in the ${selector} block do not balance`)
  return css.slice(start, i - 1)
}

function declarations(body) {
  const out = new Map()
  for (const m of body.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1], m[2].trim().replace(/\s+/g, " "))
  }
  return out
}

const html = readFileSync(SOURCE, "utf8")
const style = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1]
if (!style) fail("no <style> block in design-system/index.html")
const css = stripComments(style)
const dark = declarations(blockBody(css, ":root"))
const light = declarations(blockBody(css, ':root[data-theme="light"]'))
if (dark.size < 150 || light.size < 100) fail(`suspiciously few tokens (dark ${dark.size}, light ${light.size})`)

const applied = PATCHES.map((patch) => {
  patch.apply({ dark, light })
  return patch
})

// A custom property that refers to another (`--ink-quiet: var(--d300)`) is
// resolved on the element that declares it, and its children inherit the
// result. So a light panel nested in a dark page would inherit the dark
// answer. Re-declaring every such alias in the light block makes nested
// [data-theme] scopes resolve against their own theme.
for (const [k, v] of dark) if (v.includes("var(") && !light.has(k)) light.set(k, v)

let commit = "unknown"
let dirty = ""
try {
  const cwd = path.dirname(SOURCE)
  commit = execSync("git rev-parse --short HEAD", { cwd }).toString().trim()
  dirty = execSync("git status --porcelain -- index.html", { cwd }).toString().trim() ? " (with uncommitted changes)" : ""
} catch {
  // not a git checkout; the header says unknown
}

const block = (selector, map, scheme) =>
  `${selector} {\n  color-scheme: ${scheme};\n${[...map].map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}\n`

const output = `/*
 * AiMY tokens. GENERATED, do not edit by hand.
 * Source: design-system/index.html at ${commit}${dirty}
 * Regenerate: node scripts/extract-tokens.mjs
 *
 * Dark is the default. Light is data-theme="light" on <html>, or on any
 * element to theme just that part of the page (nested scopes work).
 * Patches applied on top of the source (scripts/token-patches.mjs):
${applied.map((p) => ` *   - ${p.id}: ${p.why}`).join("\n")}
 */

${block(':root,\n[data-theme="dark"]', dark, "dark")}
${block('[data-theme="light"]', light, "light")}`

const previous = existsSync(OUT) ? readFileSync(OUT, "utf8") : ""

if (process.argv.includes("--check")) {
  const body = (s) => s.replace(/Source: .*\n/, "")
  if (body(previous) !== body(output)) fail("package/tokens/aimy.css is out of date. Run node scripts/extract-tokens.mjs")
  console.log("extract-tokens: aimy.css is current.")
  process.exit(0)
}

// Print what changed, per theme, so a colour change is never silent.
const parse = (text, selector) => {
  const at = text.indexOf(`${selector} {`)
  if (at < 0) return new Map()
  return declarations(text.slice(at, text.indexOf("}", at)))
}
for (const [label, selector] of [
  ["dark", '[data-theme="dark"]'],
  ["light", '[data-theme="light"]'],
]) {
  const before = parse(previous, selector)
  const after = parse(output, selector)
  const changes = []
  for (const [k, v] of after) if (before.get(k) !== v) changes.push(`  ${k}: ${before.get(k) ?? "(new)"} -> ${v}`)
  for (const k of before.keys()) if (!after.has(k)) changes.push(`  ${k}: removed`)
  if (previous && changes.length) console.log(`${label}: ${changes.length} change(s)\n${changes.join("\n")}`)
}

mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, output)
console.log(`extract-tokens: wrote ${path.relative(ROOT, OUT)} (dark ${dark.size}, light ${light.size}) from ${commit}${dirty}`)
