import { Phone, SearchX, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { AimyAvatar, Avatar } from "@/components/avatar"
import { Button } from "@/components/button"
import { Card, CardBody, CardFacts, CardFoot, CardHead, CardSummary, CardTitle, CardType } from "@/components/card"
import { BriefLink, DayBrief } from "@/components/brief"
import { type DateRange } from "@/components/calendar"
import { DatePicker } from "@/components/date-picker"
import { NotificationBell, type BellPing } from "@/components/notification-bell"
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/menu"
import { Pager } from "@/components/pager"
import { SearchField } from "@/components/search-field"
import { Select, SelectItem } from "@/components/select"
import { Tab, TabPanel, Tabs, TabsList } from "@/components/tabs"
import { Tag } from "@/components/tag"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip } from "@/components/tooltip"
import { EmptyState } from "@/components/empty-state"
import { Reveal, SkeletonCard } from "@/components/skeleton"
import { toast, Toaster } from "@/components/toast"
import { Composer } from "@/components/composer"
import { Peek } from "@/components/peek"
import { StreamingText } from "@/components/streaming-text"
import { UsageSummary } from "@/components/usage"
import { Confidence } from "@/components/confidence"
import { Activity } from "@/components/activity"
import { WorkState } from "@/components/work-state"
import { VoiceStage } from "@/components/voice-stage"
import { useVoiceSession } from "@/hooks/use-voice"
import type { Basis } from "@/lib/ai-types"
import { AimyCanvas, useConversation } from "./conversation"

// The demo: a believable AiMY briefing built only from installed registry
// components. Ask from the float bar, or review a draft from a card, and the
// AiMY canvas opens over the briefing, based on what you asked from.
type Contact = {
  name: string
  who: string
  role: string
  where: string
  tone: "ok" | "warn"
  state: string
  note: string
  last: string
}

const CONTACTS: Contact[] = [
  {
    name: "Kestrel Logistics",
    who: "Dana Whitfield",
    role: "Head of operations",
    where: "Leeds, 140 people",
    tone: "ok",
    state: "Meeting Set",
    note: "They asked for pricing on the annual plan. A reply is drafted and waiting for you.",
    last: "Last call 2 days ago",
  },
  {
    name: "Harbour Foods",
    who: "Youssef Amin",
    role: "Buyer",
    where: "Bristol, 60 people",
    tone: "warn",
    state: "Needs reply",
    note: "Youssef asked for a callback after 3pm. AiMY has added it to your day.",
    last: "Missed call this morning",
  },
]

const PEOPLE = [
  { name: "Engy Hassan", role: "Sales" },
  { name: "Lina Farouk", role: "Sales manager" },
  { name: "Rami Saleh", role: "Chief executive" },
]

export function App() {
  const [q, setQ] = useState("")
  const [range, setRange] = useState<DateRange>()
  const [who, setWho] = useState("Engy Hassan")
  const [page, setPage] = useState(1)
  const [snoozed, setSnoozed] = useState<string[]>([])
  // A first visit shows skeletons while the contacts "load".
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700)
    return () => window.clearTimeout(t)
  }, [])
  const left = CONTACTS.length - snoozed.length
  const [tab, setTab] = useState("contacts")
  // The bell rings for what was finished away from the screen: a call's notes.
  const [unread, setUnread] = useState(3)
  const [ping, setPing] = useState<BellPing>()
  const call = (first: string) => {
    toast(`Calling ${first}`, { sub: "Your phone rings first." })
    window.setTimeout(() => {
      setUnread((n) => n + 1)
      setPing({ id: Date.now(), text: <b>Notes from the call with {first} are ready</b> })
    }, 4000)
  }
  const conversation = useConversation()
  // The float bar answers in the peek; the same turn is in the canvas thread.
  const [peek, setPeek] = useState(false)
  const lastAnswer = [...conversation.turns].reverse().find((t) => t.speaker === "aimy")
  const [canvasOpen, setCanvasOpen] = useState(false)
  const [basis, setBasis] = useState<Basis>([])
  const openCanvas = (b: Basis, question?: string) => {
    setBasis(b)
    setCanvasOpen(true)
    if (question) conversation.ask(question)
  }
  // A spoken question is asked the way a typed one is: into the canvas
  // thread, behind the stage, so ending the session lands on what was said.
  const voice = useVoiceSession({
    ask: (question) => {
      setBasis(["My contacts", "134 contacts"])
      setCanvasOpen(true)
      return conversation.ask(question)
    },
  })
  const shown = CONTACTS.filter((c) => !snoozed.includes(c.name) && c.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="min-h-dvh bg-body text-ink">
      <header className="flex h-(--topbar-height) items-center gap-3 border-b border-hairline bg-topbar px-5">
        <AimyMark variant="lockup" className="h-6" />
        <span className="ml-auto" />
        <Menu>
          <MenuTrigger asChild>
            <Button size="sm">
              <UserRound aria-hidden="true" />
              Viewing as {who.split(" ")[0]}
            </Button>
          </MenuTrigger>
          <MenuContent align="end">
            <MenuLabel>View as</MenuLabel>
            <MenuRadioGroup value={who} onValueChange={setWho}>
              {PEOPLE.map((p) => (
                <MenuRadioItem
                  key={p.name}
                  value={p.name}
                  description={p.role}
                  leading={<Avatar name={p.name} size="xs" />}
                >
                  {p.name}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <NotificationBell
          count={unread}
          ping={ping}
          onClick={() => {
            setUnread(0)
            toast("Notifications read")
          }}
        />
        <ThemeToggle />
        <Avatar name={who} size="sm" />
      </header>

      <main className="mx-auto flex max-w-[60rem] flex-col gap-6 px-5 pt-10 pb-28">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Good morning, {who.split(" ")[0]}</h1>
        </div>
        <DayBrief
          date="28 Oct"
          lines={[
            <>
              <BriefLink onClick={() => setTab("calls")}>2 calls</BriefLink> need a reply today. AiMY has drafted both.
            </>,
            <>
              <BriefLink onClick={() => setTab("contacts")}>{134 - snoozed.length} contacts</BriefLink> can be called,
              and <BriefLink onClick={() => setTab("customers")}>28 customers</BriefLink> have a renewal this quarter.
            </>,
          ]}
          starts={[
            {
              label: "Call the next one",
              n: 134 - snoozed.length,
              why: "Amelia Taylor is top of the list",
              onClick: () => call("Amelia"),
            },
            {
              label: "Reply to the calls",
              n: 2,
              why: "both drafts are waiting for you",
              onClick: () => setTab("calls"),
            },
            {
              label: "Ask AiMY",
              why: "about anyone on the list; the answer says what it read",
              onClick: () => openCanvas(["My contacts", "134 contacts"]),
            },
          ]}
        />

        <Tabs value={tab} onValueChange={setTab} size="page">
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

          <TabPanel value="contacts" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <SearchField label="Search contacts" value={q} onValueChange={setQ} className="w-56" />
              <DatePicker label="Last contact" value={range} onValueChange={setRange} />
              <Select label="Owner" defaultValue="me">
                <SelectItem value="me">My contacts</SelectItem>
                <SelectItem value="team">My team</SelectItem>
              </Select>
            </div>

            {!loading && shown.length === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title="No matches"
                description={`${left} ${left === 1 ? "contact" : "contacts"}, none of them matching "${q}".`}
                actions={
                  <Button size="sm" onClick={() => setQ("")}>
                    Clear the search
                  </Button>
                }
              />
            ) : (
              <Reveal
                loading={loading}
                label="Loading contacts"
                skeleton={
                  <div className="grid gap-4 column:grid-cols-2">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                }
              >
                <div className="grid gap-4 column:grid-cols-2">
                  {shown.map((c) => (
                    <Card key={c.name} status={c.tone === "warn" ? "warn" : undefined}>
                      <CardHead>
                        <Tag tone={c.tone}>{c.state}</Tag>
                        <CardType>Contact</CardType>
                      </CardHead>
                      <CardTitle>{c.name}</CardTitle>
                      <CardSummary>
                        {c.who}, {c.role.toLowerCase()}
                      </CardSummary>
                      <CardFacts>
                        <p className="flex items-center gap-2">
                          {c.where}
                          <Confidence
                            level={c.tone === "warn" ? "old" : "ok"}
                            group="Company"
                            when="2 weeks ago"
                            source="on LinkedIn"
                            checkedIn="March 2025"
                            onCheckAgain={() =>
                              toast("Company: checked again on LinkedIn", { sub: "Nothing had changed." })
                            }
                          />
                        </p>
                        <p>{c.last}</p>
                      </CardFacts>
                      <CardBody>
                        <div className="flex gap-2.5 rounded-lg bg-w04 p-3">
                          <AimyAvatar size="xs" />
                          <div className="flex flex-col items-start gap-1.5">
                            <WorkState state={c.tone === "warn" ? "staged" : "drafted"} />
                            <p className="text-meta text-ink-secondary">{c.note}</p>
                          </div>
                        </div>
                      </CardBody>
                      <CardFoot>
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => openCanvas([c.name, "Contact"], `Draft the reply to ${c.who.split(" ")[0]}`)}
                        >
                          <AimyMark title="" />
                          Review the draft
                        </Button>
                        <Button size="sm" onClick={() => call(c.who.split(" ")[0] ?? c.who)}>
                          <Phone aria-hidden="true" />
                          Call {c.who.split(" ")[0]}
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => {
                            setSnoozed((s) => [...s, c.name])
                            toast(`${c.name} snoozed`, {
                              sub: "Back in your contacts in a week.",
                              onUndo: () => setSnoozed((s) => s.filter((n) => n !== c.name)),
                            })
                          }}
                        >
                          Snooze a week
                        </Button>
                      </CardFoot>
                    </Card>
                  ))}
                </div>
              </Reveal>
            )}
            <Pager total={134} page={page} pageSize={15} noun="contacts" onPageChange={setPage} />
          </TabPanel>
          <TabPanel value="customers" className="text-body text-ink-secondary">
            28 customers. Customer cards come next.
          </TabPanel>
          <TabPanel value="calls">
            <Activity
              onOpen={(t) => toast(`Opened ${t.subject}`)}
              items={[
                {
                  id: "1",
                  subject: "Dana Whitfield",
                  outcome: "Meeting set",
                  tone: "ok",
                  by: who,
                  when: "10:42",
                  note: "Tuesday at 3pm, to go through the annual plan.",
                },
                {
                  id: "2",
                  subject: "Youssef Amin",
                  outcome: "Moved to Needs reply",
                  by: "aimy",
                  when: "09:15",
                  note: "He asked for a callback after 3pm.",
                },
                {
                  id: "3",
                  subject: "Priya Natarajan",
                  outcome: "Missed call",
                  tone: "warn",
                  by: who,
                  when: "Yesterday",
                  note: "No answer twice.",
                },
              ]}
            />
          </TabPanel>
        </Tabs>
      </main>
      <div className="pointer-events-none fixed inset-x-5 bottom-3.5 z-(--z-float) flex justify-center">
        {/* The dock: a quick answer rises out of the bar; the canvas holds the whole thread. */}
        <div className="pointer-events-auto relative w-full max-w-[47.5rem]">
          {peek && lastAnswer ? (
            <Peek
              status={
                lastAnswer.status === "thinking"
                  ? "thinking"
                  : lastAnswer.status === "streaming"
                    ? "streaming"
                    : "answered"
              }
              thinkingLabel="Reading the record…"
              onOpenCanvas={() => openCanvas(["My contacts", "134 contacts"])}
              onDismiss={() => setPeek(false)}
            >
              <StreamingText text={lastAnswer.text} streaming={lastAnswer.status === "streaming"} />
            </Peek>
          ) : null}
          <Composer
            onSubmit={(question) => {
              setPeek(true)
              conversation.ask(question)
            }}
            generating={conversation.busy}
            onStop={conversation.stop}
            onVoice={voice.start}
            badge={3}
            usage={{
              fill: 0.42,
              label: "Your usage: 42% of this slice",
              content: (
                <UsageSummary
                  groups={[
                    { title: "October", rows: [{ label: "Chats", used: 126, of: 300, note: "Within your share." }] },
                  ]}
                  link={{ label: "Usage", href: "#usage" }}
                />
              ),
            }}
          />
        </div>
      </div>
      <AimyCanvas open={canvasOpen} onOpenChange={setCanvasOpen} basis={basis} me={who} conversation={conversation} />
      <VoiceStage
        open={voice.active}
        phase={voice.phase}
        heard={voice.heard}
        error={voice.error}
        level={voice.level}
        seconds={voice.seconds}
        onEnd={voice.end}
        onMute={voice.toggleMute}
        onInterrupt={voice.interrupt}
      />
      {/* Lifted above the float bar, as both products do. */}
      <Toaster offset="5.5rem" />
    </div>
  )
}
