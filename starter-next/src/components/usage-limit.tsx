import { Notice } from "@/components/notice"

// What a person is told when they reach a usage limit, in the products' words
// (Knowledge's usage widget, ported to Sales; PLAN.md §9a). Going past a share
// is said, never blocked: "You can keep going." A hard limit says when it
// starts again; an admin's stop says who can turn it back on. What still
// works is always said. Pair it with the Composer: its `unavailable` sentence
// ("Chats are stopped. Filters still work.") and the usage ring in red.
//
//   <UsageLimit state="past" what="chats" detail="36 chats past your share, $10.80 extra this month." />
//   <UsageLimit state="reached" what="chats" resets="1 November" stillWorks="Filters and search still work." />
//   <UsageLimit state="stopped" what="chats" action={<Button size="sm">Ask your admin</Button>} />

type UsageLimitProps = {
  state: "past" | "reached" | "stopped"
  /** What is counted, plural: "chats". */
  what: string
  /** For past: the cost, in a sentence. */
  detail?: string
  /** For reached: when it starts again. */
  resets?: string
  /** What still works while it is stopped. */
  stillWorks?: string
  action?: React.ReactNode
  className?: string
}

export function UsageLimit({ state, what, detail, resets, stillWorks, action, className }: UsageLimitProps) {
  const title = state === "past" ? "Past your share" : state === "reached" ? "Limit reached" : "Stopped"
  const body =
    state === "past"
      ? `${detail ? detail + " " : ""}You can keep going.`
      : state === "reached"
        ? `You've used all your ${what} for now.${resets ? ` They start again on ${resets}.` : ""}${stillWorks ? " " + stillWorks : ""}`
        : `An admin has stopped your ${what}. Ask your admin to turn them back on.${stillWorks ? " " + stillWorks : ""}`
  return (
    <Notice tone={state === "past" ? "warn" : "err"} title={title} action={action} className={className}>
      {body}
    </Notice>
  )
}
