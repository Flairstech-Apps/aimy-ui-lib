"use client"

import { useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange)
  return () => window.removeEventListener("resize", onChange)
}

export function ViewportWidth() {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 0
  )
  return <span className="font-mono text-ink">{width ? `${width}px` : "measuring"}</span>
}
