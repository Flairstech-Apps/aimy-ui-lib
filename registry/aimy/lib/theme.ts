// Plain constants, deliberately not a "use client" module: a Next.js server
// component that imports from a client module gets a stub, not the value, so
// the pre-paint script must live here to work in <head>.

export type Theme = "dark" | "light"

/** The localStorage key every AiMY product already uses. */
export const THEME_KEY = "aimy-ds-theme"

/**
 * Runs before first paint (put it in <head>) so a saved light theme never
 * flashes dark. Dark is the default; light is <html data-theme="light">.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`
