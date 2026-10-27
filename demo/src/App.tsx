import { Phone, Sparkles } from "lucide-react"
import { AimyMark } from "@/components/aimy-mark"
import { Icon } from "@/components/icon"
import { ThemeToggle } from "@/components/theme-toggle"

// Phase 1 demo: the foundations on a believable AiMY screen. Each later batch
// replaces hand-built pieces here with the real components.
export function App() {
  return (
    <div className="min-h-dvh bg-body text-ink">
      <header className="flex h-(--topbar-height) items-center gap-3 border-b border-hairline bg-topbar px-5">
        <AimyMark variant="lockup" className="h-6" />
        <span className="ml-auto" />
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-[48rem] flex-col gap-6 px-5 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Good morning, Engy</h1>
          <p className="mt-2 text-body text-ink-secondary">Three calls need a reply today. AiMY has drafted two of them.</p>
        </div>
        <article className="rounded-xl border border-edge bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-w05">
              <Icon icon={Phone} />
            </span>
            <div>
              <h2 className="text-title font-semibold">Kestrel Logistics</h2>
              <p className="text-meta text-ink-quiet">Last call 2 days ago</p>
            </div>
            <span className="ml-auto rounded-sm bg-ok-bg px-2 py-0.5 text-micro font-semibold text-ok-text">Meeting Set</span>
          </div>
          <p className="mt-4 flex gap-2 rounded-lg bg-w04 p-3 text-meta text-ink-secondary">
            <Icon icon={Sparkles} size="sm" className="mt-0.5 text-ai-ink" />
            They asked for pricing on the annual plan. A reply is drafted and waiting for you.
          </p>
        </article>
      </main>
    </div>
  )
}
