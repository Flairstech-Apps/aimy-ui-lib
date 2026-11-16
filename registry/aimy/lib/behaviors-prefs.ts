// Preferences: a saved choice from a list that the page can apply before
// first paint (the theme is one), and what kind of pointer the person is
// using, so a part can grow its targets for a finger.

import { type Cleanup, createStore, isBrowser } from "./behaviors-core"
import { THEME_KEY } from "./theme"

export type PreferenceOptions<T extends string> = {
  /** Storage key. */
  key: string
  values: readonly T[]
  default: T
  /** Attribute set on <html> to the value (data-theme, data-density). */
  attribute?: string
}

/** Holds a choice, saves it to localStorage, mirrors it to an attribute on <html>, and tells subscribers. */
export function createPreference<T extends string>(o: PreferenceOptions<T>) {
  const read = (): T => {
    if (!isBrowser) return o.default
    try {
      const v = localStorage.getItem(o.key) as T | null
      return v && o.values.includes(v) ? v : o.default
    } catch {
      return o.default
    }
  }
  const store = createStore<{ value: T }>({ value: read() })
  const apply = (v: T) => {
    if (isBrowser && o.attribute) document.documentElement.setAttribute(o.attribute, v)
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === o.key) store.set({ value: read() })
  }
  if (isBrowser) window.addEventListener("storage", onStorage)
  store.subscribe((s) => apply(s.value))
  return {
    ...store,
    value: () => store.get().value,
    set(value: T) {
      if (!o.values.includes(value)) return
      try {
        localStorage.setItem(o.key, value)
      } catch {
        /* private mode: the choice lasts the page */
      }
      store.set({ value })
    },
    destroy: () => {
      if (isBrowser) window.removeEventListener("storage", onStorage)
    },
  }
}

export type ColorScheme = "light" | "dark"
export type ColorSchemeChoice = ColorScheme | "system"

/**
 * Light, dark or the system's. Dark is AiMY's default; the resolved scheme
 * goes on <html data-theme>, the attribute the tokens already read, under the
 * same storage key every AiMY product uses.
 */
export function createColorScheme(options: { key?: string; default?: ColorSchemeChoice } = {}) {
  const pref = createPreference<ColorSchemeChoice>({ key: options.key ?? THEME_KEY, values: ["light", "dark", "system"], default: options.default ?? "dark" })
  const mq = isBrowser && typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: light)") : null
  const resolve = (c: ColorSchemeChoice): ColorScheme => (c === "system" ? (mq?.matches ? "light" : "dark") : c)
  const store = createStore<{ choice: ColorSchemeChoice; scheme: ColorScheme }>({ choice: pref.value(), scheme: resolve(pref.value()) })
  const apply = () => {
    const scheme = resolve(pref.value())
    store.set({ choice: pref.value(), scheme })
    if (isBrowser) document.documentElement.setAttribute("data-theme", scheme)
  }
  const offPref = pref.subscribe(apply)
  mq?.addEventListener("change", apply)
  return {
    ...store,
    set: (c: ColorSchemeChoice) => pref.set(c),
    toggle: () => pref.set(store.get().scheme === "dark" ? "light" : "dark"),
    destroy: (): void => {
      offPref()
      mq?.removeEventListener("change", apply)
      pref.destroy()
    },
  }
}

/** The scheme a browser asks for in a request (the Sec-CH-Prefers-Color-Scheme client hint), for server rendering. */
export function colorSchemeOf(headers: { get(name: string): string | null }): ColorScheme | null {
  const v = headers.get("sec-ch-prefers-color-scheme")?.replace(/"/g, "")
  return v === "light" || v === "dark" ? v : null
}

/**
 * A script for <head> that applies saved preferences to <html> before first
 * paint, so a saved choice never flashes the default.
 */
export function preferencesScript(prefs: { key: string; attribute: string; values: readonly string[]; default: string }[]): string {
  const data = JSON.stringify(prefs.map((p) => [p.key, p.attribute, p.values, p.default]))
  return `(function(){var d=document.documentElement;${data}.forEach(function(p){var v=p[3];try{var s=localStorage.getItem(p[0]);if(s&&p[2].indexOf(s)>=0)v=s}catch(e){}d.setAttribute(p[1],v)})})()`
}

export type PointerKind = { coarse: boolean; hover: boolean }

/** Whether the main pointer is a finger (coarse) and whether it can hover; updates when it changes (a tablet's keyboard detached). */
export function createPointerKind() {
  const q = (m: string) => (isBrowser && typeof matchMedia === "function" ? matchMedia(m) : null)
  const coarse = q("(pointer: coarse)")
  const hover = q("(hover: hover)")
  const read = (): PointerKind => ({ coarse: !!coarse?.matches, hover: hover ? hover.matches : true })
  const store = createStore<PointerKind>(read())
  const update = () => store.set(read())
  coarse?.addEventListener("change", update)
  hover?.addEventListener("change", update)
  const destroy: Cleanup = () => {
    coarse?.removeEventListener("change", update)
    hover?.removeEventListener("change", update)
  }
  return { ...store, destroy }
}

/** A guess at the pointer from request headers, for server rendering (corrected on the client). */
export function pointerKindOf(headers: { get(name: string): string | null }): PointerKind {
  const mobile = headers.get("sec-ch-ua-mobile")
  if (mobile === "?1") return { coarse: true, hover: false }
  if (mobile === "?0") return { coarse: false, hover: true }
  const ua = headers.get("user-agent") ?? ""
  const touch = /Mobi|Android|iPhone|iPad/i.test(ua)
  return { coarse: touch, hover: !touch }
}
