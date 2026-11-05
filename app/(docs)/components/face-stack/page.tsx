import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { TeamDoor, TeamFaces, TeamFacesMore, TeamList } from "@/components/docs/face-stack-demos"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Face stack" }

export default function FaceStackPage() {
  return (
    <>
      <PageHeader
        title="Face stack"
        lead="A group of people as one object: faces over each other, the first on top, the rest counted. As a door it opens the whole set, named."
      />
      <Section title="Faces only, and as a door">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="the people on a card">
              <TeamFaces />
            </Row>
            <Row label="past four, the rest counted">
              <TeamFacesMore />
            </Row>
            <Row label="a door: the rest of the team, each name opens the person">
              <TeamDoor />
            </Row>
            <Row label="a door with nothing behind a name: a list to read">
              <TeamList />
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Install name="face-stack" exports="FaceStack, FacePerson" />
      <Section title="Use it">
        <CodeBlock>{`// The people on a card
<FaceStack people={team} />

// Sales' door: the faces are whoever did not fit on the line, the menu is the roster
<FaceStack
  people={rest}
  menu={{ label: "4 more people", cap: "The team", people: team, onOpen: openPerson }}
/>`}</CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Give each person a <code className="font-mono text-ink">sub</code>, their job, for the menu. Without{" "}
          <code className="font-mono text-ink">onOpen</code> the names are a list in a popover, since a menu item with
          nothing behind it would light under the hand for no reason.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Stack faces where they stand for one group: a team, the people on a call, the rest of a crew."
            dontText="Stack faces that each need their own name or action; set those apart as a list."
          />
          <DoDont
            doText="Make the door's menu the whole set, so everyone can be found and opened in one place."
            dontText="List only the overflow in the menu, leaving the people on the line out of it."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; <code>teamStack</code> in <code>assets/bdr.js</code> and <code>.b-stack</code> and{" "}
          <code>.b-team-stack</code> in <code>assets/bdr.css</code> (Sales d24d176). Four faces (STACK_FACES), the first
          on top (Sales sets <code>direction: rtl</code>; here each face is a step higher), each ringed 2px in the ground
          colour so the edges stay apart where they cross. The count is the one face the stack does not have: the same
          circle on the raised ground with the card border. The door is a chip (the filter chip&apos;s hairline and a
          5% ground) with a 12px chevron at stroke 2.4, and its menu, captioned &quot;The team&quot;, lists every name
          with the person&apos;s job. Changed: the faces are 24px (the avatar&apos;s xs) where Sales draws 26, and the
          overlap is 8px in the door and 6px on a card, on the 4px scale.
        </p>
      </Source>
      <A11y
        items={[
          "Faces only, it is a named group: its name lists the people.",
          "As a door, it is a button named by what it holds (4 more people); the faces inside are hidden from screen readers so the name is said once. It opens the library's menu, with its keyboard model, or a named popover when the names are only to read.",
        ]}
      />
    </>
  )
}
