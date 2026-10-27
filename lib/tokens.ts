import "server-only"
import { readFileSync } from "node:fs"
import path from "node:path"

// Reads the shipped token files at build time, so every value on the docs is
// the value an app actually gets. Nothing on these pages is typed by hand.

export type ThemeName = "dark" | "light"
type Decls = Map<string, string>

const TOKENS = path.join(process.cwd(), "package", "tokens")

function parseBlock(css: string, selector: string): Decls {
  const at = css.indexOf(`${selector} {`)
  if (at < 0) throw new Error(`tokens: no ${selector} block`)
  const body = css.slice(at, css.indexOf("}", at))
  const out: Decls = new Map()
  for (const m of body.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) out.set(m[1]!, m[2]!.trim())
  return out
}

let cache: { dark: Decls; light: Decls; motion: Decls; layers: Decls } | null = null

function load() {
  if (cache) return cache
  const aimy = readFileSync(path.join(TOKENS, "aimy.css"), "utf8")
  cache = {
    dark: parseBlock(aimy, '[data-theme="dark"]'),
    light: parseBlock(aimy, '[data-theme="light"]'),
    motion: parseBlock(readFileSync(path.join(TOKENS, "motion.css"), "utf8"), ":root"),
    layers: parseBlock(readFileSync(path.join(TOKENS, "layers.css"), "utf8"), ":root"),
  }
  return cache
}

/** The token as written in the file for that theme (light falls back to dark). */
export function raw(name: string, theme: ThemeName = "dark"): string | undefined {
  const t = load()
  return theme === "light" ? (t.light.get(name) ?? t.dark.get(name)) : t.dark.get(name)
}

/** The token with every var() followed to a final value. */
export function resolve(name: string, theme: ThemeName = "dark", depth = 0): string {
  const value = raw(name, theme)
  if (value === undefined) throw new Error(`tokens: ${name} is not defined`)
  if (depth > 10) throw new Error(`tokens: ${name} does not resolve`)
  return value.replace(/var\((--[a-zA-Z0-9-]+)(?:,[^)]*)?\)/g, (_, ref: string) => resolve(ref, theme, depth + 1))
}

export function motion(name: string): string {
  return load().motion.get(name) ?? ""
}

export function layers(): [string, string][] {
  return [...load().layers]
}

// ── Colour maths for contrast ──────────────────────────────────────────

type RGBA = [number, number, number, number]

export function parseColor(value: string): RGBA | null {
  const v = value.trim()
  const hex = /^#([0-9a-f]{3,8})$/i.exec(v)?.[1]
  if (hex) {
    const full = hex.length <= 4 ? [...hex].map((c) => c + c).join("") : hex
    const n = (i: number) => parseInt(full.slice(i, i + 2), 16)
    return [n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1]
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(v)?.[1]
  if (rgb) {
    const parts = rgb.split(/[\s,/]+/).filter(Boolean).map(Number)
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1]
  }
  return null
}

function over(top: RGBA, ground: RGBA): RGBA {
  const a = top[3]
  return [top[0] * a + ground[0] * (1 - a), top[1] * a + ground[1] * (1 - a), top[2] * a + ground[2] * (1 - a), 1]
}

function luminance([r, g, b]: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast of a colour (alpha composited) on a ground token, or null if not a flat colour. */
export function contrast(color: string, groundToken: string, theme: ThemeName): number | null {
  const fg = parseColor(color)
  const bg = parseColor(resolve(groundToken, theme))
  if (!fg || !bg) return null
  const a = luminance(over(fg, bg))
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
