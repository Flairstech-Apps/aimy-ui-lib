import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { UserFacingError, createActionState, createOptimistic, failureMessage } from "@/registry/aimy/lib/behaviors-feedback"
import { useOptimisticValue } from "@/registry/aimy/lib/behaviors-react"
import { ActionButton, SaveStatus, useUndoable } from "@/registry/aimy/ui/feedback"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Toaster } from "@/registry/aimy/ui/toast"
import { a11yViolations } from "../a11y"

const later = <T,>(ms: number, v?: T, fail?: Error) => new Promise<T>((ok, no) => setTimeout(() => (fail ? no(fail) : ok(v as T)), ms))

afterEach(() => vi.useRealTimers())

describe("action feedback", () => {
  it("doesn't flash pending for quick work, then shows success and goes quiet", async () => {
    vi.useFakeTimers()
    const a = createActionState({ pendingDelay: 150, minPending: 400, successHold: 1000 })
    const seen: string[] = []
    a.subscribe((s) => seen.push(s.status))
    const done = a.run(() => later(50))
    await vi.advanceTimersByTimeAsync(60)
    await done
    expect(seen).toEqual(["success"])
    await vi.advanceTimersByTimeAsync(1000)
    expect(a.get().status).toBe("idle")
  })

  it("holds pending long enough to read once it shows, and says why it failed", async () => {
    vi.useFakeTimers()
    const a = createActionState({ pendingDelay: 100, minPending: 400 })
    const p = a.run(() => later(150, undefined, new UserFacingError("The list is locked by Dana.")))
    await vi.advanceTimersByTimeAsync(120)
    expect(a.get().status).toBe("pending")
    await vi.advanceTimersByTimeAsync(40)
    expect(a.get().status).toBe("pending") // failed at 150ms, but pending showed at 100ms
    await vi.advanceTimersByTimeAsync(400)
    expect(await p).toBe(false)
    expect(a.get()).toEqual({ status: "error", error: "The list is locked by Dana." })
  })

  it("writes failures in AiMY's words when the error wasn't written for people", () => {
    expect(failureMessage(new TypeError("Failed to fetch"), { save: true })).toMatch(/stopped hearing back|save|connection/i)
  })
})

describe("optimistic values", () => {
  it("shows the change at once, keeps it when saved, and goes back when not", async () => {
    vi.useFakeTimers()
    const onError = vi.fn()
    let fail = false
    const o = createOptimistic({ value: "New", save: () => later(100, undefined, fail ? new UserFacingError("Stage is locked.") : undefined), onError })
    o.set("Won")
    expect(o.get()).toMatchObject({ shown: "Won", confirmed: "New", status: "saving" })
    await vi.advanceTimersByTimeAsync(100)
    expect(o.get()).toMatchObject({ shown: "Won", confirmed: "Won", status: "saved" })
    fail = true
    o.set("Lost")
    await vi.advanceTimersByTimeAsync(100)
    expect(o.get()).toMatchObject({ shown: "Won", status: "failed", error: "Stage is locked." })
    expect(onError).toHaveBeenCalledWith("Stage is locked.", expect.any(Function), "Lost")
  })

  it("lets the newest save win over a slow earlier answer", async () => {
    vi.useFakeTimers()
    const o = createOptimistic({ value: 1, save: (v: number) => later(v === 2 ? 300 : 50) })
    o.set(2)
    o.set(3)
    await vi.advanceTimersByTimeAsync(400)
    expect(o.get()).toMatchObject({ shown: 3, confirmed: 3 })
  })
})

describe("feedback parts", () => {
  it("ActionButton keeps its width, shows success, and on failure shakes and says why", async () => {
    let fail = false
    const { container } = render(
      <ActionButton pendingLabel="Saving" successLabel="Saved" onAction={() => (fail ? Promise.reject(new UserFacingError("Couldn't reach the server. Your changes are still here.")) : Promise.resolve())}>
        Save changes
      </ActionButton>
    )
    const button = screen.getByRole("button", { name: /Save changes/ })
    await userEvent.click(button)
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved"))
    fail = true
    await userEvent.click(button)
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't reach the server")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("SaveStatus says each state in words, with Try again", async () => {
    const onRetry = vi.fn()
    const { rerender } = render(<SaveStatus status="saving" />)
    expect(screen.getByRole("status")).toHaveTextContent("Saving…")
    rerender(<SaveStatus status="saved" />)
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
    rerender(<SaveStatus status="failed" error="We couldn't save your changes." onRetry={onRetry} />)
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalled()
  })

  it("InlineEdit shows the new value at once and reopens with the reason if the save fails", async () => {
    function Demo({ fail }: { fail: boolean }) {
      const [v, setV] = useState("Q4 plan")
      return <InlineEdit label="List name" value={v} onSave={(next) => later(80, undefined, fail ? new Error("That name is taken.") : undefined).then(() => setV(next))} />
    }
    const { rerender } = render(<Demo fail={false} />)
    await userEvent.click(screen.getByRole("button", { name: /List name: Q4 plan/ }))
    await userEvent.type(screen.getByRole("textbox"), "{Control>}a{/Control}Q4 review{Enter}")
    const saving = screen.getByRole("button", { name: /List name: Q4 review\. Saving\./ })
    expect(saving).toHaveAttribute("aria-busy", "true")
    await waitFor(() => expect(screen.getByRole("button", { name: /List name: Q4 review\. Press/ })).toBeInTheDocument())
    rerender(<Demo fail />)
    await userEvent.click(screen.getByRole("button", { name: /List name/ }))
    await userEvent.type(screen.getByRole("textbox"), "{Control>}a{/Control}Taken{Enter}")
    expect(screen.getByRole("button", { name: /Taken\. Saving/ })).toBeInTheDocument()
    expect(await screen.findByRole("alert")).toHaveTextContent("That name is taken.")
    expect(screen.getByRole("textbox")).toHaveValue("Taken")
  })

  it("useUndoable acts at once with Undo, and a failed save goes back with Try again", async () => {
    function Demo({ save }: { save: () => Promise<unknown> }) {
      const [archived, setArchived] = useState(false)
      const run = useUndoable()
      return (
        <>
          <p>{archived ? "Archived" : "In the list"}</p>
          <button type="button" onClick={() => run({ title: "Archived Kestrel", apply: () => setArchived(true), revert: () => setArchived(false), save })}>
            Archive
          </button>
          <Toaster />
        </>
      )
    }
    const { rerender } = render(<Demo save={() => later(30)} />)
    await userEvent.click(screen.getByRole("button", { name: "Archive" }))
    expect(screen.getByText("Archived")).toBeInTheDocument()
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }))
    expect(screen.getByText("In the list")).toBeInTheDocument()
    rerender(<Demo save={() => later(30, undefined, new UserFacingError("Kestrel is locked."))} />)
    await userEvent.click(screen.getByRole("button", { name: "Archive" }))
    expect(screen.getByText("Archived")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText("In the list")).toBeInTheDocument())
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument()
  })

  it("useOptimisticValue drives a part and reports failures", async () => {
    const onError = vi.fn()
    function Demo() {
      const v = useOptimisticValue<string>("New", () => later(30, undefined, new UserFacingError("No.")), { onError })
      return (
        <button type="button" onClick={() => v.set("Won")}>
          {v.shown} {v.status}
        </button>
      )
    }
    render(<Demo />)
    await userEvent.click(screen.getByRole("button"))
    expect(screen.getByRole("button")).toHaveTextContent("Won saving")
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("New failed"))
    await act(async () => {})
    expect(onError).toHaveBeenCalledWith("No.", expect.any(Function), "Won")
  })
})
