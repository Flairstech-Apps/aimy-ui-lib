import type { Metadata } from "next"
import { TrustDisclosureDemo } from "@/components/docs/ai2-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Trust disclosure" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Trust disclosure"
        lead="Every answer says what it is grounded on, and never stays silent when nothing could answer."
      />
      <Section title="Problems with the sources, and an answer nothing grounded">
        <ThemePair>
          <TrustDisclosureDemo />
        </ThemePair>
      </Section>
      <Install name="trust-disclosure" exports="TrustDisclosure, DisclosureAction" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<TrustDisclosure rows={[{ tone: "err", children: <><strong>One cited source is behind Confluence</strong> — …</> }]} />\n\n<TrustDisclosure exclusion rows={[{ tone: "none", children: <><strong>0 sources matched.</strong> …</> }]}\n  actions={<DisclosureAction onClick={raise}>Raise it as a coverage gap →</DisclosureAction>} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say why nothing answered, and offer the way forward."
            dontText="Show an empty answer with no reason."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>.trust-disclosure</code>, with its own copy: a row per thing worth knowing about the
          sources, in the status inks, and the warm ground when nothing could answer, with the ways forward as plain
          links. The design system&apos;s rule: every answer states its grounding, and the exclusion case is never
          silent, or a governance gap looks the same as a gap in the content. Knowledge never draws an all-clear row; ok
          is here for a product that wants to say so.
        </p>
      </Source>
      <A11y
        items={[
          "A note named What this answer is grounded on; each row's icon is decoration, the words carry the state.",
        ]}
      />
    </>
  )
}
