import type { Metadata } from "next"
import { DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Writing" }

const RULES: [string, string][] = [
  ["Call the customer back today.", "Ring the customer back today."],
  ["Your contacts", "Your board, your book"],
  ["Send the follow-up", "Open, Learn more, Click here"],
  ["Three calls need a reply.", "Warm leads are heating up!"],
  ["Couldn't save. Check your connection and try again.", "Something went wrong."],
  ["Meeting Set", "MEETING SET"],
]

export default function WritingPage() {
  return (
    <>
      <PageHeader
        title="Writing"
        lead="Plain English, short sentences, a verb on every button. Words carry state, so they have to be readable and exact."
      />
      <Section title="The rules">
        <ul className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>Say &quot;call&quot;, never &quot;ring&quot;. Say &quot;contacts&quot;, never &quot;board&quot; or &quot;book&quot;.</li>
          <li>No sales slang: no &quot;warm&quot;, &quot;cold&quot;, &quot;hot&quot; or &quot;heating up&quot;.</li>
          <li>Name the action. Never &quot;Open&quot; or &quot;Learn more&quot; when the action has a real name.</li>
          <li>An error says what happened and what to do next.</li>
          <li>A tag is the name of a state, in sentence case. Two words both get capitals: Meeting Set.</li>
          <li>Never mute text to show a state. Say the state in words and colour.</li>
          <li>AiMY&apos;s own actions are labelled as AiMY&apos;s, never shown as the user&apos;s.</li>
        </ul>
      </Section>
      <Section title="Side by side">
        <div className="flex flex-col gap-3">
          {RULES.map(([d, x]) => (
            <DoDont key={d} doText={d} dontText={x} />
          ))}
        </div>
      </Section>
    </>
  )
}
