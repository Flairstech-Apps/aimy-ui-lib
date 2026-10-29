// Moves every place the library names its home to a new address, and
// optionally to a new GitHub repo: the install page, How to adopt, the agent
// rules and llms.txt, registry.json, the npm store, the starters' and the
// demo's .npmrc and components.json, and the Coolify server.
//
//   node scripts/set-address.mjs https://ui.example.com
//   node scripts/set-address.mjs https://ui.example.com --repo Flairstech-Apps/aimy-ui-lib
//   add --dry-run to list what would change
//
// Exact-string replacement only, in tracked text files. PLAN.md and the
// append-only npm store are left alone: they are history.

import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"

const SITE_FILE = "site.json"
const KEEP = [/^PLAN\.md$/, /^npm-store\//, /^pnpm-lock\.yaml$/, /^site\.json$/]

const args = process.argv.slice(2)
const dry = args.includes("--dry-run")
const repoAt = args.indexOf("--repo")
const newRepo = repoAt >= 0 ? args[repoAt + 1] : null
const newUrl = args.find((a, i) => !a.startsWith("--") && i !== repoAt + 1)

if (!newUrl || !/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(newUrl.replace(/\/$/, ""))) {
  console.error("Give the new address as https://host, with no path. Example: https://ui.example.com")
  process.exit(1)
}
if (repoAt >= 0 && !/^[\w.-]+\/[\w.-]+$/.test(newRepo ?? "")) {
  console.error("Give --repo as owner/name. Example: Flairstech-Apps/aimy-ui-lib")
  process.exit(1)
}

const site = JSON.parse(readFileSync(SITE_FILE, "utf8"))
const oldHost = new URL(site.url).host
const newHost = new URL(newUrl).host
// The host covers both "https://host/..." and npm's "//host/npm/:_authToken".
const swaps = [[oldHost, newHost]]
if (newRepo && newRepo !== site.repo) swaps.push([`github.com/${site.repo}`, `github.com/${newRepo}`])

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f && !KEEP.some((k) => k.test(f)))

let changed = 0
for (const file of files) {
  let text
  try {
    text = readFileSync(file, "utf8")
  } catch {
    continue
  }
  if (text.includes("\0")) continue
  let next = text
  let count = 0
  for (const [from, to] of swaps) {
    if (from === to) continue
    count += next.split(from).length - 1
    next = next.replaceAll(from, to)
  }
  if (!count) continue
  changed++
  console.log(`${dry ? "would change" : "changed"} ${file} (${count})`)
  if (!dry) writeFileSync(file, next)
}

if (!dry) {
  writeFileSync(
    SITE_FILE,
    JSON.stringify({ ...site, url: `https://${newHost}`, repo: newRepo ?? site.repo }, null, 2) + "\n"
  )
}
console.log(
  `${changed} files. ${dry ? "Nothing written." : "Next: pnpm check, pnpm build, commit and push; Coolify redeploys from main."}`
)
