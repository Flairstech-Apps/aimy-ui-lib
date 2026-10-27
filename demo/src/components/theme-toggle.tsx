"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

// The sun and moon share one slot and cross-fade with transitions.dev's icon
// swap (09), shipped in @flairstech-aimy/tokens/transitions.css.
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  return (
    <button
      type="button"
      data-slot="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "inline-grid size-9 place-items-center rounded-md border border-edge text-ink-secondary",
        "transition-[background-color,border-color,color,scale] duration-(--t-fast) ease-out",
        "hover:border-edge-hover hover:bg-w05 hover:text-ink active:scale-(--press-scale)",
        className
      )}
    >
      <span className="t-icon-swap" data-state={theme === "dark" ? "a" : "b"}>
        <Sun className="t-icon size-4" data-icon="a" strokeWidth={2} aria-hidden="true" />
        <Moon className="t-icon size-4" data-icon="b" strokeWidth={2} aria-hidden="true" />
      </span>
    </button>
  )
}
