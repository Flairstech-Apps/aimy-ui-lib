import type { Metadata } from "next"
import { TrustStateDemo } from "@/components/docs/ai2-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Trust state" }

export default function Page() {
  return (
    <>
      <PageHeader title="Trust state" lead="The condition of a source, said on the source in words and colour." />
      <Section title="Each status, and one set by hand">
        <ThemePair>
          <TrustStateDemo />
        </ThemePair>
      </Section>
      <Install name="trust-state" exports="TrustState, trustLabel" />
      <Section title="Use it">
        <CodeBlock>{'<TrustState status="outdated" />\n<TrustState status="current" setByHand />'}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show the status wherever the source is cited."
            dontText="Hide a source's condition behind a hover."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>statusBadge</code> and its seven statuses, computed from owner, use, freshness and
          agreement: No issues, Out of date, Conflicting, Draft, Unowned, Unused, and Superseded. Superseded is the one
          excluded from answers, so it says Not in answers on the badge itself. Every other status still answers, and an
          answer citing one says so. The title says why; a dot marks a status set by hand. Pill-shaped, in
          Knowledge&apos;s readable status inks. The design system&apos;s five (Verified, Due, Expired, Unverified,
          Superseded) are used by neither product; their tones are what these are drawn in.
        </p>
      </Source>
      <A11y items={["The status is a word, never only a colour; the reason is in the title."]} />
    </>
  )
}
