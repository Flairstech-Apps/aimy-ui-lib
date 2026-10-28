import { useCallback, useSyncExternalStore } from "react"

import { THEME_KEY, type Theme } from "@/lib/theme"

export { THEME_KEY, themeScript, type Theme } from "@/lib/theme"

function read(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}

/** Reads and sets the AiMY theme. Colour transitions are paused for one frame during the swap. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme)

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement
    root.classList.add("theme-swapping")
    root.setAttribute("data-theme", next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // private mode: the theme still applies for this page
    }
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-swapping")))
  }, [])

  const toggle = useCallback(() => setTheme(read() === "dark" ? "light" : "dark"), [setTheme])

  return { theme, setTheme, toggle }
}
