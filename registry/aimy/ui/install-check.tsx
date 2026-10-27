// Phase 0 walking skeleton. Throwaway: proves build, deploy and install work
// end to end. Deleted in Phase 1, when the real theme and components land.
import { cn } from "@/lib/utils"

export function InstallCheck({ className }: { className?: string }) {
  return (
    <div
      data-slot="install-check"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-[#2e3d50] bg-[#141b24] px-4 py-3 text-[#dee5ed]",
        className
      )}
    >
      <span className="size-2 rounded-full bg-[#4ed6a1]" aria-hidden="true" />
      AiMY UI is installed
    </div>
  )
}
