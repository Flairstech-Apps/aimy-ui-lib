"use client"

import { Database, Flag, LayoutGrid, List, Settings, Settings2, Sun, Table, User, Users } from "lucide-react"
import { useState } from "react"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { AppShell, Page, PageHead } from "@/registry/aimy/ui/app-shell"
import { Message } from "@/registry/aimy/ui/message"
import { ScrollDot } from "@/registry/aimy/ui/scroll-dot"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Rail, RailDoor, RailDoors, RailLink } from "@/registry/aimy/ui/rail"
import { SideNav, SideNavRead, type SideNavPage } from "@/registry/aimy/ui/side-nav"
import { StatTile, StatTiles } from "@/registry/aimy/ui/stat-tile"
import { toast } from "@/registry/aimy/ui/toast"
import { Topnav } from "@/registry/aimy/ui/topnav"
import { ShellBar } from "./shell-demos"

const PRODUCTS = [
  { label: "Knowledge", onSelect: () => toast("Opens Knowledge") },
  { label: "Sales", onSelect: () => toast("Opens Sales") },
  { label: "QA", current: true },
]

const PAGES: SideNavPage[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "#dashboard",
    icon: <LayoutGrid strokeWidth={2} />,
    current: true,
    badge: 2,
    tip: "29 points below target",
    findings: [
      { fig: "29", text: "points below target on empathy", active: true },
      { fig: "4", text: "agents need coaching this week" },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "#reviews",
    icon: <Settings2 strokeWidth={2} />,
    badge: 12,
    tip: "12 calls waiting for review",
    findings: [
      { fig: "12", text: "calls waiting for review", href: "#reviews", bar: 0.62 },
      { fig: "5", text: "disputed scores", href: "#disputes", bar: 0.26 },
      { fig: "2", text: "past the 48-hour promise", href: "#late", bar: 0.1 },
    ],
  },
  { id: "goals", label: "Goal Hub", href: "#goals", icon: <Table strokeWidth={2} />, tip: "3 goals end this month" },
  { id: "data", label: "Data", href: "#data", icon: <Database strokeWidth={2} />, tip: "Synced 09:12" },
  { id: "settings", label: "Settings", href: "#settings", icon: <Settings strokeWidth={2} /> },
  { id: "profile", label: "My Profile", href: "#profile", icon: <User strokeWidth={2} /> },
]

const WIDTHS = [
  { value: "100%", label: "Full" },
  { value: "820px", label: "820" },
  { value: "390px", label: "390" },
]

export function QaSideNavDemo() {
  const [w, setW] = useState("100%")
  return (
    <div className="flex flex-col gap-4">
      <Segmented label="Shell width" options={WIDTHS} value={w} onValueChange={setW} />
      <div
        className="overflow-hidden rounded-xl border border-edge"
        style={{ width: w, maxWidth: "100%", ["--shell-h" as string]: "38rem" }}
      >
        <AppShell
          topnav={
            <Topnav
              logo={<AimyMark variant="lockup" title="AiMY QA" className="h-7" />}
              products={PRODUCTS}
              actions={<ShellBar />}
            />
          }
          nav={
            <SideNav
              variant="qa"
              pages={PAGES}
              summary="6 insights"
              count={6}
              label="QA pages"
              storageKey="aimy-docs-side-nav"
              breakpoint={900}
              onNavigate={(href) => toast(`Opens ${href.slice(1)}`)}
            />
          }
        >
          <Page>
            <PageHead title="Dashboard" stamp="Read 09:12" />
            <StatTiles>
              <StatTile label="Empathy" value="61" sub="29 points below the 90 target" tone="warn" />
              <StatTile label="Reviewed" value="148" sub="of 160 calls this week" />
              <StatTile label="Coaching" value="4" sub="agents need it this week" />
            </StatTiles>
          </Page>
        </AppShell>
      </div>
    </div>
  )
}

const SALES_PRODUCTS = [
  { label: "Knowledge", onSelect: () => toast("Opens Knowledge") },
  { label: "Sales", current: true },
  { label: "QA", onSelect: () => toast("Opens QA") },
]

// Sales' four tabs for a desk with a book, each with the reading AiMY gives on it (tabRead in bdr.js).
const SALES_TABS = [
  {
    id: "today",
    label: "Today",
    icon: <Sun strokeWidth={2} />,
    read: (
      <SideNavRead state="staged" action={{ label: "Show the 5", onClick: () => toast("Opens the 5 callbacks") }}>
        <b>5 people</b> asked to be called back, across your 9 campaigns.
      </SideNavRead>
    ),
  },
  {
    id: "contacts",
    label: "Contacts",
    badge: 109,
    icon: <Users strokeWidth={2} />,
    read: (
      <SideNavRead state="staged" evidence={[{ val: 14, cap: "steps due this week" }]}>
        <b>3 contacts</b> have a next step past its date, out of the <b>109</b> here.
      </SideNavRead>
    ),
  },
  {
    id: "campaigns",
    label: "Campaigns",
    badge: 9,
    icon: <Flag strokeWidth={2} />,
    read: (
      <SideNavRead
        state="detected"
        tone="ok"
        evidence={[
          { val: 1, cap: "request waiting" },
          { val: 2, cap: "drafts" },
        ]}
      >
        <b>2 campaigns</b> close in the next two weeks, out of the <b>9</b> running.
      </SideNavRead>
    ),
  },
  {
    id: "lists",
    label: "Lists",
    badge: 11,
    icon: <List strokeWidth={2} />,
    read: (
      <SideNavRead state="staged" evidence={[{ val: 6, cap: "people with no number" }]}>
        <b>1 list</b> is on no campaign, so nobody on it is called yet.
      </SideNavRead>
    ),
  },
]

/**
 * Sales' tabs at the top of the rail: click one and its reading opens while the last one shuts.
 * The docs column is narrower than the shell's 1040px rung, where an AppShell turns its rail into a
 * drawer, so the frame draws the rail as the column Sales shows on a laptop.
 */
export function SideNavDemo() {
  const [on, setOn] = useState("today")
  const pages: SideNavPage[] = SALES_TABS.map((t) => ({ ...t, href: `#${t.id}`, current: t.id === on }))
  const here = SALES_TABS.find((t) => t.id === on)!
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-edge text-ink"
      style={{ height: "38rem", background: "var(--body-bg)", ["--rail-w" as string]: "20rem" }}
    >
      <Topnav
        logo={<AimyMark variant="lockup" title="AiMY Sales" className="h-7" />}
        products={SALES_PRODUCTS}
        actions={<ShellBar />}
      />
      <div className="flex min-h-0 flex-1">
        <Rail
          foot={
            <RailLink icon={<Settings aria-hidden="true" />} onClick={() => toast("Opens the console")}>
              Console
            </RailLink>
          }
        >
          <SideNav pages={pages} label="Sales pages" onNavigate={(href) => setOn(href.slice(1))} />
          <RailDoors>
            <RailDoor
              cap="Diary"
              clock
              fig="10:30"
              who="Dana Whitfield"
              kind="Demo"
              go="Open the diary"
              onClick={() => toast("Opens the diary")}
            />
          </RailDoors>
        </Rail>
        <div className="app-main">
          <Page>
            <PageHead title={here.label} stamp="Read 09:12" />
            <StatTiles>
              <StatTile label="Callable" value="107" sub="38 you can call now" />
              <StatTile label="Callbacks" value="5" tone="warn" sub="all past the day they asked for" />
            </StatTiles>
          </Page>
        </div>
      </div>
    </div>
  )
}

const THREAD = [
  ["user", "Which calls broke the refund script this week?"],
  ["aimy", "Seven. Five skipped the 30-day check, and two promised a refund before asking for the order number."],
  ["user", "Who made them?"],
  ["aimy", "Four agents. Omar Said made three of them, all on Tuesday's late shift."],
  ["user", "Was that before or after the script changed?"],
  ["aimy", "After. The new script went live on Monday, and Omar's shift was the first to use it."],
  ["user", "So it might be the script, not Omar."],
  ["aimy", "Partly. The 30-day check moved to the end of the new script, and three other agents skipped it too."],
  ["user", "What should change?"],
  ["aimy", "Move the 30-day check back to the start, and add it to Omar's coaching for Thursday. I drafted both."],
] as const

/** A thread with the scroll dot and the Latest pill, and a list with a rail you can click. */
export function ScrollDotDemo() {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      <ScrollDot
        latest
        label="A thread"
        className="h-80 rounded-xl border border-hairline bg-card"
        innerClassName="flex flex-col gap-4 p-4"
      >
        {THREAD.map(([who, text], i) => (
          <Message key={i} speaker={who} author={who === "user" ? { name: "Engy Hassan" } : undefined}>
            {text}
          </Message>
        ))}
      </ScrollDot>
      <ScrollDot
        track
        label="Calls to review"
        className="h-80 rounded-xl border border-hairline bg-card"
        innerClassName="p-2"
      >
        <ul className="flex flex-col">
          {Array.from({ length: 40 }, (_, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-meta text-ink-secondary"
            >
              <span className="text-ink">Call {1040 + i}</span>
              <span>{i % 3 === 0 ? "Disputed" : "Waiting"}</span>
            </li>
          ))}
        </ul>
      </ScrollDot>
    </div>
  )
}
