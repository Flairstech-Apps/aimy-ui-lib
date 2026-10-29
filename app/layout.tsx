import type { Metadata } from "next"
import Script from "next/script"
import { themeScript } from "@/registry/aimy/lib/theme"
import { Toaster } from "@/registry/aimy/ui/toast"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "AiMY UI", template: "%s · AiMY UI" },
  description: "The component library for AiMY products at FlairsTech.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Docs only: ?theme=light or ?theme=dark picks the theme, for shareable review links. Then the
            library's pre-paint script, loaded the Next.js way so React doesn't render a <script> itself. */}
        <Script
          id="aimy-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var q=new URLSearchParams(location.search).get("theme");if(q==="light"||q==="dark")localStorage.setItem("aimy-ds-theme",q)}catch(e){};${themeScript};`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
