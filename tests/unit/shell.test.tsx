import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AppShell, Page, PageHead } from "@/registry/aimy/ui/app-shell"
import { MenuItem } from "@/registry/aimy/ui/menu"
import { NotificationCenter } from "@/registry/aimy/ui/notification-center"
import { Rail, RailDoor, RailDoorMiss, RailDoors, RailLink } from "@/registry/aimy/ui/rail"
import { Topnav, UserMenu } from "@/registry/aimy/ui/topnav"
import { a11yViolations } from "../a11y"

const products = [
  { label: "Knowledge", href: "/knowledge" },
  { label: "Sales", current: true },
  { label: "Talent", soon: "soon" },
]

function Shell({ onDiary = () => {} }: { onDiary?: () => void }) {
  return (
    <AppShell
      topnav={
        <Topnav
          logo={<span>AiMY</span>}
          products={products}
          actions={
            <UserMenu name="Engy Hassan" role="Account executive">
              <MenuItem>Settings</MenuItem>
            </UserMenu>
          }
        />
      }
      rail={
        <Rail foot={<RailLink href="/console">Console</RailLink>}>
          <RailDoors>
            <RailDoor cap="Today" fig="10:30" who="Dana" go="Open the diary" onClick={onDiary} />
          </RailDoors>
        </Rail>
      }
    >
      <Page>
        <PageHead title="Today" stamp="Read 09:12" />
      </Page>
    </AppShell>
  )
}

describe("AppShell, Topnav, Rail", () => {
  it("marks the current product, says which aren't open, and names its parts", async () => {
    const { container } = render(<Shell />)
    const nav = screen.getByRole("navigation", { name: "Products" })
    expect(within(nav).getByText("Sales").closest("[aria-current]")).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", { name: "Knowledge" })).toHaveAttribute("href", "/knowledge")
    expect(within(nav).getByText("soon")).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: "Briefing" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Console" })).toHaveAttribute("href", "/console")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("opens and closes the rail from the toggle, and Escape closes it", async () => {
    render(<Shell />)
    const toggle = screen.getByRole("button", { name: "Open the briefing" })
    const rail = screen.getByRole("complementary", { name: "Briefing" })
    expect(toggle).toHaveAttribute("aria-controls", rail.id)
    await userEvent.click(toggle)
    expect(rail).toHaveClass("is-open")
    expect(screen.getByRole("button", { name: "Close the briefing" })).toHaveAttribute("aria-expanded", "true")
    await userEvent.keyboard("{Escape}")
    expect(rail).not.toHaveClass("is-open")
  })

  it("a door is one button that opens its page", async () => {
    const open = vi.fn()
    render(<Shell onDiary={open} />)
    await userEvent.click(screen.getByRole("button", { name: /Today 10:30 Dana Open the diary/ }))
    expect(open).toHaveBeenCalledOnce()
  })

  it("draws a door's bar against its target and says misses in words", () => {
    const { container } = render(
      <RailDoor
        cap="Financials"
        fig="€182k"
        of="gained"
        bar={{ value: 180, target: 300 }}
        say={
          <>
            Behind, and <RailDoorMiss>3 calls missed</RailDoorMiss>.
          </>
        }
        go="Open the report"
        onClick={() => {}}
      />
    )
    expect(container.querySelector(".b-door-seg.is-won")).toHaveStyle({ width: "50.0%" })
    expect(container.querySelector(".b-door-mark")).toHaveStyle({ left: "83.3%" })
    expect(screen.getByText("3 calls missed")).toHaveClass("b-door-miss")
  })

  it("the account pill opens its menu", async () => {
    render(<Shell />)
    await userEvent.click(screen.getByRole("button", { name: "Account: Engy Hassan" }))
    expect(await screen.findByRole("menuitem", { name: "Settings" })).toBeInTheDocument()
  })
})

describe("NotificationCenter", () => {
  const items = [
    {
      id: "1",
      type: "Callback overdue",
      when: "09:40",
      severity: 1 as const,
      body: "Youssef asked to be called after 3pm.",
      action: { label: "Call Youssef", onClick: vi.fn() },
    },
    { id: "2", type: "Sequence paused", when: "Yesterday", read: true, body: "Stopped for 12 people." },
  ]

  it("counts the unread, says read in words, and does a row's one thing", async () => {
    const readAll = vi.fn()
    const ask = vi.fn()
    render(<NotificationCenter items={items} onMarkAllRead={readAll} onAsk={ask} />)
    const bell = screen.getByRole("button", { name: "Notifications, 1 unread" })
    await userEvent.click(bell)
    const panel = await screen.findByRole("dialog", { name: "Notifications" })
    expect(within(panel).getByText("Needs you")).toBeInTheDocument()
    expect(within(panel).getByText("Yesterday · read")).toBeInTheDocument()
    await userEvent.click(within(panel).getByRole("button", { name: "Mark all read" }))
    expect(readAll).toHaveBeenCalledOnce()
    await userEvent.click(within(panel).getByRole("button", { name: "Call Youssef" }))
    expect(items[0]!.action!.onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("says so when nothing is waiting", async () => {
    render(<NotificationCenter items={[]} />)
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }))
    expect(await screen.findByText("Nothing is waiting on you.")).toBeInTheDocument()
  })

  it("closes from the bell it opened from", async () => {
    render(<NotificationCenter items={items} />)
    const bell = screen.getByRole("button", { name: /Notifications/ })
    await userEvent.click(bell)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    await act(async () => {
      await userEvent.click(bell)
    })
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
