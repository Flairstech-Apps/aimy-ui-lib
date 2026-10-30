"use client"

import { Settings } from "lucide-react"
import { useState } from "react"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { AppShell, Page, PageHead } from "@/registry/aimy/ui/app-shell"
import { Brief, BriefHead, BriefLines, BriefLink } from "@/registry/aimy/ui/brief"
import { Button } from "@/registry/aimy/ui/button"
import { MenuItem, MenuLabel, MenuSeparator } from "@/registry/aimy/ui/menu"
import { NotificationCenter, type NotificationItem } from "@/registry/aimy/ui/notification-center"
import { Rail, RailDoor, RailDoorMiss, RailDoors, RailLink } from "@/registry/aimy/ui/rail"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { StatTile, StatTiles } from "@/registry/aimy/ui/stat-tile"
import { ThemeToggle } from "@/registry/aimy/ui/theme-toggle"
import { toast } from "@/registry/aimy/ui/toast"
import { Topnav, UserMenu } from "@/registry/aimy/ui/topnav"

const go = (what: string) => () => toast(`Opens ${what}`)

const ITEMS: NotificationItem[] = [
  {
    id: "1",
    type: "Callback overdue",
    when: "09:40",
    severity: 1,
    body: "Youssef Amin asked to be called back after 3pm yesterday.",
    action: { label: "Call Youssef", onClick: go("the call") },
  },
  {
    id: "2",
    type: "Meeting notes",
    when: "08:15",
    severity: 2,
    body: "Notes from the call with Dana Whitfield are ready.",
    action: { label: "Open the notes", onClick: go("the notes") },
  },
  {
    id: "3",
    type: "Sequence paused",
    when: "Yesterday",
    severity: 3,
    read: true,
    body: "The October sequence stopped for 12 people with no answer twice.",
  },
]

export function ShellBar() {
  const [items, setItems] = useState(ITEMS)
  return (
    <>
      <ThemeToggle />
      <NotificationCenter
        items={items}
        onMarkAllRead={() => setItems((all) => all.map((i) => ({ ...i, read: true })))}
        onAsk={go("AiMY, asked what to do first")}
      />
      <UserMenu name="Engy Hassan" role="Account executive">
        <MenuLabel>Signed in as engy@flairstech.com</MenuLabel>
        <MenuItem onSelect={go("settings")}>Settings</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={go("the sign-out")}>Sign out</MenuItem>
      </UserMenu>
    </>
  )
}

const PRODUCTS = [
  { label: "Knowledge", onSelect: go("Knowledge") },
  { label: "Sales", current: true },
  { label: "QA", onSelect: go("QA") },
  { label: "Talent", soon: "soon" },
]

export function ShellRail() {
  return (
    <Rail
      foot={
        <RailLink icon={<Settings aria-hidden="true" />} onClick={go("the console")}>
          Console
        </RailLink>
      }
    >
      <Brief ground="accent" compact label="Where your book is">
        <BriefHead size="label" title="AiMY" meta="this morning" />
        <BriefLines
          lines={[
            <>
              <BriefLink onClick={go("the callbacks")}>4 callbacks</BriefLink> are past the day they asked for. Start
              there.
            </>,
          ]}
        />
      </Brief>
      <RailDoors>
        <RailDoor
          cap="Today"
          clock
          fig="10:30"
          who="Dana Whitfield"
          kind="Demo"
          go="Open the diary"
          onClick={go("the diary")}
        />
        <RailDoor
          cap="Financials"
          fig="€182k"
          of="gained"
          bar={{ value: 182, target: 300 }}
          say={
            <>
              €11k behind where you should be today, and <RailDoorMiss>3 calls missed</RailDoorMiss>.
            </>
          }
          go="Open the report"
          onClick={go("the report")}
        />
      </RailDoors>
    </Rail>
  )
}

const WIDTHS = [
  { value: "100%", label: "Full" },
  { value: "1000px", label: "1000" },
  { value: "820px", label: "820" },
  { value: "390px", label: "390" },
]

export function AppShellDemo() {
  const [w, setW] = useState("100%")
  return (
    <div className="flex flex-col gap-4">
      <Segmented label="Shell width" options={WIDTHS} value={w} onValueChange={setW} />
      <div
        className="overflow-hidden rounded-xl border border-edge"
        style={{ width: w, maxWidth: "100%", ["--shell-h" as string]: "40rem" }}
      >
        <AppShell
          topnav={
            <Topnav
              logo={<AimyMark variant="lockup" title="AiMY Sales" className="h-7" />}
              products={PRODUCTS}
              actions={<ShellBar />}
            />
          }
          rail={<ShellRail />}
        >
          <Page>
            <PageHead
              title="Today"
              stamp="Read 09:12"
              actions={
                <Button size="sm" onClick={go("the queue")}>
                  Start calling
                </Button>
              }
            />
            <StatTiles>
              <StatTile label="Callable" value="107" sub="38 you can call now" onClick={go("the 38")} />
              <StatTile label="Callbacks" value="4" tone="warn" sub="all past the day they asked for" />
              <StatTile label="Meetings" value="2" sub="10:30 and 15:00" />
            </StatTiles>
          </Page>
        </AppShell>
      </div>
    </div>
  )
}

/** The bar on its own, in a shell with no rail, at the same four widths. */
export function TopnavDemo() {
  const [w, setW] = useState("100%")
  return (
    <div className="flex flex-col gap-4">
      <Segmented label="Bar width" options={WIDTHS} value={w} onValueChange={setW} />
      <div
        className="overflow-hidden rounded-xl border border-edge"
        style={{ width: w, maxWidth: "100%", ["--shell-h" as string]: "9rem" }}
      >
        <AppShell
          topnav={
            <Topnav
              logo={<AimyMark variant="lockup" title="AiMY Sales" className="h-7" />}
              products={PRODUCTS}
              actions={<ShellBar />}
            />
          }
        >
          <Page>
            <p className="text-meta text-ink-secondary">The page starts under the bar.</p>
          </Page>
        </AppShell>
      </div>
    </div>
  )
}

export function RailDoorDemo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="w-[20rem]">
        <RailDoors>
          <RailDoor
            cap="Today"
            fig="Nothing is in the diary"
            go="Open the diary"
            onClick={go("the diary")}
            say="5 things in the fortnight ahead"
          />
          <RailDoor
            cap="Your journey"
            fig="€240k"
            of="signed"
            bar={{ value: 240, target: 240 }}
            say="All of what was signed is in."
            go="Open the report"
            onClick={go("the report")}
          />
          <RailDoor
            cap="The year"
            fig="47"
            of="days left"
            say="Renews 14 Dec unless either side says otherwise."
            go="Open the report"
            onClick={go("the report")}
          />
        </RailDoors>
      </div>
    </div>
  )
}

export function NotificationCenterDemo() {
  const [items, setItems] = useState(ITEMS)
  return (
    <div className="flex items-center gap-4">
      <NotificationCenter
        items={items}
        onMarkAllRead={() => setItems((all) => all.map((i) => ({ ...i, read: true })))}
        onAsk={go("AiMY, asked what to do first")}
      />
      <Button size="sm" onClick={() => setItems(items.length ? [] : ITEMS)}>
        {items.length ? "Clear them" : "Bring them back"}
      </Button>
    </div>
  )
}
