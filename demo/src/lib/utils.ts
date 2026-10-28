import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge has to know AiMY's own theme names, or it mistakes a size
// like text-meta for a colour and drops it when text-ink-secondary follows.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["micro", "meta", "body", "title"] }],
      "font-weight": [{ font: ["regular"] }],
      leading: [{ leading: ["base"] }],
      rounded: [{ rounded: ["pill"] }],
      shadow: [{ shadow: ["sm", "md", "lg", "xl"] }],
    },
  },
})

/**
 * A duration token in milliseconds, read from the CSS as the transitions.dev
 * snippets do, so timing has one source. Reads the unit: a minifier may write
 * 2000ms as 2s, and parseFloat alone would take that as 2ms.
 */
export function cssDuration(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const v = parseFloat(raw)
  if (!Number.isFinite(v)) return fallback
  return raw.endsWith("ms") ? v : raw.endsWith("s") ? v * 1000 : v
}

/** Join class names and let later Tailwind utilities override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
