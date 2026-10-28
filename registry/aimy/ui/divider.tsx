import { cn } from "@/lib/utils"

// .ds-divider: a 1px edge-coloured rule. With children it becomes the
// labelled form, a section marker between two rules (capitals are allowed
// here: it is the one marker per group).
type DividerProps = {
  children?: React.ReactNode
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function Divider({ children, orientation = "horizontal", className }: DividerProps) {
  if (orientation === "vertical") {
    return <span data-slot="divider" role="separator" aria-orientation="vertical" className={cn("w-px self-stretch bg-edge", className)} />
  }
  if (!children) {
    return <hr data-slot="divider" className={cn("my-1 h-px border-0 bg-edge", className)} />
  }
  return (
    <div data-slot="divider" role="separator" className={cn("my-1 flex items-center gap-3", className)}>
      <span aria-hidden="true" className="h-px flex-1 bg-edge" />
      <span className="text-xs font-bold tracking-wide text-ink-quiet uppercase">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-edge" />
    </div>
  )
}
