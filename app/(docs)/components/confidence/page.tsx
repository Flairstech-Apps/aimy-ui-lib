import type { Metadata } from "next"
import { ConfidenceDemo, ScoreDemo } from "@/components/docs/ai2-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Confidence and score" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Confidence and score"
        lead="How sure AiMY is about a fact, in words that say what limits it; and, separately, how well something scores."
      />
      <Section title="Confidence on a contact's facts: checked, out of date, partly known, not known yet">
        <ThemePair>
          <ConfidenceDemo />
        </ThemePair>
      </Section>
      <Section title="Score: Knowledge's Fit meter">
        <ThemePair>
          <ScoreDemo />
        </ThemePair>
      </Section>
      <Install name="confidence score" exports="Confidence, Score" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Confidence level="old" group="Company" source="on LinkedIn" checkedIn="March 2025" onCheckAgain={recheck} />\n<Confidence level="gap" group="Contact details" missing={["a direct line"]} onFindOut={research} />\n<Score value={82} label="Fit" />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say what limits a fact: May be out of date. Last checked March 2025."
            dontText="Show Low confidence with no reason."
          />
        </div>
      </Section>
      <Source>
        <p>
          Both, named apart, your choice on 28 Oct. Confidence is Sales&apos; <code>.b-conf</code>: no high, medium or
          low, but a word that says what limits it: a check when it is fine, May be out of date after a year, Partly
          known, Not known yet. Hover or focus explains where the facts came from and when, with Check again or Find out
          more. The explanation opens after 120ms and closes at once, with a bridge the pointer can cross, as in Sales;
          Escape also closes it. Score is Knowledge&apos;s ICP Fit badge: three bars and the number, high from 75 and
          medium from 50. A score says how well something matches; it is not confidence. The design system&apos;s
          &quot;High confidence&quot; label is used by neither product.
        </p>
      </Source>
      <A11y
        items={[
          "The badge is a button named by its word and group; its explanation is linked to it and opens on focus.",
          "Score is read as Fit 82 out of 100, high.",
        ]}
      />
    </>
  )
}
