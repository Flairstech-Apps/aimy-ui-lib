// After `shadcn build`: turns each "@aimy/<name>" in registryDependencies into
// the item's full address, so any item installs from its URL alone, with no
// "@aimy" entry in the project's components.json:
//
//   npx shadcn@latest add https://<site>/r/init.json
//
// Projects that do list the @aimy registry resolve the same files either way.
// The address comes from site.json; the Coolify server swaps it for the host a
// request came in on, like every other baked address.

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const DIR = "public/r"
const { url } = JSON.parse(readFileSync("site.json", "utf8"))
const toUrl = (dep) => (dep.startsWith("@aimy/") ? `${url}/r/${dep.slice("@aimy/".length)}.json` : dep)

const fix = (item) =>
  Array.isArray(item.registryDependencies)
    ? { ...item, registryDependencies: item.registryDependencies.map(toUrl) }
    : item

let changed = 0
for (const name of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const file = join(DIR, name)
  const json = JSON.parse(readFileSync(file, "utf8"))
  const next = Array.isArray(json.items) ? { ...json, items: json.items.map(fix) } : fix(json)
  const out = JSON.stringify(next, null, 2) + "\n"
  if (out !== JSON.stringify(json, null, 2) + "\n") {
    writeFileSync(file, out)
    changed++
  }
}
console.log(`Registry: full addresses in ${changed} files.`)
