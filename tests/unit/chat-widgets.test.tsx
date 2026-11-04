import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Users } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { CandidateCards, type Candidate } from "@/registry/aimy/ui/candidate-card"
import { CandidateProfile } from "@/registry/aimy/ui/candidate-profile"
import { ChatTable } from "@/registry/aimy/ui/chat-table"
import { RankedList } from "@/registry/aimy/ui/ranked-list"
import { UploadResults, type UploadItem } from "@/registry/aimy/ui/upload-results"
import { WidgetFrame } from "@/registry/aimy/ui/widget-frame"
import { a11yViolations } from "../a11y"

const PEOPLE: Candidate[] = [
  { id: "a", name: "Youssef Hamdy", role: "Technical Support Specialist", company: "Teleperformance", location: "Giza", match: 82, skills: ["Ticketing", "Windows", "Networking"] },
  { id: "b", name: "Salma Ragab", role: "Customer Support", match: 51 },
]

describe("WidgetFrame", () => {
  it("is a region named by its title, with the canvas, download and the rest", async () => {
    const open = vi.fn()
    const download = vi.fn()
    const more = vi.fn()
    const { container } = render(
      <WidgetFrame icon={<Users />} title="Recommended candidates" meta="Best match first" onOpen={open} onDownload={download} more={{ label: "Show all candidates", onClick: more }}>
        <p>Result</p>
      </WidgetFrame>
    )
    expect(screen.getByRole("region", { name: "Recommended candidates" })).toHaveTextContent("Best match first")
    await userEvent.click(screen.getByRole("button", { name: "Open in the canvas" }))
    await userEvent.click(screen.getByRole("button", { name: "Download" }))
    await userEvent.click(screen.getByRole("button", { name: "Show all candidates" }))
    expect([open, download, more].map((f) => f.mock.calls.length)).toEqual([1, 1, 1])
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("CandidateCards", () => {
  it("shows each person with the Fit badge, two skills and the rest counted, and acts on that person", async () => {
    const email = vi.fn()
    const { container } = render(<CandidateCards candidates={PEOPLE} onView={() => {}} onEmail={email} onOutreach={() => {}} />)
    const youssef = screen.getByRole("article", { name: "Youssef Hamdy" })
    expect(within(youssef).getByRole("img", { name: "Fit 82 out of 100, high" })).toBeInTheDocument()
    expect(youssef).toHaveTextContent("Ticketing")
    expect(youssef).toHaveTextContent("1 more")
    await userEvent.click(screen.getByRole("button", { name: "Email Salma Ragab" }))
    expect(email).toHaveBeenCalledWith(PEOPLE[1])
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("CandidateProfile", () => {
  it("shows About in three lines and two jobs, and opens the rest in place", async () => {
    const { container } = render(
      <CandidateProfile
        name="Karim Ashraf"
        role="IT Support"
        company="Teleperformance"
        location="New Cairo"
        match={64}
        about="A long summary."
        experience={[{ title: "One" }, { title: "Two" }, { title: "Three" }]}
        skills={["Hardware"]}
        onOutreach={() => {}}
      />
    )
    const readAll = screen.getByRole("button", { name: "Read all" })
    expect(readAll).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(readAll)
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.queryByText("Three")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Show all 3 jobs" }))
    expect(screen.getByText("Three")).toBeInTheDocument()
    expect(screen.getByLabelText("Location")).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("RankedList", () => {
  it("is a named, ordered list whose rows open their result", async () => {
    const open = vi.fn()
    const items = [{ id: "1", title: "PHP Developer", details: "Cairo", reason: "Same title", match: 95 }]
    const { container } = render(<RankedList label="Matched positions" items={items} onOpen={open} />)
    const list = screen.getByRole("list", { name: "Matched positions" })
    expect(list.tagName).toBe("OL")
    await userEvent.click(within(list).getByRole("button", { name: /PHP Developer/ }))
    expect(open).toHaveBeenCalledWith(items[0])
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("UploadResults", () => {
  const files: UploadItem[] = [
    { id: "1", name: "scan.pdf", file: "scan.pdf", status: "failed", message: "The PDF is a scan." },
    { id: "2", name: "Dina Emad", file: "dina.pdf", status: "warnings", message: "No email." },
    { id: "3", name: "Hana Mansour", file: "hana.pdf", status: "added" },
  ]

  it("counts by status, opens on what needs a person, and filters", async () => {
    const act = vi.fn()
    const { container } = render(<UploadResults label="CV upload" items={files} onAction={act} />)
    const group = screen.getByRole("radiogroup", { name: "CV upload: show" })
    expect(within(group).getByRole("radio", { name: /Not added/ })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("The PDF is a scan.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Upload again" }))
    expect(act).toHaveBeenCalledWith(files[0])
    await userEvent.click(within(group).getByRole("radio", { name: /^1Added$/ }))
    expect(screen.getByText("Hana Mansour")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("ChatTable", () => {
  type Row = { id: string; title: string; n: number }
  const rows: Row[] = [
    { id: "1", title: "B role", n: 2 },
    { id: "2", title: "A role", n: 1 },
  ]
  const columns = [
    { key: "title", header: "Position", cell: (r: Row) => r.title, sort: (a: Row, b: Row) => a.title.localeCompare(b.title) },
    { key: "n", header: "Years", end: true, cell: (r: Row) => r.n },
  ]

  it("is a status while it loads", () => {
    render(<ChatTable<Row> loading label="Matched positions" rows={rows} rowKey={(r) => r.id} columns={columns} />)
    expect(screen.getByRole("status", { name: "Loading Matched positions" })).toBeInTheDocument()
  })

  it("sorts by a header, says the order, and keeps it in both forms", async () => {
    // jsdom draws both forms (it has no container queries); a browser shows one.
    const { container } = render(<ChatTable<Row> label="Matched positions" rows={rows} rowKey={(r) => r.id} columns={columns} />)
    const table = container.querySelector("table")!
    const header = within(table).getByRole("columnheader", { name: /Position/ })
    await userEvent.click(within(header).getByRole("button"))
    expect(header).toHaveAttribute("aria-sort", "ascending")
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("A role")
    const narrow = container.querySelector(".set2-runs")!
    expect(within(narrow as HTMLElement).getAllByRole("row")[1]).toHaveTextContent("A role")
  })
})
