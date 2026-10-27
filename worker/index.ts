// Serves the static docs and registry from out/, locked to FlairsTech.
//
// Two locks, because people and the install command arrive differently:
// - /r/* (registry JSON, fetched by the shadcn CLI) needs
//   "Authorization: Bearer <REGISTRY_TOKEN>".
// - Everything else (the docs) needs the same token once, entered on /login,
//   which sets an HttpOnly cookie. Cloudflare Access can replace this later.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  REGISTRY_TOKEN: string
}

const COOKIE = "aimy_ui"
const YEAR = 60 * 60 * 24 * 365

function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function cookie(request: Request, name: string): string {
  const header = request.headers.get("Cookie") ?? ""
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return decodeURIComponent(rest.join("="))
  }
  return ""
}

function loginPage(error: boolean, next: string): Response {
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
  <input type="hidden" name="next" value="${next.replace(/"/g, "&quot;")}">
  ${error ? "<p>That token didn't match. Check it and try again.</p>" : ""}
  <button type="submit">Sign in</button>
</form></body></html>`
  return new Response(html, {
    status: error ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const token = env.REGISTRY_TOKEN

    if (url.pathname.startsWith("/r/")) {
      const auth = request.headers.get("Authorization") ?? ""
      const given = auth.startsWith("Bearer ") ? auth.slice(7) : ""
      if (!token || !same(given, token)) {
        return Response.json(
          { error: "Missing or wrong AIMY_REGISTRY_TOKEN. Set it in your environment; components.json sends it." },
          { status: 401 }
        )
      }
      return env.ASSETS.fetch(request)
    }

    if (url.pathname === "/login") {
      if (request.method === "POST") {
        const form = await request.formData()
        const given = String(form.get("token") ?? "")
        const next = String(form.get("next") ?? "/")
        const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/"
        if (!token || !same(given, token)) return loginPage(true, safeNext)
        return new Response(null, {
          status: 303,
          headers: {
            Location: safeNext,
            "Set-Cookie": `${COOKIE}=${encodeURIComponent(given)}; Path=/; Max-Age=${YEAR}; HttpOnly; Secure; SameSite=Lax`,
          },
        })
      }
      return loginPage(false, url.searchParams.get("next") ?? "/")
    }

    if (!token || !same(cookie(request, COOKIE), token)) {
      return Response.redirect(`${url.origin}/login?next=${encodeURIComponent(url.pathname + url.search)}`, 302)
    }
    return env.ASSETS.fetch(request)
  },
}
