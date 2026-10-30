// The Coolify (Docker) twin of worker/index.ts: serves the static docs, the
// registry and the npm store from out/, behind the same two locks.
//
// - /r/* and /npm/* need "Authorization: Bearer <REGISTRY_TOKEN>".
// - Everything else (the docs) needs the same token once, entered on /login,
//   which sets an HttpOnly cookie, or sent as the same Bearer header.
//
// Company sign-in: fill in server/sso.json (issuer and client ID, neither is a
// secret; for Cognito the issuer is https://cognito-idp.<region>.amazonaws.com/<pool id>)
// and people sign in to the docs with their company account instead of the
// token. A public app client with PKCE needs no secret; OIDC_CLIENT_SECRET in
// the environment is used if the app client has one. OIDC_* variables override
// the file. /r and /npm keep the Bearer token, because a terminal can't sign in.
//
// Open to anyone: server/access.json { "public": true } (or AIMY_PUBLIC=true,
// which wins either way) drops both locks and the sign-in. Set it to false and
// the locks above come back as they were.
//
// The build bakes the Cloudflare address into a few files (npm tarball URLs,
// the registry index, the install commands on the docs). They are rewritten to
// the address the request came in on, so one build serves on either host.

import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { createReadStream, readFileSync } from "node:fs"
import { extname, join, normalize, resolve, sep } from "node:path"
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { handleMcp } from "./mcp.mjs"

const ROOT = resolve(process.env.OUT_DIR ?? "out")
const TOKEN = process.env.REGISTRY_TOKEN ?? ""
const PORT = Number(process.env.PORT ?? 3000)
const BAKED = "https://aimy-ui-lib.aimy.flairstech.com"
const COOKIE = "aimy_ui"
// The released version, from the npm store in the build, for the MCP server's name card.
let VERSION = "1.0.0"
try {
  const meta = JSON.parse(readFileSync(join(ROOT, "npm/@flairstech-aimy/ui/index.json"), "utf8"))
  VERSION = meta["dist-tags"]?.latest ?? VERSION
} catch {
  // No npm store in this build: keep the default.
}
const YEAR = 60 * 60 * 24 * 365

let access = {}
try {
  access = JSON.parse(readFileSync(new URL("./access.json", import.meta.url), "utf8"))
} catch {
  // No access.json: locked.
}
const OPEN = process.env.AIMY_PUBLIC ? process.env.AIMY_PUBLIC === "true" : access.public === true

let ssoFile = {}
try {
  ssoFile = JSON.parse(readFileSync(new URL("./sso.json", import.meta.url), "utf8"))
} catch {
  // No sso.json: company sign-in comes from the environment or stays off.
}
const ISSUER = (process.env.OIDC_ISSUER || ssoFile.issuer || "").replace(/\/$/, "")
const CLIENT_ID = process.env.OIDC_CLIENT_ID || ssoFile.clientId || ""
const CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET ?? ""
const SCOPES = process.env.OIDC_SCOPES || ssoFile.scopes || "openid email profile"
// Optional: only these email domains get in, e.g. "flairstech.com".
const DOMAINS = String(process.env.ALLOWED_EMAIL_DOMAINS || (ssoFile.allowedEmailDomains ?? []).join(","))
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean)
const SSO = Boolean(ISSUER && CLIENT_ID)
const SESSION = "aimy_sso"
const PENDING = "aimy_sso_pending"
const SESSION_AGE = 60 * 60 * 12
// Signs the sign-in cookies. Without a secret, a fresh key each start: a
// redeploy signs people out, and the company sign-in lets them straight back in.
const KEY = createHash("sha256")
  .update("aimy-ui-session:" + (process.env.SESSION_SECRET || CLIENT_SECRET || randomBytes(32).toString("hex")))
  .digest()

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

// Without REGISTRY_TOKEN in the environment, the token is checked against its
// SHA-256 in server/token.sha256, which is safe to commit: the token is random
// and long, so the hash can't be turned back into it.
let TOKEN_HASH = ""
try {
  TOKEN_HASH = readFileSync(new URL("./token.sha256", import.meta.url), "utf8")
    .trim()
    .toLowerCase()
} catch {
  // No hash file: only REGISTRY_TOKEN can open the locks.
}
const sha256 = (s) => createHash("sha256").update(s).digest()

if (!TOKEN && !TOKEN_HASH) console.warn("No REGISTRY_TOKEN and no token.sha256: every request will be refused.")
if (OPEN) console.log("Open to anyone: no token, no sign-in.")
else console.log(SSO ? `Company sign-in on, through ${ISSUER}` : "Company sign-in off: the docs take the token.")

function same(given) {
  if (!given) return false
  if (TOKEN) return timingSafeEqual(sha256(given), sha256(TOKEN))
  if (/^[0-9a-f]{64}$/.test(TOKEN_HASH)) return timingSafeEqual(sha256(given), Buffer.from(TOKEN_HASH, "hex"))
  return false
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

const HEAD = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AiMY UI: sign in</title>
<style>
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#0f1215;color:#dee5ed;font:300 16px/1.5 Poppins,system-ui,sans-serif}
  form,main{width:min(360px,calc(100% - 32px));display:grid;gap:12px}
  h1{margin:0 0 4px;font-size:20px;font-weight:500;color:#f5f7fb}
  label{font-size:14px;color:#c3ceda}
  input{font:inherit;color:#f5f7fb;background:#141b24;border:1px solid #2e3d50;border-radius:8px;padding:10px 12px}
  input:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid #3369ff;outline-offset:2px}
  button,a.b{font:inherit;font-weight:500;color:#fff;background:#3369ff;border:0;border-radius:8px;padding:10px 12px;cursor:pointer;text-align:center;text-decoration:none}
  p{margin:0}
  p.e{font-size:14px;color:#ff7282}
</style></head><body>`

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

function notice(res, status, title, text, link) {
  const html = `${HEAD}
<main>
  <h1>${escape(title)}</h1>
  <p>${escape(text)}</p>
  ${link ? `<a class="b" href="${escape(link.href)}">${escape(link.label)}</a>` : ""}
</main></body></html>`
  send(res, status, html, { "Content-Type": "text/html; charset=utf-8" })
}

function loginPage(res, error, next) {
  const html = `${HEAD}
<form method="post" action="/login">
  <h1>AiMY UI</h1>
  <label for="t">Library token</label>
  <input id="t" name="token" type="password" autocomplete="current-password" required autofocus>
  <input type="hidden" name="next" value="${escape(next)}">
  ${error ? `<p class="e">That token didn't match. Check it and try again.</p>` : ""}
  <button type="submit">Sign in</button>
</form></body></html>`
  send(res, error ? 401 : 200, html, { "Content-Type": "text/html; charset=utf-8" })
}

const safe = (next) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/")

function setCookie(req, name, value, maxAge, path = "/") {
  const secure = origin(req).startsWith("https:") ? "; Secure" : ""
  return `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
}

// Signed cookies: base64url(JSON) + "." + HMAC, with an expiry inside.
const b64url = (buf) => Buffer.from(buf).toString("base64url")

function seal(data) {
  const payload = b64url(JSON.stringify(data))
  return `${payload}.${createHmac("sha256", KEY).update(payload).digest("base64url")}`
}

function unseal(value) {
  const [payload, sig] = (value ?? "").split(".")
  if (!payload || !sig) return null
  const want = Buffer.from(createHmac("sha256", KEY).update(payload).digest("base64url"))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    return data.exp > Date.now() / 1000 ? data : null
  } catch {
    return null
  }
}

const signedIn = (req) => SSO && unseal(cookie(req, SESSION)) !== null

let discovery = null
function provider() {
  discovery ??= fetch(`${ISSUER}/.well-known/openid-configuration`)
    .then((r) => {
      if (!r.ok) throw new Error(`OIDC discovery answered ${r.status}`)
      return r.json()
    })
    .catch((error) => {
      discovery = null
      throw error
    })
  return discovery
}

// Send the person to the company sign-in (authorization code with PKCE).
async function startSignIn(req, res, next) {
  const config = await provider()
  const state = b64url(randomBytes(16))
  const nonce = b64url(randomBytes(16))
  const verifier = b64url(randomBytes(32))
  const challenge = b64url(createHash("sha256").update(verifier).digest())
  const pending = seal({ state, nonce, verifier, next: safe(next), exp: Date.now() / 1000 + 600 })
  const to = new URL(config.authorization_endpoint)
  for (const [k, v] of Object.entries({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: `${origin(req)}/auth/callback`,
    scope: SCOPES,
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }))
    to.searchParams.set(k, v)
  res.writeHead(302, {
    Location: to.toString(),
    "Set-Cookie": setCookie(req, PENDING, pending, 600, "/auth"),
    "Cache-Control": "no-store",
  })
  res.end()
}

// The company sign-in sends the person back here with a code. The ID token
// comes straight from the token endpoint over TLS, so its claims are checked
// but its signature need not be (OpenID Connect Core 3.1.3.7).
async function callback(req, res, url) {
  const again = { label: "Sign in again", href: "/auth/login" }
  const pending = unseal(cookie(req, PENDING))
  if (url.searchParams.get("error")) {
    return notice(res, 401, "Sign-in didn't finish", url.searchParams.get("error_description") ?? "", again)
  }
  if (!pending || pending.state !== url.searchParams.get("state")) {
    return notice(res, 400, "Sign-in expired", "That sign-in link is old or was opened twice.", again)
  }
  const config = await provider()
  const tokens = await fetch(config.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // A public client proves itself with the PKCE verifier alone.
      ...(CLIENT_SECRET && {
        Authorization: `Basic ${Buffer.from(`${encodeURIComponent(CLIENT_ID)}:${encodeURIComponent(CLIENT_SECRET)}`).toString("base64")}`,
      }),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: url.searchParams.get("code") ?? "",
      redirect_uri: `${origin(req)}/auth/callback`,
      code_verifier: pending.verifier,
      client_id: CLIENT_ID,
    }),
  })
  if (!tokens.ok) {
    console.error("OIDC token exchange failed", tokens.status, await tokens.text())
    return notice(res, 502, "Sign-in didn't finish", "The sign-in service refused the code.", again)
  }
  const { id_token: idToken } = await tokens.json()
  let claims
  try {
    claims = JSON.parse(Buffer.from(String(idToken).split(".")[1], "base64url").toString("utf8"))
  } catch {
    return notice(res, 502, "Sign-in didn't finish", "The sign-in service sent no ID token.", again)
  }
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (
    claims.iss !== config.issuer ||
    !aud.includes(CLIENT_ID) ||
    !(claims.exp > Date.now() / 1000) ||
    claims.nonce !== pending.nonce
  ) {
    return notice(res, 401, "Sign-in didn't finish", "The sign-in answer didn't match this site.", again)
  }
  const email = String(claims.email ?? "").toLowerCase()
  if (DOMAINS.length && !DOMAINS.includes(email.split("@")[1] ?? "")) {
    return notice(res, 403, "Not for this account", `AiMY UI is for FlairsTech accounts. You signed in as ${email}.`)
  }
  const session = seal({ email, name: claims.name ?? email, exp: Date.now() / 1000 + SESSION_AGE })
  res.writeHead(303, {
    Location: pending.next,
    "Set-Cookie": [setCookie(req, SESSION, session, SESSION_AGE), setCookie(req, PENDING, "", 0, "/auth")],
    "Cache-Control": "no-store",
  })
  res.end()
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
  if (pathname === "/robots.txt") {
    return send(res, 200, "User-agent: *\nDisallow: /\n", { "Content-Type": "text/plain; charset=utf-8" })
  }

  // The MCP server: open while the site is, otherwise behind the same Bearer token as /r.
  if (pathname === "/mcp") {
    if (!OPEN && req.method !== "OPTIONS" && !same(bearer(req))) {
      return json(res, 401, { error: "This MCP server needs the library token as a Bearer header." })
    }
    return handleMcp(req, res, {
      root: ROOT,
      origin: origin(req),
      baked: BAKED,
      version: VERSION,
      body: () => body(req, 65536),
    })
  }

  if (OPEN) {
    // Open to anyone: no sign-in pages, no locks.
    if (pathname === "/login" || pathname.startsWith("/auth/")) {
      res.writeHead(302, { Location: safe(url.searchParams.get("next") ?? "/") })
      return res.end()
    }
    if (pathname.startsWith("/npm/")) return npm(req, res, pathname)
    return serveStatic(req, res, pathname, url)
  }

  if (pathname === "/auth/logout") {
    res.writeHead(303, {
      Location: "/auth/signed-out",
      "Set-Cookie": [setCookie(req, SESSION, "", 0), setCookie(req, COOKIE, "", 0)],
      "Cache-Control": "no-store",
    })
    return res.end()
  }
  if (pathname === "/auth/signed-out") {
    return notice(res, 200, "Signed out", "You are signed out of AiMY UI.", {
      label: "Sign in",
      href: SSO ? "/auth/login" : "/login",
    })
  }
  if (SSO && pathname === "/auth/login") return startSignIn(req, res, url.searchParams.get("next") ?? "/")
  if (SSO && pathname === "/auth/callback") return callback(req, res, url)

  if (pathname.startsWith("/r/") || pathname.startsWith("/npm/")) {
    if (!same(bearer(req))) {
      return json(res, 401, {
        error: "Missing or wrong AIMY_REGISTRY_TOKEN. Set it in your environment; components.json and .npmrc send it.",
      })
    }
    if (pathname.startsWith("/npm/")) return npm(req, res, pathname)
  } else if (pathname === "/login") {
    // With company sign-in on, the token form is gone for people.
    if (SSO) {
      res.writeHead(302, { Location: `/auth/login?next=${encodeURIComponent(url.searchParams.get("next") ?? "/")}` })
      return res.end()
    }
    if (req.method === "POST") {
      let form
      try {
        form = new URLSearchParams(await body(req))
      } catch {
        return send(res, 413, "Too large")
      }
      const given = form.get("token") ?? ""
      const next = form.get("next") ?? "/"
      if (!same(given)) return loginPage(res, true, safe(next))
      res.writeHead(303, {
        Location: safe(next),
        "Set-Cookie": setCookie(req, COOKIE, encodeURIComponent(given), YEAR),
        "Cache-Control": "no-store",
      })
      return res.end()
    }
    return loginPage(res, false, url.searchParams.get("next") ?? "/")
  } else if (!((SSO ? signedIn(req) : same(cookie(req, COOKIE))) || same(bearer(req)))) {
    // People sign in once and carry a cookie; agents reading /llms.txt,
    // /AGENTS.md or a page send the token as a Bearer header instead.
    const to = SSO ? "/auth/login" : "/login"
    res.writeHead(302, { Location: `${to}?next=${encodeURIComponent(url.pathname + url.search)}` })
    return res.end()
  }
  return serveStatic(req, res, pathname, url)
}

async function serveStatic(req, res, pathname, url) {
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
  // Open or locked, the library stays out of search engines.
  res.setHeader("X-Robots-Tag", "noindex, nofollow")
  handle(req, res).catch((error) => {
    console.error(error)
    if (!res.headersSent) send(res, 500, "Server error")
    else res.destroy()
  })
}).listen(PORT, () => console.log(`AiMY UI on :${PORT}, serving ${ROOT}`))
