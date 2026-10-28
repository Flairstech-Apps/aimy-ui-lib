import { fireEvent, render, screen } from "@testing-library/react"
import { Phone } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { Avatar, AimyAvatar, AvatarGroup } from "@/registry/aimy/ui/avatar"
import { Button } from "@/registry/aimy/ui/button"
import { Chip } from "@/registry/aimy/ui/chip"
import { CountBadge } from "@/registry/aimy/ui/count-badge"
import { Divider } from "@/registry/aimy/ui/divider"
import { IconButton } from "@/registry/aimy/ui/icon-button"
import { Kbd } from "@/registry/aimy/ui/kbd"
import { Link } from "@/registry/aimy/ui/link"
import { StatusPill } from "@/registry/aimy/ui/status"
import { Tag } from "@/registry/aimy/ui/tag"
import { a11yViolations } from "../a11y"

describe("Button", () => {
  it("is a type=button pill that defaults to ghost", () => {
    render(<Button>Send the follow-up</Button>)
    const b = screen.getByRole("button", { name: "Send the follow-up" })
    expect(b).toHaveAttribute("type", "button")
    expect(b).toHaveAttribute("data-variant", "ghost")
    expect(b).toHaveClass("rounded-pill")
  })

  it("turns the AiMY mark white on brand", () => {
    render(<Button variant="brand">Prepare me for it</Button>)
    expect(screen.getByRole("button")).toHaveClass("[--aimy-mark:currentColor]", "text-on-brand")
  })

  it("blocks clicks and says it is busy while loading", () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>
    )
    const b = screen.getByRole("button", { name: "Saving" })
    expect(b).toBeDisabled()
    expect(b).toHaveAttribute("aria-busy", "true")
    fireEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("can render a link with button styling", () => {
    render(
      <Button asChild variant="brand">
        <a href="/calls">View the call</a>
      </Button>
    )
    const a = screen.getByRole("link", { name: "View the call" })
    expect(a).toHaveClass("rounded-pill")
    expect(a).not.toHaveAttribute("type")
  })

  it("has no accessibility violations in any variant", async () => {
    const { container } = render(
      <>
        {(["brand", "ghost", "accent", "ok", "warn", "err", "text"] as const).map((v) => (
          <Button key={v} variant={v}>
            Call back
          </Button>
        ))}
      </>
    )
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("IconButton", () => {
  it("uses its label as name and tooltip", () => {
    render(
      <IconButton label="Call Kestrel">
        <Phone />
      </IconButton>
    )
    const b = screen.getByRole("button", { name: "Call Kestrel" })
    expect(b).toHaveAttribute("title", "Call Kestrel")
  })
})

describe("Link", () => {
  it("is underlined inline and on hover otherwise", () => {
    render(
      <>
        <Link href="/a">Open the record</Link>
        <Link href="/b" variant="inline">
          the policy
        </Link>
      </>
    )
    expect(screen.getByRole("link", { name: "Open the record" })).toHaveClass("no-underline", "hover:underline")
    expect(screen.getByRole("link", { name: "the policy" })).toHaveClass("underline")
  })
})

describe("Tag", () => {
  it("has a fill and no visible edge", () => {
    render(<Tag tone="ok">Meeting Set</Tag>)
    const t = screen.getByText("Meeting Set")
    expect(t).toHaveClass("bg-ok-bg", "text-ok-text", "border-transparent")
  })
})

describe("Chip", () => {
  it("reports its state and toggles", () => {
    const onClick = vi.fn()
    render(
      <Chip selected onClick={onClick}>
        Needs reply
      </Chip>
    )
    const c = screen.getByRole("button", { name: "Needs reply" })
    expect(c).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(c)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("names its remove control after the chip", () => {
    const onRemove = vi.fn()
    render(<Chip onRemove={onRemove}>This week</Chip>)
    fireEvent.click(screen.getByRole("button", { name: "Remove This week" }))
    expect(onRemove).toHaveBeenCalledOnce()
  })
})

describe("CountBadge", () => {
  it("caps the count and tells screen readers what it counts", () => {
    render(<CountBadge count={140} label="unread notifications" />)
    expect(screen.getByText("99+")).toBeInTheDocument()
    expect(screen.getByText("140 unread notifications")).toHaveClass("sr-only")
  })

  it("renders nothing at zero", () => {
    const { container } = render(<CountBadge count={0} label="unread" />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe("StatusPill", () => {
  it("says the state in words beside the dot", () => {
    render(<StatusPill state="busy">On a call</StatusPill>)
    expect(screen.getByText("On a call")).toHaveAttribute("data-state", "busy")
  })
})

describe("Kbd and Divider", () => {
  it("renders one key cap per key", () => {
    const { container } = render(<Kbd keys={["Ctrl", "K"]} />)
    expect(container.querySelectorAll("kbd")).toHaveLength(2)
  })

  it("labels a divider as a separator", () => {
    render(<Divider>Earlier</Divider>)
    expect(screen.getByRole("separator")).toHaveTextContent("Earlier")
  })
})

describe("Avatar", () => {
  it("shows initials and is named for the person", () => {
    render(<Avatar name="Engy Hassan" />)
    expect(screen.getByRole("img", { name: "Engy Hassan" })).toHaveTextContent("EH")
  })

  it("falls back to initials when the photo fails", () => {
    const { container } = render(<Avatar name="Rami Saleh" src="/missing.jpg" />)
    fireEvent.error(container.querySelector("img")!)
    expect(screen.getByRole("img", { name: "Rami Saleh" })).toHaveTextContent("RS")
  })

  it("shows AiMY as the mark, not a face", () => {
    render(<AimyAvatar />)
    expect(screen.getByRole("img", { name: "AiMY" })).toBeInTheDocument()
  })

  it("groups faces and counts the rest", () => {
    render(<AvatarGroup max={2} people={[{ name: "A B" }, { name: "C D" }, { name: "E F" }]} />)
    expect(screen.getByText("+1")).toBeInTheDocument()
  })
})
