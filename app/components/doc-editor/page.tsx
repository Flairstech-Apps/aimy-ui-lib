import type { Metadata } from "next"
import { DocToolsDemo } from "@/components/docs/document-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Writing tools" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Writing tools"
        lead="The tools for writing a document: on a selection, above the line you are on, and for the whole document."
      />
      <Section title="The selection menu, the writing toolbar, the block menu and AiMY's menu">
        <DocToolsDemo />
      </Section>
      <Install name="doc-editor" exports="DocEditor, SelectionMenu, WritingToolbar, BlockMenu, AiMenu, applyFormat" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<DocEditor html={body} onChange={save}\n  selectionActions={["Rewrite", "Shorten", "Find a source"]} onSelectionAction={(label, text) => propose(label, text)}\n  docActions={["Rewrite for support agents", "Shorten", "Fill the gaps"]} onDocAction={propose} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show what AiMY proposes as a change to accept."
            dontText="Let AiMY rewrite the body in place."
          />
        </div>
      </Section>
      <Source>
        <p>
          Knowledge&apos;s writing tools on the document page (knowledge.js 7681-8313; knowledge.css 4083-4135 and
          7328-7342; aimy-ds.css 2618-2628 and 3040-3053). Select words and the selection menu sits under them: Bold,
          Italic, Underline, then what AiMY can do with the words, the first in the accent with the AiMY mark. While you
          write, the writing toolbar sits above the line you are on: add a block, the three formats, Heading and
          Subheading, the lists and Quote, Undo and Redo, and AiMY for the whole document, which opens AiMY&apos;s menu.
          The block menu opens from &quot;+&quot; or from &quot;/&quot; on an empty line: Text, Heading, Subheading, the
          lists, Quote, Code. The current format shows pressed. Pressing a tool keeps the selection on the words. AiMY
          never edits the text itself: what it proposes is shown as a change to Accept, Edit or Reject (Suggestion).
          Fixed in the port: Knowledge&apos;s menus can run off the page and the selection menu ignores Escape; here
          they stay inside the page, flip above a selection with no room below, close on Escape, and the toolbar and the
          block menu move with the arrow keys. Formatting runs on the browser&apos;s editing commands, as
          Knowledge&apos;s does; DocEditor owns the body after the first render and reports it through onChange.
        </p>
      </Source>
      <A11y
        items={[
          "The body is a labelled multi-line textbox. The toolbars are named toolbars whose buttons say their state with aria-pressed and move with the arrow keys; the block menu is a menu that takes focus and closes on Escape.",
        ]}
      />
    </>
  )
}
