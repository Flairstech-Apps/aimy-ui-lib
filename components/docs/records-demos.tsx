"use client"

import { useState } from "react"
import { Button } from "@/registry/aimy/ui/button"
import { Confidence } from "@/registry/aimy/ui/confidence"
import { DataTable, SortHeader, TableEmpty, nextSort, type Column, type SortState } from "@/registry/aimy/ui/data-table"
import { DescriptionList, FactGroup, FactGroups } from "@/registry/aimy/ui/description-list"
import { StatTile, StatTiles } from "@/registry/aimy/ui/stat-tile"
import { Tag } from "@/registry/aimy/ui/tag"
import { Timeline, TimelineItem, TimelineMonth } from "@/registry/aimy/ui/timeline"
import { toast } from "@/registry/aimy/ui/toast"
import { VirtualList } from "@/registry/aimy/ui/virtual-list"

/* ── Stat tiles ───────────────────────────────────────────────────── */
export function StatTileDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StatTiles>
        <StatTile label="Booked" value="€182,400" sub="was €140,000 at signing" />
        <StatTile label="Meetings held" value="25" sub="of the 30 promised for the year" tone="ok" />
        <StatTile label="Callable" value="107" sub="38 you can call now" onClick={() => toast("Opens the 38")} />
        <StatTile label="No answer twice" value="12" sub="the sequence is still running past them" tone="warn" />
      </StatTiles>
      <StatTiles>
        <StatTile label="Contacts" value="1,240" sub="across 9 campaigns" />
        <StatTile
          label="Missed calls"
          value="3"
          sub="all from this morning"
          tone="err"
          onClick={() => toast("Opens the call log")}
        />
      </StatTiles>
    </div>
  )
}

/* ── Description lists ────────────────────────────────────────────── */
export function DescriptionListDemo() {
  const [checking, setChecking] = useState(false)
  return (
    <div className="flex flex-col gap-8">
      <FactGroups>
        <FactGroup
          title="Company"
          checking={checking}
          action={<Confidence level={checking ? "busy" : "ok"} group="Company" when="3 weeks ago" />}
        >
          <DescriptionList
            items={[
              { term: "Name", detail: "Kestrel Logistics" },
              { term: "Size", detail: "140 people" },
              { term: "Where", detail: "Leeds" },
              { term: "Founded", detail: null },
            ]}
          />
        </FactGroup>
        <FactGroup title="Role" action={<Confidence level="old" group="Role" checkedIn="March 2025" />}>
          <DescriptionList
            items={[
              { term: "Person", detail: "Dana Whitfield" },
              { term: "Title", detail: "Head of operations" },
              { term: "Reports to", detail: "the managing director" },
              { term: "Decides", detail: "Yes, with finance", tone: "ok" },
            ]}
          />
        </FactGroup>
      </FactGroups>
      <Button
        size="sm"
        className="self-start"
        onClick={() => {
          setChecking(true)
          window.setTimeout(() => setChecking(false), 2400)
        }}
      >
        Check the company again
      </Button>
      <div className="max-w-[22rem] rounded-lg px-6 py-1.5" style={{ background: "var(--aimy-wash)" }}>
        <DescriptionList
          form="stacked"
          items={[
            { term: "Pace", detail: "On track", tone: "ok", note: "62% used, 58% of the month gone" },
            { term: "Blocked", detail: "2 people", tone: "err", note: "Lina Farouk and Omar Said hit their limit" },
            {
              term: "Session limit",
              detail: "40 chats a day",
              action: (
                <Button size="sm" variant="text" onClick={() => toast("Edits the limit")}>
                  Edit
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

/* ── Timeline ─────────────────────────────────────────────────────── */
export function TimelineDemo() {
  return (
    <Timeline end="First called 24 Jun · 3 steps climbed">
      <TimelineMonth>October</TimelineMonth>
      <TimelineItem
        when="28 Oct, 10:42"
        by="Engy Hassan"
        outcome="Meeting set"
        tone="ok"
        move="Meeting"
        milestone
        ago="today"
        defaultOpen
      >
        <p>
          They asked for pricing on the annual plan. A meeting is set for 4 Nov at 14:00 with Dana and their finance
          lead.
        </p>
        <Tag tone="ok">Decides with finance</Tag>
      </TimelineItem>
      <TimelineItem when="21 Oct, 16:05" by="AiMY" ai outcome="Callback" tone="warn" ago="7 days ago">
        <p>Dana asked to be called back after the quarter closes. AiMY has put it in the diary for 28 Oct.</p>
      </TimelineItem>
      <TimelineMonth>September</TimelineMonth>
      <TimelineItem when="30 Sep, 09:15" by="Engy Hassan" outcome="No answer" ago="4 weeks ago">
        <p>Rang through to reception; nobody picked up.</p>
      </TimelineItem>
      <TimelineItem
        when="12 Sep, 11:30"
        by="Engy Hassan"
        outcome="Not interested"
        tone="err"
        move="Closed"
        moveOut
        ago="7 weeks ago"
      >
        <p>Wrong person: Dana's predecessor, who has since left.</p>
      </TimelineItem>
    </Timeline>
  )
}

/* ── Data table ───────────────────────────────────────────────────── */
type Run = { id: string; when: string; at: number; source: string; n: number; ok: boolean }
const RUNS: Run[] = [
  { id: "r1", when: "28 Oct, 09:12", at: 9, source: "SharePoint: Sales playbooks", n: 214, ok: true },
  { id: "r2", when: "27 Oct, 09:10", at: 8, source: "Google Drive: Pricing", n: 38, ok: false },
  { id: "r3", when: "26 Oct, 09:11", at: 7, source: "Confluence: Onboarding", n: 1290, ok: true },
  { id: "r4", when: "25 Oct, 09:09", at: 6, source: "SharePoint: Contracts", n: 77, ok: true },
]
const RUN_COLS: Column<Run>[] = [
  { key: "when", header: "When", width: "8.5rem", cell: (r) => r.when, sort: (a, b) => a.at - b.at },
  { key: "source", header: "Source", cell: (r) => r.source, sort: (a, b) => a.source.localeCompare(b.source) },
  {
    key: "n",
    header: "Documents",
    end: true,
    width: "auto",
    cell: (r) => r.n.toLocaleString("en-GB"),
    sort: (a, b) => a.n - b.n,
  },
  {
    key: "st",
    header: "Result",
    end: true,
    width: "auto",
    cell: (r) => (r.ok ? <Tag tone="ok">Synced</Tag> : <Tag tone="err">Failed</Tag>),
  },
]

export function DataTableRowsDemo() {
  const [picked, setPicked] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        label="Syncs"
        rows={RUNS}
        columns={RUN_COLS}
        rowKey={(r) => r.id}
        rowName={(r) => r.source}
        selected={picked}
        onSelectedChange={setPicked}
      />
      <p className="text-meta text-ink-secondary" aria-live="polite">
        {picked.length ? `${picked.length} selected.` : "Nothing selected."}
      </p>
    </div>
  )
}

type Person = { id: string; name: string; company: string; city: string; calls: number; last: string }
const FIRST = ["Amelia", "Youssef", "Dana", "Peter", "Lina", "Omar", "Sara", "Tom", "Nadia", "James"]
const LAST = ["Taylor", "Amin", "Whitfield", "Foster", "Farouk", "Said", "Haddad", "Reid", "Karim", "Moss"]
const CO = ["Kestrel Logistics", "Harbour Foods", "Northgate Health", "Brightline Retail", "Ashby Freight"]
const CITY = ["Leeds", "Bristol", "Manchester", "Glasgow", "Cardiff"]
const PEOPLE: Person[] = Array.from({ length: 24 }, (_, i) => ({
  id: `p${i}`,
  name: `${FIRST[i % 10]} ${LAST[(i * 3) % 10]}`,
  company: CO[i % 5] as string,
  city: CITY[(i * 2) % 5] as string,
  calls: (i * 7) % 5,
  last: `${(i % 27) + 1} Oct`,
}))
const PEOPLE_COLS: Column<Person>[] = [
  {
    key: "name",
    header: "Name",
    sub: "from LinkedIn",
    cell: (p) => p.name,
    sort: (a, b) => a.name.localeCompare(b.name),
  },
  { key: "company", header: "Company", sub: "from the register", cell: (p) => p.company },
  { key: "city", header: "City", cell: (p) => p.city },
  { key: "calls", header: "Calls", end: true, cell: (p) => p.calls, sort: (a, b) => a.calls - b.calls },
  { key: "last", header: "Last call", end: true, cell: (p) => (p.calls ? p.last : <i>none</i>) },
]

export function DataTableTableDemo() {
  const [picked, setPicked] = useState<string[]>(["p2"])
  return (
    <DataTable
      form="table"
      label="Contacts"
      rows={PEOPLE}
      columns={PEOPLE_COLS}
      rowKey={(p) => p.id}
      rowName={(p) => p.name}
      selected={picked}
      onSelectedChange={setPicked}
      stickyHead
      maxHeight="18rem"
    />
  )
}

export function DataTableSortBarDemo() {
  const [sort, setSort] = useState<SortState>(null)
  const [rows, setRows] = useState(RUNS)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-5">
        <span className="text-meta text-ink-secondary">Sort</span>
        {(["when", "source", "n"] as const).map((k) => (
          <SortHeader
            key={k}
            label={k === "when" ? "When" : k === "source" ? "Source" : "Documents"}
            dir={sort?.key === k ? sort.dir : undefined}
            onClick={() => setSort(nextSort(sort, k))}
          />
        ))}
      </div>
      <DataTable
        label="Syncs, sorted from the bar"
        rows={rows}
        columns={RUN_COLS.map((c) => ({ ...c, sort: undefined }))}
        rowKey={(r) => r.id}
        empty={
          <TableEmpty
            title="No syncs yet"
            action={
              <Button size="sm" onClick={() => setRows(RUNS)}>
                Run the first sync
              </Button>
            }
          >
            Connect a source and AiMY reads it every morning at 09:00.
          </TableEmpty>
        }
        sort={sort}
        onSortChange={setSort}
      />
      <Button size="sm" className="self-start" onClick={() => setRows((r) => (r.length ? [] : RUNS))}>
        {rows.length ? "Show it empty" : "Bring the rows back"}
      </Button>
    </div>
  )
}

/* ── Windowed list ────────────────────────────────────────────────── */
const MANY = Array.from({ length: 5000 }, (_, i) => ({
  id: `q${i}`,
  name: `${FIRST[i % 10]} ${LAST[(i * 7) % 10]}`,
  company: CO[(i * 3) % 5] as string,
  n: i + 1,
}))

export function VirtualListDemo() {
  const [at, setAt] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setAt((a) => Math.max(0, a - 1))}>
          Up
        </Button>
        <Button size="sm" onClick={() => setAt((a) => Math.min(MANY.length - 1, a + 1))}>
          Down
        </Button>
        <Button size="sm" onClick={() => setAt(2500)}>
          Go to 2,500
        </Button>
        <span className="text-meta text-ink-secondary" aria-live="polite">
          On {(at + 1).toLocaleString("en-GB")} of {MANY.length.toLocaleString("en-GB")}
        </span>
      </div>
      <div className="max-h-[22rem] overflow-y-auto rounded-lg bg-card px-4">
        <VirtualList
          label="The queue"
          items={MANY}
          rowKey={(p) => p.id}
          cursor={at}
          renderRow={(p) => (
            <div className="flex items-baseline gap-3 px-1 text-meta">
              <span className="w-12 text-ink-secondary tabular-nums">{p.n.toLocaleString("en-GB")}</span>
              <span className="font-semibold text-d50">{p.name}</span>
              <span className="text-ink-secondary">{p.company}</span>
            </div>
          )}
        />
      </div>
    </div>
  )
}
