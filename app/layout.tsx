import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AiMY UI",
  description: "The component library for AiMY products. Internal to FlairsTech.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
