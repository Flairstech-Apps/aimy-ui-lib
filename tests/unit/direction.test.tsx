import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { readingKey } from "@/registry/aimy/lib/behaviors-core"
import { Calendar } from "@/registry/aimy/ui/calendar"
import { ResizablePanels } from "@/registry/aimy/ui/resizable-panels"
import { Tree } from "@/registry/aimy/ui/tree"

// Right to left: the arrow keys follow the reading direction. jsdom doesn't cascade direction from a
// dir attribute, so these set it inline where the part reads it.

const rtl = (el: HTMLElement) => {
  el.style.direction = "rtl"
  return el
}

describe("right to left", () => {
  it("readingKey swaps only the horizontal arrows, only under rtl", () => {
    const ltrEl = document.createElement("div")
    const rtlEl = rtl(document.createElement("div"))
    expect(readingKey({ key: "ArrowLeft", currentTarget: ltrEl })).toBe("ArrowLeft")
    expect(readingKey({ key: "ArrowLeft", currentTarget: rtlEl })).toBe("ArrowRight")
    expect(readingKey({ key: "ArrowRight", currentTarget: rtlEl })).toBe("ArrowLeft")
    expect(readingKey({ key: "ArrowDown", currentTarget: rtlEl })).toBe("ArrowDown")
  })

  it("Calendar: ArrowLeft goes to the next day", () => {
    render(<Calendar value={new Date(2026, 10, 10)} today={new Date(2026, 10, 20)} />)
    const grid = rtl(screen.getByRole("grid"))
    const focused = () => grid.querySelector<HTMLElement>('[tabindex="0"]')?.textContent
    expect(focused()).toBe("10")
    fireEvent.keyDown(grid, { key: "ArrowLeft" })
    expect(focused()).toBe("11")
  })

  it("Tree: ArrowLeft opens a closed folder", () => {
    render(<Tree label="Files" items={[{ id: "a", label: "Accounts", children: [{ id: "a1", label: "Kestrel" }] }]} />)
    rtl(screen.getByRole("tree")) // the tree's key handler sits on the tree; in a browser direction inherits
    const row = screen.getByRole("treeitem", { name: /Accounts/ })
    expect(row).toHaveAttribute("aria-expanded", "false")
    fireEvent.keyDown(row, { key: "ArrowLeft" })
    expect(screen.getByRole("treeitem", { name: /Accounts/ })).toHaveAttribute("aria-expanded", "true")
  })

  it("ResizablePanels: ArrowLeft grows the panel before the handle", () => {
    const onSizesChange = vi.fn()
    render(
      <ResizablePanels onSizesChange={onSizesChange}>
        <div>List</div>
        <div>Detail</div>
      </ResizablePanels>
    )
    const handle = rtl(screen.getByRole("separator"))
    fireEvent.keyDown(handle, { key: "ArrowLeft" })
    expect(onSizesChange).toHaveBeenLastCalledWith([51, 49])
  })
})
