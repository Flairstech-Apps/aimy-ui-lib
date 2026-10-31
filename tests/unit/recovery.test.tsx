import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { ErrorSummary, RecoveryState, RecoveryStatus } from "@/registry/aimy/ui/recovery"
import { toast, Toaster } from "@/registry/aimy/ui/toast"
import { classifyError } from "@/registry/aimy/lib/recovery-kinds"
import { a11yViolations } from "../a11y"

describe("classifyError", () => {
  const axios = (status: number, data?: object, headers: Record<string, string> = {}) => ({
    response: { status, data, headers },
  })

  it("maps statuses to kinds, and the codes never become the words", () => {
    expect(classifyError(axios(401)).kind).toBe("session")
    expect(classifyError(axios(403)).kind).toBe("permission")
    expect(classifyError(axios(404)).kind).toBe("missing")
    expect(classifyError(axios(410)).kind).toBe("expired")
    expect(classifyError(axios(412)).kind).toBe("conflict")
    expect(classifyError(axios(413)).kind).toBe("file-too-large")
    expect(classifyError(axios(415)).kind).toBe("file-type")
    expect(classifyError(axios(422)).kind).toBe("validation")
    expect(classifyError(axios(502)).kind).toBe("service")
    expect(classifyError(axios(504)).kind).toBe("timeout")
    expect(classifyError(500).kind).toBe("service")
  })

  it("prefers the server's or identity provider's word over the status", () => {
    expect(classifyError(axios(400, { error: "invalid_grant" })).kind).toBe("session")
    expect(classifyError(axios(400, { code: "concurrency_conflict" })).kind).toBe("conflict")
    expect(classifyError({ error: "login_required" }).kind).toBe("session")
    expect(classifyError(axios(503, { message: "Planned maintenance until 14:00" })).kind).toBe("maintenance")
  })

  it("reads Retry-After and the correlation ID", () => {
    const r = classifyError(axios(429, {}, { "Retry-After": "30", "X-Correlation-Id": "7f3c" }))
    expect(r).toMatchObject({ kind: "rate-limit", retryAfter: 30, reference: "7f3c", status: 429 })
  })

  it("says offline only when the browser confirms it", () => {
    expect(classifyError({ code: "ERR_NETWORK", message: "Network Error" }).kind).toBe("connection")
    expect(classifyError(new TypeError("Failed to fetch")).kind).toBe("connection")
    const spy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    expect(classifyError({ code: "ERR_NETWORK" }, { sideEffect: true }).kind).toBe("offline")
    spy.mockRestore()
  })

  it("never offers a blind retry for a side effect that may have happened", () => {
    expect(classifyError({ code: "ECONNABORTED" }).kind).toBe("timeout")
    expect(classifyError({ code: "ECONNABORTED" }, { sideEffect: true }).kind).toBe("uncertain")
    expect(classifyError(axios(504), { sideEffect: true }).kind).toBe("uncertain")
    expect(classifyError({ code: "ERR_NETWORK" }, { save: true }).kind).toBe("save")
    expect(classifyError({ code: "ERR_NETWORK" }, { upload: true }).kind).toBe("upload")
  })
})

describe("RecoveryState", () => {
  afterEach(() => vi.useRealTimers())

  it("fails with the words, the recovery and the reference, announced at once", async () => {
    const onAction = vi.fn()
    const { container } = render(<RecoveryState kind="service" onAction={onAction} reference="7f3c-21ab" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong on our side. We couldn't complete your request.")
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(screen.getByText("7f3c-21ab")).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("retries calmly: a polite status with the attempt, and no buttons", () => {
    render(<RecoveryState kind="session" status="retrying" attempt={2} onAction={() => {}} />)
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting your session. Attempt 2 of 3.")
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
    expect(document.querySelector("[data-slot=recovery-state]")).toHaveAttribute("data-status", "retrying")
  })

  it("moves focus to the title when it blocks the page, or the whole window", () => {
    const { rerender } = render(<RecoveryState kind="permission" display="page" onAction={() => {}} />)
    expect(screen.getByRole("heading", { level: 1, name: "You don't have access to this yet" })).toHaveFocus()
    rerender(<RecoveryState kind="workspace" display="screen" onAction={() => {}} />)
    expect(screen.getByRole("heading", { level: 1, name: "Your account isn't connected to a workspace" })).toHaveFocus()
    expect(screen.getByRole("button", { name: "Sign in with another account" })).toBeInTheDocument()
  })

  it("counts Retry-After down with the button held, then says once that it can go", () => {
    vi.useFakeTimers()
    render(<RecoveryState kind="rate-limit" display="inline" retryAfter={2} onAction={() => {}} />)
    expect(screen.getByRole("button", { name: "Try again in 2s" })).toBeDisabled()
    expect(screen.getByRole("alert")).toHaveTextContent("Wait 2 seconds before trying again.")
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole("button", { name: "Try again in 1s" })).toBeDisabled()
    expect(screen.getByRole("alert")).toHaveTextContent("Wait 2 seconds before trying again.")
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
    expect(screen.getByRole("alert")).toHaveTextContent("You can try again now.")
  })

  it("stays quiet when another state already speaks for the failure", () => {
    render(<RecoveryState kind="load" announce={false} />)
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("shows a background retry as a polite status", () => {
    render(<RecoveryStatus kind="connection" attempt={1} />)
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting · Attempt 1 of 3")
  })
})

describe("ErrorSummary", () => {
  it("takes focus and links each line to its field, keeping what was typed", async () => {
    const { container } = render(
      <form>
        <ErrorSummary errors={[{ id: "email", message: "Enter an email address" }]} />
        <Field id="email" label="Email" error="Enter an email address">
          <Input defaultValue="engy@" />
        </Field>
      </form>
    )
    const summary = screen.getByRole("group", { name: "Check the highlighted fields" })
    expect(summary).toHaveFocus()
    await userEvent.click(screen.getByRole("link", { name: "Enter an email address" }))
    const field = screen.getByLabelText("Email")
    expect(field).toHaveFocus()
    expect(field).toHaveValue("engy@")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("toast, err", () => {
  afterEach(() => act(() => toast.dismiss()))

  it("is announced at once and offers the recovery", async () => {
    const retry = vi.fn()
    render(<Toaster />)
    act(() => {
      toast("We couldn't export the report", { tone: "err", sub: "Nothing changed.", action: { label: "Try again", onClick: retry } })
    })
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't export the report")
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
