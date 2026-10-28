import type { Metadata } from "next"
import { BriefDemo } from "@/components/docs/micro-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Brief" }

export default function Page() {
  return (
    <>
      <PageHeader title="Brief" lead="What AiMY has to say at the top of a page, in the shape each product says it." />
      <Section title="Sales' Today, Sales' lead finding, Knowledge's greeting, and a short AiMY note">
        <ThemePair>
          <BriefDemo />
        </ThemePair>
      </Section>
      <Install
        name="brief"
        exports="Brief, BriefHead, BriefLines, BriefFigure, BriefDeck, BriefActions, BriefStarts, BriefNext, BriefLink, DayBrief"
      />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Brief ground="wash">\n  <BriefHead title="Today" meta="28 Oct" />\n  <BriefLines lines={[<><BriefLink onClick={open}>4 callbacks</BriefLink> are past the day they asked for.</>]} />\n  <BriefStarts starts={[{ label: "Call the next one", n: 107, why: "Amelia Taylor is top of the queue", onClick: next }]} />\n</Brief>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Put the numbers in the sentence and make each one open what it counts."
            dontText="Show a row of numbers with no sentence."
          />
        </div>
      </Section>
      <Source>
        <p>
          Built from parts, your call on 28 Oct, so it can be used as Sales has it, as Knowledge has it, or for any AiMY
          information. Sales&apos; Today (<code>.slv</code>): the AiMY wash, the large title and the date, the day in
          sentences, each number a link to the set it counts, then ways to start. Each start has a verb, how many are
          behind it and why; the reason is what stops it being a menu, so it wraps and never truncates. Sales&apos; lead
          finding (<code>.s-insight.is-lead</code>): the small AiMY line with its work state, one large figure and its
          sentence, the consequence as the loudest line, then actions. Knowledge&apos;s greeting: sentences, then
          &quot;Worth asking&quot; on a line of its own above the questions. Compact, it is a short AiMY note. DayBrief
          is Sales&apos; Today, ready made. Muted and faint words are secondary ink.
        </p>
      </Source>
      <A11y
        items={["A named region; numbers are buttons that open the set they count; starts are a labelled group."]}
      />
    </>
  )
}
