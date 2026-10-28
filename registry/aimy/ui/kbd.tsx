import { cn } from "@/lib/utils"

// .ds-kbd, identical in all three repos: a key cap with a 2px bottom edge.
// Pass several keys to show a shortcut: <Kbd keys={["Ctrl", "K"]} />.
type KbdProps = { keys: string[]; className?: string }

export function Kbd({ keys, className }: KbdProps) {
  return (
    <span data-slot="kbd" className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((key, i) => (
        <kbd
          key={`${key}-${i}`}
          className="inline-block min-w-5 rounded-sm border border-b-2 border-edge bg-raised px-1.5 py-0.5 text-center font-mono text-xs leading-none text-ink-secondary"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}
