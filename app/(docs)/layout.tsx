import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { PageNav, Toc } from "@/components/docs/page-chrome"
import { Sidebar } from "@/components/docs/sidebar"
import ui from "@/package/ui/package.json"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { ThemeToggle } from "@/registry/aimy/ui/theme-toggle"

/** The docs shell: the bar, the sidebar, the page, and "On this page" beside it. */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-(--z-float) flex h-(--topbar-height) items-center gap-3 border-b border-hairline bg-topbar px-5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 rounded-md" aria-label="AiMY UI home">
          <AimyMark variant="lockup" title="" className="h-6" />
          <span className="rounded-sm bg-w07 px-2 py-0.5 text-2xs font-semibold text-ink-secondary">UI</span>
        </Link>
        <span className="ml-auto" />
        <Link
          href="/whats-new/"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w05 hover:text-ink"
        >
          What&apos;s new
          <span className="rounded-sm bg-w07 px-1.5 py-0.5 font-mono text-2xs text-ink">{ui.version}</span>
        </Link>
        <ThemeToggle />
      </header>
      {/* Below the rail rung the sidebar becomes a menu under the topbar (it changes form, it never disappears). */}
      <details className="group border-b border-hairline rail:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-xs font-semibold text-ink-secondary">
          <ChevronRight
            aria-hidden="true"
            strokeWidth={2}
            className="size-4 transition-transform duration-(--t-fast) ease-out group-open:rotate-90"
          />
          Pages
        </summary>
        <Sidebar />
      </details>
      <div className="mx-auto grid max-w-(--bp-ref) grid-cols-1 rail:grid-cols-[var(--sidebar-width)_1fr]">
        <aside className="hidden border-r border-hairline rail:block">
          <div
            data-scroll
            className="sticky top-(--topbar-height) max-h-[calc(100dvh-var(--topbar-height))] overflow-y-auto"
          >
            <Sidebar />
          </div>
        </aside>
        {/* At 80rem and up, "On this page" sits beside the content. */}
        <div className="grid min-w-0 grid-cols-1 px-5 py-12 rail:px-12 min-[80rem]:grid-cols-[minmax(0,1fr)_12rem] min-[80rem]:gap-12">
          <main className="min-w-0">
            {children}
            <PageNav />
          </main>
          <aside className="hidden min-[80rem]:block">
            <div className="sticky top-[calc(var(--topbar-height)+3rem)]">
              <Toc />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
