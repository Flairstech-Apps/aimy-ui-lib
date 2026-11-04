import type { Metadata } from "next"
import { UploadResultsDemo } from "@/components/docs/chat-widget-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Upload results" }

export default function Page() {
  return (
    <>
      <PageHeader title="Upload results" lead="A batch counted by status, then the items that need a person." />
      <Section title="Bulk CV upload">
        <ThemePair>
          <UploadResultsDemo />
        </ThemePair>
      </Section>
      <Install name="upload-results" exports="UploadResults" />
      <Section title="Use it">
        <CodeBlock>{`<WidgetFrame icon={<Upload />} title="Bulk CV upload results" meta={\`\${files.length} files\`} flush>
  <UploadResults label="CV upload" onAction={act} items={[
    { id, name: "Dina Emad", file: "DinaEmadCV.pdf", status: "warnings", message: "No email or phone in the CV." },
  ]} />
</WidgetFrame>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Count first, then open on what needs a person." dontText="List every file with the problems in among them." />
          <DoDont doText="Say each status in words with its icon." dontText="Show a status by colour or an emoji alone." />
        </div>
      </Section>
      <Source>
        <p>{"The Knowledge app's bulk upload table: uploading, done or failed per file, with a message cut off at the edge. The server also returns warnings, which become Added, with warnings. Nour picked counts first on 4 Nov over a status table and a live list."}</p>
      </Source>
      <A11y items={["The counts are a radio group that filters the rows.","Each row's button names its fix: Open, See warnings, Upload again."]} />
    </>
  )
}
