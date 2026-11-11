import { Ban } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { ThinkingIndicator } from "@/components/thinking"
import type { Person, Speaker, TurnStatus } from "@/lib/ai-types"
import { cn } from "@/lib/utils"

// One turn in a conversation. Sales' shape, Nour's choice (28 Oct): your turn
// is a bubble up to 540px with 16px text beside your 28px face (8px corners),
// the square corner on your side.
//
// AiMY's turn has no mark and takes 95% of the thread (Nour, 11 Nov; Sales
// ead3a9e, Knowledge d3e44a2): the thread is AiMY's, so the mark said nothing
// the canvas does not, and the answer gets the room back. It starts on the
// thread's left edge, square corner top left.
//
// While AiMY is thinking the bubble is not drawn yet: the think-mark stands
// where the answer will be (both products). When the answer lands the
// bubble's ground and edge fade in. A stopped answer keeps what was written
// and says Stopped under it (Knowledge's .msg-stopped).
//
//   <Message speaker="user" author={me}>Who is due today?</Message>
//   <Message speaker="aimy" status="streaming"><StreamingText text={t} streaming /></Message>
//
// Anything after the bubble (ResponseActions, follow-up Suggestions) goes in
// `after`, which starts where AiMY's bubble starts.

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
        {aimy ? null : (
          <span className="mt-0.5 shrink-0">
            <Avatar name={author?.name ?? "You"} src={author?.src} size="sm" className="rounded-md" />
          </span>
        )}
        {thinking ? (
          <ThinkingIndicator label={thinkingLabel} />
        ) : (
          <div
            className={cn(
              "min-w-0 border px-4 py-3 text-body font-medium",
              "transition-[background-color,border-color] duration-(--t-base) ease-out",
              aimy
                ? "flex-[0_1_95%] rounded-xl rounded-tl-xs border-edge bg-raised text-ink"
                : "max-w-[33.75rem] rounded-xl rounded-tr-xs border-accent/22 bg-accent-dim text-ink"
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
      {after && !thinking ? <div className={cn("flex flex-col gap-2", !aimy && "pr-10")}>{after}</div> : null}
    </div>
  )
}
