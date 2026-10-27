import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Every AiMY icon is a Lucide glyph on the 24 grid with stroke 2 and round
// caps (Nour's rule). Sizes are square and come from this scale only.
const SIZES = {
  xs: "size-3", // 12: inside a tag or a count
  sm: "size-3.5", // 14: inside a button, beside 14px text
  md: "size-4", // 16: the default, beside body text
  lg: "size-5", // 20: standalone controls
  xl: "size-6", // 24: empty states, large controls
} as const

type IconProps = {
  icon: LucideIcon
  size?: keyof typeof SIZES
  /** Accessible name. Leave out when the icon sits beside words that say the same thing. */
  label?: string
  className?: string
}

export function Icon({ icon: Glyph, size = "md", label, className }: IconProps) {
  return (
    <Glyph
      data-slot="icon"
      strokeWidth={2}
      className={cn(SIZES[size], "shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  )
}
