import type { Metadata } from "next"
import Script from "next/script"
import { themeScript } from "@/lib/theme"
import "./globals.css"

export const metadata: Metadata = { title: "AiMY product" }

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
