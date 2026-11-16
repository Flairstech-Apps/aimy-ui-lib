import type { Metadata } from "next"
import { SortableDemo } from "@/components/docs/behavior-parts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Sortable list" }

export default function Page() {
  return (
    <>
      <PageHeader title="Sortable list" lead="A list people put in their own order: a pipeline's stages, the steps of a plan, the columns of a table." />
      <Section title="Pipeline stages">
        <ThemePair>
          <SortableDemo />
        </ThemePair>
      </Section>
      <Install name="sortable-list" exports="SortableList" />
      <Section title="Use it">
        <CodeBlock>{"<SortableList\n  label=\"Pipeline stages\"\n  items={stages}\n  getKey={(s) => s.id}\n  getLabel={(s) => s.name}\n  onReorder={setStages}\n  renderItem={(s) => s.name}\n/>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Save the new order on drop, and let Undo in a toast take it back." dontText="Ask for confirmation after a reorder." />
          <DoDont doText="Keep the grip as the only drag handle, so text in the row can still be selected." dontText="Make the whole row draggable." />
        </div>
      </Section>
      <Source>
        <p>Built on AiMY's reorder behaviour (<code>createReorder</code>, <code>bindDrag</code>, <code>createAutoScroll</code>). The moving row lifts onto the raised ground with a brand edge and the large shadow; the grip is Lucide's grip-vertical.</p>
      </Source>
      <A11y items={["Each grip is a button named “Move” and the row's name, described by how to move it.", "Space picks up, the arrows move (Home and End jump), Space drops, Escape puts it back; each step is announced in a live region.", "Focus stays on the grip as the row moves."]} />
    </>
  )
}
