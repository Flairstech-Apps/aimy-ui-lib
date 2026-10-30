import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LayoutGrid, Settings } from "lucide-react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"
import { ScrollDot } from "@/registry/aimy/ui/scroll-dot"
import { SideNav, type SideNavPage } from "@/registry/aimy/ui/side-nav"
import { a11yViolations } from "../a11y"

// jsdom has no ResizeObserver; the components only need it to exist.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})
afterEach(() => localStorage.clear())

const PAGES: SideNavPage[] = [
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings /> },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: <LayoutGrid />,
    current: true,
    badge: 2,
    tip: "29 points below target",
    findings: [{ fig: "29", text: "points below target", active: true }],
  },
]

describe("SideNav", () => {
  it("opens with the current page first, saying so, and its figures", async () => {
    const { container } = render(<SideNav pages={PAGES} summary="6 insights" label="QA pages" breakpoint={0} />)
    const nav = screen.getByRole("navigation", { name: "QA pages" })
    expect(nav).toHaveAttribute("data-rail", "open")
    const sections = container.querySelectorAll(".snav-section")
    expect(sections[0]).toHaveTextContent("Dashboard")
    expect(sections[0]).toHaveTextContent("You're here")
    expect(screen.getByText("points below target")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute("href", "/settings")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("collapses to icons named with their figures, remembers it, and opens again", async () => {
    render(<SideNav pages={PAGES} count={6} label="QA pages" storageKey="t-nav" breakpoint={0} />)
    await userEvent.click(screen.getByRole("button", { name: "Collapse the pages" }))
    expect(screen.getByRole("navigation", { name: "QA pages" })).toHaveAttribute("data-rail", "collapsed")
    expect(localStorage.getItem("t-nav")).toBe("collapsed")
    const current = screen.getByRole("link", { name: "Dashboard: 29 points below target (you're here)" })
    expect(current).toHaveAttribute("aria-current", "page")
    await userEvent.click(screen.getByRole("button", { name: "Expand the pages" }))
    expect(screen.getByRole("navigation", { name: "QA pages" })).toHaveAttribute("data-rail", "open")
    expect(localStorage.getItem("t-nav")).toBe("open")
  })

  it("routes through onNavigate instead of following the link", async () => {
    const went: string[] = []
    render(<SideNav pages={PAGES} onNavigate={(href) => went.push(href)} breakpoint={0} />)
    await userEvent.click(screen.getByRole("link", { name: /Settings/ }))
    expect(went).toEqual(["/settings"])
  })
})

describe("SideNav, narrow", () => {
  it("stays collapsed and opens the open form as a drawer, closed by Escape", async () => {
    render(<SideNav pages={PAGES} label="QA pages" breakpoint={5000} />)
    expect(screen.getByRole("navigation", { name: "QA pages" })).toHaveAttribute("data-narrow", "true")
    const open = screen.getByRole("button", { name: "Open the pages" })
    expect(open).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(open)
    expect(open).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region", { name: "QA pages" })).not.toHaveAttribute("inert")
    await userEvent.keyboard("{Escape}")
    expect(open).toHaveAttribute("aria-expanded", "false")
  })
})

describe("ScrollDot", () => {
  it("is a named region you can reach, with the dot hidden from screen readers", async () => {
    const { container } = render(
      <ScrollDot label="Messages" latest>
        <p>One</p>
      </ScrollDot>
    )
    const region = screen.getByRole("region", { name: "Messages" })
    expect(region).toHaveAttribute("tabindex", "0")
    expect(container.querySelector(".aimy-scroll")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("button", { name: "Jump to the latest message", hidden: true })).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })
})
