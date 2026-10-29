import { AimyNote } from "@/components/aimy-note"
import { Diary, DiaryLoop, type DiaryEntry } from "@/components/diary"
import { toast } from "@/components/toast"

// The Diary tab: the month and the day, and the meetings nobody wrote up.
// The rail's Today door opens it.
const open = (who: string) => () => toast(`Opened ${who}`)

const ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    date: "2026-10-28",
    time: "10:30",
    kind: "demo",
    who: "Dana Whitfield",
    what: "Pricing on the annual plan",
    set: "you",
    onOpen: open("Dana Whitfield"),
  },
  {
    id: "2",
    date: "2026-10-28",
    time: "15:00",
    kind: "callback",
    who: "Youssef Amin",
    what: "Asked for a call after 3pm",
    set: "aimy",
    onOpen: open("Youssef Amin"),
  },
  { id: "3", date: "2026-10-28", kind: "owed", who: "Harbour Foods", what: "Proposal due" },
  { id: "4", date: "2026-10-23", time: "11:00", kind: "held", who: "Peter Foster", what: "Signed the pilot" },
  {
    id: "5",
    date: "2026-10-30",
    time: "10:00",
    kind: "meeting",
    who: "Kestrel Logistics",
    what: "Annual plan review",
    set: "you",
  },
  {
    id: "6",
    date: "2026-11-04",
    time: "14:00",
    kind: "demo",
    who: "Brightline Retail",
    what: "Second demo",
    set: "aimy",
  },
]

export function DiaryTab() {
  return (
    <div className="flex flex-col gap-4">
      <Diary
        today="2026-10-28"
        entries={ENTRIES}
        onAdd={() => toast("Tell AiMY who and when", { sub: "It lands in the diary" })}
      />
      <DiaryLoop
        note={
          <AimyNote variant="quiet">One meeting happened with nothing written about it. A line is enough.</AimyNote>
        }
        rows={[
          {
            id: "a",
            when: "Thu 23 Oct",
            who: "Peter Foster",
            what: "Signed the pilot",
            onClick: open("the note for Peter"),
          },
        ]}
      />
    </div>
  )
}
