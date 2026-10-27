import { themeScript } from "@/hooks/use-theme"

/** Place inside <head>. Applies the saved theme before first paint. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
