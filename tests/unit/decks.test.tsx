import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ChaptersDeck, chaptersProblems, chaptersSlides, type ChaptersStory } from "@/registry/aimy/ui/chapters-deck"
import { deckProblems, formatFigure } from "@/registry/aimy/ui/deck"
import { HorizonDeck, type HorizonStory } from "@/registry/aimy/ui/horizon-deck"
import { LanesDeck, type LanesStory } from "@/registry/aimy/ui/lanes-deck"
import { a11yViolations } from "../a11y"

const cover = { kicker: "AiMY UI · the story so far", title: "From two products to one system.", when: "November 2026" }
const close = { title: "Knowledge to", turn: "Action.", sub: "Every insight comes with a next step.", action: { label: "Browse the parts" } }

const horizon: HorizonStory = {
  cover,
  moments: [
    { when: "27 Oct", chapter: "The plan", title: "We started with a plan.", body: "Every decision written down first." },
    { when: "29 Oct", chapter: "1.0.0", figure: { value: 113, means: "parts today" } },
    { when: "11 Nov", chapter: "Patches", title: "Production found what the docs missed." },
  ],
  close,
}

const lanes: LanesStory = {
  cover,
  moments: [
    { when: "27 Oct", chapter: "The plan", learned: "Two products, one problem.", did: "One plan." },
    { when: "29 Oct", chapter: "1.0.0", figure: { value: 113, means: "parts today" }, did: "Built what they draw." },
  ],
  close,
}

const deck = () => screen.getByRole("region", { name: cover.title })
const count = () => screen.getByText(/ of \d+$/)

describe("HorizonDeck", () => {
  it("is a named slide deck that starts on its cover", async () => {
    const { container } = render(<HorizonDeck story={horizon} />)
    expect(deck()).toHaveAttribute("aria-roledescription", "slide deck")
    expect(count()).toHaveTextContent("1 of 5")
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("moves with the keys and the buttons, and stops at the ends", async () => {
    render(<HorizonDeck story={horizon} />)
    fireEvent.keyDown(deck(), { key: "ArrowRight" })
    expect(count()).toHaveTextContent("2 of 5")
    fireEvent.keyDown(deck(), { key: "End" })
    expect(count()).toHaveTextContent("5 of 5")
    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled()
    fireEvent.keyDown(deck(), { key: "ArrowRight" })
    expect(count()).toHaveTextContent("5 of 5")
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }))
    expect(count()).toHaveTextContent("4 of 5")
    fireEvent.keyDown(deck(), { key: "Home" })
    expect(count()).toHaveTextContent("1 of 5")
  })

  it("shows only the current slide to a screen reader", () => {
    render(<HorizonDeck story={horizon} />)
    fireEvent.keyDown(deck(), { key: "ArrowRight" })
    const now = screen.getAllByRole("heading").find((h) => h.textContent === "We started with a plan.")!
    expect(now.closest("section")).toHaveAttribute("data-state", "now")
    expect(now.closest("section")).not.toHaveAttribute("aria-hidden", "true")
    const ahead = screen
      .getAllByRole("heading", { hidden: true })
      .find((h) => h.textContent === "Production found what the docs missed.")!
    expect(ahead.closest("section")).toHaveAttribute("aria-hidden", "true")
  })

  it("says a figure's value and what it means", () => {
    render(<HorizonDeck story={horizon} />)
    const figure = within(deck()).getByText("113")
    expect(figure.closest("section")).toHaveTextContent("parts today")
  })
})

describe("LanesDeck", () => {
  it("names its lanes Knowledge and Action, and says the chapter in words", async () => {
    const { container } = render(<LanesDeck story={lanes} />)
    fireEvent.keyDown(deck(), { key: "ArrowRight" })
    expect(container.querySelector(".dk-lns-rail")).toHaveTextContent("Knowledge")
    expect(container.querySelector(".dk-lns-rail")).toHaveTextContent("Action")
    expect(container.querySelector(".dk-lns-where-n")).toHaveTextContent("1 of 2")
    expect(container.querySelector(".dk-lns-where-name")).toHaveTextContent("The plan")
    expect(await a11yViolations(container)).toEqual([])
  })

  it("keeps past columns in the story and hides the rail on the cover and the close", () => {
    const { container } = render(<LanesDeck story={lanes} />)
    expect(container.querySelector(".dk-lns")).toHaveAttribute("data-edge")
    fireEvent.keyDown(deck(), { key: "ArrowRight" })
    fireEvent.keyDown(deck(), { key: "ArrowRight" })
    expect(container.querySelector(".dk-lns")).not.toHaveAttribute("data-edge")
    const cols = container.querySelectorAll(".dk-lns-col")
    expect(cols[0]).toHaveAttribute("data-state", "done")
    expect(cols[1]).toHaveAttribute("data-state", "now")
    fireEvent.keyDown(deck(), { key: "End" })
    expect(container.querySelector(".dk-lns")).toHaveAttribute("data-edge")
  })

  it("takes its own lane names", () => {
    const { container } = render(
      <LanesDeck
        story={{ ...lanes, lanes: { up: { name: "Signal", holds: "What we saw" }, down: { name: "Move", holds: "What we changed" } } }}
      />
    )
    expect(container.querySelector(".dk-lns-rail")).toHaveTextContent("SignalWhat we saw")
  })
})

describe("Deck stories", () => {
  it("draws a figure in its own decimals and grouping, with its unit", () => {
    expect(formatFigure(92.5)).toBe("92.5")
    expect(formatFigure(1240)).toBe("1,240")
    expect(formatFigure(1.4)).toBe("1.4")
    expect(formatFigure(3)).toBe("3")
    const story: HorizonStory = {
      ...horizon,
      moments: [horizon.moments[0]!, { chapter: "Pilot", figure: { value: 1.4, prefix: "$", suffix: "M", means: "pipeline added" } }],
    }
    render(<HorizonDeck story={story} />)
    expect(within(deck()).getByText("1.4").parentElement).toHaveTextContent("$1.4M")
  })

  it("leaves a moment's date out rather than needing one", () => {
    const story: HorizonStory = { ...horizon, moments: [{ chapter: "Why", title: "Reps lose their day." }, ...horizon.moments] }
    const { container } = render(<HorizonDeck story={story} />)
    expect(container.querySelectorAll(".dk-hzn-chip")[0]).toHaveTextContent(/^Why$/)
    expect(container.querySelectorAll(".dk-hzn-panel .dk-kicker")[1]).toHaveTextContent(/^Why$/)
  })

  it("offers the speaker view only when there are notes", () => {
    const { unmount } = render(<HorizonDeck story={horizon} />)
    expect(screen.queryByRole("button", { name: "Speaker view" })).toBeNull()
    unmount()
    render(<LanesDeck story={{ ...lanes, close: { ...close, notes: "Ask for one thing." } }} />)
    expect(screen.getByRole("button", { name: "Speaker view" })).toBeInTheDocument()
  })

  it("names what is wrong with a story before it is drawn", () => {
    expect(deckProblems(horizon, "horizon")).toEqual([])
    expect(deckProblems(lanes, "lanes")).toEqual([])
    const bad = deckProblems(
      {
        cover: { kicker: "All-hands", title: "AiMY Sales v3: rebuilt from the ground up to give every rep their time back" },
        moments: [
          { chapter: "Why", title: "Data entry", figure: { value: 40, means: "% of the day" } },
          { chapter: "", title: "Ok" },
        ],
        close,
      },
      "horizon"
    ).join("\n")
    expect(bad).toMatch(/The cover: the title is \d+ characters/)
    expect(bad).toMatch(/a figure takes the title's place/)
    expect(bad).toMatch(/put the unit in the figure's suffix/)
    expect(bad).toMatch(/Moment 2 .*needs a chapter/)
    const lane = deckProblems({ ...lanes, moments: [{ chapter: "Trust", learned: "People trust sources.", figure: { value: 4.2, suffix: "/5", means: "trust" }, did: "" }, lanes.moments[0]!] }, "lanes").join("\n")
    expect(lane).toMatch(/learned isn't shown/)
    expect(lane).toMatch(/needs did/)
    expect(deckProblems({ ...horizon, moments: Array.from({ length: 8 }, (_, k) => ({ chapter: `M${k}`, title: "A line." })) }, "horizon")[0]).toMatch(/^8 moments is too many/)
  })

  it("reports the story's problems to onProblems", async () => {
    const seen: string[][] = []
    render(<HorizonDeck story={{ ...horizon, moments: horizon.moments.slice(0, 1) }} onProblems={(p) => seen.push(p)} />)
    await new Promise((r) => setTimeout(r, 0))
    expect(seen.at(-1)?.[0]).toMatch(/at least two moments/)
  })
})

const talk: ChaptersStory = {
  cover: { kicker: "Proposal · Support", title: "Answers in seconds, not minutes.", when: "3 December 2026", notes: "Open with the cost." },
  parts: [
    { title: "Why now", holds: "What searching costs", slides: [{ kind: "statement", title: "Agents spend a third of every call searching." }] },
    {
      title: "The proof",
      slides: [{ kind: "figures", title: "Six weeks with Sales", figures: [{ value: 41, suffix: "%", means: "faster answers than before" }] }],
    },
    {
      title: "The decision",
      slides: [
        {
          kind: "choice",
          title: "Two ways to roll it out",
          options: [
            { name: "Everyone in January", lines: ["All agents on 12 January"] },
            { name: "Tier 1 first", recommended: true, lines: ["Tier 1 in January"] },
          ],
        },
      ],
    },
  ],
  close: { title: "Answers in", turn: "seconds.", action: { label: "Approve the rollout" } },
}

const talkDeck = () => screen.getByRole("region", { name: talk.cover.title })

describe("ChaptersDeck", () => {
  it("flattens a talk into cover, agenda, a divider and slides per part, and the close", () => {
    expect(chaptersSlides(talk).map((f) => f.type)).toEqual(["cover", "agenda", "part", "slide", "part", "slide", "part", "slide", "close"])
    expect(chaptersSlides({ ...talk, agenda: false })[1]?.type).toBe("part")
  })

  it("is a named slide deck whose agenda lists the parts", async () => {
    const { container } = render(<ChaptersDeck story={talk} />)
    expect(talkDeck()).toHaveAttribute("aria-roledescription", "slide deck")
    expect(count()).toHaveTextContent("1 of 9")
    fireEvent.keyDown(talkDeck(), { key: "ArrowRight" })
    const agenda = container.querySelector(".dk-k-agenda")!
    expect(agenda.closest("section")).toHaveAttribute("data-state", "now")
    expect(within(agenda as HTMLElement).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["01Why now", "02The proof", "03The decision"])
    expect(await a11yViolations(container)).toEqual([])
  })

  it("lights the current part in the rail and steps the rail aside on the cover", () => {
    const { container } = render(<ChaptersDeck story={talk} />)
    expect(container.querySelector(".dk-chp")).toHaveAttribute("data-edge")
    for (let k = 0; k < 4; k++) fireEvent.keyDown(talkDeck(), { key: "ArrowRight" })
    expect(container.querySelector(".dk-chp")).not.toHaveAttribute("data-edge")
    const parts = container.querySelectorAll(".dk-chp-part")
    expect(parts[0]).toHaveAttribute("data-state", "done")
    expect(parts[1]).toHaveAttribute("data-state", "now")
    expect(parts[2]).toHaveAttribute("data-state", "ahead")
  })

  it("marks the recommended option and offers the speaker view for notes", () => {
    render(<ChaptersDeck story={talk} />)
    expect(screen.getByRole("button", { name: "Speaker view" })).toBeInTheDocument()
    const rec = screen.getAllByText("Recommended", { selector: ".dk-k-opt-tag" })
    expect(rec).toHaveLength(1)
    expect(rec[0]!.closest(".dk-k-opt")).toHaveTextContent("Tier 1 first")
  })

  it("names what is wrong with a talk before it is drawn", () => {
    expect(chaptersProblems(talk)).toEqual([])
    const bad = chaptersProblems({
      ...talk,
      parts: [
        { title: "One", slides: [] },
        {
          title: "Two",
          slides: [
            { kind: "points", title: "Too many", points: [{ head: "a" }, { head: "b" }, { head: "c" }, { head: "d" }] },
            { kind: "choice", title: "Three", options: [{ name: "A", lines: [] }, { name: "B", lines: [] }, { name: "C", lines: [] }] },
            { kind: "figures", title: "Bare", figures: [{ value: 40, means: "% of the day" }] },
          ],
        },
      ],
    }).join("\n")
    expect(bad).toMatch(/Part 1 \(One\): has no slides/)
    expect(bad).toMatch(/two or three points; this has 4/)
    expect(bad).toMatch(/a choice is two options; this has 3/)
    expect(bad).toMatch(/put the unit in suffix or prefix/)
  })
})
