import type { Metadata } from "next"
import { BriefingDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Briefing" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Briefing"
        lead="A briefing item a person can acknowledge or dismiss with a reason, and a cluster summarised."
      />
      <Section title="A coverage-gap card">
        <ThemePair>
          <BriefingDemo />
        </ThemePair>
      </Section>
      <Install name="briefing" exports="BriefingActions, Aggregate" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<BriefingActions onAcknowledge={ack} onDismiss={(reason) => dismiss(reason)} onUndo={restore} />\n<Aggregate stats={stats} rows={rows} more="+ 9 more topics · 24 asks combined" />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Capture why something was dismissed." dontText="Dismiss with no way back." />
        </div>
      </Section>
      <Source>
        <p>
          Built from the design system&apos;s briefing card and aggregate, your call on 28 Oct: neither product has
          acknowledge or dismiss yet. Acknowledge marks it seen; Dismiss opens the reasons in place, one click each (no
          menu, no dialog), and the reason is recorded. Both offer Undo (doctrine §5.9). The aggregate shows the totals,
          the top rows with their share, and what the rest add up to; the design system makes that last line required.
        </p>
      </Source>
      <A11y items={["The reasons are a labelled group of buttons; Dismiss reports whether they are open."]} />
    </>
  )
}
