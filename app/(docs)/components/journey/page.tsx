import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { Journey } from "@/registry/aimy/ui/journey"

export const metadata: Metadata = { title: "Journey" }

const DANA = [
  { label: "Already a contact", detail: "from the start" },
  { label: "First called", detail: "11 Jul · Engy" },
  { label: "No answer", detail: "27 Aug" },
  { label: "Callback", detail: "24 Oct", tone: "warn" as const },
  { label: "Answered", detail: "12 Nov", tone: "ok" as const },
]

const KESTREL = [
  { label: "Found on a list", detail: "2 Jun" },
  { label: "First called", detail: "9 Jun · Lina" },
  { label: "No answer", detail: "12 Jun" },
  { label: "No answer", detail: "19 Jun" },
  { label: "Answered", detail: "3 Jul", tone: "ok" as const },
  { label: "Interested", detail: "18 Jul", tone: "ok" as const },
  { label: "Meeting", detail: "2 Sep · Omar · went well", tone: "ok" as const },
  { label: "Signed", detail: "30 Sep · Omar", tone: "ok" as const },
]

export default function JourneyPage() {
  return (
    <>
      <PageHeader
        title="Journey"
        lead="How someone got where they are, left to right: each step that happened, and where they stand now."
      />
      <Section title="A contact's story" lead="Sales' contact page: every step filled in the tone of how it went; the last is an open ring, where Dana stands now.">
        <ThemePair>
          <div className="rounded-lg bg-card p-5">
            <Journey label="How Dana got here" steps={DANA} />
          </div>
        </ThemePair>
      </Section>
      <Section title="A long story" lead="Eight steps keep the first and the last four; the three between are said in words on a dashed line.">
        <ThemePair>
          <div className="rounded-lg bg-card p-5">
            <Journey label="How Kestrel Logistics got here" steps={KESTREL} />
          </div>
        </ThemePair>
      </Section>
      <Install name="journey" exports="Journey" />
      <Section title="Use it">
        <CodeBlock>{`<Journey label="How Dana got here" steps={[
  { label: "Already a contact", detail: "from the start" },
  { label: "First called", detail: "11 Jul · Engy" },
  { label: "Callback", detail: "24 Oct", tone: "warn" },
  { label: "Answered", detail: "12 Nov", tone: "ok" },
]} />`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Give every step when it happened and, where it matters, who did it: 11 Jul · Engy."
            dontText="Draw steps with no date, so the strip is a stepper nobody stepped through."
          />
          <DoDont
            doText="Keep it to six steps; let the stretch between say how many it hides."
            dontText="Scroll a long story sideways inside a page that scrolls."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; story strip (<code>.b-story-line</code>, bdr.css 2174-2238, filled by <code>storyOf</code> in
          bdr.js): filled dots joined by a 2px line in the d400 ink, the last an open ring in its tone with a 6px halo,
          and Sales&apos; <code>storyTrim</code> (the first step, the hidden stretch in words, the last four). Changed: the
          dates are the secondary ink, not muted; the dots take the status fills; sides are logical, so it reads right to
          left on a right-to-left page; and the ground the dots cut out of is <code>--jr-ground</code>, the card by default.
        </p>
      </Source>
      <A11y
        items={[
          "An ordered list with a name; the last step carries aria-current=\"step\".",
          "Tone is drawn only; each step's words say what happened, so nothing rests on colour.",
          "The hidden stretch is read as its words (3 steps more); the dots are hidden from screen readers.",
        ]}
      />
    </>
  )
}
