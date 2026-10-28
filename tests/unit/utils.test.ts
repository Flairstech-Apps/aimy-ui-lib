import { describe, expect, it } from "vitest"
import { cn, cssDuration } from "@/registry/aimy/lib/utils"

describe("cn", () => {
  it("joins class names and drops falsy ones", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b")
  })

  it("keeps an AiMY text size next to a text colour", () => {
    expect(cn("text-meta text-ink-secondary")).toBe("text-meta text-ink-secondary")
    expect(cn("text-micro text-ink-quiet", "text-body")).toBe("text-ink-quiet text-body")
    expect(cn("rounded-md", "rounded-pill")).toBe("rounded-pill")
  })

  it("lets a later Tailwind utility override an earlier one", () => {
    expect(cn("px-4 bg-[#141b24]", "bg-red-900")).toBe("px-4 bg-red-900")
  })
})

describe("cssDuration", () => {
  it("reads ms and s, so a minified 2s is 2000ms, not 2", () => {
    const root = document.documentElement
    root.style.setProperty("--x-hold", "2s")
    root.style.setProperty("--x-gap", "60ms")
    root.style.setProperty("--x-swap", ".15s")
    expect(cssDuration("--x-hold", 0)).toBe(2000)
    expect(cssDuration("--x-gap", 0)).toBe(60)
    expect(cssDuration("--x-swap", 0)).toBe(150)
    expect(cssDuration("--x-missing", 400)).toBe(400)
  })
})
