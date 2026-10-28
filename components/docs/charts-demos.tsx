"use client"

import { useState } from "react"
import { AimyNote } from "@/registry/aimy/ui/aimy-note"
import { Button } from "@/registry/aimy/ui/button"
import { Donut } from "@/registry/aimy/ui/donut"
import { Funnel } from "@/registry/aimy/ui/funnel"
import { Heatmap } from "@/registry/aimy/ui/heatmap"
import { KpiWidget, KpiWidgets } from "@/registry/aimy/ui/kpi-widget"
import { Leaderboard } from "@/registry/aimy/ui/leaderboard"
import { ScoreTile } from "@/registry/aimy/ui/score-tile"
import { Sparkline } from "@/registry/aimy/ui/sparkline"
import { TargetBar } from "@/registry/aimy/ui/target-bar"
import { toast } from "@/registry/aimy/ui/toast"
import { TrendChart, type TrendRange } from "@/registry/aimy/ui/trend-chart"

/* ── KPI widget ───────────────────────────────────────────────────── */
const ANSWERED = [51, 52, null, 55, 54, 57, 58, 56, 60, 61, 63, 62, 65, 64]
const HANDLE = [7.9, 7.6, 7.7, 7.2, 7.0, 6.8, 6.9, 6.5, 6.4, 6.1, 6.2, 5.9, 5.8, 5.6]

export function KpiWidgetDemo() {
  return (
    <KpiWidgets>
      <KpiWidget
        label="Calls answered"
        value="64%"
        sub="51% at signing · 70% promised"
        state={{ word: "behind", tone: "warn" }}
        series={ANSWERED}
        goal={{ value: 70 }}
        format={(v) => `${v}%`}
        start="Signing"
        keyLabel="Now · 4 weeks averaged"
        summary="Calls answered: 51% at signing, 64% now across the last 4 weeks, 70% promised, behind."
        note={
          <AimyNote variant="quiet">
            Six points short, and closing about one a week. At this pace it lands in mid December.
          </AimyNote>
        }
      />
      <KpiWidget
        label="Minutes to handle a call"
        value="5.8"
        sub="7.9 at signing · 6.5 promised"
        state={{ word: "kept", tone: "ok" }}
        series={HANDLE}
        goal={{ value: 6.5 }}
        format={(v) => `${v} min`}
        start="Signing"
        keyLabel="Now · 4 weeks averaged"
        summary="Minutes to handle a call: 7.9 at signing, 5.8 now across the last 4 weeks, 6.5 promised, kept."
        note={<AimyNote variant="quiet">Under the promise since week 8, mostly from shorter holds.</AimyNote>}
      />
    </KpiWidgets>
  )
}

/* ── Progress to target ───────────────────────────────────────────── */
const euro = (n: number) => `€${Math.round(n / 1000)}k`

export function TargetBarDemo() {
  const [run, setRun] = useState(0)
  return (
    <div className="flex flex-col gap-10">
      <TargetBar key={run} arriving value={182400} target={300000} forecast={268000} elapsed={0.61} format={euro} />
      <TargetBar value={318000} target={300000} format={euro} labels={{ value: "Signed" }} />
      <Button size="sm" className="self-start" onClick={() => setRun((r) => r + 1)}>
        Play the arrival again
      </Button>
    </div>
  )
}

/* ── Funnel ───────────────────────────────────────────────────────── */
export function FunnelDemo() {
  const [run, setRun] = useState(0)
  return (
    <div className="flex flex-col gap-8">
      <Funnel
        key={run}
        arriving
        label="Where the 240 people on this campaign are"
        head={{ name: "Step", n: "People" }}
        total={240}
        rows={[
          { name: "Not called yet", n: 53, tone: "neutral" },
          { name: "Called", n: 187, tone: "neutral" },
          { name: "Talked", n: 92, tone: "neutral" },
          { name: "Meeting set", n: 31, tone: "ok" },
          { name: "No answer twice", n: 12, tone: "warn" },
        ]}
      />
      <div className="flex flex-col gap-2">
        <p className="text-meta text-ink-secondary">Of the 92 who talked, how many got further:</p>
        <Funnel
          form="steps"
          label="How far the 92 who talked got"
          rows={[
            { name: "Asked for pricing", n: 58, of: 92, tone: "accent" },
            { name: "Booked a demo", n: 31, of: 92, tone: "ok" },
            { name: "Signed", n: 4, of: 92, tone: "ok" },
          ]}
        />
      </div>
      <Button size="sm" className="self-start" onClick={() => setRun((r) => r + 1)}>
        Play the arrival again
      </Button>
    </div>
  )
}

/* ── Sparkline ────────────────────────────────────────────────────── */
export function SparklineDemo() {
  return (
    <div className="flex max-w-[32rem] flex-col gap-4 rounded-lg p-5" style={{ background: "var(--aimy-wash)" }}>
      <p className="text-meta font-semibold">Since the tone changed to “Short and direct”</p>
      <Sparkline
        before={[31, 33, 30, 34, 32, 33, 31]}
        after={[28, 25, 22, 21, 19, 20]}
        label="Follow-up questions a day: about 32 before 14 Oct and about 21 after"
        start="Follow-up questions a day, 1 Oct"
        at="Tone changed 14 Oct"
        end="Today"
      />
    </div>
  )
}

/* ── QA: score tile and trend chart ───────────────────────────────── */
const YTD = {
  key: "ytd",
  label: "YTD",
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  scores: [82, 85, 84, 86, 91, 87, 87, 88, 88, 86, 74, 87],
  prev: [80, 79, 82, 81, 84, 83, 85, 84, 86, 85, 83, 84],
  flags: [10],
}
const RANGES: TrendRange[] = [
  YTD,
  { key: "90d", label: "90D", labels: ["Oct", "Nov", "Dec"], scores: [86, 74, 87], prev: [85, 83, 84], flags: [1] },
  { key: "30d", label: "30D", labels: ["W1", "W2", "W3", "W4"], scores: [85, 88, 86, 87], prev: [84, 85, 83, 84] },
  {
    key: "7d",
    label: "7D",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    scores: [86, 88, 85, 89, 87, 90, 87],
    prev: [84, 85, 85, 86, 84, 86, 85],
  },
]

export function ScoreTileDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <ScoreTile
        className="max-w-[24rem]"
        label="Quality score"
        value="87.3%"
        tone="warn"
        sub={
          <>
            <strong>2.7</strong> under the <strong>90%</strong> goal
          </>
        }
        trend={{ dir: "up", amount: "5.2%", vs: "vs last period" }}
        series={YTD.scores}
        goal={90}
        source="Real audit data · YTD"
        open={open}
        onToggle={() => setOpen((o) => !o)}
        controls="score-trend-panel"
      />
      <section id="score-trend-panel" hidden={!open} className="rounded-xl border border-card-border bg-card p-6">
        <TrendChart title="Quality score" goal={{ value: 90, label: "SLA 90%" }} ranges={RANGES} arriving />
      </section>
    </div>
  )
}

export function TrendChartDemo() {
  return (
    <TrendChart
      title="Quality score"
      goal={{ value: 90, label: "SLA 90%" }}
      ranges={RANGES}
      pointNote={(r, i) => (r.flags?.includes(i) ? "AiMY looked into this dip" : undefined)}
      actions={
        <Button size="sm" variant="text" onClick={() => toast("Asks AiMY about this chart")}>
          Ask AiMY about this chart
        </Button>
      }
    />
  )
}

export function TrendChartEmptyDemo() {
  return <TrendChart title="Quality score" ranges={[{ key: "7d", label: "7D", labels: [], scores: [] }]} />
}

/* ── QA: donut ────────────────────────────────────────────────────── */
export function DonutDemo() {
  return (
    <Donut
      label="How 412 evaluations went"
      center={{ label: "Pass rate" }}
      parts={[
        { key: "pass", label: "Pass", value: 297, tone: "ok", center: "Pass rate" },
        { key: "border", label: "Borderline", value: 45, tone: "warn", center: "Borderline" },
        { key: "fail", label: "Fail", value: 70, tone: "err", center: "Fail rate" },
      ]}
      onPick={(k) => toast(`Asks AiMY why: ${k}`)}
    />
  )
}

/* ── QA: heatmap ──────────────────────────────────────────────────── */
const WEEKS = Array.from({ length: 12 }, (_, i) => `W${i + 1}`)
export function HeatmapDemo() {
  return (
    <Heatmap
      label="Quality by goal, last 12 weeks"
      columns={WEEKS}
      rows={[
        { name: "Follow-up SOP", values: [88, 84, 79, 82, 86, 90, 85, 87, 83, 88, 91, 89] },
        { name: "Resolution confirmed", values: [76, 74, 72, 78, 81, 83, 80, 84, 82, 85, 86, 84] },
        { name: "Ticket categorisation", values: [91, 92, 90, 93, 89, 92, 94, 93, 90, 92, 93, 95] },
        {
          name: "Empathy and tone",
          values: [66, 64, 68, 71, 74, 79, 82, 83, 81, 85, 84, 86],
          coached: { 3: "Empathy coaching session, 14 Mar" },
        },
        { name: "Identity verification", values: [95, 96, null, 94, 97, 96, 95, 98, 97, 96, 97, 98] },
        {
          name: "Survey promotion",
          values: [58, 62, 61, 65, 63, 69, 72, 70, 74, 73, 77, 79],
          coached: { 6: "Script change, 4 Apr" },
        },
      ]}
    />
  )
}

/* ── QA: leaderboard ──────────────────────────────────────────────── */
export function LeaderboardDemo() {
  const open = (n: string) => () => toast(`Opens ${n}`)
  return (
    <Leaderboard
      label="Top 5 agents this month"
      rows={[
        {
          name: "Layla Mansour",
          metrics: [
            { label: "Quality", value: "97%", tone: "ok" },
            { label: "CSAT", value: "96%" },
          ],
          onOpen: open("Layla"),
        },
        {
          name: "Karim Haddad",
          metrics: [
            { label: "Quality", value: "95%", tone: "ok" },
            { label: "CSAT", value: "93%" },
          ],
          onOpen: open("Karim"),
        },
        {
          name: "Sara Nabil",
          metrics: [
            { label: "Quality", value: "94%", tone: "ok" },
            { label: "CSAT", value: "95%" },
          ],
          onOpen: open("Sara"),
        },
        {
          name: "Omar Fathy",
          metrics: [
            { label: "Quality", value: "92%", tone: "ok" },
            { label: "CSAT", value: "90%" },
          ],
          onOpen: open("Omar"),
        },
        {
          name: "Mona Adel",
          metrics: [
            { label: "Quality", value: "91%", tone: "ok" },
            { label: "CSAT", value: "92%" },
          ],
          onOpen: open("Mona"),
        },
      ]}
    />
  )
}
