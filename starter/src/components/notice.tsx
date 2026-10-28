import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

// A notice in the flow of the page: Knowledge's document notice (.dv-notice:
// expired, replaced), its settings notes (.set2-note) and sync alerts
// (.set2-dc-alert with Try again), Sales' outcome callout (.b-state). A
// tinted ground of the tone with an icon and words, never a coloured stripe
// on the left edge. Errors are announced at once; the rest politely.
const TONES = {
  neutral: { ground: "bg-w04", ink: "text-ink-secondary", Icon: Info },
  info: { ground: "bg-info-bg", ink: "text-info-text", Icon: Info },
  ok: { ground: "bg-ok-bg", ink: "text-ok-text", Icon: CircleCheck },
  warn: { ground: "bg-warn-bg", ink: "text-warn-text", Icon: TriangleAlert },
  err: { ground: "bg-err-bg", ink: "text-err-text", Icon: CircleAlert },
} as const

type NoticeProps = {
  tone?: keyof typeof TONES
  title?: React.ReactNode
  children: React.ReactNode
  /** A button or link that resolves it: "Try again", "Open the new version". */
  action?: React.ReactNode
  className?: string
}

export function Notice({ tone = "neutral", title, children, action, className }: NoticeProps) {
  const t = TONES[tone]
  return (
    <div
      data-slot="notice"
      data-tone={tone}
      role={tone === "err" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg px-4 py-3 text-meta text-ink", t.ground, className)}
    >
      <t.Icon aria-hidden="true" strokeWidth={2} className={cn("mt-0.5 size-4 shrink-0", t.ink)} />
      <div className="min-w-0 flex-1">
        {title ? <p className={cn("font-semibold", t.ink)}>{title}</p> : null}
        <div className={cn(title && "mt-0.5")}>{children}</div>
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  )
}
