import type { Metadata } from "next"
import { DataTableRowsDemo, DataTableTableDemo, DataTableSortBarDemo } from "@/components/docs/records-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Data table" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Data table"
        lead="Records in columns: rows as cards, or a real table, sorted and selected in place."
      />
      <Section title="Rows: Knowledge's run history, with selection">
        <DataTableRowsDemo />
      </Section>
      <Section title="Table: a head that stays put, sub-labels, selection">
        <ThemePair>
          <DataTableTableDemo />
        </ThemePair>
      </Section>
      <Section title="A sort bar above the rows, the narrow form, and the empty state">
        <ThemePair>
          <DataTableSortBarDemo />
        </ThemePair>
      </Section>
      <Install name="data-table" exports="DataTable, SortHeader, TableEmpty, nextSort" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<DataTable label="Syncs" rows={runs} rowKey={(r) => r.id}\n  selected={picked} onSelectedChange={setPicked}\n  columns={[\n    { key: "when", header: "When", width: "8.5rem", cell: (r) => r.when, sort: byDate },\n    { key: "n", header: "Documents", end: true, width: "auto", cell: (r) => r.n },\n  ]} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Let a sort return to the original order."
            dontText="Hide the sort arrow until a column is sorted."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales draws no tables, so this is Knowledge&apos;s console. Rows is the run history (<code>.set2-runs</code>,
          settings.css 1125-1201, 2963): every row its own card 6px apart, one height for every row (4.25rem), a head
          naming the columns; below 46rem of its own width the first column takes a line, the rest share the next, and
          the head goes. Table is the preview table (<code>.set2-pv</code>, settings.css 1024-1039): zebra rows, a
          sub-label under a header, sideways scroll. Sorting is Knowledge&apos;s <code>sortTh</code>: up, down, and back
          to the order the rows came in, with the arrow always drawn and lit only on the column doing the work. Your
          call on 28 Oct added the two gaps from the design-system spec (<code>.dtable</code>): a head that stays put
          while the body scrolls, and row selection, with the head&apos;s box selecting all or none and showing a dash
          for some. A selected row takes the accent tint. For thousands of rows use VirtualList.
        </p>
      </Source>
      <A11y
        items={[
          "Rows form is a table, rows and cells by role; table form is a real table in a focusable, named scroll region.",
          "Sortable heads carry aria-sort; each row's box is named after the row.",
        ]}
      />
    </>
  )
}
