"use client"

import { Inbox, Settings } from "lucide-react"
import { useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { AppShell, Page, PageHead } from "@/components/app-shell"
import { BriefLink, DayBrief } from "@/components/brief"
import { Button } from "@/components/button"
import { Composer } from "@/components/composer"
import { EmptyState } from "@/components/empty-state"
import { MenuItem, MenuLabel, MenuSeparator } from "@/components/menu"
import { NotificationCenter, type NotificationItem } from "@/components/notification-center"
import { Rail, RailDoor, RailDoors, RailLink } from "@/components/rail"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast, Toaster } from "@/components/toast"
import { Topnav, UserMenu } from "@/components/topnav"
import { AimyCanvas, useConversation } from "./conversation"

// A new AiMY product on Next.js starts here, already in the AiMY shell: the bar with the
// products, the bell and the account; the rail of standing facts (a drawer
// below 1040px); the page with its head and a briefing; the float bar that
// opens the AiMY Canvas; toast with undo. Rename PRODUCT, then replace the
// page's content with your own. Add components with `pnpm aimy:add @aimy/<name>`.
const PRODUCT = "AiMY New"
const ME = "Alex Morgan" // the signed-in person; replace with your auth

const PRODUCTS = [
  { label: "Knowledge", href: "https://design-aimy-knolwedge.aimy.flairstech.com" },
  { label: "Sales", href: "https://aimy-sales.nour-ali.workers.dev" },
  { label: PRODUCT.replace(/^AiMY /, ""), current: true },
]

export function App() {
  const [items, setItems] = useState<NotificationItem[]>([
    { id: "1", type: "Welcome", when: "Now", severity: 3, body: "This bell lists what needs you, one row per thing." },
  ])
  const [done, setDone] = useState(false)
  const conversation = useConversation()
  const [canvasOpen, setCanvasOpen] = useState(false)
  const ask = (q: string) => {
    setCanvasOpen(true)
    void conversation.ask(q)
  }

  return (
    <>
      <AppShell
        topnav={
          <Topnav
            logo={<AimyMark variant="lockup" title={PRODUCT} className="h-7" />}
            products={PRODUCTS}
            actions={
              <>
                <ThemeToggle />
                <NotificationCenter
                  items={items}
                  onMarkAllRead={() => setItems((all) => all.map((i) => ({ ...i, read: true })))}
                  onAsk={() => ask("What should I do first?")}
                />
                <UserMenu name={ME} role={PRODUCT}>
                  <MenuLabel>Signed in</MenuLabel>
                  <MenuItem onSelect={() => toast("Settings go here")}>Settings</MenuItem>
                  <MenuSeparator />
                  <MenuItem onSelect={() => toast("Signed out")}>Sign out</MenuItem>
                </UserMenu>
              </>
            }
          />
        }
        rail={
          <Rail
            foot={
              <RailLink icon={<Settings aria-hidden="true" />} onClick={() => toast("The console goes here")}>
                Console
              </RailLink>
            }
          >
            <RailDoors>
              <RailDoor
                cap="Today"
                fig="Nothing is in the diary"
                say="A standing fact goes here, with the page it opens."
                go="Open the diary"
                onClick={() => toast("The diary goes here")}
              />
            </RailDoors>
          </Rail>
        }
      >
        <Page>
          <div className="flex flex-col gap-6 pb-24">
            <PageHead title={`Good morning, ${ME.split(" ")[0]}`} stamp="Read just now" />
            <DayBrief
              date={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              lines={[
                <>
                  This is the briefing: the day in a few sentences, each number a{" "}
                  <BriefLink onClick={() => toast("A number opens the set it counts")}>link to its set</BriefLink>.
                </>,
              ]}
              starts={[
                {
                  label: "Ask AiMY",
                  why: "the canvas opens over the page",
                  onClick: () => ask("What needs me today?"),
                },
                {
                  label: "Do something",
                  why: "every direct action ends in a toast with Undo",
                  onClick: () => {
                    setDone(true)
                    toast("Marked as done", { onUndo: () => setDone(false) })
                  },
                },
              ]}
            />
            {done ? (
              <p className="text-body text-ink-secondary">Done. Undo is in the toast.</p>
            ) : (
              <EmptyState
                icon={<Inbox />}
                title="Nothing here yet"
                description="Your product's first screen goes here. An empty state says how to fill it."
                actions={
                  <Button variant="brand" size="sm" onClick={() => ask("Where do I start?")}>
                    Ask AiMY where to start
                  </Button>
                }
              />
            )}
          </div>
        </Page>
      </AppShell>

      <div className="pointer-events-none fixed inset-x-5 bottom-3.5 z-(--z-float) flex justify-center">
        <div className="pointer-events-auto w-full max-w-[47.5rem]">
          <Composer
            onSubmit={ask}
            generating={conversation.busy}
            onStop={conversation.stop}
            placeholder="Ask AiMY"
          />
        </div>
      </div>
      <AimyCanvas
        open={canvasOpen}
        onOpenChange={setCanvasOpen}
        basis={[PRODUCT]}
        me={ME}
        conversation={conversation}
      />
      {/* Every reversible action ends in toast("…", { onUndo }). */}
      <Toaster />
    </>
  )
}
