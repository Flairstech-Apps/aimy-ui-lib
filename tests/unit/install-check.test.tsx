import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InstallCheck } from "@/registry/aimy/ui/install-check"
import { a11yViolations } from "../a11y"

describe("InstallCheck", () => {
  it("says the library is installed", () => {
    render(<InstallCheck />)
    expect(screen.getByText("AiMY UI is installed")).toBeInTheDocument()
  })

  it("lets a className override its defaults", () => {
    const { container } = render(<InstallCheck className="bg-red-900" />)
    const el = container.querySelector("[data-slot=install-check]")
    expect(el).toHaveClass("bg-red-900")
    expect(el).not.toHaveClass("bg-[#141b24]")
  })

  it("has no accessibility violations", async () => {
    const { container } = render(<InstallCheck />)
    expect(await a11yViolations(container)).toEqual([])
  })
})
