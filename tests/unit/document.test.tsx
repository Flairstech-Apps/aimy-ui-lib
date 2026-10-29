import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AiMenu, BlockMenu, SelectionMenu, WritingToolbar } from "@/registry/aimy/ui/doc-editor"
import {
  DocByline,
  DocComments,
  DocNotice,
  DocPage,
  DocRail,
  DocRailFoot,
  DocTitle,
  RailBlock,
  SaveState,
  VersionPreview,
} from "@/registry/aimy/ui/document"
import { a11yViolations } from "../a11y"

describe("DocPage", () => {
  it("goes back, says the save state, and hides and shows the details", async () => {
    const back = vi.fn()
    const { container } = render(
      <DocPage
        back={{ label: "All documents", onClick: back }}
        end={<SaveState state="saved" savedAt="09:12" />}
        rail={
          <DocRail>
            <RailBlock title="What it is" count={2}>
              A policy.
            </RailBlock>
          </DocRail>
        }
      >
        <DocTitle>Refunds</DocTitle>
      </DocPage>
    )
    await userEvent.click(screen.getByRole("button", { name: "All documents" }))
    expect(back).toHaveBeenCalledOnce()
    expect(screen.getByText("Saved · 09:12")).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: "Details" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Hide details" }))
    expect(container.querySelector(".doc-page")).toHaveClass("rail-closed")
    expect(screen.getByRole("button", { name: "Show details" })).toHaveAttribute("aria-expanded", "false")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("says unsaved changes with Discard and Save, and why a draft can't publish", async () => {
    const save = vi.fn()
    render(
      <SaveState
        state="unsaved"
        onSave={save}
        onDiscard={() => {}}
        publish={{ onPublish: () => {}, blockedBy: "Add some content first" }}
      />
    )
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes")
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }))
    expect(save).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: "Add some content first" })).toBeDisabled()
  })
})

describe("The head", () => {
  it("says the state and the way out of it, never a silent redirect", async () => {
    const go = vi.fn()
    render(<DocNotice kind="replaced" link={{ label: "Go to the current one", onClick: go }} />)
    expect(screen.getByRole("status")).toHaveTextContent("Replaced. A newer document replaced it. Not used in answers.")
    await userEvent.click(screen.getByRole("button", { name: /Go to the current one/ }))
    expect(go).toHaveBeenCalledOnce()
  })

  it("names the owner or says nobody owns it, and links to the original", () => {
    const { rerender } = render(
      <DocByline owner={{ name: "Dana Whitfield" }} source={{ label: "Confluence", href: "https://x.test" }} />
    )
    expect(screen.getByText(/Owned by/)).toHaveTextContent("Owned by Dana Whitfield")
    expect(screen.getByRole("link", { name: /Came from Confluence/ })).toHaveAttribute("target", "_blank")
    rerender(<DocByline owner={{}} source="here" />)
    expect(screen.getByText("Nobody owns it")).toBeInTheDocument()
    expect(screen.getByText("Written here")).toBeInTheDocument()
  })

  it("says an old version is being read, with the ways back", async () => {
    const back = vi.fn()
    render(<VersionPreview n={2} date="3 Oct" onRestore={() => {}} onBack={back} />)
    expect(screen.getByRole("status")).toHaveTextContent("Reading v2 from 3 Oct. You cannot edit history.")
    await userEvent.click(screen.getByRole("button", { name: "Back to the current one" }))
    expect(back).toHaveBeenCalledOnce()
  })
})

describe("The rail's foot", () => {
  it("reports a problem in place, and only sends something written", async () => {
    const report = vi.fn()
    render(<DocRailFoot onReport={report} onArchive={() => {}} />)
    await userEvent.click(screen.getByRole("button", { name: "Report a problem" }))
    const send = screen.getByRole("button", { name: "Send the report" })
    expect(send).toBeDisabled()
    await userEvent.type(screen.getByRole("textbox", { name: "What is wrong with it?" }), "The limit is £750 now")
    await userEvent.click(send)
    expect(report).toHaveBeenCalledWith("The limit is £750 now")
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("offers Restore and Delete once archived", () => {
    render(<DocRailFoot archived onRestore={() => {}} onDelete={() => {}} />)
    expect(screen.getByRole("button", { name: "Restore" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
  })
})

describe("DocComments", () => {
  it("counts comments, marks a reported problem, resolves it in words", async () => {
    const add = vi.fn()
    const resolve = vi.fn()
    const { rerender, container } = render(
      <DocComments
        comments={[{ id: "1", author: "Omar", time: "Today", text: "Limit changed.", problem: true }]}
        onAdd={add}
        onResolve={resolve}
      />
    )
    expect(screen.getByRole("heading", { name: "1 comment" })).toBeInTheDocument()
    expect(screen.getByText("Reported a problem")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Mark it resolved" }))
    expect(resolve).toHaveBeenCalledWith("1")
    await userEvent.type(screen.getByRole("textbox", { name: "Add a comment" }), "Fixed{Enter}")
    expect(add).toHaveBeenCalledWith("Fixed")
    rerender(
      <DocComments
        comments={[{ id: "1", author: "Omar", time: "Today", text: "Limit changed.", problem: true, done: true }]}
        onAdd={add}
      />
    )
    expect(screen.getByText("Resolved")).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Writing tools", () => {
  it("the selection menu formats, then hands the words to AiMY", async () => {
    const fmt = vi.fn()
    const act = vi.fn()
    const { container } = render(
      <SelectionMenu active={{ bold: true }} onFormat={fmt} actions={["Rewrite", "Shorten"]} onAction={act} />
    )
    const bar = screen.getByRole("toolbar", { name: "The selected words" })
    expect(within(bar).getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(within(bar).getByRole("button", { name: "Italic" }))
    expect(fmt).toHaveBeenCalledWith("italic")
    await userEvent.click(within(bar).getByRole("button", { name: "Rewrite" }))
    expect(act).toHaveBeenCalledWith("Rewrite")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("the toolbar moves with the arrow keys", () => {
    render(<WritingToolbar onFormat={() => {}} onAdd={() => {}} />)
    const bar = screen.getByRole("toolbar", { name: "Writing tools" })
    const add = within(bar).getByRole("button", { name: "Add a block" })
    add.focus()
    fireEvent.keyDown(bar, { key: "ArrowRight" })
    expect(document.activeElement).toHaveAccessibleName("Bold")
    fireEvent.keyDown(bar, { key: "End" })
    expect(document.activeElement).toHaveAccessibleName("Quote")
  })

  it("the block menu takes focus, picks a block, and closes on Escape", async () => {
    const pick = vi.fn()
    const close = vi.fn()
    render(<BlockMenu onPick={pick} onClose={close} />)
    const menu = screen.getByRole("menu", { name: "Add a block" })
    expect(document.activeElement).toHaveAccessibleName("Text")
    fireEvent.keyDown(menu, { key: "ArrowDown" })
    expect(document.activeElement).toHaveAccessibleName("Heading")
    await userEvent.click(screen.getByRole("menuitem", { name: "Quote" }))
    expect(pick).toHaveBeenCalledWith("quote")
    fireEvent.keyDown(menu, { key: "Escape" })
    expect(close).toHaveBeenCalledOnce()
  })

  it("AiMY's menu opens from its button and picks for the whole document", async () => {
    const pick = vi.fn()
    render(<AiMenu items={["Rewrite for support agents", "Shorten"]} onPick={pick} />)
    await userEvent.click(screen.getByRole("button", { name: "Rewrite this with AiMY" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Shorten" }))
    expect(pick).toHaveBeenCalledWith("Shorten")
  })
})
