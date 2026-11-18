import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AmbientBackground } from "@/registry/aimy/ui/ambient-background"
import { AppShell, Page, PageHead } from "@/registry/aimy/ui/app-shell"
import { a11yViolations } from "../a11y"

describe("AmbientBackground", () => {
  it("is a hidden layer that is never read", async () => {
    const { container } = render(<AmbientBackground className="extra" />)
    const layer = container.querySelector("[data-slot=ambient-background]")
    expect(layer).toHaveAttribute("aria-hidden", "true")
    expect(layer).toHaveClass("ambient-bg", "extra")
    expect(layer).toBeEmptyDOMElement()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("sits first in AppShell by default, behind the bar and the page, and ambient={false} leaves it out", () => {
    const page = (
      <Page>
        <PageHead title="Today" />
      </Page>
    )
    const { container, rerender } = render(<AppShell topnav={<nav aria-label="Products" />}>{page}</AppShell>)
    const shell = container.querySelector("[data-slot=app-shell]")
    expect(shell?.firstElementChild).toHaveAttribute("data-slot", "ambient-background")
    rerender(
      <AppShell topnav={<nav aria-label="Products" />} ambient={false}>
        {page}
      </AppShell>
    )
    expect(container.querySelector("[data-slot=ambient-background]")).toBeNull()
  })
})
