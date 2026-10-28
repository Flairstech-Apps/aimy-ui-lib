"use client"

import { useState } from "react"
import {
  Brief,
  BriefActions,
  BriefDeck,
  BriefFigure,
  BriefHead,
  BriefLines,
  BriefLink,
  BriefNext,
  DayBrief,
} from "@/registry/aimy/ui/brief"
import { Button } from "@/registry/aimy/ui/button"
import { Composer } from "@/registry/aimy/ui/composer"
import { NotificationBell, type BellPing } from "@/registry/aimy/ui/notification-bell"
import { Suggestions } from "@/registry/aimy/ui/suggestions"
import { toast } from "@/registry/aimy/ui/toast"
import { UsageLimit } from "@/registry/aimy/ui/usage-limit"
import { UsageSummary } from "@/registry/aimy/ui/usage"
import { WorkState } from "@/registry/aimy/ui/work-state"

const PINGS = ["Recording processed", "Analysis done", "Your meeting notes are ready."]

export function BellDemo() {
  const [count, setCount] = useState(2)
  const [ping, setPing] = useState<BellPing>()
  const [n, setN] = useState(0)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <NotificationBell count={count} ping={ping} onClick={() => setCount(0)} />
      <Button
        size="sm"
        onClick={() => {
          setCount((c) => c + 1)
          setPing({ id: Date.now(), text: <b>{PINGS[n % PINGS.length]}</b> })
          setN((x) => x + 1)
        }}
      >
        Something finished
      </Button>
      <Button size="sm" onClick={() => setPing({ id: Date.now(), text: <b>Notes not written</b>, fail: true })}>
        Something failed
      </Button>
      <Button size="sm" onClick={() => setCount(0)}>
        Read them all
      </Button>
    </div>
  )
}

const go = (what: string) => () => toast(`Opens ${what}`)

export function BriefDemo() {
  return (
    <div className="flex flex-col gap-6">
      <DayBrief
        date="28 Oct"
        lines={[
          <>
            <BriefLink onClick={go("the callbacks")}>4 callbacks</BriefLink> are past the day they asked for and{" "}
            <BriefLink onClick={go("the meetings")}>4 meetings</BriefLink> have been and gone with nothing said about
            them.
          </>,
          <>
            <BriefLink onClick={go("the queue")}>107 people</BriefLink> across{" "}
            <BriefLink onClick={go("the campaigns")}>9 campaigns</BriefLink> can be called.
          </>,
          <>
            <BriefLink onClick={go("Peter Foster")}>Peter Foster</BriefLink>, handed over 26 Sep, signed yesterday, and
            1 other got a decision this week.
          </>,
        ]}
        starts={[
          {
            label: "Call the next one",
            n: 107,
            why: "Amelia Taylor is top of the queue",
            onClick: go("the next call"),
          },
          {
            label: "Work the callbacks",
            n: 4,
            why: "every one of them is past the day they asked for",
            onClick: go("the callbacks"),
          },
          { label: "Say what happened", n: 4, why: "the oldest passed 16 Oct", onClick: go("the meetings") },
          {
            label: "Find leads",
            why: "describe who to look for; what comes back is a list",
            onClick: go("lead finding"),
          },
        ]}
      />
      <Brief ground="accent" label="Where this campaign is">
        <BriefHead
          size="label"
          title="AiMY on this campaign"
          state={<WorkState state="detected" label="Read off your accounts" />}
        />
        <BriefFigure n="12" of="of 40">
          people have been called twice with no answer.
        </BriefFigure>
        <BriefDeck>The sequence is running past them regardless.</BriefDeck>
        <BriefActions>
          <Button variant="brand" size="sm" onClick={go("the twelve")}>
            Show the 12
          </Button>
          <Button size="sm" onClick={go("the sequence")}>
            Pause the sequence for them
          </Button>
        </BriefActions>
      </Brief>
      <Brief ground="plain" label="Good morning">
        <BriefLines
          lines={[
            "Good morning, Engy — how are you doing?",
            <>
              <BriefLink onClick={go("the documents")}>214 documents</BriefLink> in the corpus.{" "}
              <BriefLink onClick={go("the conflicts")}>2 contradict each other</BriefLink>, and one source has stopped
              syncing.
            </>,
          ]}
        />
        <BriefNext>
          <Suggestions
            variant="follow"
            items={["What contradicts what?", "Which sources have stopped syncing?", "What changed recently?"]}
            onPick={(q) => toast(`Asked: ${q}`)}
          />
        </BriefNext>
      </Brief>
      <Brief ground="accent" compact label="AiMY">
        <BriefHead size="label" title="AiMY" meta="from the last call" />
        <BriefLines
          lines={["Reception took it last time. Calls here get through most around 10:00, 34% of 1,240 calls."]}
        />
      </Brief>
    </div>
  )
}

export function UsageLimitDemo() {
  const [stopped, setStopped] = useState(true)
  return (
    <div className="flex flex-col gap-3">
      <UsageLimit state="past" what="chats" detail="36 chats past your share, $10.80 extra this month." />
      <UsageLimit state="reached" what="chats" resets="1 November" stillWorks="Filters and search still work." />
      <UsageLimit
        state="stopped"
        what="chats"
        stillWorks="Filters still work."
        action={
          <Button size="sm" onClick={() => toast("Asked your admin", { sub: "Lina Farouk will see it in her bell" })}>
            Ask your admin
          </Button>
        }
      />
      <Composer
        onSubmit={() => {}}
        unavailable={stopped ? "Chats are stopped. Filters still work." : undefined}
        usage={{
          fill: 1,
          tone: stopped ? "err" : undefined,
          label: stopped ? "Your usage: chats are stopped" : "Your usage: 100% of this slice",
          content: (
            <UsageSummary
              groups={[
                {
                  title: "October",
                  rows: [
                    {
                      label: "Chats",
                      used: 300,
                      of: 300,
                      tone: "err",
                      note: stopped
                        ? "An admin has stopped your chats. Ask your admin to turn them back on."
                        : undefined,
                    },
                  ],
                },
              ]}
              link={{ label: "Usage", href: "#usage" }}
            />
          ),
        }}
      />
      <Button size="sm" className="self-start" onClick={() => setStopped((s) => !s)}>
        {stopped ? "Turn chats back on" : "Stop chats"}
      </Button>
    </div>
  )
}
