import type { Metadata } from "next"
import { ChatTableDemo } from "@/components/docs/chat-widget-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Chat table" }

export default function Page() {
  return (
    <>
      <PageHeader title="Chat table" lead="A tool's table inside a chat reply, sortable, that changes form when it runs out of room instead of scrolling sideways." />
      <Section title="Matched positions as a table" lead="At chat width the columns fit. Sort by any header with an arrow; Show it loading shows the placeholder rows.">
        <div className="rounded-xl border border-hairline bg-body p-5 text-ink">
          <div className="max-w-[46rem]">
            <ChatTableDemo />
          </div>
        </div>
      </Section>
      <Section title="When it runs out of room" lead="Narrower than 36rem, the same rows change form: the first column on its own line, the rest under it. Nothing scrolls sideways.">
        <ThemePair>
          <ChatTableDemo />
        </ThemePair>
      </Section>
      <Install name="chat-table" exports="ChatTable, wrapCell" />
      <Section title="Use it">
        <CodeBlock>{`<WidgetFrame icon={<Table2 />} title={title} meta={\`\${rows.length} rows, from \${tool}\`} flush>
  <ChatTable label={title} rows={rows} rowKey={(r) => r.id} loading={!ready} columns={[
    { key: "title", header: "Position", cell: (r) => r.title, sort: byTitle },
    { key: "match", header: "Match", cell: (r) => <Score value={r.match} label="Fit" />, sort: byMatch },
    { key: "why", header: "Reasoning", cell: (r) => wrapCell(r.why) },
  ]} />
</WidgetFrame>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Wrap long text with wrapCell." dontText="Cut text at a set number of characters." />
          <DoDont doText="Use the Ranked list when each row needs its reason read." dontText="Hide the reason in a narrow column." />
        </div>
      </Section>
      <Source>
        <p>{"Replaces the Knowledge app's StreamingTable: a blue gradient head, uppercase headings, a Previous and Next paginator, text cut at 50 characters, and sideways scrolling in the reply. This is the library's DataTable in its table form, and its rows form when narrow. Nour asked for a table among the chat widgets on 4 Nov."}</p>
      </Source>
      <A11y items={["Sortable headers say their order (aria-sort).","While loading it is a status named Loading and the table's name.","The narrow form is the same rows and cells, not a picture of them."]} />
    </>
  )
}
