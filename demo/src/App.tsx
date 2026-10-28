import { Bell, Phone } from "lucide-react"
import { useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { AimyAvatar, Avatar } from "@/components/avatar"
import { Button } from "@/components/button"
import { Chip } from "@/components/chip"
import { CountBadge } from "@/components/count-badge"
import { Divider } from "@/components/divider"
import { IconButton } from "@/components/icon-button"
import { Tag } from "@/components/tag"
import { ThemeToggle } from "@/components/theme-toggle"

// Batch A demo: a believable AiMY briefing built only from installed
// registry components. Later batches replace the remaining hand-built bits.
const CONTACTS = [
  { name: "Kestrel Logistics", who: "Dana Whitfield", state: ["ok", "Meeting Set"], note: "They asked for pricing on the annual plan. A reply is drafted and waiting for you.", last: "Last call 2 days ago" },
  { name: "Harbour Foods", who: "Youssef Amin", state: ["warn", "Needs reply"], note: "Youssef asked for a callback after 3pm. AiMY has added it to your day.", last: "Missed call this morning" },
] as const

export function App() {
  const [filter, setFilter] = useState<string | null>(null)
  return (
    <div className="min-h-dvh bg-body text-ink">
      <header className="flex h-(--topbar-height) items-center gap-3 border-b border-hairline bg-topbar px-5">
        <AimyMark variant="lockup" className="h-6" />
        <span className="ml-auto" />
        <span className="relative">
          <IconButton label="Notifications" size="lg">
            <Bell />
          </IconButton>
          <CountBadge count={3} label="unread notifications" />
        </span>
        <ThemeToggle />
        <Avatar name="Engy Hassan" size="sm" />
      </header>
      <main className="mx-auto flex max-w-[48rem] flex-col gap-6 px-5 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Good morning, Engy</h1>
          <p className="mt-2 text-body text-ink-secondary">Two calls need a reply today. AiMY has drafted both.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Needs reply", "Meeting Set"].map((f) => (
            <Chip key={f} selected={filter === f} onClick={() => setFilter((v) => (v === f ? null : f))}>
              {f}
            </Chip>
          ))}
        </div>
        {CONTACTS.filter((c) => !filter || c.state[1] === filter).map((c) => (
          <article key={c.name} className="rounded-xl border border-edge bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={c.who} />
              <div>
                <h2 className="text-title font-semibold">{c.name}</h2>
                <p className="text-meta text-ink-quiet">{c.last}</p>
              </div>
              <Tag tone={c.state[0]} className="ml-auto">
                {c.state[1]}
              </Tag>
            </div>
            <Divider className="my-4" />
            <div className="flex gap-3">
              <AimyAvatar size="xs" />
              <p className="text-meta text-ink-secondary">{c.note}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="brand">
                <AimyMark title="" />
                Review the draft
              </Button>
              <Button>
                <Phone aria-hidden="true" />
                Call {c.who.split(" ")[0]}
              </Button>
              <Button variant="text" className="ml-auto">
                Snooze a week
              </Button>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
