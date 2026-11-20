import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { hideOthers } from "@/registry/aimy/lib/behaviors-layers"
import { Button } from "@/registry/aimy/ui/button"
import { CallRecording } from "@/registry/aimy/ui/call-recording"
import { Progress } from "@/registry/aimy/ui/progress"
import { ResizablePanels } from "@/registry/aimy/ui/resizable-panels"
import { TargetBar } from "@/registry/aimy/ui/target-bar"
import { Toaster, toast } from "@/registry/aimy/ui/toast"
import { Tree } from "@/registry/aimy/ui/tree"
import { UploadResults, type UploadItem } from "@/registry/aimy/ui/upload-results"

// Fixes from the 20 Nov audit: parts that read a prop once, worst-case data, focus and layers.

describe("parts follow props that arrive late", () => {
  it("Tree keeps a Tab stop when its items arrive after the first render", () => {
    const { rerender } = render(<Tree label="Files" items={[]} />)
    rerender(<Tree label="Files" items={[{ id: "a", label: "Accounts" }, { id: "b", label: "Billing" }]} />)
    const rows = screen.getAllByRole("treeitem")
    expect(rows.filter((r) => r.tabIndex === 0)).toHaveLength(1)
    expect(rows[0]).toHaveAttribute("tabindex", "0")
  })

  it("UploadResults opens on failures that stream in, until a tab is picked", async () => {
    const ok: UploadItem = { id: "1", name: "Q3", file: "q3.csv", status: "added" }
    const bad: UploadItem = { id: "2", name: "Q4", file: "q4.csv", status: "failed", message: "No header row." }
    const { rerender } = render(<UploadResults label="Upload" items={[ok]} />)
    rerender(<UploadResults label="Upload" items={[ok, bad]} />)
    expect(screen.getByRole("radio", { name: /Not added$/ })).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("radio", { name: /\d+\s*Added$/ }))
    rerender(<UploadResults label="Upload" items={[ok, bad, { ...bad, id: "3" }]} />)
    expect(screen.getByRole("radio", { name: /\d+\s*Added$/ })).toHaveAttribute("aria-checked", "true")
  })

  it("CallRecording's clock shows a length that arrives late", () => {
    const { rerender } = render(<CallRecording id="c1" seconds={0} />)
    rerender(<CallRecording id="c1" seconds={187} />)
    expect(screen.getByRole("button")).toHaveTextContent("3:07")
  })

  it("ResizablePanels re-splits when a panel comes, so none opens at 0", () => {
    const { rerender, container } = render(
      <ResizablePanels>
        <div>List</div>
        <div>Detail</div>
      </ResizablePanels>
    )
    rerender(
      <ResizablePanels>
        <div>List</div>
        <div>Detail</div>
        <div>Notes</div>
      </ResizablePanels>
    )
    const bases = [...container.querySelectorAll<HTMLElement>("[data-slot=resizable-panel]")].map((p) => parseFloat(p.style.flexBasis))
    expect(bases).toHaveLength(3)
    expect(bases.every((b) => b > 30)).toBe(true)
  })
})

describe("worst-case values", () => {
  it("Progress reads a missing value as empty, not full", () => {
    const { container } = render(<Progress value={Number.NaN} label="Done" />)
    expect((container.querySelector("[role=progressbar] > div") as HTMLElement).style.scale).toBe("0 1")
  })

  it("TargetBar with no target says so, with no percentage or marker", () => {
    const { container } = render(<TargetBar value={4200} target={Number.NaN} format={(n) => `$${n}`} />)
    expect(container).toHaveTextContent("No target set")
    expect(container).not.toHaveTextContent("NaN")
    expect(container.querySelector(".s-att-target")).toBeNull()
  })
})

describe("focus and layers", () => {
  it("a loading Button keeps focus and refuses the press", async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Save</Button>)
    const b = screen.getByRole("button", { name: "Save" })
    b.focus()
    rerender(
      <Button loading onClick={onClick}>
        Save
      </Button>
    )
    expect(b).toHaveFocus()
    await userEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("a disabled link Button leaves the Tab order and refuses the press", async () => {
    const onClick = vi.fn()
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="#x">View the call</a>
      </Button>
    )
    const a = screen.getByRole("link", { name: "View the call" })
    expect(a).toHaveAttribute("aria-disabled", "true")
    expect(a).toHaveAttribute("tabindex", "-1")
    await userEvent.click(a)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("a modal hides the page around the toaster, not the whole app that holds it", () => {
    const app = document.createElement("div")
    app.innerHTML = `<main id="page">Page</main><div role="status" aria-live="polite"></div>`
    const dialog = document.createElement("div")
    document.body.append(app, dialog)
    const undo = hideOthers(dialog)
    expect(app.querySelector("#page")).toHaveAttribute("aria-hidden", "true")
    expect(app.querySelector("[role=status]")).not.toHaveAttribute("aria-hidden")
    undo()
    expect(app.querySelector("#page")).not.toHaveAttribute("aria-hidden")
    app.remove()
    dialog.remove()
  })

  it("a toast that closes with no transition leaves the page", () => {
    vi.useFakeTimers()
    render(<Toaster />)
    act(() => toast("Archived Kestrel", { onUndo: () => {} }))
    expect(screen.getByText("Archived Kestrel")).toBeInTheDocument()
    act(() => toast.dismiss())
    act(() => vi.runOnlyPendingTimers())
    expect(screen.queryByText("Archived Kestrel")).toBeNull()
    expect(document.querySelector("[data-slot=toaster]")).toHaveAttribute("data-aimy-persistent")
    vi.useRealTimers()
  })
})
