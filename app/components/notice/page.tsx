import type { Metadata } from "next"
import { NoticeDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Notice" }

export default function Page() {
  return (
    <>
      <PageHeader title="Notice" lead="Something worth knowing about what's on the page, with the way to resolve it." />
      <Section title="Info, warn, err, ok, neutral">
        <ThemePair>
          <NoticeDemo />
        </ThemePair>
      </Section>
      <Install name="notice" exports="Notice" />
      <Section title="Use it">
        <CodeBlock>{"<Notice tone=\"err\" title=\"The last sync failed.\" action={<Button size=\"sm\" onClick={retry}>Try again</Button>}>\n  Nothing was changed.\n</Notice>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what happened and give the fix as a button." dontText="Show a red box with no way out." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s document notice (<code>.dv-notice</code>), settings notes (<code>.set2-note</code>) and sync alerts (<code>.set2-dc-alert</code>), and Sales&apos; outcome callout (<code>.b-state</code>). Knowledge&apos;s neutral note drew a 2px rule down the left edge; that became a tinted ground, because AiMY never uses left stripes. The design system&apos;s <code>.banner</code> and <code>.inline-note</code> were never used.</p>
      </Source>
      <A11y items={["err is announced at once (role alert); the others politely (role status).","The icon is decoration; the words carry the meaning."]} />
    </>
  )
}
