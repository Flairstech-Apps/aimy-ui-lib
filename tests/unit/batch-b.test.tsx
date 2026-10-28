import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Checkbox } from "@/registry/aimy/ui/checkbox"
import { CopyButton } from "@/registry/aimy/ui/copy-button"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { PasswordField } from "@/registry/aimy/ui/password-field"
import { SearchField } from "@/registry/aimy/ui/search-field"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Select, SelectItem } from "@/registry/aimy/ui/select"
import { Switch } from "@/registry/aimy/ui/switch"
import { Textarea } from "@/registry/aimy/ui/textarea"
import { a11yViolations } from "../a11y"

describe("Field", () => {
  it("labels the control and ties help to it", () => {
    render(
      <Field label="Company name" help="As it appears on invoices.">
        <Input />
      </Field>
    )
    const input = screen.getByLabelText("Company name")
    expect(input).toHaveAccessibleDescription("As it appears on invoices.")
    expect(input).not.toHaveAttribute("aria-invalid")
  })

  it("marks the control invalid and describes it with the error instead of help", () => {
    render(
      <Field label="Email" help="We send the summary here." error="Enter an email like dana@kestrel.com.">
        <Input type="email" />
      </Field>
    )
    const input = screen.getByLabelText("Email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Enter an email like dana@kestrel.com.")
    expect(screen.queryByText("We send the summary here.")).not.toBeInTheDocument()
  })

  it("shakes the control when an error appears", () => {
    const { rerender } = render(
      <Field label="Name">
        <Textarea />
      </Field>
    )
    rerender(
      <Field label="Name" error="It still needs a name.">
        <Textarea />
      </Field>
    )
    expect(screen.getByLabelText("Name")).toHaveClass("is-shaking")
  })

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Field label="Notes" optional>
        <Textarea />
      </Field>
    )
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("SearchField", () => {
  it("shows a clear button only with text, and clears with it or Escape", () => {
    const onValueChange = vi.fn()
    render(<SearchField label="Search contacts" onValueChange={onValueChange} />)
    const box = screen.getByRole("searchbox", { name: "Search contacts" })
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument()
    fireEvent.change(box, { target: { value: "kes" } })
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(box).toHaveValue("")
    fireEvent.change(box, { target: { value: "har" } })
    fireEvent.keyDown(box, { key: "Escape" })
    expect(box).toHaveValue("")
    expect(onValueChange).toHaveBeenLastCalledWith("")
  })
})

describe("Select", () => {
  it("is a named combobox showing the placeholder, not a native select", () => {
    const { container } = render(
      <Select label="Owner" placeholder="Choose an owner">
        <SelectItem value="engy">Engy</SelectItem>
      </Select>
    )
    expect(screen.getByRole("combobox", { name: "Owner" })).toHaveTextContent("Choose an owner")
    expect(container.querySelector("select:not([aria-hidden])")).toBeNull()
  })

  it("shows the chosen value", () => {
    render(
      <Select label="Owner" defaultValue="lina">
        <SelectItem value="engy">Engy</SelectItem>
        <SelectItem value="lina">Lina</SelectItem>
      </Select>
    )
    expect(screen.getByRole("combobox", { name: "Owner" })).toHaveTextContent("Lina")
  })
})

describe("Checkbox", () => {
  it("toggles from its label and reports the state", () => {
    render(<Checkbox label="Only my calls" />)
    const box = screen.getByRole("checkbox", { name: "Only my calls" })
    expect(box).toHaveAttribute("aria-checked", "false")
    fireEvent.click(screen.getByText("Only my calls"))
    expect(box).toHaveAttribute("aria-checked", "true")
  })

  it("supports some (mixed)", () => {
    render(<Checkbox label="All teams" checked="indeterminate" />)
    expect(screen.getByRole("checkbox", { name: "All teams" })).toHaveAttribute("aria-checked", "mixed")
  })
})

describe("Switch", () => {
  it("switches on, and animates only after the first change", () => {
    render(<Switch label="Email me the summary" />)
    const sw = screen.getByRole("switch", { name: "Email me the summary" })
    expect(sw).not.toHaveClass("is-init")
    fireEvent.click(sw)
    expect(sw).toHaveAttribute("aria-checked", "true")
    expect(sw).toHaveAttribute("data-on", "true")
    expect(sw).toHaveClass("is-init")
  })

  it("explains why it is locked", () => {
    render(<Switch label="Voice mode" disabled lockedReason="Your plan doesn't include voice." />)
    expect(screen.getByRole("switch")).toHaveAttribute("title", "Your plan doesn't include voice.")
  })
})

describe("Segmented", () => {
  it("is a named radiogroup that changes with a click", () => {
    const onValueChange = vi.fn()
    render(
      <Segmented
        label="Show"
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
        ]}
        onValueChange={onValueChange}
      />
    )
    expect(screen.getByRole("radiogroup", { name: "Show" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Day" })).toBeChecked()
    fireEvent.click(screen.getByRole("radio", { name: "Week" }))
    expect(onValueChange).toHaveBeenCalledWith("week")
  })
})

describe("PasswordField", () => {
  it("is masked and reveals with a named control", () => {
    render(
      <Field label="Auth token">
        <PasswordField secretName="the token" defaultValue="sk_live_123" />
      </Field>
    )
    const input = screen.getByLabelText("Auth token")
    expect(input).toHaveAttribute("type", "password")
    fireEvent.click(screen.getByRole("button", { name: "Show the token" }))
    expect(input).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Hide the token" })).toHaveAttribute("aria-pressed", "true")
  })
})

describe("CopyButton", () => {
  it("copies and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<CopyButton value="https://hooks.aimy/abc" what="the webhook URL" />)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy the webhook URL" }))
    })
    expect(writeText).toHaveBeenCalledWith("https://hooks.aimy/abc")
    expect(screen.getByRole("status")).toHaveTextContent("Copied the webhook URL")
  })
})
