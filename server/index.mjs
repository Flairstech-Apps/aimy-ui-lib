// The Coolify (Docker) twin of worker/index.ts: serves the static docs, the
// registry and the npm store from out/, behind the same two locks.
//
// - /r/* and /npm/* need "Authorization: Bearer <REGISTRY_TOKEN>".
// - Everything else (the docs) needs the same token once, entered on /login,
//   which sets an HttpOnly cookie, or sent as the same Bearer header.
//
// The build bakes the Cloudflare address into a few files (npm tarball URLs,
// the registry index, the install commands on the docs). They are rewritten to
// the address the request came in on, so one build serves on either host.
// Microsoft (Entra ID) sign-in can replace the docs lock later.

import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { createReadStream } from "node:fs"
import { extname, join, normalize, resolve, sep } from "node:path"
import { timingSafeEqual } from "node:crypto"

const ROOT = resolve(process.env.OUT_DIR ?? "out")
const TOKEN = process.env.REGISTRY_TOKEN ?? ""
const PORT = Number(process.env.PORT ?? 3000)
const BAKED = "https://aimy-ui-lib.nour-ali.workers.dev"
const COOKIE = "aimy_ui"
const YEAR = 60 * 60 * 24 * 365

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".tgz": "application/octet-stream",
}
// Small text files that may carry the baked address.
const TEXT = new Set([".html", ".txt", ".md", ".json"])

if (!TOKEN) console.warn("REGISTRY_TOKEN is not set: every request will be refused.")

function same(given) {
  if (!TOKEN) return false
  const a = Buffer.from(given)
  const b = Buffer.from(TOKEN)
  return a.length === b.length && timingSafeEqual(a, b)
}

function cookie(req, name) {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="))
      } catch {
        return ""
      }
    }
  }
  return ""
}

function bearer(req) {
  const auth = req.headers.authorization ?? ""
  return auth.startsWith("Bearer ") ? auth.slice(7) : ""
}

function origin(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "")
  const proto = String(req.headers["x-forwarded-proto"] ?? "http")
    .split(",")[0]
    .trim()
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? `localhost:${PORT}`)
    .split(",")[0]
    .trim()
  return `${proto}://${host}`
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Cache-Control": "no-store", ...headers })
  res.end(body)
}

function json(res, status, body) {
  send(res, status, JSON.stringify(body), { "Content-Type": "application/json" })
}

function loginPage(res, error, next) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AiMY UI: sign in</title>
<style>
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#0f1215;color:#dee5ed;font:300 16px/1.5 Poppins,system-ui,sans-serif}
  form{width:min(360px,calc(100% - 32px));display:grid;gap:12px}
  h1{margin:0 0 4px;font-size:20px;font-weight:500;color:#f5f7fb}
  label{font-size:14px;color:#c3ceda}
  input{font:inherit;color:#f5f7fb;background:#141b24;border:1px solid #2e3d50;border-radius:8px;padding:10px 12px}
  input:focus-visible{outline:2px solid #3369ff;outline-offset:2px}
  button{font:inherit;font-weight:500;color:#fff;background:#3369ff;border:0;border-radius:8px;padding:10px 12px;cursor:pointer}
  p{margin:0;font-size:14px;color:#ff7282}
</style></head><body>
<form method="post" action="/login">
  <h1>AiMY UI</h1>
  <label for="t">Library token</label>
  <input id="t" name="token" type="password" autocomplete="current-password" required autofocus>
  <input type="hidden" name="next" value="${next.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}">
  ${error ? "<p>That token didn't match. Check it and try again.</p>" : ""}
  <button type="submit">Sign in</button>
</form></body></html>`
  send(res, error ? 401 : 200, html, { "Content-Type": "text/html; charset=utf-8" })
}

async function body(req, limit = 8192) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error("too large")
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString("utf8")
}

// A path inside out/, or null if it would leave it.
function inside(path) {
  const full = normalize(join(ROOT, path))
  return full === ROOT || full.startsWith(ROOT + sep) ? full : null
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

// Find the file for a URL path the way Cloudflare's static assets do with
// trailingSlash: "/x/" is x/index.html, "/x" redirects to "/x/" when that exists.
async function locate(pathname) {
  const file = inside(pathname)
  if (!file) return { missing: true }
  if (pathname.endsWith("/")) {
    const index = join(file, "index.html")
    return (await isFile(index)) ? { file: index } : { missing: true }
  }
  if (await isFile(file)) return { file }
  if (await isFile(join(file, "index.html"))) return { redirect: pathname + "/" }
  if (await isFile(file + ".html")) return { file: file + ".html" }
  return { missing: true }
}

async function serveFile(req, res, file, { status = 200, type, cache } = {}) {
  const ext = extname(file)
  const headers = {
    "Content-Type": type ?? TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": cache ?? "private, no-cache",
  }
  if (TEXT.has(ext)) {
    const text = (await readFile(file, "utf8")).replaceAll(BAKED, origin(req))
    const buf = Buffer.from(text)
    res.writeHead(status, { ...headers, "Content-Length": buf.length })
    res.end(req.method === "HEAD" ? undefined : buf)
    return
  }
  const { size } = await stat(file)
  res.writeHead(status, { ...headers, "Content-Length": size })
  if (req.method === "HEAD") return res.end()
  createReadStream(file).pipe(res)
}

async function notFound(req, res) {
  const page = join(ROOT, "404.html")
  if (await isFile(page)) return serveFile(req, res, page, { status: 404 })
  send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" })
}

// npm asks for package metadata at /npm/@scope%2fname (or /npm/@scope/name)
// and for tarballs at the URL the metadata names. Both are static files that
// scripts/npm-registry.mjs writes into out/npm/.
async function npm(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(res, 405, { error: "This registry is read-only. Publish with scripts/npm-registry.mjs." })
  }
  const rest = pathname.slice("/npm/".length)
  const meta = /^(@[a-z0-9-]+\/[a-z0-9._-]+)\/?$/.exec(rest)
  const tarball = /^@[a-z0-9-]+\/[a-z0-9._-]+\/-\/[a-z0-9._-]+\.tgz$/.test(rest)
  if (!meta && !tarball) return json(res, 404, { error: "Not found" })
  const file = inside(meta ? `/npm/${meta[1]}/index.json` : `/npm/${rest}`)
  if (!file || !(await isFile(file))) return json(res, 404, { error: "Not found" })
  return serveFile(req, res, file, {
    type: meta ? "application/json" : "application/octet-stream",
    cache: meta ? "no-cache" : "private, max-age=31536000, immutable",
  })
}

async function handle(req, res) {
  const url = new URL(req.url ?? "/", "http://x")
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return send(res, 400, "Bad request")
  }

  if (pathname === "/healthz") return send(res, 200, "ok")

  if (pathname.startsWith("/r/") || pathname.startsWith("/npm/")) {
    if (!same(bearer(req))) {
      return json(res, 401, {
        error: "Missing or wrong AIMY_REGISTRY_TOKEN. Set it in your environment; components.json and .npmrc send it.",
      })
    }
    if (pathname.startsWith("/npm/")) return npm(req, res, pathname)
  } else if (pathname === "/login") {
    if (req.method === "POST") {
      let form
      try {
        form = new URLSearchParams(await body(req))
      } catch {
        return send(res, 413, "Too large")
      }
      const given = form.get("token") ?? ""
      const next = form.get("next") ?? "/"
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/"
      if (!same(given)) return loginPage(res, true, safeNext)
      const secure = origin(req).startsWith("https:") ? "; Secure" : ""
      res.writeHead(303, {
        Location: safeNext,
        "Set-Cookie": `${COOKIE}=${encodeURIComponent(given)}; Path=/; Max-Age=${YEAR}; HttpOnly; SameSite=Lax${secure}`,
        "Cache-Control": "no-store",
      })
      return res.end()
    }
    return loginPage(res, false, url.searchParams.get("next") ?? "/")
  } else if (!(same(cookie(req, COOKIE)) || same(bearer(req)))) {
    // People sign in once and carry a cookie; agents reading /llms.txt,
    // /AGENTS.md or a page send the same token as a Bearer header instead.
    res.writeHead(302, { Location: `/login?next=${encodeURIComponent(url.pathname + url.search)}` })
    return res.end()
  }

  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed")
  const found = await locate(pathname)
  if (found.redirect) {
    res.writeHead(307, { Location: found.redirect + url.search })
    return res.end()
  }
  if (found.missing) return notFound(req, res)
  const cache = pathname.startsWith("/_next/static/") ? "private, max-age=31536000, immutable" : undefined
  return serveFile(req, res, found.file, { cache })
}

createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error)
    if (!res.headersSent) send(res, 500, "Server error")
    else res.destroy()
  })
}).listen(PORT, () => console.log(`AiMY UI on :${PORT}, serving ${ROOT}`))
