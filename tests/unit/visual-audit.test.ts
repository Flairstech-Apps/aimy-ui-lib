import { describe, expect, it } from "vitest"
import { describeVisualProblems, visualProblems } from "@/registry/aimy/lib/visual-audit"

// The visual audit measures layout, which jsdom doesn't have: here it only has to run without a page
// to measure and word its findings. Its real checks run in Chrome (docs audit, 20 Nov).

describe("visual audit", () => {
  it("runs on a page with no layout and finds nothing to measure", () => {
    document.body.innerHTML = `<main><button>Save</button><p>Hello</p></main>`
    expect(visualProblems(document.querySelector("main")!)).toEqual([])
  })

  it("words each problem as a sentence with its place", () => {
    const element = document.createElement("button")
    expect(
      describeVisualProblems([
        { kind: "row", severity: "fix", message: "Pills differ in height by 2px.", where: "[data-slot=topnav]", element, measured: { spread: 2 } },
        { kind: "cut", severity: "check", message: "Text is cut.", where: "span.name", element, measured: { over: 4 } },
      ])
    ).toEqual(["Fix: Pills differ in height by 2px. ([data-slot=topnav])", "Check: Text is cut. (span.name)"])
  })
})
