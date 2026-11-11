import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { themeScript } from "@/lib/theme"
import "./globals.css"

export const metadata: Metadata = { title: "AiMY product" }
// AiMY: viewportFit cover hands the app the whole screen, so the shell, the
// canvas and the float bar can keep clear of a phone's status bar, home
// indicator and notch (--safe-* in the tokens; 0 on a laptop).
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* AiMY: apply the saved theme before first paint, so the page never flashes the wrong one. */}
        <Script id="aimy-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
