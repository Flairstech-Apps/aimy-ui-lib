import { Sparkles } from "lucide-react"
import { AimyMark } from "@/components/aimy-mark"
import { Icon } from "@/components/icon"
import { ThemeToggle } from "@/components/theme-toggle"

// A new AiMY product starts here: the theme, fonts and topbar are in place.
// Add components with `pnpm aimy:add @aimy/<name>`; the shell components
// (rail, canvas, composer) replace this layout as they land in the library.
export function App() {
  return (
    <div className="min-h-dvh bg-body text-ink">
      <header className="flex h-(--topbar-height) items-center gap-3 border-b border-hairline bg-topbar px-5">
        <AimyMark variant="lockup" className="h-6" />
        <span className="ml-auto" />
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-[48rem] flex-col items-start gap-4 px-5 py-15">
        <span className="grid size-12 place-items-center rounded-xl bg-w05">
          <Icon icon={Sparkles} size="xl" className="text-ai-ink" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Your AiMY product</h1>
        <p className="text-body text-ink-secondary">
          The AiMY theme, fonts and topbar are installed. Edit src/App.tsx to start, and add components with pnpm
          aimy:add.
        </p>
      </main>
    </div>
  )
}
