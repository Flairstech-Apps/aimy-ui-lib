import { act, fireEvent, render, screen } from "@testing-library/react"
import { Send } from "lucide-react"
import { beforeEach, describe, expect, it } from "vitest"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { THEME_KEY, themeScript } from "@/registry/aimy/hooks/use-theme"
import { Icon } from "@/registry/aimy/ui/icon"
import { ThemeToggle } from "@/registry/aimy/ui/theme-toggle"
import { a11yViolations } from "../a11y"

describe("Icon", () => {
  it("is hidden from screen readers when it has no label", () => {
    const { container } = render(<Icon icon={Send} />)
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("is announced by its label when given one", () => {
    render(<Icon icon={Send} label="Send" />)
    expect(screen.getByRole("img", { name: "Send" })).toBeInTheDocument()
  })

  it("uses stroke 2 and a square size from the scale", () => {
    const { container } = render(<Icon icon={Send} size="sm" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("stroke-width", "2")
    expect(svg).toHaveClass("size-3.5")
  })
})

describe("AimyMark", () => {
  it("is an image named AiMY by default", () => {
    render(<AimyMark />)
    expect(screen.getByRole("img", { name: "AiMY" })).toBeInTheDocument()
  })

  it("is decorative with an empty title", () => {
    const { container } = render(<AimyMark title="" />)
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("gives every instance its own gradient id", () => {
    const { container } = render(
      <>
        <AimyMark />
        <AimyMark variant="lockup" />
      </>
    )
    const ids = [...container.querySelectorAll("radialGradient")].map((g) => g.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })

  it("has no accessibility violations", async () => {
    const { container } = render(<AimyMark variant="lockup" />)
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "dark")
    localStorage.clear()
  })

  it("names the theme it switches to", () => {
    render(<ThemeToggle />)
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument()
  })

  it("switches the theme on <html> and remembers it", async () => {
    render(<ThemeToggle />)
    await act(async () => {
      fireEvent.click(screen.getByRole("button"))
    })
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
    expect(localStorage.getItem(THEME_KEY)).toBe("light")
    expect(await screen.findByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument()
  })

  it("has no accessibility violations", async () => {
    const { container } = render(<ThemeToggle />)
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("themeScript", () => {
  it("applies a saved light theme and defaults to dark", () => {
    localStorage.setItem(THEME_KEY, "light")
    new Function(themeScript)()
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
    localStorage.clear()
    new Function(themeScript)()
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })
})
