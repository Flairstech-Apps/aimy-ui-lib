import { cn } from "@/lib/utils"

// The wash Sales and Knowledge draw behind the whole app: two ellipse glows on
// the ground, below every surface, in both themes with each theme's own
// alphas. It never moves and takes no pointer. AppShell draws it for you; on
// a page without the shell, put it first in <body> and give the app's root a
// position so it paints above the wash.
//
//   <body><AmbientBackground /><div className="relative">…</div></body>

export function AmbientBackground({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("ambient-bg", className)} data-slot="ambient-background" />
}
