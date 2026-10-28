"use client"

import { Popover as Primitive } from "radix-ui"
import { useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { NotificationBell, type BellPing } from "@/components/notification-bell"
import { cn } from "@/lib/utils"

// The bell and what it opens: Sales' panel (.ntf-panel, your call on 28 Oct).
// "Needs you" with the unread count and "Mark all read", then a row per thing:
// a severity dot (red, amber, brand) beside its type in words, when, one
// sentence, and the one thing to do about it. Sales fades a read row to 45%;
// here a read row keeps its ink, its dot goes hollow and its time says
// "read". At the foot, one question for AiMY. Below 520px of the window the
// panel spans the width under the bar.
//
//   <NotificationCenter items={rows} ping={ping} onMarkAllRead={readAll}
//     onAsk={() => ask("What should I do first?")} />

export type NotificationItem = {
  id: string
  /** What it is, in words: "Callback overdue". */
  type: string
  when: string
  body: React.ReactNode
  /** 1 needs you now, 2 soon, 3 for your information. */
  severity?: 1 | 2 | 3
  read?: boolean
  action?: { label: string; onClick: () => void }
}

type NotificationCenterProps = {
  items: NotificationItem[]
  /** Something just finished: the bell rings and says it (NotificationBell). */
  ping?: BellPing
  onMarkAllRead?: () => void
  /** The foot's question for AiMY. */
  onAsk?: () => void
  askLabel?: string
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void
}

export function NotificationCenter({
  items,
  ping,
  onMarkAllRead,
  onAsk,
  askLabel = "Ask AiMY what to do first",
  onOpenChange,
}: NotificationCenterProps) {
  const [open, setOpenState] = useState(false)
  const anchor = useRef<HTMLSpanElement>(null)
  const setOpen = (o: boolean) => {
    setOpenState(o)
    onOpenChange?.(o)
  }
  const unread = items.filter((i) => !i.read).length
  return (
    <Primitive.Root open={open} onOpenChange={setOpen}>
      <Primitive.Anchor asChild>
        <span ref={anchor} className="inline-flex">
          <NotificationBell count={unread} open={open} ping={ping} onClick={() => setOpen(!open)} />
        </span>
      </Primitive.Anchor>
      <Primitive.Portal>
        <Primitive.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="t-dropdown ntf-panel z-(--z-popover)"
          aria-label="Notifications"
          // The bell is the anchor, not a trigger: pressing it is not "outside".
          onInteractOutside={(e) => {
            if (anchor.current?.contains(e.target as Node)) e.preventDefault()
          }}
          data-slot="notification-center"
        >
          <div className="ntf-head">
            <b>Needs you</b>
            {unread ? <span className="ntf-count">{unread}</span> : null}
            {onMarkAllRead && unread ? (
              <button type="button" className="ntf-clear" onClick={onMarkAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>
          {items.length ? (
            <ul className="ntf-list">
              {items.map((n) => (
                <li key={n.id} className={cn("ntf-row", n.read && "is-read")}>
                  <span className={cn("ntf-sev", n.severity && `p${n.severity}`)} aria-hidden="true" />
                  <div className="ntf-row-main">
                    <div className="ntf-row-head">
                      <span className="ntf-row-type">{n.type}</span>
                      <span className="ntf-row-when">
                        {n.when}
                        {n.read ? " · read" : ""}
                      </span>
                    </div>
                    <p className="ntf-row-body">{n.body}</p>
                    {n.action ? (
                      <button
                        type="button"
                        className="ntf-row-cta"
                        onClick={() => {
                          setOpen(false)
                          n.action?.onClick()
                        }}
                      >
                        {n.action.label}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ntf-empty">Nothing is waiting on you.</p>
          )}
          {onAsk && items.length ? (
            <div className="ntf-foot">
              <button
                type="button"
                className="ntf-foot-btn"
                onClick={() => {
                  setOpen(false)
                  onAsk()
                }}
              >
                <AimyMark title="" />
                {askLabel}
              </button>
            </div>
          ) : null}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}
