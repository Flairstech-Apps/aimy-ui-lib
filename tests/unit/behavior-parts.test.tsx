import { readFileSync } from "node:fs"
import path from "node:path"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { ariaProblems, singleTabStopProblems } from "@/registry/aimy/lib/behaviors-testing"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { Field } from "@/registry/aimy/ui/field"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { ResizablePanels } from "@/registry/aimy/ui/resizable-panels"
import { SortableList } from "@/registry/aimy/ui/sortable-list"
import { SwipeRow } from "@/registry/aimy/ui/swipe-row"
import { Tree, type TreeItem } from "@/registry/aimy/ui/tree"
import { a11yViolations } from "../a11y"

const PRODUCTS = ["Cloud", "Security", "Data", "Support"].map((p) => ({ value: p.toLowerCase(), label: p }))

describe("Combobox", () => {
  it("filters as you type, chooses with Enter and shows the choice", async () => {
    const onValueChange = vi.fn()
    render(
      <Field label="Product">
        <Combobox options={PRODUCTS} onValueChange={onValueChange} />
      </Field>
    )
    const input = screen.getByRole("combobox", { name: "Product" })
    await userEvent.type(input, "sec")
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Security"])
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option").id)
    expect(ariaProblems(document.body)).toEqual([])
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenCalledWith("security")
    expect(input).toHaveValue("Security")
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).toHaveFocus()
  })

  it("opens with ArrowDown, says when nothing matches, and Escape closes", async () => {
    render(<Combobox label="Product" options={PRODUCTS} defaultValue="data" />)
    const input = screen.getByRole("combobox", { name: "Product" })
    expect(input).toHaveValue("Data")
    input.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")).toHaveLength(4)
    expect(screen.getByRole("option", { name: "Data" })).toHaveAttribute("aria-selected", "true")
    await userEvent.type(input, "zzz")
    expect(screen.getByRole("status")).toHaveTextContent("Nothing matches")
    await userEvent.keyboard("{Escape}")
    expect(input).toHaveAttribute("aria-expanded", "false")
    await userEvent.tab()
    expect(input).toHaveValue("Data")
  })

  it("shows options that arrive after typing (a server search), unfiltered, and reports the words", async () => {
    const onQueryChange = vi.fn()
    function Search() {
      const [options, setOptions] = useState<typeof PRODUCTS>([])
      return (
        <Combobox
          label="Person"
          autoFocus
          filter={false}
          options={options}
          onQueryChange={(q) => {
            onQueryChange(q)
            // The server answers later, with matches the words alone would not keep.
            setTimeout(() => setOptions(q ? [{ value: "amelia", label: "Amelia Taylor" }] : []), 0)
          }}
        />
      )
    }
    render(<Search />)
    const input = screen.getByRole("combobox", { name: "Person" })
    expect(input).toHaveFocus()
    await userEvent.type(input, "ataylor")
    expect(onQueryChange).toHaveBeenLastCalledWith("ataylor")
    await waitFor(() => expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Amelia Taylor"]))
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option").id)
  })
})

describe("Disclosure", () => {
  it("keeps a closed Disclosure closed inside an open one", () => {
    const css = readFileSync(path.resolve(__dirname, "../../package/tokens/transitions.css"), "utf8")
    for (const rule of css.match(/\.t-acc\[data-open="true"\][^{]*/g) ?? []) expect(rule).toMatch(/^\.t-acc\[data-open="true"\] > /)
  })
})

describe("InlineEdit", () => {
  it("edits in place, refuses with a reason, saves on Enter and returns focus", async () => {
    function Demo() {
      const [v, setV] = useState("Q4 plan")
      return <InlineEdit label="List name" value={v} onSave={setV} validate={(d) => (d.trim() ? null : "Give it a name.")} />
    }
    render(<Demo />)
    await userEvent.click(screen.getByRole("button", { name: /List name: Q4 plan/ }))
    const input = screen.getByRole("textbox", { name: "List name" })
    expect(input).toHaveFocus()
    await userEvent.clear(input)
    await userEvent.keyboard("{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Give it a name.")
    expect(input).toHaveAttribute("aria-invalid", "true")
    await userEvent.type(input, "Q4 review{Enter}")
    const button = await screen.findByRole("button", { name: /List name: Q4 review/ })
    await waitFor(() => expect(button).toHaveFocus())
  })

  it("Escape puts the value back", async () => {
    render(<InlineEdit label="Name" value="Kestrel" onSave={() => {}} />)
    await userEvent.click(screen.getByRole("button"))
    await userEvent.type(screen.getByRole("textbox"), " Logistics{Escape}")
    expect(screen.getByRole("button", { name: /Name: Kestrel\./ })).toBeInTheDocument()
  })
})

const FILES: TreeItem[] = [
  { id: "app", label: "app", children: [{ id: "page", label: "page.tsx" }, { id: "layout", label: "layout.tsx" }] },
  { id: "lib", label: "lib", children: [{ id: "behaviors", label: "behaviors.ts" }] },
  { id: "readme", label: "README.md" },
]

describe("Tree", () => {
  it("is one Tab stop with the tree keyboard model and full ARIA", async () => {
    const onSelect = vi.fn()
    const { container } = render(<Tree label="Files" items={FILES} onSelect={onSelect} />)
    const tree = screen.getByRole("tree", { name: "Files" })
    expect(singleTabStopProblems(tree)).toEqual([])
    expect(ariaProblems(tree)).toEqual([])
    await userEvent.tab()
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute("aria-expanded", "true")
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: "page.tsx" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith("page")
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveFocus()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("checks roll up to folders", async () => {
    const onCheckedChange = vi.fn()
    render(<Tree label="Files" items={FILES} checkable defaultExpanded={["app"]} onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole("treeitem", { name: "page.tsx" }))
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute("aria-checked", "mixed")
    await userEvent.click(screen.getByRole("treeitem", { name: "app" }))
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute("aria-checked", "true")
    expect(onCheckedChange).toHaveBeenLastCalledWith(expect.arrayContaining(["page", "layout"]))
  })
})

describe("SortableList", () => {
  it("reorders by keyboard, keeps focus on the grip, and calls onReorder once", async () => {
    const onReorder = vi.fn()
    function Demo() {
      const [items, setItems] = useState(["Plan", "Build", "Ship"])
      return (
        <SortableList
          label="Steps"
          items={items}
          getKey={(s) => s}
          getLabel={(s) => s}
          renderItem={(s) => s}
          onReorder={(next) => {
            onReorder(next)
            setItems(next)
          }}
        />
      )
    }
    render(<Demo />)
    screen.getByRole("button", { name: "Move Plan" }).focus()
    await userEvent.keyboard(" ")
    expect(screen.getByRole("button", { name: "Move Plan" })).toHaveAttribute("aria-pressed", "true")
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    expect(screen.getByRole("button", { name: "Move Plan" })).toHaveFocus()
    await userEvent.keyboard(" ")
    expect(onReorder).toHaveBeenCalledTimes(1)
    expect(onReorder).toHaveBeenCalledWith(["Build", "Ship", "Plan"])
    expect(screen.getAllByRole("listitem").map((l) => l.lastElementChild?.textContent)).toEqual(["Build", "Ship", "Plan"])
  })
})

describe("ResizablePanels", () => {
  it("resizes from the keyboard inside each panel's minimum", async () => {
    const onSizesChange = vi.fn()
    render(
      <ResizablePanels defaultSizes={[30, 70]} min={[20, 40]} labels={["List", "Detail"]} onSizesChange={onSizesChange}>
        <div>List</div>
        <div>Detail</div>
      </ResizablePanels>
    )
    const handle = screen.getByRole("separator", { name: "Resize List" })
    expect(handle).toHaveAttribute("aria-valuenow", "30")
    handle.focus()
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(handle).toHaveAttribute("aria-valuenow", "40")
    await userEvent.keyboard("{End}")
    expect(handle).toHaveAttribute("aria-valuenow", "60")
    await userEvent.keyboard("{Home}")
    expect(handle).toHaveAttribute("aria-valuenow", "20")
    expect(onSizesChange).toHaveBeenLastCalledWith([20, 80])
  })
})

describe("SwipeRow", () => {
  it("reaches each action by Tab, which slides the row open, and runs it", async () => {
    const archive = vi.fn()
    const { container } = render(
      <SwipeRow trailing={{ label: "Archive", tone: "info", onAction: archive }}>
        <p>Kestrel replied</p>
      </SwipeRow>
    )
    await userEvent.tab()
    const button = screen.getByRole("button", { name: "Archive" })
    expect(button).toHaveFocus()
    const row = container.querySelector<HTMLElement>('[data-slot="swipe-row"] > div')!
    await waitFor(() => expect(row.style.transform).toBe("translateX(-88px)"))
    await act(async () => button.click())
    expect(archive).toHaveBeenCalledTimes(1)
  })
})
