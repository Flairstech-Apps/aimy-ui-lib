import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Donut } from "@/registry/aimy/ui/donut"
import { Funnel } from "@/registry/aimy/ui/funnel"
import { Heatmap } from "@/registry/aimy/ui/heatmap"
import { KpiWidget } from "@/registry/aimy/ui/kpi-widget"
import { Leaderboard } from "@/registry/aimy/ui/leaderboard"
import { ScoreTile } from "@/registry/aimy/ui/score-tile"
import { Sparkline } from "@/registry/aimy/ui/sparkline"
import { TargetBar } from "@/registry/aimy/ui/target-bar"
import { TrendChart } from "@/registry/aimy/ui/trend-chart"
import { a11yViolations } from "../a11y"

describe("KpiWidget", () => {
  it("draws the line with a break, the goal, and a keyboard readout", async () => {
    const { container } = render(
      <KpiWidget
        label="Calls answered"
        value="64%"
        state={{ word: "behind", tone: "warn" }}
        series={[51, 52, null, 55, 57]}
        goal={{ value: 70 }}
        format={(v) => `${v}%`}
        summary="Calls answered: 51% at signing, 64% now, 70% promised, behind."
      />
    )
    const plot = screen.getByRole("img", { name: /70% promised, behind/ })
    expect(screen.getByText("behind")).toHaveClass("tone-warn")
    expect(screen.getByText("promised")).toBeInTheDocument()
    expect(container.querySelector(".b-wid-line")?.getAttribute("d")?.match(/M/g)).toHaveLength(2)
    plot.focus()
    fireEvent.keyDown(plot, { key: "ArrowLeft" })
    expect(container.querySelector(".b-wid-tip")).toHaveTextContent("Week 4 · 55%")
    fireEvent.keyDown(plot, { key: "ArrowLeft" })
    expect(container.querySelector(".b-wid-tip")).toHaveTextContent("Week 2 · 52%")
    fireEvent.keyDown(plot, { key: "Escape" })
    expect(container.querySelector(".b-wid-tip")).toBeNull()
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("TargetBar", () => {
  it("says the share and the projection, with the target at the scale's 83%", () => {
    const { container } = render(
      <TargetBar value={150} target={300} forecast={240} elapsed={0.5} format={(n) => `€${n}k`} />
    )
    expect(screen.getByText("50% of target")).toBeInTheDocument()
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "€150k of a €300k target. AiMY expects another €90k by the end, reaching €240k."
    )
    expect(container.querySelector(".s-att-target")).toHaveStyle({ left: "83.3%" })
    expect(container.querySelector(".s-att-pace")).toBeInTheDocument()
    expect(screen.getByText(/Could still come · €90k/)).toBeInTheDocument()
  })

  it("turns green past the target and drops the marks it has no data for", () => {
    const { container } = render(<TargetBar value={318} target={300} format={(n) => `${n}`} />)
    expect(screen.getByText("106% of target")).toHaveClass("tone-ok")
    expect(container.querySelector(".s-att-pace")).toBeNull()
    expect(container.querySelector(".s-att-fcast")).toBeNull()
  })
})

describe("Funnel", () => {
  it("reads each row as its count of its whole, and shows a sliver for any", () => {
    const { container } = render(
      <Funnel
        label="Where the 240 are"
        total={240}
        rows={[
          { name: "Called", n: 187 },
          { name: "Signed", n: 1, tone: "ok" },
          { name: "Lost", n: 0 },
        ]}
      />
    )
    const list = screen.getByRole("list", { name: "Where the 240 are" })
    expect(within(list).getByRole("listitem", { name: "Called: 187 of 240" })).toBeInTheDocument()
    const fills = container.querySelectorAll(".b-fn-fill")
    expect(fills[1]).toHaveStyle({ width: "1%" })
    expect(fills[2]).toHaveStyle({ width: "0%" })
  })
})

describe("Sparkline", () => {
  it("draws before, after and the change between them", () => {
    const { container } = render(
      <Sparkline before={[3, 4, 3]} after={[2, 1]} label="About 3 before, about 1 after" at="Tone changed" />
    )
    expect(screen.getByRole("img", { name: "About 3 before, about 1 after" })).toBeInTheDocument()
    expect(container.querySelector(".agv-spark-before")?.getAttribute("points")?.split(" ")).toHaveLength(3)
    // After starts at the change, so the two halves join.
    expect(container.querySelector(".agv-spark-after")?.getAttribute("points")?.split(" ")).toHaveLength(3)
    expect(container.querySelector(".agv-spark-at")).toBeInTheDocument()
  })
})

const RANGES = [
  {
    key: "ytd",
    label: "YTD",
    labels: ["Jan", "Feb", "Mar", "Apr"],
    scores: [82, 91, 74, 87],
    prev: [80, 84, 83, 84],
    flags: [2],
  },
  { key: "7d", label: "7D", labels: ["Mon", "Tue"], scores: [86, 88] },
]

describe("TrendChart", () => {
  it("says the peak and low, switches range, and compares with the period before", async () => {
    const { container } = render(
      <TrendChart title="Quality score" goal={{ value: 90, label: "SLA 90%" }} ranges={RANGES} />
    )
    expect(screen.getByText("Peak · Feb")).toBeInTheDocument()
    expect(screen.getByText("Low · Mar")).toBeInTheDocument()
    expect(container.querySelectorAll(".qa-trend-dot.is-err")).toHaveLength(1)
    expect(container.querySelector(".qa-trend-prev")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Compare" }))
    expect(container.querySelector(".qa-trend-prev")).toBeInTheDocument()
    expect(screen.getByText("Previous period")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "7D" }))
    expect(screen.getByText("Peak · Tue")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Compare" })).toBeNull()
    expect(await a11yViolations(container)).toEqual([])
  })

  it("says so when a range has no scores", () => {
    render(<TrendChart ranges={[{ key: "7d", label: "7D", labels: [], scores: [] }]} />)
    expect(screen.getByText("No scores in this range yet.")).toBeInTheDocument()
  })
})

describe("ScoreTile", () => {
  it("opens its trend from the line, and says how it moved in words", async () => {
    const toggle = vi.fn()
    const { container, rerender } = render(
      <>
        <ScoreTile
          label="Quality score"
          value="87.3%"
          tone="warn"
          trend={{ dir: "up", amount: "5.2%", vs: "vs last period" }}
          series={[80, 84, 87]}
          goal={90}
          onToggle={toggle}
          controls="p"
        />
        <section id="p" aria-label="Trend" hidden />
      </>
    )
    const btn = screen.getByRole("button", { name: /Open trend/ })
    expect(btn).toHaveAttribute("aria-expanded", "false")
    expect(btn).toHaveAttribute("aria-controls", "p")
    expect(screen.getByText("up")).toHaveClass("sr-only")
    await userEvent.click(btn)
    expect(toggle).toHaveBeenCalledOnce()
    rerender(
      <>
        <ScoreTile label="Quality score" value="87.3%" series={[80, 84, 87]} open onToggle={toggle} controls="p" />
        <section id="p" aria-label="Trend" hidden />
      </>
    )
    expect(screen.getByRole("button", { name: /Close trend/ })).toHaveAttribute("aria-expanded", "true")
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Donut", () => {
  it("names every share, and says a part in the centre when its row is pointed at", async () => {
    const pick = vi.fn()
    const { container } = render(
      <Donut
        label="Evaluations"
        center={{ label: "Pass rate" }}
        parts={[
          { key: "pass", label: "Pass", value: 72, tone: "ok", center: "Pass rate" },
          { key: "fail", label: "Fail", value: 28, tone: "err", center: "Fail rate" },
        ]}
        onPick={pick}
      />
    )
    expect(screen.getByRole("img")).toHaveAccessibleName("Evaluations: Pass 72%, Fail 28%.")
    expect(container.querySelector(".qa-donut-pct")).toHaveTextContent("72%")
    const fail = screen.getByRole("button", { name: /Fail/ })
    fireEvent.focus(fail)
    expect(container.querySelector(".qa-donut-pct")).toHaveTextContent("28%")
    expect(screen.getByText("Fail rate")).toBeInTheDocument()
    expect(container.querySelector(".qa-donut-arc.is-dim")).toBeInTheDocument()
    await userEvent.click(fail)
    expect(pick).toHaveBeenCalledWith("fail")
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Heatmap", () => {
  it("bands each cell, says a missing score, and reads coaching with the cell", async () => {
    const { container } = render(
      <Heatmap
        label="Quality by goal"
        columns={["W1", "W2", "W3", "W4"]}
        rows={[{ name: "Empathy", values: [85, 74, 62, null], coached: { 1: "Coaching, 14 Mar" } }]}
      />
    )
    expect(screen.getByText("85")).toHaveClass("tone-ok")
    expect(screen.getByText("74").closest(".qa-hm-cell")).toHaveClass("tone-warn", "is-coached")
    expect(screen.getByText("62")).toHaveClass("tone-err")
    expect(screen.getByText("none")).toHaveClass("is-na")
    expect(screen.getByText(", Coaching, 14 Mar")).toHaveClass("sr-only")
    expect(screen.getByRole("rowheader", { name: "Empathy" })).toBeInTheDocument()
    expect(await a11yViolations(container)).toEqual([])
  })
})

describe("Leaderboard", () => {
  it("ranks in order, medals the first three, and opens a row", async () => {
    const open = vi.fn()
    const { container } = render(
      <Leaderboard
        label="Top agents"
        rows={["Layla", "Karim", "Sara", "Omar"].map((name) => ({
          name,
          metrics: [{ label: "Quality", value: "97%", tone: "ok" as const }],
          onOpen: name === "Layla" ? open : undefined,
        }))}
      />
    )
    const list = screen.getByRole("list", { name: "Top agents" })
    expect(list.tagName).toBe("OL")
    expect(container.querySelector(".qa-lead-rank.r1")).toHaveTextContent("1")
    expect(container.querySelectorAll(".qa-lead-rank.r1, .qa-lead-rank.r2, .qa-lead-rank.r3")).toHaveLength(3)
    await userEvent.click(screen.getByRole("button", { name: /Layla/ }))
    expect(open).toHaveBeenCalledOnce()
    expect(await a11yViolations(container)).toEqual([])
  })
})
