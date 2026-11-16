import type { Metadata } from "next"
import { SwipeDemo } from "@/components/docs/behavior-parts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Swipe row" }

export default function Page() {
  return (
    <>
      <PageHeader title="Swipe row" lead="A row on a phone that slides to show an action behind it: archive a notification, snooze a task." />
      <Section title="Snooze on the left, archive on the right">
        <ThemePair>
          <SwipeDemo />
        </ThemePair>
      </Section>
      <Install name="swipe-row" exports="SwipeRow" />
      <Section title="Use it">
        <CodeBlock>{"<SwipeRow\n  leading={{ label: \"Snooze\", icon: <BellOff />, tone: \"warn\", onAction: snooze }}\n  trailing={{ label: \"Archive\", icon: <Archive />, tone: \"info\", onAction: archive }}\n>\n  <NotificationRow />\n</SwipeRow>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Put the same actions in the row's menu too: swiping is a shortcut, not the way." dontText="Hide an action people need behind a swipe only." />
          <DoDont doText="Make destructive swipes undoable with a toast, and keep fullSwipe for actions Undo can take back." dontText="Use fullSwipe for delete." />
        </div>
      </Section>
      <Source>
        <p>Built on AiMY's swipe behaviour (<code>createSwipeActions</code>, with <code>rubberBand</code> past the edge). Actions sit on the status grounds so they read by word and colour; the row settles with the base duration on the smooth-out curve.</p>
      </Source>
      <A11y items={["Each action is a real button: Tab reaches it, which slides the row open; Enter runs it.", "Under reduced motion the row moves without a transition."]} />
    </>
  )
}
