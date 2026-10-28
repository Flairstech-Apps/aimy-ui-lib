import { describe, expect, it } from "vitest"
import { cn } from "@/registry/aimy/lib/utils"

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
