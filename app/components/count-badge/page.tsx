import { Bell, MessageSquare } from "lucide-react"
import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { CountBadge } from "@/registry/aimy/ui/count-badge"
import { IconButton } from "@/registry/aimy/ui/icon-button"

export const metadata: Metadata = { title: "Count badge" }

export default function CountBadgePage() {
  return (
    <>
      <PageHeader title="Count badge" lead="How many unread things wait behind a control. White on AiMY red, ringed in the page colour, pinned to the top right." />
      <Section title="On a control">
        <ThemePair>
          <Row label="3, 12, and more than 99">
            <span className="relative">
              <IconButton label="Notifications">
                <Bell />
              </IconButton>
              <CountBadge count={3} label="unread notifications" />
            </span>
            <span className="relative">
              <IconButton label="Messages">
                <MessageSquare />
              </IconButton>
              <CountBadge count={12} label="unread messages" />
            </span>
            <span className="relative">
              <IconButton label="Notifications">
                <Bell />
              </IconButton>
              <CountBadge count={140} label="unread notifications" />
            </span>
          </Row>
        </ThemePair>
      </Section>
      <Install name="count-badge" exports="CountBadge" />
      <Section title="Use it">
        <CodeBlock>{`<span className="relative">
  <IconButton label="Notifications"><Bell /></IconButton>
  <CountBadge count={unread} label="unread notifications" />
</span>`}</CodeBlock>
      </Section>
      <Source>
        <p>
          The design system&apos;s <code>.count-badge</code> on Sales&apos; <code>--badge-ground</code> (#d92d20), now a token.
          White on the dark theme&apos;s <code>--err</code> read only 2.6:1; on this ground it reads 4.8:1. At zero it
          renders nothing. The arrival animation (transitions.dev notification badge) lands with the topnav bell.
        </p>
      </Source>
      <A11y items={["The visible number is hidden from screen readers; they hear the full count and what it counts instead."]} />
    </>
  )
}
