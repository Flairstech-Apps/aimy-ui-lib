import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FileDrop } from "@/registry/aimy/ui/file-drop"
import { a11yViolations } from "../a11y"

const file = (name: string, bytes: number, type = "") => new File([new Uint8Array(bytes)], name, { type })

describe("FileDrop", () => {
  it("takes files that fit, and says why the others were left out", async () => {
    const onFiles = vi.fn()
    const { container } = render(<FileDrop accept={[".csv"]} maxSize={1000} onFiles={onFiles} label="Upload contacts" />)
    const input = screen.getByLabelText("Upload contacts")
    await userEvent.upload(input, [file("ok.csv", 10), file("big.csv", 5000), file("pic.png", 10, "image/png")], { applyAccept: false })
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "ok.csv" })])
    expect(screen.getByRole("alert")).toHaveTextContent("big.csv is 5 KB; the most is 1 KB.")
    expect(screen.getByRole("alert")).toHaveTextContent("pic.png isn't one of .csv.")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("takes dropped files and shows it is ready for them while they are over it", () => {
    const onFiles = vi.fn()
    const { container } = render(<FileDrop multiple={false} onFiles={onFiles} />)
    const zone = container.querySelector("label")!
    fireEvent.dragOver(zone, { dataTransfer: { files: [] } })
    expect(zone).toHaveAttribute("data-over")
    fireEvent.drop(zone, { dataTransfer: { files: [file("a.txt", 1), file("b.txt", 1)] } })
    expect(zone).not.toHaveAttribute("data-over")
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.txt" })])
    expect(screen.getByRole("alert")).toHaveTextContent("b.txt wasn't added: this takes one file.")
  })
})
