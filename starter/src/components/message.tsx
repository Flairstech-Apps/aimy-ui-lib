import { Ban } from "lucide-react"
import { AimyAvatar, Avatar } from "@/components/avatar"
import { ThinkingIndicator } from "@/components/thinking"
import type { Person, Speaker, TurnStatus } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// One turn in a conversation. Sales' shape, Nour's choice (28 Oct), which is
// also the design system's spec (sales.css:7549): a 28px avatar with 8px
// corners, a bubble up to 540px with 16px text, and the square corner on the
// speaker's side. Knowledge drew a 30px circle and a 480px bubble.
//
// While AiMY is thinking the bubble is not drawn yet: the think-mark stands
// where the answer will be, and the avatar waits (both products). When the
// answer lands the bubble's ground and edge fade in. A stopped answer keeps
// what was written and says Stopped under it (Knowledge's .msg-stopped).
//
//   <Message speaker="user" author={me}>Who is due today?</Message>
//   <Message speaker="aimy" status="streaming"><StreamingText text={t} streaming /></Message>
//
// Anything after the bubble (ResponseActions, follow-up Suggestions) goes in
// `after`, which lines up with the bubble, not the avatar.

type MessageProps = {
  speaker: Speaker
  status?: TurnStatus
  /** The person who asked (user turns). */
  author?: Person
  /** What the think-mark says while AiMY works. */
  thinkingLabel?: string | string[]
  /** Under the bubble: actions, follow-ups, sources. */
  after?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function Message({ speaker, status = "done", author, thinkingLabel, after, className, children }: MessageProps) {
  const aimy = speaker === "aimy"
  const thinking = aimy && status === "thinking"
  return (
    <div
      data-slot="message"
      data-speaker={speaker}
      data-status={status}
      className={cn("flex flex-col gap-1.5 px-1", !aimy && "items-end", className)}
    >
      <div className={cn("flex w-full items-start gap-3", !aimy && "flex-row-reverse")}>
        <span
          className={cn("mt-0.5 shrink-0 transition-[opacity] duration-(--t-base) ease-out", thinking && "opacity-0")}
        >
          {aimy ? (
            <AimyAvatar size="sm" className="rounded-md" />
          ) : (
            <Avatar name={author?.name ?? "You"} src={author?.src} size="sm" className="rounded-md" />
          )}
        </span>
        {thinking ? (
          <ThinkingIndicator label={thinkingLabel} />
        ) : (
          <div
            className={cn(
              "max-w-[33.75rem] min-w-0 border px-4 py-3 text-body font-medium",
              "transition-[background-color,border-color] duration-(--t-base) ease-out",
              aimy
                ? "rounded-xl rounded-tl-xs border-edge bg-raised text-ink"
                : "rounded-xl rounded-tr-xs border-accent/22 bg-accent-dim text-ink"
            )}
          >
            {children}
            {status === "stopped" ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
                <Ban className="size-3 shrink-0" aria-hidden="true" />
                Stopped
              </p>
            ) : null}
            {status === "failed" ? (
              <p className="mt-2 text-xs font-semibold text-err-text">
                AiMY couldn&apos;t finish this answer. Nothing was lost.
              </p>
            ) : null}
          </div>
        )}
      </div>
      {after && !thinking ? <div className={cn("flex flex-col gap-2", aimy ? "pl-10" : "pr-10")}>{after}</div> : null}
    </div>
  )
}
