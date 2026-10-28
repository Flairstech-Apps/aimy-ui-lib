import { Bell, TriangleAlert } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AimyMark } from "@/components/aimy-mark"
import { IconButton } from "@/components/icon-button"
import { cn } from "@/lib/utils"

// The topbar bell, and the small moments that say something landed (PLAN.md
// §9a). The count slides on and pops when it changes (transitions.dev's
// notification badge, 03). When something finishes, pass a new `ping`: the
// bell rocks from its top, three swings in 600ms, and one line drops from
// under it saying what finished, then goes after about 1.4s (Knowledge's
// note-taker ring and tip). Neither happens while the bell's panel is open:
// the row is already there. Under reduced motion the bell stays still and
// the line only fades.
//
//   <NotificationBell count={unread} open={panelOpen} onClick={toggle}
//     ping={{ id: n.id, text: "Recording processed", fail: false }} />

export type BellPing = { id: string | number; text: React.ReactNode; fail?: boolean }

type NotificationBellProps = {
  count: number
  onClick?: () => void
  /** The bell's panel is open: no ring, no tip. */
  open?: boolean
  /** A new id rings the bell and shows the tip. */
  ping?: BellPing
  className?: string
}

const RING_MS = 600
const TIP_MS = 1400

export function NotificationBell({ count, onClick, open, ping, className }: NotificationBellProps) {
  const button = useRef<HTMLButtonElement>(null)
  const [ringing, setRinging] = useState(false)
  const [tip, setTip] = useState<{ ping: BellPing; cx: number; top: number; on: boolean } | null>(null)
  // The badge keeps its last number while it closes, so it pops away rather than vanishing.
  const [shown, setShown] = useState(count)
  if (count > 0 && count !== shown) setShown(count)

  useEffect(() => {
    if (!ping || open) return
    const el = button.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const timers = [
      window.setTimeout(() => {
        setRinging(true)
        setTip({ ping, cx: r.left + r.width / 2, top: Math.round(r.bottom + 10), on: false })
      }),
      window.setTimeout(() => setTip((t) => (t ? { ...t, on: true } : t)), 30),
      window.setTimeout(() => setRinging(false), RING_MS),
      window.setTimeout(() => setTip((t) => (t ? { ...t, on: false } : t)), TIP_MS),
    ]
    return () => timers.forEach(window.clearTimeout)
    // A new ping id is the signal; its other fields come with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping?.id, open])

  return (
    <span className={cn("relative inline-flex", className)} data-slot="notification-bell">
      <IconButton
        ref={button}
        label={count ? `Notifications, ${count} unread` : "Notifications"}
        size="lg"
        className={cn("aimy-bell", ringing && "is-ringing")}
        aria-expanded={open}
        onClick={onClick}
      >
        <Bell />
      </IconButton>
      <span className="t-badge" data-open={count > 0} aria-hidden="true">
        <span className="t-badge-dot grid h-4.5 min-w-4.5 place-items-center rounded-pill border-2 border-body bg-badge px-1 text-2xs leading-none font-bold text-on-brand">
          {shown}
        </span>
      </span>
      {tip && typeof document !== "undefined"
        ? createPortal(
            <div
              className={cn("aimy-tip", tip.on && "is-on", tip.ping.fail && "is-fail")}
              style={{ top: tip.top }}
              // Centred under the bell, kept inside the window; the point stays on the bell.
              ref={(node) => {
                if (!node) return
                const w = node.offsetWidth
                const left = Math.max(12, Math.min(window.innerWidth - w - 12, tip.cx - w / 2))
                node.style.left = `${Math.round(left)}px`
                node.style.setProperty("--tip-x", `${Math.round(tip.cx - left)}px`)
              }}
              role="status"
              aria-live="polite"
            >
              {tip.ping.fail ? <TriangleAlert aria-hidden="true" /> : <AimyMark title="" className="h-[13px] w-3" />}
              <span>{tip.ping.text}</span>
            </div>,
            document.body
          )
        : null}
    </span>
  )
}
