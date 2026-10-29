import type { Metadata } from "next"
import { DocPageDemo, DocStatesDemo } from "@/components/docs/document-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Document page" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Document page"
        lead="A document to read and keep right: its state, its history, the tools to write it, and the details beside it."
      />
      <Section title="Knowledge's document page: select words, write in the body, open the versions, report a problem">
        <DocPageDemo />
      </Section>
      <Section title="The notices, and a blank document">
        <ThemePair>
          <DocStatesDemo />
        </ThemePair>
      </Section>
      <Install
        name="document doc-editor suggestion trust-state"
        exports="DocPage, SaveState, DocHead, DocNotice, DocByline, DocVersions, VersionPreview, DocTitle, DocStart, DocComments, DocRail, RailBlock, RailAction, DocInsights, DocRailFoot"
      />
      <Section title="Use it">
        <CodeBlock>
          {
            '<DocPage back={{ label: "All documents", onClick: close }}\n  end={<SaveState state={dirty ? "unsaved" : "saved"} savedAt="09:12" onSave={save} onDiscard={discard} />}\n  rail={<DocRail foot={<DocRailFoot onReport={report} onArchive={confirmArchive} />}>\n    <RailBlock title="What it is">…</RailBlock>\n  </DocRail>}>\n  <DocHead byline={<DocByline status={<TrustState status="outdated" />} owner={{ name: "Dana Whitfield" }}\n    source={{ label: "Confluence", href }} versions={<DocVersions updated="12 Oct" versions={versions} onOpen={read} />} />} />\n  <DocTitle onChange={rename}>Refunds on annual plans</DocTitle>\n  <DocEditor html={body} onChange={markDirty} onSelectionAction={propose} docActions={actions} onDocAction={propose} />\n  <DocComments comments={comments} onAdd={add} onResolve={resolve} />\n</DocPage>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say the document's state and the way out of it."
            dontText="Redirect from a replaced document without saying so."
          />
        </div>
      </Section>
      <Source>
        <p>
          Added by your request on 29 Oct. Knowledge&apos;s document page (console.html <code>?doc=</code>,{" "}
          <code>renderDoc</code> in knowledge.js 7253-7570; knowledge.css 4029-4800). The paper and, beside it, 20rem of
          details; under 1100px of its own width the details go below. The bar goes back to where you came from, says
          &quot;Saved · 09:12&quot; or &quot;Unsaved changes&quot; with Discard and Save (and Publish on a draft, or why
          not yet), and hides or shows the details. The head: a notice when the document is archived, replaced or out of
          date, with the way out of that state, never a silent redirect; the byline (trust state, kind, owner, where it
          came from with a link to the original, the collection, and &quot;Updated 12 Oct&quot; with its versions, which
          open the version list); the title, editable in place. Opening an old version says so above the paper, with
          Restore and Back to the current one. The details: AiMY noticed (two things at most, each with its next step),
          the blocks you fold (what it is, what it connects to, where it came from) with outlined actions, and at the
          foot Report a problem, Archive or Restore, Delete. Then the comments, where a reported problem is marked and
          can be resolved. Changed on purpose: Report a problem opens in place rather than in a modal; Archive and
          Delete go to a typed confirmation (ChangeReview with <code>word</code>); a resolved problem is struck through
          and says Resolved rather than fading; the details toggle has its own icon (Knowledge&apos;s falls back to an
          eye).
        </p>
      </Source>
      <A11y
        items={[
          "The details are a named region; the toggle says Hide details or Show details and its state. The notice is a status. The versions open a named panel; the comments are a named section with a labelled field.",
        ]}
      />
    </>
  )
}
