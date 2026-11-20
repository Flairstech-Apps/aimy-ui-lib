import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { FileDropDemo } from "@/components/docs/file-drop-demo"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "File drop" }

export default function FileDropPage() {
  return (
    <>
      <PageHeader title="File drop" lead="Where files come in: drop them, or press to choose. Files that don't fit are named with the reason; the rest go through." />
      <Section title="Try it" lead="Drop a file on it, or press it. It takes .csv and .xlsx up to 10 MB.">
        <ThemePair>
          <FileDropDemo />
        </ThemePair>
      </Section>
      <Install name="file-drop" exports="FileDrop" />
      <Section title="Use it">
        <CodeBlock>{`<FileDrop accept={[".csv", ".xlsx"]} maxSize={10_000_000} label="Upload contacts"
  onFiles={(files) => upload(files)} />`}</CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-body text-ink-secondary">
          Show what happened to each file afterwards with UploadResults.
        </p>
      </Section>
      <Section title="Rules">
        <DoDont
          doText="Say what it takes (types and size) on it, and say why a file was left out, by name."
          dontText="Refuse a file silently, or only after it has uploaded."
        />
      </Section>
      <Source>
        <p>
          Knowledge&apos;s settings drop, <code>.set2-drop</code> (<code>settings.css</code> 1476-1486): the card ground, a
          1.5px dashed edge that turns brand on hover and while files are over it, the icon and words centred, 9rem
          tall at least. QA&apos;s words and accepted-formats line come from <code>.di-dropzone</code> (
          <code>data-ingestion.html</code> 5440-5480). Changed: the icon is Lucide&apos;s Upload rather than QA&apos;s
          drawn ring, and the quiet ink of the words is the secondary ink.
        </p>
      </Source>
      <A11y
        items={[
          "A labelled file input: Tab reaches it, Enter or Space opens the chooser, and the ring shows for keyboard focus.",
          "Files left out are listed in an alert, so they are read out as they appear.",
        ]}
      />
    </>
  )
}
