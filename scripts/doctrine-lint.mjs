#!/usr/bin/env node
// Doctrine lint: fails the build on patterns the AiMY system forbids, so the
// rules are enforced by CI instead of remembered. Scans the library source
// (registry/) that ships to products.
//
// Each rule names the rule it enforces. Exemptions are listed by file with a
// reason, never silently.

import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SCAN = ["registry"]

// Files allowed to break one named rule, with the reason.
const EXEMPT = {
  "registry/aimy/brand/aimy-mark.tsx": {
    "raw-colour": "The logo's own gradient stops and wordmark blue are the brand mark, not UI colour.",
  },
  "registry/aimy/ui/orb.tsx": {
    "raw-colour": "The Silk orb is a canvas drawing in the products' own strand colours (voice.js makeSilk), not UI colour.",
  },
  "registry/aimy/ui/thinking.tsx": {
    "raw-colour": "The think-mark paints each particle in the logo's own gradient colour (read from MARK_GRADIENT), as the products do.",
  },
}

const RULES = [
  {
    id: "transition-all",
    why: "Never transition `all`: name the properties (doctrine, Never list).",
    test: /\btransition-all\b|transition:\s*all\b/,
  },
  {
    id: "left-stripe",
    why: "No coloured left-edge stripes; use a tinted ground (Nour, 11 Sep).",
    test: /\bborder-l-(?:[2-9]|\[)|border-left(?:-width)?:\s*[2-9]px/,
  },
  {
    id: "native-select",
    why: "No native <select>; use the AiMY Dropdown (doctrine, Never list).",
    test: /<select[\s>]/,
  },
  {
    id: "inline-onclick",
    why: "No inline onclick strings; use handlers (doctrine, Never list).",
    test: /onclick\s*=\s*["']/i,
  },
  {
    id: "muted-text",
    why: "No muted text: say a state in words and colour, never by fading text (Nour, 8 Sep).",
    test: /\btext-[a-z0-9-]+\/\d{1,2}\b|\btext-opacity-/,
  },
  {
    id: "faint-text",
    why: "ink-faint and ink-rule are for hairlines and glyphs; words bottom out at ink-quiet (no muted text).",
    test: /\btext-ink-(?:faint|rule)\b/,
  },
  {
    id: "off-scale-space",
    why: "Spacing stays on the AiMY 4px scale: 0, px, 0.5, 1-6, 8, 10, 12, 15.",
    test: /(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(?:7|9|11|1[3-46-9]|[2-9]\d|\d{3,})\b/,
  },
  {
    id: "gradient-text",
    why: "No gradient text (doctrine, Never list).",
    test: /\bbg-clip-text\b|background-clip:\s*text/,
  },
  {
    id: "raw-motion",
    why: "Every duration and curve is a motion token (PLAN.md section 7a).",
    test: /\bduration-\[\d|\bduration-\d|\bease-\[|\bdelay-\[\d|\bdelay-\d|cubic-bezier\(/,
  },
  {
    id: "raw-colour",
    why: "Every colour is a token; no hex, rgb() or hsl() in components (design-system principles).",
    test: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/,
  },
]

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(tsx?|css)$/.test(name)) out.push(full)
  }
  return out
}

const problems = []
for (const base of SCAN) {
  for (const file of walk(path.join(ROOT, base))) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/")
    const lines = readFileSync(file, "utf8").split(/\r?\n/)
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return // comments may name what they forbid
      for (const rule of RULES) {
        if (EXEMPT[rel]?.[rule.id]) continue
        if (rule.test.test(line)) problems.push(`${rel}:${i + 1}  [${rule.id}] ${rule.why}\n    ${line.trim()}`)
      }
    })
  }
}

if (problems.length) {
  console.error(`Doctrine lint found ${problems.length} problem(s):\n\n${problems.join("\n\n")}`)
  process.exit(1)
}
console.log("Doctrine lint: clean.")
