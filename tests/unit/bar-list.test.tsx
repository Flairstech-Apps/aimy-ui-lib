import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BarList } from "@/registry/aimy/ui/bar-list"
import { a11yViolations } from "../a11y"

describe("BarList", () => {
  it("places bars on a narrowed scale with the goal, and says so", async () => {
    const open = vi.fn()
    const { container } = render(
      <BarList label="Quality" goal={85} scale={[75, 100]} unit="%" rows={[{ label: "Lune", value: 80, figure: "411 tickets", tone: "warn", onClick: open }, { label: "Kofax", value: 70 }]} />
    )
    const fills = container.querySelectorAll<HTMLElement>(".bl-fill")
    expect(fills[0]!.style.width).toBe("20%")
    expect(fills[1]!.style.width).toBe("0%")
    expect(container.querySelector<HTMLElement>(".bl-goal")!.style.insetInlineStart).toBe("40%")
    expect(container).toHaveTextContent("The line on each bar is the goal, 85%.")
    expect(container).toHaveTextContent("from 75% to 100%")
    await userEvent.click(screen.getByRole("button", { name: /Lune/ }))
    expect(open).toHaveBeenCalled()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("inline: value and share of the whole; a missing value reads as nothing", () => {
    const { container } = render(<BarList form="inline" rows={[{ label: "Created", value: 388 }, { label: "Updated", value: 224 }, { label: "Lost", value: Number.NaN }]} />)
    expect(container).toHaveTextContent("63.4%")
    expect(container).toHaveTextContent("36.6%")
    expect(container.querySelectorAll<HTMLElement>(".bl-fill")[2]!.style.width).toBe("0%")
    expect(container).toHaveTextContent("No data")
    expect(container).not.toHaveTextContent("NaN")
  })
})
