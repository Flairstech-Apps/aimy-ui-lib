import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DataTable, nextSort, type Column } from "@/registry/aimy/ui/data-table"
import { DescriptionList, FactGroup } from "@/registry/aimy/ui/description-list"
import { StatTile, StatTiles } from "@/registry/aimy/ui/stat-tile"
import { Timeline, TimelineItem, TimelineMonth } from "@/registry/aimy/ui/timeline"
import { VirtualList } from "@/registry/aimy/ui/virtual-list"
import { a11yViolations } from "../a11y"

describe("StatTile", () => {
  it("draws figures, and a door tile is a button that opens its set", async () => {
    const open = vi.fn()
    const { container } = render(
      <StatTiles>
        <StatTile label="Booked" value="€182,400" sub="was €140,000 at signing" />
        <StatTile label="Callable" value="107" sub="38 you can call now" tone="ok" onClick={open} />
      </StatTiles>
    )
    expect(screen.getByText("€182,400")).toBeInTheDocument()
    expect(screen.getByText("107")).toHaveClass("tone-ok")
    await userEvent.click(screen.getByRole("button", { name: /Callable 107 38 you can call now/ }))
    expect(open).toHaveBeenCalledOnce()
    expect(container.querySelector(".s-afs")).toHaveStyle({ "--tiles": "2" })
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("DescriptionList", () => {
  it("says a missing value in words, beside or stacked", () => {
    const { rerender } = render(
      <DescriptionList
        items={[
          { term: "Founded", detail: null },
          { term: "Size", detail: "140 people", tone: "ok" },
        ]}
      />
    )
    expect(screen.getByText("Not known")).toHaveClass("b-about-none")
    expect(screen.getByText("140 people")).toHaveClass("tone-ok")
    rerender(
      <DescriptionList form="stacked" items={[{ term: "Pace", detail: "On track", tone: "ok", note: "62% used" }]} />
    )
    expect(screen.getByText("On track")).toHaveClass("is-ok")
    expect(screen.getByText("62% used")).toBeInTheDocument()
  })

  it("a group being checked again is busy and names itself", async () => {
    const { container } = render(
      <FactGroup title="Company" checking>
        <DescriptionList items={[{ term: "Size", detail: "140 people" }]} />
      </FactGroup>
    )
    const g = screen.getByRole("region", { name: "Company" })
    expect(g).toHaveAttribute("aria-busy", "true")
    expect(g).toHaveClass("is-checking")
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Timeline", () => {
  it("draws one record's history, newest open, with the step and the end", async () => {
    const { container } = render(
      <Timeline end="First called 24 Jun">
        <TimelineMonth>October</TimelineMonth>
        <TimelineItem
          when="28 Oct"
          by="Engy Hassan"
          outcome="Meeting set"
          tone="ok"
          move="Meeting"
          milestone
          defaultOpen
        >
          They asked for pricing.
        </TimelineItem>
        <TimelineItem when="21 Oct" by="AiMY" ai outcome="Callback" tone="warn">
          Call after the quarter.
        </TimelineItem>
      </Timeline>
    )
    const items = container.querySelectorAll("details")
    expect(items[0]).toHaveAttribute("open")
    expect(items[0]).toHaveClass("is-milestone")
    expect(items[1]).not.toHaveAttribute("open")
    expect(screen.getByText("→ Meeting")).toBeInTheDocument()
    expect(screen.getByText("AiMY")).toHaveClass("is-ai")
    expect(screen.getByText("First called 24 Jun")).toBeInTheDocument()
    await userEvent.click(screen.getByText("21 Oct"))
    expect(items[1]).toHaveAttribute("open")
    expect(await a11yViolations(container)).toEqual([])
  })
})

type R = { id: string; name: string; n: number }
const ROWS: R[] = [
  { id: "b", name: "Bristol", n: 2 },
  { id: "a", name: "Aberdeen", n: 3 },
  { id: "c", name: "Cardiff", n: 1 },
]
const COLS: Column<R>[] = [
  { key: "name", header: "Name", cell: (r) => r.name, sort: (x, y) => x.name.localeCompare(y.name) },
  { key: "n", header: "Calls", end: true, cell: (r) => r.n },
]
const names = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell").at(-2)?.textContent)

describe("DataTable", () => {
  it("sorts in three states: up, down, and back to the order they came in", async () => {
    render(<DataTable label="Cities" rows={ROWS} columns={COLS} rowKey={(r) => r.id} />)
    const head = screen.getByRole("columnheader", { name: /Name/ })
    expect(head).toHaveAttribute("aria-sort", "none")
    expect(names()).toEqual(["Bristol", "Aberdeen", "Cardiff"])
    await userEvent.click(screen.getByRole("button", { name: /Name/ }))
    expect(head).toHaveAttribute("aria-sort", "ascending")
    expect(names()).toEqual(["Aberdeen", "Bristol", "Cardiff"])
    await userEvent.click(screen.getByRole("button", { name: /Name/ }))
    expect(head).toHaveAttribute("aria-sort", "descending")
    expect(names()).toEqual(["Cardiff", "Bristol", "Aberdeen"])
    await userEvent.click(screen.getByRole("button", { name: /Name/ }))
    expect(head).toHaveAttribute("aria-sort", "none")
    expect(names()).toEqual(["Bristol", "Aberdeen", "Cardiff"])
    expect(nextSort({ key: "name", dir: "asc" }, "n")).toEqual({ key: "n", dir: "asc" })
  })

  it("selects rows one by one, all, or none", async () => {
    const changes: string[][] = []
    const Harness = () => {
      const [sel, setSel] = useState<string[]>([])
      return (
        <DataTable
          label="Cities"
          form="table"
          stickyHead
          rows={ROWS}
          columns={COLS}
          rowKey={(r) => r.id}
          rowName={(r) => r.name}
          selected={sel}
          onSelectedChange={(k) => {
            changes.push(k)
            setSel(k)
          }}
        />
      )
    }
    const { container } = render(<Harness />)
    expect(container.querySelector("table")).toHaveClass("is-sticky")
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Cardiff" }))
    expect(changes.at(-1)).toEqual(["c"])
    expect(screen.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("data-state", "indeterminate")
    expect(screen.getByRole("checkbox", { name: "Select Cardiff" }).closest("tr")).toHaveAttribute("data-selected")
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all" }))
    expect(changes.at(-1)).toEqual(["b", "a", "c"])
    await userEvent.click(screen.getByRole("checkbox", { name: "Select none" }))
    expect(changes.at(-1)).toEqual([])
    expect(await a11yViolations(container)).toEqual([])
  })

  it("shows the empty block when there are no rows", () => {
    render(<DataTable label="Cities" rows={[]} columns={COLS} rowKey={(r) => r.id} empty={<p>No syncs yet</p>} />)
    expect(screen.getByText("No syncs yet")).toBeInTheDocument()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })
})

describe("VirtualList", () => {
  afterEach(() => vi.restoreAllMocks())

  it("draws only the rows near the view, each saying its place", () => {
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(40)
    const items = Array.from({ length: 5000 }, (_, i) => ({ id: `r${i}`, name: `Row ${i + 1}` }))
    render(<VirtualList label="Queue" items={items} rowKey={(r) => r.id} renderRow={(r) => r.name} cursor={0} />)
    const list = screen.getByRole("list", { name: "Queue" })
    const rows = within(list).getAllByRole("listitem")
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(60)
    expect(rows[0]).toHaveAttribute("aria-posinset", "1")
    expect(rows[0]).toHaveAttribute("aria-setsize", "5000")
    expect(rows[0]).toHaveClass("is-cursor")
    expect(list).toHaveStyle({ height: "200000px" })
  })

  it("shows the empty state for no items", () => {
    render(<VirtualList label="Queue" items={[]} rowKey={() => ""} renderRow={() => null} empty={<p>Nobody left</p>} />)
    expect(screen.getByText("Nobody left")).toBeInTheDocument()
  })
})
