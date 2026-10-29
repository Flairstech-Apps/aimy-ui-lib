import { Moon, Sun } from "lucide-react"
import { IconButton } from "@/components/icon-button"
import { useTheme } from "@/hooks/use-theme"

// The sun and moon share one slot and cross-fade with transitions.dev's icon
// swap (09), shipped in @flairstech-aimy/tokens/transitions.css.
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  return (
    <IconButton data-slot="theme-toggle" label={`Switch to ${next} theme`} onClick={toggle} size="lg" className={className}>
      <span className="t-icon-swap" data-state={theme === "dark" ? "a" : "b"}>
        <Sun className="t-icon" data-icon="a" strokeWidth={2} aria-hidden="true" />
        <Moon className="t-icon" data-icon="b" strokeWidth={2} aria-hidden="true" />
      </span>
    </IconButton>
  )
}
