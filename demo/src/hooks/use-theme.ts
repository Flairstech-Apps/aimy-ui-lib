import { useCallback, useSyncExternalStore } from "react"

export type Theme = "dark" | "light"

/** The localStorage key every AiMY product already uses. */
export const THEME_KEY = "aimy-ds-theme"

/**
 * Runs before first paint (put it in <head>) so a saved light theme never
 * flashes dark. Dark is the default; light is <html data-theme="light">.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`

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
