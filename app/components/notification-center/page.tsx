import type { Metadata } from "next"
import { NotificationCenterDemo } from "@/components/docs/shell-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Notification center" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Notification center"
        lead="The bell and what it opens: what needs you, and the one thing to do about each."
      />
      <Section title="Three things, one read; then none">
        <ThemePair>
          <NotificationCenterDemo />
        </ThemePair>
      </Section>
      <Install name="notification-center" exports="NotificationCenter" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<NotificationCenter items={[\n  { id: "1", type: "Callback overdue", when: "09:40", severity: 1, body: "Youssef asked to be called after 3pm.",\n    action: { label: "Call Youssef", onClick: call } },\n]} onMarkAllRead={readAll} onAsk={askAimy} ping={ping} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Give each row the one thing to do about it." dontText="Fade what has been read." />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; panel, your call on 28 Oct (<code>.ntf-panel</code>, bdr.css 1669-1753 over sales.css 1451-1538).
          360px, 14px corners, opening from the bell&apos;s corner with the library&apos;s dropdown motion. &quot;Needs
          you&quot; with the unread count and &quot;Mark all read&quot;; a row per thing with a 5px severity dot (red
          needs you now, amber soon, brand for your information) beside its type in words, when, one sentence, and the
          one thing to do about it; at the foot, one question for AiMY. Sales fades a read row to 45%; here a read row
          keeps its ink, its dot goes hollow and its time says &quot;read&quot;. Empty, it says &quot;Nothing is waiting
          on you.&quot; The bell is the NotificationBell, so a ping rings it and says what finished. Below 520px the
          panel spans the window under the bar.
        </p>
      </Source>
      <A11y
        items={[
          "The bell names the unread count and says when its panel is open; the panel is a named dialog, and the severity is said by the type's words, not the dot alone.",
        ]}
      />
    </>
  )
}
