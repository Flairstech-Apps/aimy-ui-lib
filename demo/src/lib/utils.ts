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

/** Join class names and let later Tailwind utilities override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
