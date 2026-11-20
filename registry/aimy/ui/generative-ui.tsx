"use client"

import { BarChart3, Calendar, FileText, LayoutGrid, type LucideIcon, Table2, Users, Wallet } from "lucide-react"
import { Component, type ReactNode, useEffect, useMemo } from "react"
import { Button } from "@/components/button"
import { DataTable } from "@/components/data-table"
import { DescriptionList } from "@/components/description-list"
import { Donut } from "@/components/donut"
import { KpiWidget } from "@/components/kpi-widget"
import { Notice } from "@/components/notice"
import { RankedList } from "@/components/ranked-list"
import { StatTile, StatTiles } from "@/components/stat-tile"
import { Tag } from "@/components/tag"
import { TargetBar } from "@/components/target-bar"
import { TrendChart } from "@/components/trend-chart"
import { WidgetFrame } from "@/components/widget-frame"
import { type UiCatalog, type UiNode, checkUi, parsePartialJson } from "@/lib/generative-ui"
import { cn } from "@/lib/utils"

// AiMY's answer as interface: a spec from the model, drawn only with library
// parts, so it is on brand and accessible by construction and no model code
// runs. Pass spec (a finished answer) or stream (the JSON so far): a
// streaming answer draws each part as soon as it is whole. Anything the
// catalogue doesn't allow is left out and handed to onProblems, to send back
// to the model. Buttons in an answer call onAction; nothing acts by itself.

const ICONS: Record<string, LucideIcon> = { chart: BarChart3, table: Table2, people: Users, calendar: Calendar, document: FileText, money: Wallet, grid: LayoutGrid }
const TONE3 = ["ok", "warn", "err"] as const
const str = (description: string, optional = false) => ({ type: "string" as const, description, optional })
const num = (description: string, optional = false) => ({ type: "number" as const, description, optional })

/** The parts an answer may use, with their props. Extend it with your own parts and renderers. */
export const AIMY_UI: UiCatalog = {
  Stack: { description: "Parts one under the other.", props: { gap: { type: "string", description: "Space between", enum: ["tight", "normal"], optional: true } }, children: true },
  Columns: { description: "Parts side by side (stacked on a phone).", props: { count: { type: "number", description: "How many columns", enum: [2, 3], optional: true } }, children: true },
  Widget: {
    description: "A titled frame around a widget, as AiMY's chat widgets.",
    props: { title: str("What it shows"), icon: { type: "string", description: "Its icon", enum: Object.keys(ICONS), optional: true }, meta: str("A short note after the title: a date range, a count", true) },
    children: true,
  },
  Heading: { description: "A short heading over a group.", props: { text: str("The heading") } },
  Text: { description: "A sentence or two.", props: { text: str("The words") } },
  Notice: {
    description: "Something the person should know first, in a tinted box.",
    props: { tone: { type: "string", description: "What kind", enum: ["neutral", "info", "ok", "warn", "err"], optional: true }, title: str("A few words", true), text: str("The message") },
  },
  StatTiles: {
    description: "Up to four figures side by side, each saying what it means.",
    props: {
      items: {
        type: "array",
        description: "The figures",
        max: 4,
        items: {
          type: "object",
          description: "One figure",
          props: { label: str("What it counts"), value: str("The figure, formatted: 42, 18%, $12k"), sub: str("What it means: against a usual day, what is needed, or a target someone set"), tone: { type: "string", description: "Good, watch or bad", enum: TONE3, optional: true } },
        },
      },
    },
  },
  Facts: {
    description: "Terms and their details, like a record's fields.",
    props: {
      items: {
        type: "array",
        description: "The facts",
        max: 16,
        items: { type: "object", description: "One fact", props: { term: str("The name"), detail: str("Its value", true), note: str("A line under it", true), tone: { type: "string", description: "Colour of the detail", enum: TONE3, optional: true } } },
      },
      form: { type: "string", description: "Term beside or above its detail", enum: ["beside", "stacked"], optional: true },
    },
  },
  Table: {
    description: "Rows and columns; for more than a handful of items with the same fields.",
    props: {
      label: str("What the table lists"),
      columns: { type: "array", description: "The columns", max: 8, items: { type: "object", description: "One column", props: { key: str("The row key it shows"), header: str("Its heading"), end: { type: "boolean", description: "Right-align (numbers)", optional: true } } } },
      rows: { type: "array", description: "The rows", max: 100, items: { type: "record", description: "A row: column key to text or number" } },
    },
  },
  Ranked: {
    description: "A ranked list of things to act on, each with why it ranks there.",
    props: {
      label: str("What is ranked"),
      items: {
        type: "array",
        description: "Best first",
        max: 10,
        items: { type: "object", description: "One item", props: { id: str("Unique id"), title: str("Its name"), details: str("A short line", true), reason: str("Why it ranks here", true), match: num("How well it fits, 0 to 100", true) } },
      },
    },
  },
  Donut: {
    description: "How a whole splits into a few parts.",
    props: {
      label: str("What the whole is"),
      parts: {
        type: "array",
        description: "The parts",
        max: 6,
        items: { type: "object", description: "One part", props: { key: str("Unique key"), label: str("Its name"), value: num("Its size"), tone: { type: "string", description: "Its colour", enum: ["ok", "warn", "err", "accent", "neutral"] } } },
      },
      center: { type: "object", description: "In the middle", optional: true, props: { value: str("A figure", true), label: str("What it is") } },
    },
  },
  Kpi: {
    description: "One measure over time with its state and goal.",
    props: {
      label: str("The measure"),
      value: str("Its current value, formatted"),
      sub: str("What it means", true),
      state: { type: "object", description: "Its state in a word", optional: true, props: { word: str("On track, Behind…"), tone: { type: "string", description: "Its colour", enum: TONE3, optional: true } } },
      series: { type: "array", description: "Values over time, oldest first", max: 60, items: num("A value") },
      goal: { type: "object", description: "A goal someone set", optional: true, props: { value: num("The goal"), label: str("Its name", true) } },
      summary: str("The chart in one sentence, for screen readers"),
    },
  },
  Trend: {
    description: "A line over time, optionally against the period before.",
    props: {
      title: str("What it shows", true),
      labels: { type: "array", description: "The points' names (months, weeks)", max: 60, items: str("A name") },
      values: { type: "array", description: "One value per label", max: 60, items: num("A value") },
      previous: { type: "array", description: "The period before, to compare", optional: true, max: 60, items: num("A value") },
      goal: { type: "object", description: "A goal someone set", optional: true, props: { value: num("The goal"), label: str("Its name") } },
      unit: { type: "string", description: "How to show the numbers (default count)", enum: ["count", "percent", "money"], optional: true },
    },
  },
  Target: {
    description: "Progress towards a target, with the forecast.",
    props: {
      value: num("Where it is now"),
      target: num("The target someone set"),
      forecast: num("Where it is heading", true),
      unit: { type: "string", description: "How to show the numbers", enum: ["count", "percent", "money"], optional: true },
    },
  },
  Tags: {
    description: "A few short labels.",
    props: { items: { type: "array", description: "The labels", max: 12, items: { type: "object", description: "One label", props: { text: str("The words"), tone: { type: "string", description: "Its colour", enum: ["neutral", "ok", "warn", "err", "info", "ai"], optional: true } } } } },
  },
  Actions: {
    description: "Buttons for what to do next; the app decides what each does.",
    props: {
      buttons: {
        type: "array",
        description: "At most three; the main one last",
        max: 3,
        items: { type: "object", description: "One button", props: { label: str("What it does, as a verb"), action: str("Its action name for the app"), payload: str("Anything the app needs with it", true), primary: { type: "boolean", description: "The main action", optional: true } } },
      },
    },
  },
}

type P = Record<string, unknown>
type Ctx = { onAction?: (action: string, payload?: string) => void }
type Renderer = (props: P, children: ReactNode, ctx: Ctx) => ReactNode

const fmt = (unit: unknown) => (n: number) =>
  unit === "percent" ? `${Math.round(n)}%` : unit === "money" ? new Intl.NumberFormat("en", { notation: "compact", style: "currency", currency: "USD" }).format(n) : new Intl.NumberFormat("en").format(n)

/** How each catalogue part is drawn. */
export const AIMY_UI_RENDER: Record<string, Renderer> = {
  Stack: (p, c) => <div className={cn("flex flex-col", p.gap === "tight" ? "gap-2" : "gap-4")}>{c}</div>,
  // On the room the answer has (a chat drawer is narrow on a wide screen), not the window's.
  Columns: (p, c) => (
    <div className="@container">
      <div className={cn("grid gap-3", p.count === 3 ? "@min-[44rem]:grid-cols-3 @min-[30rem]:grid-cols-2" : "@min-[30rem]:grid-cols-2")}>{c}</div>
    </div>
  ),
  Widget: (p, c) => {
    const Icon = ICONS[String(p.icon ?? "grid")] ?? LayoutGrid
    return (
      <WidgetFrame icon={<Icon aria-hidden="true" strokeWidth={2} />} title={String(p.title)} meta={p.meta as string | undefined}>
        <div className="flex flex-col gap-4">{c}</div>
      </WidgetFrame>
    )
  },
  Heading: (p) => <h3 className="text-base font-semibold text-ink">{String(p.text)}</h3>,
  Text: (p) => <p className="text-base text-ink">{String(p.text)}</p>,
  Notice: (p) => (
    <Notice tone={p.tone as "info" | undefined} title={p.title as string | undefined}>
      {String(p.text)}
    </Notice>
  ),
  StatTiles: (p) => (
    <StatTiles>
      {(p.items as P[]).map((t, i) => (
        <StatTile key={i} label={String(t.label)} value={String(t.value)} sub={t.sub as string} tone={t.tone as "ok" | undefined} />
      ))}
    </StatTiles>
  ),
  Facts: (p) => (
    <DescriptionList
      form={p.form as "beside" | undefined}
      items={(p.items as P[]).map((f) => ({ term: String(f.term), detail: f.detail as string | undefined, note: f.note as string | undefined, tone: f.tone as "ok" | undefined }))}
    />
  ),
  Table: (p) => {
    const rows = (p.rows as Record<string, string | number>[]).map((r, i) => ({ ...r, __row: String(i) }))
    const columns = (p.columns as P[]).map((c) => ({ key: String(c.key), header: String(c.header), end: !!c.end, cell: (r: Record<string, string | number>) => r[String(c.key)] ?? "" }))
    return <DataTable label={String(p.label)} rows={rows} columns={columns} rowKey={(r) => String(r.__row)} form="table" />
  },
  Ranked: (p) => <RankedList label={String(p.label)} items={(p.items as P[]).map((i) => ({ id: String(i.id), title: String(i.title), details: i.details as string, reason: i.reason as string, match: i.match as number }))} />,
  Donut: (p) => <Donut label={String(p.label)} parts={p.parts as never} center={p.center as never} />,
  Kpi: (p) => (
    <KpiWidget
      label={String(p.label)}
      value={String(p.value)}
      sub={p.sub as string | undefined}
      state={p.state as never}
      series={p.series as number[]}
      goal={p.goal as never}
      summary={String(p.summary)}
    />
  ),
  Trend: (p) => {
    const labels = p.labels as string[]
    const values = (p.values as number[]).slice(0, labels.length)
    return <TrendChart title={p.title as string | undefined} goal={p.goal as never} format={fmt(p.unit)} ranges={[{ key: "all", label: "All", labels: labels.slice(0, values.length), scores: values, prev: p.previous as number[] | undefined }]} />
  },
  Target: (p) => <TargetBar value={Number(p.value)} target={Number(p.target)} forecast={p.forecast as number | undefined} format={fmt(p.unit)} />,
  Tags: (p) => (
    <div className="flex flex-wrap gap-1.5">
      {(p.items as P[]).map((t, i) => (
        <Tag key={i} tone={(t.tone as "ok" | undefined) ?? "neutral"}>
          {String(t.text)}
        </Tag>
      ))}
    </div>
  ),
  Actions: (p, _c, ctx) => (
    <div className="flex flex-wrap justify-end gap-2">
      {(p.buttons as P[]).map((b, i) => (
        <Button key={i} size="sm" variant={b.primary ? "brand" : undefined} onClick={() => ctx.onAction?.(String(b.action), b.payload as string | undefined)}>
          {String(b.label)}
        </Button>
      ))}
    </div>
  ),
}

// One part that throws (data the catalogue allowed but the part can't
// draw) is left out; the rest of the answer still shows.
class PartBoundary extends Component<{ children: ReactNode; onError: (e: Error) => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e: Error) {
    this.props.onError(e)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

type GenerativeUIProps = {
  /** A finished answer: the spec as an object or JSON text. */
  spec?: unknown
  /** An answer still arriving: the JSON text so far. Parts draw as soon as they are whole. */
  stream?: string
  catalog?: UiCatalog
  render?: Record<string, Renderer>
  /** What a button in the answer does. */
  onAction?: (action: string, payload?: string) => void
  /** What was left out, as sentences to send back to the model. Called when the answer is finished. */
  onProblems?: (problems: string[]) => void
  className?: string
}

export function GenerativeUI({ spec, stream, catalog = AIMY_UI, render = AIMY_UI_RENDER, onAction, onProblems, className }: GenerativeUIProps) {
  const streaming = stream !== undefined
  const raw = useMemo(() => (streaming ? parsePartialJson(stream) : typeof spec === "string" ? parsePartialJson(spec) : spec), [streaming, stream, spec])
  const checked = useMemo(() => checkUi(raw, catalog, { partial: streaming }), [raw, catalog, streaming])
  const problemsKey = checked.problems.join("\n")
  useEffect(() => {
    if (!streaming) onProblems?.(problemsKey ? problemsKey.split("\n") : [])
  }, [streaming, problemsKey, onProblems])

  const draw = (n: UiNode, key: string): ReactNode => {
    const r = Object.hasOwn(render, n.type) ? render[n.type] : undefined
    if (!r) return null
    const kids = n.children?.map((c, i) => draw(c, `${key}.${i}`))
    return (
      <PartBoundary key={key} onError={(e) => onProblems?.([`${n.type}: couldn't be drawn (${e.message})`])}>
        <div
          data-part={n.type}
          className="flex min-w-0 flex-col transition-[opacity,translate] duration-(--t-slow) ease-out motion-reduce:transition-none starting:translate-y-1.5 starting:opacity-0 [&>*]:flex-1"
        >
          {r(n.props, kids, { onAction })}
        </div>
      </PartBoundary>
    )
  }

  return (
    <div data-slot="generative-ui" aria-busy={streaming || undefined} className={cn("flex flex-col gap-4", className)}>
      {checked.node ? draw(checked.node, "0") : null}
    </div>
  )
}
