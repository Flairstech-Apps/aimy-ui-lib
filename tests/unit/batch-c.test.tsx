import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Calendar } from "@/registry/aimy/ui/calendar"
import { Card, CardFoot, CardHead, CardSummary, CardTitle, CardType } from "@/registry/aimy/ui/card"
import { Disclosure } from "@/registry/aimy/ui/disclosure"
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuTrigger } from "@/registry/aimy/ui/menu"
import { Pager } from "@/registry/aimy/ui/pager"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/aimy/ui/popover"
import { Tab, TabPanel, Tabs, TabsList } from "@/registry/aimy/ui/tabs"
import { a11yViolations } from "../a11y"

describe("Card", () => {
  it("opens from its title, keeps its own buttons, and tints its edge by status", () => {
    const onOpen = vi.fn()
    const onCall = vi.fn()
    render(
      <Card status="warn">
        <CardHead>
          <CardType>Contact</CardType>
        </CardHead>
        <CardTitle onClick={onOpen}>Kestrel Logistics</CardTitle>
        <CardSummary>Head of operations</CardSummary>
        <CardFoot>
          <button onClick={onCall}>Call Dana</button>
        </CardFoot>
      </Card>
    )
    fireEvent.click(screen.getByRole("button", { name: "Kestrel Logistics" }))
    fireEvent.click(screen.getByRole("button", { name: "Call Dana" }))
    expect(onOpen).toHaveBeenCalledOnce()
    expect(onCall).toHaveBeenCalledOnce()
    expect(screen.getByRole("article")).toHaveAttribute("data-status", "warn")
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Kestrel Logistics")
  })
})

describe("Tabs", () => {
  it("is a tablist that switches panels and shows counts", async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="contacts" size="page">
        <TabsList aria-label="Views">
          <Tab value="contacts" count={134}>
            Contacts
          </Tab>
          <Tab value="calls" count={12}>
            Calls
          </Tab>
        </TabsList>
        <TabPanel value="contacts">All contacts</TabPanel>
        <TabPanel value="calls">Recent calls</TabPanel>
      </Tabs>
    )
    expect(screen.getByRole("tablist", { name: "Views" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^Contactss*,s*134$/ })).toHaveAttribute("aria-selected", "true")
    await user.click(screen.getByRole("tab", { name: /^Callss*,s*12$/ }))
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Recent calls")
  })
})

describe("Disclosure", () => {
  it("toggles its section and keeps the closed body out of reach", () => {
    render(
      <Disclosure title="Transcript" count={42}>
        <a href="#line">First line</a>
      </Disclosure>
    )
    const head = screen.getByRole("button", { name: /Transcript/ })
    expect(head).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("region", { hidden: true })).toHaveAttribute("inert")
    fireEvent.click(head)
    expect(head).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region", { name: "Transcript" })).not.toHaveAttribute("inert")
  })
})

describe("Pager", () => {
  it("says where you are and how many come next", () => {
    const onPageChange = vi.fn()
    render(<Pager total={134} page={9} pageSize={15} noun="contacts" onPageChange={onPageChange} />)
    expect(screen.getByText("121–134 of 134 contacts, page 9 of 9")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Next/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Back 15" }))
    expect(onPageChange).toHaveBeenCalledWith(8)
  })

  it("says all shown on one page", () => {
    render(<Pager total={9} page={1} noun="contacts" onPageChange={() => {}} />)
    expect(screen.getByText("9 contacts, all shown.")).toBeInTheDocument()
  })
})

describe("Menu", () => {
  it("opens from its trigger, acts, and stays open for several answers", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Menu>
        <MenuTrigger>Sells</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem checked onCheckedChange={() => {}}>
            Cloud
          </MenuCheckboxItem>
          <MenuItem onSelect={onSelect} description="Removes it from this list">
            Remove
          </MenuItem>
        </MenuContent>
      </Menu>
    )
    const trigger = screen.getByRole("button", { name: "Sells" })
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Cloud" }))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    await user.click(screen.getByRole("menuitem", { name: /Remove/ }))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})

describe("Popover", () => {
  it("opens a named panel and closes on Escape", async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger>Why this score</PopoverTrigger>
        <PopoverContent label="About this score">From the last call, 2 days ago.</PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole("button", { name: "Why this score" }))
    expect(screen.getByRole("dialog", { name: "About this score" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("Calendar", () => {
  it("is a grid that chooses a day and moves with the arrow keys", async () => {
    const onValueChange = vi.fn()
    const day = new Date(2026, 9, 14)
    render(<Calendar value={day} onValueChange={onValueChange} />)
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeInTheDocument()
    const start = screen.getByRole("button", { name: "Wednesday, 14 October 2026" })
    expect(start).toHaveAttribute("tabindex", "0")
    start.focus()
    await act(async () => {
      fireEvent.keyDown(start, { key: "ArrowDown" })
    })
    const next = screen.getByRole("button", { name: "Wednesday, 21 October 2026" })
    expect(next).toHaveFocus()
    fireEvent.click(next)
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 21))
  })

  it("has no accessibility violations", async () => {
    const { container } = render(<Calendar value={new Date(2026, 9, 14)} />)
    expect(await a11yViolations(container)).toEqual([])
  })
})
