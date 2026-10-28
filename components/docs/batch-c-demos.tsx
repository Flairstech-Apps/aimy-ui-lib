"use client"

import { LogOut, Phone, Settings, Trash2, UserRound } from "lucide-react"
import { useState } from "react"
import { Avatar } from "@/registry/aimy/ui/avatar"
import { Button } from "@/registry/aimy/ui/button"
import { Calendar, type DateRange } from "@/registry/aimy/ui/calendar"
import { Card, CardFacts, CardFoot, CardHead, CardSummary, CardTitle, CardType } from "@/registry/aimy/ui/card"
import { DatePicker } from "@/registry/aimy/ui/date-picker"
import { Disclosure } from "@/registry/aimy/ui/disclosure"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSearch,
  MenuSeparator,
  MenuTrigger,
} from "@/registry/aimy/ui/menu"
import { Pager } from "@/registry/aimy/ui/pager"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/registry/aimy/ui/popover"
import { Tab, TabPanel, Tabs, TabsList } from "@/registry/aimy/ui/tabs"
import { Tag } from "@/registry/aimy/ui/tag"
import { InfoTip, Tooltip } from "@/registry/aimy/ui/tooltip"

export function CardDemo() {
  const [opened, setOpened] = useState<string>()
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 column:grid-cols-2">
        <Card>
          <CardHead>
            <Tag tone="ok">Meeting Set</Tag>
            <CardType>Contact</CardType>
          </CardHead>
          <CardTitle onClick={() => setOpened("Kestrel Logistics")}>Kestrel Logistics</CardTitle>
          <CardSummary>Dana Whitfield, head of operations</CardSummary>
          <CardFacts>
            <p>Leeds, 140 people</p>
            <p>Last call 2 days ago</p>
          </CardFacts>
          <CardFoot>
            <Button size="sm">
              <Phone aria-hidden="true" />
              Call Dana
            </Button>
          </CardFoot>
        </Card>
        <Card status="warn">
          <CardHead>
            <Tag tone="warn">Needs reply</Tag>
            <CardType>Contact</CardType>
          </CardHead>
          <CardTitle onClick={() => setOpened("Harbour Foods")}>Harbour Foods</CardTitle>
          <CardSummary>Youssef Amin, buyer</CardSummary>
          <CardFacts>
            <p>Missed call this morning</p>
          </CardFacts>
          <CardFoot>
            <Button size="sm">
              <Phone aria-hidden="true" />
              Call Youssef
            </Button>
          </CardFoot>
        </Card>
      </div>
      <p className="text-meta text-ink-secondary" aria-live="polite">
        {opened ? `Opened ${opened}.` : "Click anywhere on a card to open it; the call button works on its own."}
      </p>
    </div>
  )
}

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="contacts" size="page">
        <TabsList aria-label="Views">
          <Tab value="contacts" count={134}>
            Contacts
          </Tab>
          <Tab value="customers" count={28}>
            Customers
          </Tab>
          <Tab value="calls" count={12}>
            Calls
          </Tab>
        </TabsList>
        <TabPanel value="contacts" className="text-meta text-ink-secondary">
          134 contacts.
        </TabPanel>
        <TabPanel value="customers" className="text-meta text-ink-secondary">
          28 customers.
        </TabPanel>
        <TabPanel value="calls" className="text-meta text-ink-secondary">
          12 calls this week.
        </TabPanel>
      </Tabs>
      <Tabs defaultValue="overview">
        <TabsList aria-label="Skill">
          <Tab value="overview">Overview</Tab>
          <Tab value="contents" count={6}>
            Contents
          </Tab>
        </TabsList>
        <TabPanel value="overview" className="text-meta text-ink-secondary">
          What the skill does and who can use it.
        </TabPanel>
        <TabPanel value="contents" className="text-meta text-ink-secondary">
          Six files.
        </TabPanel>
      </Tabs>
    </div>
  )
}

const PEOPLE = ["Engy Hassan", "Lina Farouk", "Sherif Adel", "Kestrel Ward", "Rami Saleh"]
const SELLS = ["Cloud", "Security", "Data", "Support", "Training", "Hardware"]

export function MenuDemo() {
  const [who, setWho] = useState("Engy Hassan")
  const [sells, setSells] = useState<string[]>(["Cloud"])
  const [q, setQ] = useState("")
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Menu>
        <MenuTrigger asChild>
          <Button>
            <UserRound aria-hidden="true" />
            Viewing as {who.split(" ")[0]}
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>View as</MenuLabel>
          <MenuRadioGroup value={who} onValueChange={setWho}>
            {PEOPLE.map((p) => (
              <MenuRadioItem key={p} value={p} leading={<Avatar name={p} size="xs" />} description={p === "Rami Saleh" ? "Chief executive" : "Sales"}>
                {p}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger asChild>
          <Button>Sells: {sells.length ? sells.join(", ") : "Choose"}</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuSearch label="Find a product" value={q} onValueChange={setQ} />
          {SELLS.filter((s) => s.toLowerCase().includes(q.toLowerCase())).map((s) => (
            <MenuCheckboxItem
              key={s}
              checked={sells.includes(s)}
              onCheckedChange={(on) => setSells((v) => (on ? [...v, s] : v.filter((x) => x !== s)))}
            >
              {s}
            </MenuCheckboxItem>
          ))}
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger asChild>
          <Button>Account</Button>
        </MenuTrigger>
        <MenuContent align="end">
          <MenuLabel>Engy Hassan</MenuLabel>
          <MenuItem leading={<Settings aria-hidden="true" />}>Settings</MenuItem>
          <MenuItem leading={<LogOut aria-hidden="true" />}>Sign out</MenuItem>
          <MenuSeparator />
          <MenuItem danger leading={<Trash2 aria-hidden="true" />} description="You can restore it for 30 days">
            Delete the list
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}

export function TipsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Tooltip content="Call Kestrel Logistics">
        <Button>
          <Phone aria-hidden="true" />
          Hover or focus me
        </Button>
      </Tooltip>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
        Relevance
        <InfoTip label="About relevance" content="How closely a document matches the question, from the words and the people it mentions." />
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="accent">Why this score</Button>
        </PopoverTrigger>
        <PopoverContent label="About this score">
          <p className="text-ink">From the last call with Dana, 2 days ago.</p>
          <p className="mt-1">Nothing newer has come in since.</p>
          <div className="mt-3 flex justify-end gap-2">
            <PopoverClose asChild>
              <Button size="sm">Check again</Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DisclosureDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Disclosure title="Transcript" count={4}>
        <ul className="flex flex-col gap-1.5 text-meta text-ink-secondary">
          <li>
            <span className="font-semibold text-ink">Dana: </span>Can you send pricing for the annual plan?
          </li>
          <li>
            <span className="font-semibold text-ink">Engy: </span>Yes, today. Any seat count in mind?
          </li>
          <li>
            <span className="font-semibold text-ink">Dana: </span>About 140, maybe more by spring.
          </li>
          <li>
            <span className="font-semibold text-ink">Engy: </span>I&apos;ll include both.
          </li>
        </ul>
      </Disclosure>
      <Disclosure title="Who else was on the call" count={2} defaultOpen>
        <p className="text-meta text-ink-secondary">Dana Whitfield and Mo Clarke.</p>
      </Disclosure>
    </div>
  )
}

export function PagerDemo() {
  const [page, setPage] = useState(1)
  return <Pager total={134} page={page} pageSize={15} noun="contacts" onPageChange={setPage} />
}

const daysAgo = (n: number) => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n)
}

export function DateDemo() {
  const [range, setRange] = useState<DateRange>()
  const [day, setDay] = useState<Date>()
  return (
    <div className="flex flex-wrap items-start gap-8">
      <DatePicker
        label="Created"
        value={range}
        onValueChange={setRange}
        presets={[
          { label: "Today", range: { from: daysAgo(0) } },
          { label: "Last 7 days", range: { from: daysAgo(6), to: daysAgo(0) } },
          { label: "Last 30 days", range: { from: daysAgo(29), to: daysAgo(0) } },
        ]}
      />
      <div className="rounded-lg border border-edge p-3">
        <Calendar value={day} onValueChange={setDay} />
      </div>
    </div>
  )
}
