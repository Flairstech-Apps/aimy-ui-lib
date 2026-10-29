import type { Metadata } from "next"
import { UsageDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Usage" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Usage"
        lead="How much of AiMY a person has used, on the composer's mark, in words with the numbers."
      />
      <Section title="The ring, and the numbers behind it">
        <ThemePair>
          <UsageDemo />
        </ThemePair>
      </Section>
      <Install name="usage composer" exports="UsageSummary, Composer" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Composer usage={{ fill: 0.67, tone: "warn", label: "Your usage: 67% of this slice, past your share",\n  content: <UsageSummary groups={groups} link={{ label: "Usage", href: "/usage" }} /> }} … />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say what going past a share costs, and that they can keep going."
            dontText="Block someone at a soft limit without saying why."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s usage widget, which Sales ports: a ring round the composer&apos;s AiMY mark fills as the
          slice is used, amber past the share, red when stopped. Hover (after 220ms), focus or a press opens the
          numbers: per period, &quot;336 of 300&quot; with a meter and what it means. Going past a share is said, never
          blocked: &quot;36 chats past your share, $10.80 extra this month. You can keep going.&quot;
        </p>
      </Source>
      <A11y items={["The mark is a button named with the usage; the popover closes on Escape and returns to it."]} />
    </>
  )
}
