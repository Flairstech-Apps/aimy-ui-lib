import { themeScript } from "@/lib/theme"

/** Place inside <head>. Applies the saved theme before first paint. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
