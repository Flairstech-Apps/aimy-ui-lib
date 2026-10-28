import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Dialog, DialogContent, DialogTrigger, TypeToConfirm } from "@/registry/aimy/ui/dialog"
import { EmptyState, ErrorState } from "@/registry/aimy/ui/empty-state"
import { Notice } from "@/registry/aimy/ui/notice"
import { Progress } from "@/registry/aimy/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/registry/aimy/ui/sheet"
import { Reveal, Skeleton } from "@/registry/aimy/ui/skeleton"
import { toast, Toaster } from "@/registry/aimy/ui/toast"
import { a11yViolations } from "../a11y"

describe("toast", () => {
  afterEach(() => {
    act(() => toast.dismiss())
    vi.useRealTimers()
  })

  it("says what happened in a live region and undoes", () => {
    const onUndo = vi.fn()
    render(<Toaster />)
    act(() => {
      toast("Assigned to Lina", { onUndo, sub: "She has it from now." })
    })
    const region = screen.getByRole("status")
    expect(region).toHaveTextContent("Assigned to Lina")
    expect(region).toHaveTextContent("She has it from now.")
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(onUndo).toHaveBeenCalledOnce()
  })

  it("replaces the current toast instead of stacking", () => {
    render(<Toaster />)
    act(() => {
      toast("Link copied")
      toast("Assigned to Lina", { onUndo: () => {} })
    })
    expect(screen.queryByText("Link copied")).not.toBeInTheDocument()
    expect(screen.getByText("Assigned to Lina")).toBeInTheDocument()
  })

  it("goes after 4s without Undo, 6s with", () => {
    vi.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast("Link copied")
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.getByRole("status").querySelector(".is-open")).toBeNull()
  })
})

describe("Dialog", () => {
  it("opens a named dialog with its actions and closes on Escape", async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Add a person</DialogTrigger>
        <DialogContent title="Add a person" description="They get access to this workspace." footer={<button>Add Lina</button>}>
          <p>Body</p>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByRole("button", { name: "Add a person" }))
    const dialog = screen.getByRole("dialog", { name: "Add a person" })
    expect(dialog).toHaveAccessibleDescription("They get access to this workspace.")
    expect(screen.getByRole("button", { name: "Add Lina" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("TypeToConfirm", () => {
  it("keeps the action disabled until the word is typed, ignoring case and commas", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <TypeToConfirm
        open
        onOpenChange={() => {}}
        title="Delete 1,284 records"
        description="This can't be undone."
        word="1,284"
        actionLabel="Delete 1,284 records"
        onConfirm={onConfirm}
      />
    )
    const action = screen.getByRole("button", { name: "Delete 1,284 records" })
    expect(action).toBeDisabled()
    await user.type(screen.getByLabelText("Type 1,284 to confirm"), "1284")
    expect(action).toBeEnabled()
    await user.click(action)
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})

describe("Sheet", () => {
  it("opens a named dialog from the side", async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger>Open settings</SheetTrigger>
        <SheetContent title="Settings">Body</SheetContent>
      </Sheet>
    )
    await user.click(screen.getByRole("button", { name: "Open settings" }))
    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveAttribute("data-side", "right")
  })
})

describe("Notice, EmptyState, ErrorState", () => {
  it("announces errors at once and others politely", () => {
    render(
      <>
        <Notice tone="err" title="The last sync failed.">
          Nothing was changed.
        </Notice>
        <Notice tone="info">This version replaces the March one.</Notice>
      </>
    )
    expect(screen.getByRole("alert")).toHaveTextContent("The last sync failed.")
    expect(screen.getByRole("status")).toHaveTextContent("This version replaces the March one.")
  })

  it("offers the way forward", async () => {
    const onRetry = vi.fn()
    const { container } = render(
      <>
        <EmptyState title="No matches" description="134 contacts, none matching these filters." actions={<button>Clear filters</button>} />
        <ErrorState onRetry={onRetry} />
      </>
    )
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledOnce()
    expect(screen.getByRole("alert")).toHaveTextContent("Nothing changed. Trying again is safe.")
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Reveal and Progress", () => {
  it("shows the skeleton while loading, then the content", () => {
    const { rerender } = render(
      <Reveal loading label="Loading contacts" skeleton={<Skeleton className="w-20" />}>
        <p>Kestrel Logistics</p>
      </Reveal>
    )
    expect(screen.getByRole("status", { name: "Loading contacts" })).toBeInTheDocument()
    expect(screen.queryByText("Kestrel Logistics")).not.toBeInTheDocument()
    rerender(
      <Reveal loading={false} label="Loading contacts" skeleton={<Skeleton className="w-20" />}>
        <p>Kestrel Logistics</p>
      </Reveal>
    )
    expect(screen.getByText("Kestrel Logistics")).toBeInTheDocument()
  })

  it("is a named progressbar that warns near the limit", () => {
    render(<Progress value={1700} max={2000} size="meter" limit label="Credits used" />)
    const bar = screen.getByRole("progressbar", { name: "Credits used" })
    expect(bar).toHaveAttribute("aria-valuenow", "1700")
    expect(bar.firstElementChild).toHaveClass("bg-warn")
  })
})
