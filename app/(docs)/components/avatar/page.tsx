import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { AimyAvatar, Avatar, AvatarGroup } from "@/registry/aimy/ui/avatar"

export const metadata: Metadata = { title: "Avatar" }

const TEAM = [{ name: "Engy Hassan" }, { name: "Lina Farouk" }, { name: "Sherif Adel" }, { name: "Rami Saleh" }, { name: "Mona Kamal" }, { name: "Omar Nabil" }]

export default function AvatarPage() {
  return (
    <>
      <PageHeader title="Avatar" lead="People and AiMY, told apart at a glance: a person is a face or initials in a circle; AiMY is its mark on its tile." />
      <Section title="People and AiMY">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="xs 24, sm 28, md 32, lg 44">
              <Avatar name="Engy Hassan" size="xs" />
              <Avatar name="Engy Hassan" size="sm" />
              <Avatar name="Engy Hassan" />
              <Avatar name="Engy Hassan" size="lg" />
            </Row>
            <Row label="AiMY">
              <AimyAvatar size="sm" />
              <AimyAvatar />
              <AimyAvatar size="lg" />
            </Row>
            <Row label="a group, past four">
              <AvatarGroup people={TEAM} />
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Install name="avatar" exports="Avatar, AimyAvatar, AvatarGroup" />
      <Section title="Use it">
        <CodeBlock>{`<Avatar name="Engy Hassan" src={photoUrl} />
<AimyAvatar />
<AvatarGroup people={attendees} max={4} />`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont doText="Show what AiMY did with AimyAvatar, every time." dontText="Show an AiMY action with the user's face, or a person with the AiMY mark." />
      </Section>
      <Source>
        <p>
          Initials on <code>--grad-avatar</code> from <code>.avatar</code>; the photo ring from Sales&apos; <code>.b-face</code>;
          AiMY&apos;s tile from Knowledge&apos;s <code>.aimy-av-tile</code>, now the <code>--aimy-tile</code> tokens. Initials use
          12px at 24 and 28 (the products set 10px in the topnav, below the 12px floor).
        </p>
      </Source>
      <A11y items={["A person's avatar is an image named for them.", "If the photo fails to load, the initials show instead of a broken image."]} />
    </>
  )
}
