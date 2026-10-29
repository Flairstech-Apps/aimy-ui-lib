import type { Metadata } from "next"
import { WorkStateDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Work state" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Work state"
        lead="Where every item AiMY surfaces stands: noticed, suggested, written, waiting on you, done, or stopped."
      />
      <Section title="The six states, and a state in its own words">
        <ThemePair>
          <WorkStateDemo />
        </ThemePair>
      </Section>
      <Install name="work-state" exports="WorkState, workStateLabel" />
      <Section title="Use it">
        <CodeBlock>
          {'<WorkState state="staged" />\n<WorkState state="detected" label="Read off the record" />'}
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Put a work state on every item AiMY surfaces."
            dontText="Show an AI item with no state, or merge two states into one."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; pill (<code>.work-state</code>, no dot), with Sales&apos; words, your choice on 28 Oct: Found,
          Suggested, Drafted, Awaiting you, Done, Stopped. Each of the six claims has its own hue: info, accent, cyan,
          warn, ok, err. Sales lets a pill say something more specific beside the AiMY mark (&quot;Read off the
          record&quot;), and the doctrine allows Blocked and Handled as display words, but the state is always one of
          the six (§2.3: collapsing them is a preservation-of-agency violation). Knowledge never draws the pill, only
          filter chips; its words (Flagged, Draft, Up to date, Blocked) are not used. In light, each word is its
          readable status ink.
        </p>
      </Source>
      <A11y items={["The state is a word; colour only repeats it."]} />
    </>
  )
}
