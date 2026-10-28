import type { Metadata } from "next"
import { CitationDemo } from "@/components/docs/ai2-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Citations and sources" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Citations and sources"
        lead="Every claim in an answer points at what it stands on, and the person can check it without leaving the answer."
      />
      <Section title="Citations in an answer, its sources, the drawer, and one plain line">
        <ThemePair>
          <CitationDemo />
        </ThemePair>
      </Section>
      <Install name="citation source-list source-line" exports="Citation, SourceList, SourceLine" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<p>Not once the licence is activated<Citation n={1} source={docs[0]} onFlag={flag} />.</p>\n<SourceList sources={docs} onOpen={openDoc} />\n<SourceList variant="drawer" sources={docs} onOpen={openDoc} />\n<SourceLine>From your last 3 calls</SourceLine>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Number citations in the order they appear, and match the source list."
            dontText="Cite a source the person can't open."
          />
          <DoDont
            doText="Let a person flag one citation."
            dontText="Ask for feedback on the whole answer when one source is wrong."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s <code>.cite</code>, <code>.cite-preview</code> and <code>sourceRow</code>. The chip&apos;s
          number matches the row it points at. The preview opens on hover and on keyboard focus, because a preview only
          a mouse can reach is not a way to verify. It shows the title, the trust state, the passage quoted, where the
          document came from, and Flag, Knowledge&apos;s per-citation feedback with its own toast. Rows open the
          document and take a second line below 520px rather than lose the title. The drawer is Knowledge&apos;s
          &quot;What this answer stands on&quot;, opened from Response actions. SourceLine is Sales&apos;{" "}
          <code>.s-ans-cite</code>: Sales has no numbered citations, only one plain line under an answer. Added to
          Knowledge&apos;s preview: Escape closes it, a tap opens it, and it uses the tooltip timing (transitions.dev
          17). Words Knowledge drew in faint ink are in secondary ink. Not built: the design system&apos;s Open source
          button and highlighted passage, which neither product uses.
        </p>
      </Source>
      <A11y
        items={[
          "Each chip is a button named Source 1: and its title; the preview opens on focus and Escape closes it.",
          "Flag is a real button inside the preview, reachable by Tab.",
          "Sources are an ordered list of buttons, in citation order.",
        ]}
      />
    </>
  )
}
