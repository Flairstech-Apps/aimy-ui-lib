import { useState } from "react"
import { Button } from "@/components/button"
import { DataTable, TableEmpty, type Column, type SortState } from "@/components/data-table"
import { StatTile, StatTiles } from "@/components/stat-tile"
import { TargetBar } from "@/components/target-bar"
import { Tag } from "@/components/tag"
import { toast } from "@/components/toast"

// The Customers tab: the book in four figures, then every customer in rows
// that sort and select. Selecting some offers one action on them, with undo.
type Customer = {
  id: string
  name: string
  owner: string
  renews: string
  month: number
  worth: number
  state: "ok" | "warn" | "err"
}

const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Kestrel Logistics",
    owner: "Engy Hassan",
    renews: "Nov 2026",
    month: 11,
    worth: 48000,
    state: "ok",
  },
  { id: "c2", name: "Harbour Foods", owner: "Engy Hassan", renews: "Dec 2026", month: 12, worth: 22500, state: "warn" },
  { id: "c3", name: "Northgate Health", owner: "Omar Said", renews: "Jan 2027", month: 13, worth: 61000, state: "ok" },
  {
    id: "c4",
    name: "Brightline Retail",
    owner: "Lina Farouk",
    renews: "Nov 2026",
    month: 11,
    worth: 15800,
    state: "err",
  },
  { id: "c5", name: "Ashby Freight", owner: "Omar Said", renews: "Mar 2027", month: 15, worth: 35100, state: "ok" },
]
const STATE = { ok: "On track", warn: "Quiet for 3 weeks", err: "Asked to cancel" } as const
const euro = (n: number) => `€${n.toLocaleString("en-GB")}`

const COLUMNS: Column<Customer>[] = [
  { key: "name", header: "Customer", cell: (c) => c.name, sort: (a, b) => a.name.localeCompare(b.name) },
  { key: "owner", header: "Owner", width: "9rem", cell: (c) => c.owner },
  { key: "renews", header: "Renews", width: "6.5rem", cell: (c) => c.renews, sort: (a, b) => a.month - b.month },
  {
    key: "worth",
    header: "Worth",
    width: "6rem",
    end: true,
    cell: (c) => euro(c.worth),
    sort: (a, b) => a.worth - b.worth,
  },
  {
    key: "state",
    header: "Where it stands",
    width: "auto",
    end: true,
    cell: (c) => <Tag tone={c.state}>{STATE[c.state]}</Tag>,
  },
]

export function Customers() {
  const [picked, setPicked] = useState<string[]>([])
  const [rows, setRows] = useState(CUSTOMERS)
  const [sort, setSort] = useState<SortState>(null)
  const total = rows.reduce((n, c) => n + c.worth, 0)
  const soon = rows.filter((c) => c.month === 11)
  return (
    <div className="flex flex-col gap-6">
      <TargetBar
        arriving
        value={total}
        target={300000}
        forecast={total + 64000}
        elapsed={0.61}
        format={(n) => `€${Math.round(n / 1000)}k`}
        labels={{ value: "Renewed" }}
      />
      <StatTiles>
        <StatTile label="Customers" value={rows.length} sub="28 in the full book" />
        <StatTile label="Worth" value={euro(total)} sub="was €160,000 a year ago" />
        <StatTile
          label="Renew this month"
          value={soon.length}
          sub="sort by when they renew"
          onClick={() => setSort({ key: "renews", dir: "asc" })}
        />
        <StatTile
          label="Asked to cancel"
          value={rows.filter((c) => c.state === "err").length}
          tone="err"
          sub="Brightline Retail, on 21 Oct"
        />
      </StatTiles>
      {picked.length ? (
        <div className="flex items-center gap-3 text-meta">
          <span>{picked.length} selected.</span>
          <Button
            size="sm"
            onClick={() => {
              const before = rows
              setRows((r) => r.filter((c) => !picked.includes(c.id)))
              setPicked([])
              toast(`${picked.length} moved to Archived`, { onUndo: () => setRows(before) })
            }}
          >
            Archive them
          </Button>
        </div>
      ) : null}
      <DataTable
        label="Customers"
        rows={rows}
        columns={COLUMNS}
        rowKey={(c) => c.id}
        rowName={(c) => c.name}
        selected={picked}
        onSelectedChange={setPicked}
        sort={sort}
        onSortChange={setSort}
        empty={
          <TableEmpty
            title="No customers here"
            action={
              <Button size="sm" onClick={() => setRows(CUSTOMERS)}>
                Bring them back
              </Button>
            }
          >
            Archived customers are under Archived.
          </TableEmpty>
        }
      />
    </div>
  )
}
