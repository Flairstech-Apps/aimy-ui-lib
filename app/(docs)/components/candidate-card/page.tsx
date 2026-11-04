import type { Metadata } from "next"
import { CandidateCardsDemo } from "@/components/docs/chat-widget-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Candidate card" }

export default function Page() {
  return (
    <>
      <PageHeader title="Candidate card" lead="One candidate in a grid of cards: who they are, how well they fit, where they work, and what to do next." />
      <Section title="Recommended candidates">
        <ThemePair>
          <CandidateCardsDemo />
        </ThemePair>
      </Section>
      <Install name="candidate-card" exports="CandidateCard, CandidateCards" />
      <Section title="Use it">
        <CodeBlock>{`<CandidateCards
  candidates={[{ id, name, role, company, location, match: 82, skills }]}
  onView={openProfile} onEmail={email} onOutreach={startOutreach} />`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Name two skills and count the rest." dontText="Cut names to two words or squeeze skills into a fixed box." />
          <DoDont doText="Use the app's actions: View profile, Email, Start outreach." dontText="Add actions the product does not have." />
        </div>
      </Section>
      <Source>
        <p>{"The Knowledge app's CandidateCard and its chat's candidates table (CandidatesTable): name, role, match, location, company, skills, and Email and Outreach. Nour picked the two-across cards on 4 Nov over ranked rows and a why-they-match card. The match is the library's Fit badge, which replaced four different rings and circles."}</p>
      </Source>
      <A11y items={["Each card is an article named by the person.","The Fit badge reads as a sentence: Fit 82 out of 100, high.","Email and Start outreach name the person they act on."]} />
    </>
  )
}
