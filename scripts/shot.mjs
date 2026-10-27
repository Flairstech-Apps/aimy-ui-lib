#!/usr/bin/env node
// Full-width screenshots with headless Chrome, for reviews at the 1536px
// reference width (the Claude browser pane is narrower and crops).
//
//   node scripts/shot.mjs <url> <out.png> [width=1536] [height=1200]
//
// For the light theme, add ?theme=light to a docs URL.

import { execFileSync } from "node:child_process"
import path from "node:path"

const [url, out, width = "1536", height = "1200"] = process.argv.slice(2)
if (!url || !out) {
  console.error("Usage: node scripts/shot.mjs <url> <out.png> [width] [height]")
  process.exit(1)
}
const chrome =
  process.env.CHROME ??
  (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : "google-chrome")

execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  `--window-size=${width},${height}`,
  "--virtual-time-budget=8000",
  `--screenshot=${path.resolve(out)}`,
  url,
])
console.log(`shot: ${out} (${width}x${height})`)
