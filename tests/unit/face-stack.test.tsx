import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Avatar } from "@/registry/aimy/ui/avatar"
import { FaceStack, type FacePerson } from "@/registry/aimy/ui/face-stack"
import { a11yViolations } from "../a11y"

const TEAM: FacePerson[] = [
  { id: "1", name: "Lina Farouk", src: "/lina.jpg", sub: "Account executive" },
  { id: "2", name: "Sherif Adel", sub: "Sales development" },
  { id: "3", name: "Rami Saleh" },
  { id: "4", name: "Mona Kamal" },
  { id: "5", name: "Omar Nabil" },
  { id: "6", name: "Hana Mansour" },
]

describe("Avatar", () => {
  it("shows the photo when it has one, and the initials when it has none", () => {
    const { container } = render(
      <>
        <Avatar name="Lina Farouk" src="/lina.jpg" />
        <Avatar name="Sherif Adel" />
      </>
    )
    expect(container.querySelector("img")).toHaveAttribute("src", "/lina.jpg")
    expect(screen.getByRole("img", { name: "Sherif Adel" })).toHaveTextContent("SA")
  })
})

describe("FaceStack", () => {
  it("is a named group of four faces, the first on top, and the rest counted", async () => {
    const { container } = render(<FaceStack people={TEAM} />)
    const group = screen.getByRole("group", { name: TEAM.map((p) => p.name).join(", ") })
    expect(group.querySelectorAll('[data-slot="avatar"]')).toHaveLength(4)
    expect(group).toHaveTextContent("+2 more")
    const z = [...group.querySelectorAll<HTMLElement>('[data-slot="avatar"]')].map((a) => Number(a.parentElement!.style.zIndex))
    expect(z).toEqual([4, 3, 2, 1])
    expect(await a11yViolations(container)).toEqual([])
  })

  it("as a door, opens the whole set named, and each name opens the person", async () => {
    const open = vi.fn()
    render(<FaceStack people={TEAM.slice(3)} menu={{ label: "3 more people", cap: "The team", people: TEAM, onOpen: open }} />)
    await userEvent.click(screen.getByRole("button", { name: "3 more people" }))
    expect(screen.getAllByRole("menuitem")).toHaveLength(6)
    await userEvent.click(screen.getByRole("menuitem", { name: /Lina Farouk/ }))
    expect(open).toHaveBeenCalledWith(TEAM[0])
  })
})
