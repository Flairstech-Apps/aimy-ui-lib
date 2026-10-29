#!/usr/bin/env node
// Our own private npm registry, served as static files by the Cloudflare
// worker under /npm/ behind the library token. (GitHub Packages is blocked by
// the org's billing limit; see PLAN.md section 4.)
//
//   node scripts/npm-registry.mjs publish ui      pack package/ui into npm-store/
//   node scripts/npm-registry.mjs publish tokens  pack package/tokens into npm-store/
//   node scripts/npm-registry.mjs build           write public/npm/ from npm-store/
//
// npm-store/ is committed and append-only: a published version is never
// replaced. `build` runs as part of `pnpm build`, so every deploy serves
// every version in the store.

import { execSync } from "node:child_process"
import { createHash } from "node:crypto"
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { gunzipSync } from "node:zlib"

const ROOT = path.resolve(import.meta.dirname, "..")
const STORE = path.join(ROOT, "npm-store")
const OUT = path.join(ROOT, "public", "npm")
const ORIGIN = "https://aimy-ui-lib.aimy.flairstech.com"
const SCOPE = "@flairstech-aimy"

function fail(message) {
  console.error(message)
  process.exit(1)
}

// Reads package/package.json out of an npm tarball (gzip + ustar).
function manifestOf(tgz) {
  const tar = gunzipSync(readFileSync(tgz))
  for (let off = 0; off + 512 <= tar.length; ) {
    const name = tar.toString("utf8", off, off + 100).replace(/\0.*$/s, "")
    if (!name) break
    const size = parseInt(tar.toString("utf8", off + 124, off + 136).replace(/\0.*$/s, "").trim() || "0", 8)
    const body = off + 512
    if (name === "package/package.json") return JSON.parse(tar.toString("utf8", body, body + size))
    off = body + Math.ceil(size / 512) * 512
  }
  fail(`No package/package.json in ${tgz}`)
}

function compareVersions(a, b) {
  const pa = a.split(/[.-]/).map((p) => (/^\d+$/.test(p) ? Number(p) : p))
  const pb = b.split(/[.-]/).map((p) => (/^\d+$/.test(p) ? Number(p) : p))
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === pb[i]) continue
    if (pa[i] === undefined) return 1 // 1.0.0 sorts after 1.0.0-beta
    if (pb[i] === undefined) return -1
    return pa[i] > pb[i] ? 1 : -1
  }
  return 0
}

function publish(which) {
  const dir = path.join(ROOT, "package", which)
  if (!existsSync(path.join(dir, "package.json"))) fail(`Unknown package "${which}". Use ui or tokens.`)
  const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
  const short = pkg.name.split("/")[1]
  const dest = path.join(STORE, SCOPE, short, `${short}-${pkg.version}.tgz`)
  if (existsSync(dest)) fail(`${pkg.name}@${pkg.version} is already published. Bump the version in package/${which}/package.json.`)

  if (pkg.scripts?.build) execSync("pnpm build", { cwd: dir, stdio: "inherit" })
  const tmp = mkdtempSync(path.join(tmpdir(), "aimy-pack-"))
  execSync(`npm pack --pack-destination "${tmp}"`, { cwd: dir, stdio: "inherit" })
  const packed = readdirSync(tmp).find((f) => f.endsWith(".tgz"))
  if (!packed) fail("npm pack produced no tarball")
  mkdirSync(path.dirname(dest), { recursive: true })
  copyFileSync(path.join(tmp, packed), dest)
  rmSync(tmp, { recursive: true, force: true })
  console.log(`Published ${pkg.name}@${pkg.version} to npm-store/. Run pnpm deploy to put it online.`)
}

function build() {
  rmSync(OUT, { recursive: true, force: true })
  const scopeDir = path.join(STORE, SCOPE)
  if (!existsSync(scopeDir)) return console.log("npm-store is empty; nothing to serve.")
  for (const short of readdirSync(scopeDir)) {
    const name = `${SCOPE}/${short}`
    const versions = {}
    for (const file of readdirSync(path.join(scopeDir, short)).filter((f) => f.endsWith(".tgz"))) {
      const tgz = path.join(scopeDir, short, file)
      const data = readFileSync(tgz)
      const manifest = manifestOf(tgz)
      const tarballPath = `/npm/${SCOPE}/${short}/-/${file}`
      versions[manifest.version] = {
        ...manifest,
        _id: `${name}@${manifest.version}`,
        dist: {
          tarball: `${ORIGIN}${tarballPath}`,
          shasum: createHash("sha1").update(data).digest("hex"),
          integrity: `sha512-${createHash("sha512").update(data).digest("base64")}`,
        },
      }
      mkdirSync(path.join(OUT, SCOPE, short, "-"), { recursive: true })
      copyFileSync(tgz, path.join(OUT, SCOPE, short, "-", file))
    }
    const latest = Object.keys(versions).sort(compareVersions).at(-1)
    const latestManifest = versions[latest]
    const packument = {
      _id: name,
      name,
      description: latestManifest?.description,
      "dist-tags": { latest },
      versions,
    }
    writeFileSync(path.join(OUT, SCOPE, short, "index.json"), JSON.stringify(packument, null, 2))
    console.log(`Serving ${name}: ${Object.keys(versions).sort(compareVersions).join(", ")} (latest ${latest})`)
  }
}

const [command, arg] = process.argv.slice(2)
if (command === "publish") publish(arg)
else if (command === "build") build()
else fail("Usage: node scripts/npm-registry.mjs publish <ui|tokens> | build")
