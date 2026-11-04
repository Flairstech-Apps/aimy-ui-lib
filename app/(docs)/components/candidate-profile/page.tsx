import type { Metadata } from "next"
import { ProfileDemo } from "@/components/docs/chat-widget-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Candidate profile" }

export default function Page() {
  return (
    <>
      <PageHeader title="Candidate profile" lead="One candidate in full, inside the reply, when the question is about them." />
      <Section title="A profile in a reply">
        <ThemePair>
          <ProfileDemo />
        </ThemePair>
      </Section>
      <Install name="candidate-profile" exports="CandidateProfile" />
      <Section title="Use it">
        <CodeBlock>{`<WidgetFrame icon={<Briefcase />} title="Candidate profile" meta={company}>
  <CandidateProfile name={name} role={title} company={company} location={location}
    level="Junior" email={email} phone={phone} match={51} about={summary}
    experience={jobs} skills={skills}
    onOutreach={outreach} onDownloadCv={downloadCv} onAddNote={addNote} />
</WidgetFrame>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Show About in three lines and two jobs, and open the rest in place." dontText="Print the whole CV into the thread." />
          <DoDont doText="Let long text wrap." dontText="Keep text on one line until it runs out of the card." />
        </div>
      </Section>
      <Source>
        <p>{"The Knowledge app's ProfileCard: summary, work experience, skills, and View source, Download CV and Add note. It lived in a side panel, always dark, with no match. Nour picked the full profile in the reply on 4 Nov, over a summary that opens the canvas and a tabbed profile."}</p>
      </Source>
      <A11y items={["Read all and Show all say whether they are open.","Contact facts carry their names (Location, Level, Email, Phone) for screen readers."]} />
    </>
  )
}
