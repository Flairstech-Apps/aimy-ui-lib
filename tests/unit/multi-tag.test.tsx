import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { MultiSelect } from "@/registry/aimy/ui/multi-select"
import { TagInput } from "@/registry/aimy/ui/tag-input"
import { a11yViolations } from "../a11y"

const TEAMS = ["Sales", "Support", "Billing", "Legal", "Ops"].map((t) => ({ value: t.toLowerCase(), label: t }))

describe("MultiSelect", () => {
  it("ticks several, names them on the trigger, selects all, and sends each with a form", async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <form>
        <MultiSelect label="Teams" placeholder="Any team" options={TEAMS} onValueChange={onValueChange} name="team" />
      </form>
    )
    const trigger = screen.getByRole("button", { name: "Teams" })
    expect(trigger).toHaveTextContent("Any team")
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole("checkbox", { name: "Sales" }))
    await userEvent.click(screen.getByRole("checkbox", { name: "Legal" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["sales", "legal"])
    expect(trigger).toHaveTextContent("Sales, Legal")
    await userEvent.click(screen.getByRole("checkbox", { name: "Select all" }))
    expect(onValueChange).toHaveBeenLastCalledWith(TEAMS.map((t) => t.value))
    expect(trigger).toHaveTextContent("Sales, Support and 3 more")
    expect(new FormData(container.querySelector("form")!).getAll("team")).toHaveLength(5)
    expect(await a11yViolations(document.body)).toEqual([])
  })
})

describe("TagInput", () => {
  it("adds on Enter, a comma or a paste, takes the last back with Backspace, and refuses with a reason", async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <TagInput label="Regions" onValueChange={onValueChange} validate={(t) => (/^[A-Z]{2,5}$/.test(t) ? null : "Use a region code, like EMEA.")} />
    )
    const box = screen.getByRole("textbox", { name: "Regions" })
    await userEvent.type(box, "EMEA{Enter}APAC,")
    expect(onValueChange).toHaveBeenLastCalledWith(["EMEA", "APAC"])
    await userEvent.type(box, "{Backspace}")
    expect(onValueChange).toHaveBeenLastCalledWith(["EMEA"])
    await userEvent.type(box, "europe{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Use a region code, like EMEA.")
    expect(box).toHaveAttribute("aria-invalid", "true")
    await userEvent.clear(box)
    await userEvent.click(screen.getByRole("button", { name: "Remove EMEA" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(await a11yViolations(container)).toEqual([])
  })
})
