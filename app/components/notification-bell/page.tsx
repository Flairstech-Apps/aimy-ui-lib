import type { Metadata } from "next"
import { BellDemo } from "@/components/docs/micro-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Notification bell" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Notification bell"
        lead="The bell says something landed: the count pops, the bell rocks, one line says what."
      />
      <Section title="Something finishes, something fails">
        <ThemePair>
          <BellDemo />
        </ThemePair>
      </Section>
      <Install name="notification-bell" exports="NotificationBell" />
      <Section title="Use it">
        <CodeBlock>
          {
            "<NotificationBell count={unread} open={panelOpen} onClick={toggle}\n  ping={{ id: n.id, text: <b>Recording processed</b> }} />"
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Ring for something the person was waiting on."
            dontText="Ring the bell for every background event."
          />
        </div>
      </Section>
      <Source>
        <p>
          Micro-interactions, added to the plan on 28 Oct (PLAN.md §9a). The ring and the tip are Knowledge&apos;s, from
          the note taker. The bell rocks from its top, the way a bell hangs: three swings that die away in 600ms. One
          line drops from under it saying what finished, then goes after about a second and a half: 250ms in, 150ms out,
          no blur, nothing to press. Its point stays on the bell even when the line is pushed in from the window&apos;s
          edge. The count slides on and pops with transitions.dev&apos;s notification badge (03). Neither the ring nor
          the tip shows while the bell&apos;s panel is open, because the row is already there. Under reduced motion the
          bell stays still and the line only fades.
        </p>
      </Source>
      <A11y items={["The bell is named with the unread count; the tip is a polite status, so it is read out once."]} />
    </>
  )
}
