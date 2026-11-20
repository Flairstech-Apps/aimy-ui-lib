import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Journey, trimJourney } from "@/registry/aimy/ui/journey"

const steps = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `Step ${i + 1}`, detail: `${i + 1} Oct` }))

describe("Journey", () => {
  it("is a named list whose last step is where they stand", () => {
    render(<Journey label="How Dana got here" steps={steps(3)} />)
    const list = screen.getByRole("list", { name: "How Dana got here" })
    const items = list.querySelectorAll("li")
    expect(items).toHaveLength(3)
    expect(items[2]).toHaveAttribute("aria-current", "step")
    expect(items[0]).not.toHaveAttribute("aria-current")
  })

  it("keeps the first step and the last four of a long story, the rest said in words", () => {
    const shown = trimJourney(steps(8))
    expect(shown.map((s) => s.label)).toEqual(["Step 1", "⋯", "Step 5", "Step 6", "Step 7", "Step 8"])
    expect(shown[1]?.detail).toBe("3 steps more")
    render(<Journey label="Story" steps={steps(8)} />)
    expect(screen.getByText("3 steps more")).toBeInTheDocument()
  })

  it("draws a story of max steps or fewer whole, and trims to exactly max", () => {
    expect(trimJourney(steps(6))).toHaveLength(6)
    expect(trimJourney(steps(7))).toHaveLength(6)
    expect(trimJourney(steps(7))[1]?.detail).toBe("2 steps more")
    expect(trimJourney(steps(9), 4).map((s) => s.label)).toEqual(["Step 1", "⋯", "Step 8", "Step 9"])
  })
})
