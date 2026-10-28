import { themeScript } from "@/hooks/use-theme"

/**
 * Place inside <head>. Applies the saved theme before first paint.
 * In a Vite or plain HTML app, paste themeScript into index.html instead.
 * In the Next.js App Router, React 19 warns when a component renders a
 * <script>; use next/script there:
 *   <Script id="aimy-theme" strategy="beforeInteractive">{themeScript}</Script>
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
