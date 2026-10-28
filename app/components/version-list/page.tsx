import type { Metadata } from "next"
import { VersionListDemo } from "@/components/docs/ai3-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Version list" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Version list"
        lead="Every version of a document, with AiMY's edits as ordinary versions that say who accepted them."
      />
      <Section title="Three versions, one written by AiMY">
        <ThemePair>
          <VersionListDemo />
        </ThemePair>
      </Section>
      <Install name="version-list" exports="VersionList" />
      <Section title="Use it">
        <CodeBlock>{"<VersionList versions={versions} selected={picked} onPick={(v) => setPicked(v.id)} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Name the person who accepted an AI edit." dontText="Hide AI edits in a separate history." />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>versionList</code>: a version number in the margin, or the AiMY mark on AiMY&apos;s
          blue for a version it wrote, the label, who and how (&quot;AiMY · accepted by Dana Whitfield&quot;), and the
          date, with Current on the newest. AI edits are marked, not set apart. Restoring adds a new version and deletes
          nothing, so the trail never gets a hole; use ChangeReview for it. The design system&apos;s version compare is
          used by neither product.
        </p>
      </Source>
      <A11y items={["An ordered list; pickable rows are toggle buttons that say which version they are."]} />
    </>
  )
}
