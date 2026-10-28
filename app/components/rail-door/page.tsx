import type { Metadata } from "next"
import { RailDoorDemo } from "@/components/docs/shell-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Rail doors" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Rail doors"
        lead="The standing facts beside every page, each a way into the page that holds it."
      />
      <Section title="The diary on an empty day, a client's journey, and the year">
        <ThemePair>
          <RailDoorDemo />
        </ThemePair>
      </Section>
      <Install name="rail" exports="RailDoors, RailDoor, RailDoorMiss" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<RailDoors>\n  <RailDoor cap="Today" clock fig="10:30" who="Dana Whitfield" kind="Demo" go="Open the diary" onClick={openDiary} />\n  <RailDoor cap="Financials" fig="€182k" of="gained" bar={{ value: 182, target: 300 }}\n    say={<>€11k behind, and <RailDoorMiss>3 calls missed</RailDoorMiss>.</>} go="Open the report" onClick={openReport} />\n</RailDoors>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Make a standing fact the way into its page."
            dontText="Open a panel off the rail across the page."
          />
        </div>
      </Section>
      <Source>
        <p>
          Added to the plan on 28 Oct (Nour). Sales&apos; doors (<code>.b-door</code> in <code>.rail-doors</code>,
          bdr.css 4844-5003 and 5199-5203; built by <code>diaryDoor</code>, <code>railDoors</code> and{" "}
          <code>yearCard</code> in bdr.js 10134-10386). A standing fact and the page it opens: what is in the diary
          today (the time as the figure with a clock, then who and what kind; on an empty day it says so and counts the
          fortnight ahead), what has been gained or signed against target (a 6px bar in the success ink, a mark at the
          target, the scale the target plus a fifth, and a sentence on the pace with any misses in the error ink), and
          how many days a client&apos;s year has left. Each is one button that names where it goes, with the arrow
          moving on hover; never a panel hanging off the rail. In the rail they take the smaller size (13 by 14px
          padding, the figure at 20px); elsewhere they are full size. Sales&apos; caption ink is secondary ink here.
        </p>
      </Source>
      <A11y items={["Each door is one button whose name is everything it says, ending with where it goes."]} />
    </>
  )
}
