import type { Metadata } from "next"
import { UsageLimitDemo } from "@/components/docs/micro-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Usage limits" }

export default function Page() {
  return (
    <>
      <PageHeader title="Usage limits" lead="What a person is told at a limit, and what still works." />
      <Section title="Past the share, limit reached, stopped by an admin, and the composer while stopped">
        <ThemePair>
          <UsageLimitDemo />
        </ThemePair>
      </Section>
      <Install name="usage-limit usage composer" exports="UsageLimit, UsageSummary, Composer" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<UsageLimit state="past" what="chats" detail="36 chats past your share, $10.80 extra this month." />\n<UsageLimit state="stopped" what="chats" stillWorks="Filters still work." action={<Button size="sm">Ask your admin</Button>} />\n<Composer unavailable="Chats are stopped. Filters still work." usage={{ fill: 1, tone: "err", label: "Your usage: chats are stopped", content: … }} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say what still works, and who can lift the limit."
            dontText="Grey out the product with no sentence."
          />
        </div>
      </Section>
      <Source>
        <p>
          Usage limits, added to the plan on 28 Oct (PLAN.md §9a), in the products&apos; words from Knowledge&apos;s
          usage widget, which Sales ports. Going past a share is said, never blocked: &quot;You can keep going.&quot; A
          limit says when it starts again. An admin&apos;s stop says who can turn it back on. Each always says what
          still works. The composer keeps everything typed: its placeholder becomes the sentence, the ring turns red,
          and a question sent while stopped goes when chats are back on.
        </p>
      </Source>
      <A11y items={["Past the share is a status; reached and stopped are alerts. Each says the state in words."]} />
    </>
  )
}
