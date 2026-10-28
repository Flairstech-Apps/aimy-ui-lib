import { ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Sidebar } from "@/components/docs/sidebar"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import Script from "next/script"
import { themeScript } from "@/registry/aimy/hooks/use-theme"
import { ThemeToggle } from "@/registry/aimy/ui/theme-toggle"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "AiMY UI", template: "%s · AiMY UI" },
  description: "The component library for AiMY products. Internal to FlairsTech.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Docs only: ?theme=light or ?theme=dark picks the theme, for shareable review links. Then the
            library's pre-paint script, loaded the Next.js way so React doesn't render a <script> itself. */}
        <Script id="aimy-theme" strategy="beforeInteractive">
          {`try{var q=new URLSearchParams(location.search).get("theme");if(q==="light"||q==="dark")localStorage.setItem("aimy-ds-theme",q)}catch(e){}${themeScript}`}
        </Script>
      </head>
      <body className="min-h-dvh">
        <header className="sticky top-0 z-(--z-float) flex h-(--topbar-height) items-center gap-3 border-b border-hairline bg-topbar px-5 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3 rounded-md" aria-label="AiMY UI home">
            <AimyMark variant="lockup" title="" className="h-6" />
            <span className="rounded-sm bg-w07 px-2 py-0.5 text-2xs font-semibold text-ink-secondary">UI</span>
          </Link>
          <span className="ml-auto" />
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
            <div className="sticky top-(--topbar-height) max-h-[calc(100dvh-var(--topbar-height))] overflow-y-auto">
              <Sidebar />
            </div>
          </aside>
          <main className="min-w-0 px-5 py-10 rail:px-12">{children}</main>
        </div>
      </body>
    </html>
  )
}
