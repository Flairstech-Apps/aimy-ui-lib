import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Sales' diary (diaryPage, calBody): the month and the day beside it. The
// month has its count of things and steps back and forward, with Today to
// come home; a Monday-first grid shows up to three dots a day, one per thing,
// coloured by kind; today has an accent dot under its number. Choosing a day
// lists it on the right: the hour (or "all day"), the kind in words, who,
// and what, with whether you set the time or AiMY put it there. A day with
// nothing says how things get in. Under it, add one, and the next three
// things in the diary. On a narrower diary the day goes under the month.
//
// Sales marks the month as a grid but gives it no keys; here the arrow keys
// move a day or a week, Home and End go to the week's ends, and Page Up and
// Page Down move a month. The day you land on is the day shown.
//
//   <Diary today="2026-10-28" entries={[{ id: "1", date: "2026-10-28", time: "10:30", kind: "demo",
//     who: "Dana Whitfield", what: "Pricing on the annual plan", set: "you", onOpen }]} onAdd={…} />

export type DiaryKind = "meeting" | "demo" | "dinner" | "held" | "callback" | "owed"
export type DiaryEntry = {
  id: string
  /** The day, yyyy-mm-dd. */
  date: string
  /** "10:30"; leave out for something with a day and no hour ("all day"). */
  time?: string
  kind: DiaryKind
  who: string
  what?: string
  /** Who put the time there: said after what, for a timed thing that hasn't happened. */
  set?: "you" | "aimy"
  /** Opens the record; without it the row is not pressable. */
  onOpen?: () => void
}

type DiaryProps = {
  entries: DiaryEntry[]
  /** Today, yyyy-mm-dd. */
  today: string
  /** The day shown; leave out and the diary keeps its own, starting today. */
  selected?: string
  onSelect?: (date: string) => void
  /** The word for each kind. */
  kinds?: Partial<Record<DiaryKind, string>>
  onAdd?: () => void
  addLabel?: string
  /** Controls before Today in the month's head, e.g. the call log. */
  actions?: React.ReactNode
  /** What an empty day says. */
  empty?: string
  className?: string
}

const KINDS: Record<DiaryKind, string> = {
  meeting: "Meeting",
  demo: "Demo",
  dinner: "Dinner",
  held: "Held",
  callback: "Callback",
  owed: "Owed",
}
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const fromIso = (s: string) => new Date(`${s}T00:00:00`)
const addDays = (s: string, n: number) => {
  const d = fromIso(s)
  return toIso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}
const addMonths = (s: string, n: number) => {
  const d = fromIso(s)
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return toIso(new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)))
}
const sayDay = (s: string) => fromIso(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
const shortDay = (s: string) =>
  fromIso(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`
/** How much is on a day, in words: "nothing on", "1 thing", "3 things". */
const onDay = (n: number) => (n ? plural(n, "thing") : "nothing on")
const byTime = (a: DiaryEntry, b: DiaryEntry) =>
  a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")

export function Diary({
  entries,
  today,
  selected,
  onSelect,
  kinds,
  onAdd,
  addLabel = "Add to the diary",
  actions,
  empty = "Nothing in the diary. Tell AiMY when you are seeing somebody and it lands here.",
  className,
}: DiaryProps) {
  const [own, setOwn] = useState(today)
  const sel = selected ?? own
  const cells = useRef(new Map<string, HTMLDivElement>())
  const focusNext = useRef(false)
  const K = { ...KINDS, ...kinds }
  const pick = (d: string, fromKeys = false) => {
    if (selected === undefined) setOwn(d)
    onSelect?.(d)
    if (fromKeys) focusNext.current = true
  }
  // After a key moves the day, the focus follows it, into another month if need be.
  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    cells.current.get(sel)?.focus()
  }, [sel])

  const d = fromIso(sel)
  const y = d.getFullYear()
  const mo = d.getMonth()
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7
  const span = lead + new Date(y, mo + 1, 0).getDate()
  const n = span > 35 ? 42 : 35
  const start = new Date(y, mo, 1 - lead)
  const days = Array.from({ length: n }, (_, i) => {
    const c = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: toIso(c), day: c.getDate(), out: c.getMonth() !== mo, end: c.getDay() === 0 || c.getDay() === 6 }
  })
  const on = (iso: string) => entries.filter((e) => e.date === iso).sort(byTime)
  const monthKey = `${y}-${String(mo + 1).padStart(2, "0")}`
  const inMonth = entries.filter((e) => e.date.startsWith(monthKey)).length
  const dayRows = on(sel)
  const horizon = addDays(sel, 60)
  const next = entries
    .filter((e) => e.date > sel && e.date <= horizon)
    .sort(byTime)
    .slice(0, 3)
  const monthName = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const onKey = (e: React.KeyboardEvent, iso: string) => {
    const wd = (fromIso(iso).getDay() + 6) % 7
    const to =
      e.key === "ArrowLeft"
        ? addDays(iso, -1)
        : e.key === "ArrowRight"
          ? addDays(iso, 1)
          : e.key === "ArrowUp"
            ? addDays(iso, -7)
            : e.key === "ArrowDown"
              ? addDays(iso, 7)
              : e.key === "Home"
                ? addDays(iso, -wd)
                : e.key === "End"
                  ? addDays(iso, 6 - wd)
                  : e.key === "PageUp"
                    ? addMonths(iso, -1)
                    : e.key === "PageDown"
                      ? addMonths(iso, 1)
                      : null
    if (!to) return
    e.preventDefault()
    pick(to, true)
  }

  return (
    <div className={cn("b-diary", className)} data-slot="diary">
      <div className="b-cal-panel">
        <div className="b-cal-head">
          <h3 className="b-cal-month">
            {monthName}
            <span className="b-cal-count" aria-label={`${plural(inMonth, "thing")} this month`}>
              {inMonth.toLocaleString("en-GB")}
            </span>
          </h3>
          <div className="b-cal-nav">
            {actions}
            <button type="button" className="b-cal-btn is-word" onClick={() => pick(today)}>
              Today
            </button>
            <button
              type="button"
              className="b-cal-btn"
              aria-label="The month before"
              onClick={() => pick(addMonths(sel, -1))}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="b-cal-btn"
              aria-label="The month after"
              onClick={() => pick(addMonths(sel, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="b-cal-mo">
          <div className="b-cal-week" aria-hidden="true">
            {WEEK.map((w, i) => (
              <span key={w} className={cn("b-cal-wd", i > 4 && "is-end")}>
                {w}
              </span>
            ))}
          </div>
          <div className="b-cal-grid" role="grid" aria-label={monthName}>
            {Array.from({ length: n / 7 }, (_, r) => (
              <div key={r} className="b-cal-row" role="row">
                {days.slice(r * 7, r * 7 + 7).map((c) => {
                  const things = on(c.iso)
                  const isSel = c.iso === sel
                  return (
                    <div
                      key={c.iso}
                      ref={(el) => {
                        if (el) cells.current.set(c.iso, el)
                        else cells.current.delete(c.iso)
                      }}
                      role="gridcell"
                      tabIndex={isSel ? 0 : -1}
                      aria-selected={isSel}
                      aria-current={c.iso === today ? "date" : undefined}
                      aria-label={`${sayDay(c.iso)}, ${onDay(things.length)}`}
                      className={cn("b-cal-day", c.out && "is-out", c.end && "is-end", c.iso === today && "is-today")}
                      onClick={() => pick(c.iso)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          pick(c.iso)
                        } else onKey(e, c.iso)
                      }}
                    >
                      <span className="b-cal-bg" aria-hidden="true" />
                      <span className="b-cal-num" aria-hidden="true">
                        {c.day}
                      </span>
                      <span className="b-cal-dots" aria-hidden="true">
                        {things.slice(0, 3).map((t) => (
                          <span key={t.id} className={cn("b-cal-dot", `k-${t.kind}`)} />
                        ))}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="b-cal-side">
          <p className="b-cal-cap" aria-live="polite">
            {sel === today
              ? `Today, ${fromIso(sel).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`
              : sayDay(sel)}{" "}
            · {onDay(dayRows.length)}
          </p>
          <div className="b-cal-agenda">
            {dayRows.length ? (
              dayRows.map((t, i) => {
                const inner = (
                  <>
                    <span className="b-cal-evtop">
                      <span className={cn("b-cal-dot", `k-${t.kind}`)} aria-hidden="true" />
                      <span className="b-cal-etime">{t.time ?? "all day"}</span>{" "}
                      <span className="b-kind">{K[t.kind]}</span>
                    </span>{" "}
                    <span className="b-cal-ename">
                      {t.who}{" "}
                      {t.what || (t.set && t.time && t.kind !== "held") ? (
                        <span className="b-cal-ewhat">
                          {t.what}
                          {t.set && t.time && t.kind !== "held"
                            ? t.set === "you"
                              ? " · you set the time"
                              : " · AiMY put it here"
                            : ""}
                        </span>
                      ) : null}
                    </span>
                  </>
                )
                const style = { "--i": Math.min(i, 8) } as React.CSSProperties
                return t.onOpen ? (
                  <button key={t.id} type="button" className="b-cal-ev" style={style} onClick={t.onOpen}>
                    {inner}
                  </button>
                ) : (
                  <div key={t.id} className="b-cal-ev is-plain" style={style}>
                    {inner}
                  </div>
                )
              })
            ) : (
              <p className="b-cal-none">{empty}</p>
            )}
          </div>
          {onAdd ? (
            <button type="button" className="b-cal-add" onClick={onAdd}>
              <span className="b-cal-plus" aria-hidden="true">
                <Plus />
              </span>
              {addLabel}
            </button>
          ) : null}
          {next.length ? (
            <div className="b-cal-next">
              <p className="b-cal-cap">Next in the diary</p>
              {next.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className="b-cal-nrow"
                  style={{ "--i": i } as React.CSSProperties}
                  onClick={t.onOpen ?? (() => pick(t.date))}
                >
                  <span className={cn("b-cal-dot", `k-${t.kind}`)} aria-hidden="true" />
                  <span className="b-cal-nwhen">
                    {shortDay(t.date)}
                    {t.time ? ` · ${t.time}` : ""}
                  </span>{" "}
                  <span className="b-cal-nwho">{t.who}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export type DiaryLoopRow = { id: string; when: string; who: string; what?: string; go?: string; onClick: () => void }

/** Sales' Missing details: meetings that happened and nobody wrote up. */
export function DiaryLoop({
  title = "Missing details",
  link,
  note,
  rows,
}: {
  title?: string
  /** On the right of the caption, e.g. a link to all notes. */
  link?: React.ReactNode
  /** AiMY's line about them (an AimyNote). */
  note?: React.ReactNode
  rows: DiaryLoopRow[]
}) {
  if (!rows.length) return null
  return (
    <section className="b-loop" aria-label={title} data-slot="diary-loop">
      <div className="b-loop-head">
        <h3 className="b-loop-cap">{title}</h3>
        {link}
      </div>
      {note}
      {rows.map((r, i) => (
        <button
          key={r.id}
          type="button"
          className="b-loop-row"
          style={{ "--i": i } as React.CSSProperties}
          onClick={r.onClick}
        >
          <span className="b-loop-when">{r.when}</span>{" "}
          <span className="b-loop-who">
            {r.who} {r.what ? <span className="b-loop-what">{r.what}</span> : null}
          </span>{" "}
          <span className="b-loop-go">{r.go ?? "Say how it went"}</span>
        </button>
      ))}
    </section>
  )
}
