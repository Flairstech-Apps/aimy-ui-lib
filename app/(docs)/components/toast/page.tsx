import type { Metadata } from "next"
import { ToastDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Toast" }

export default function Page() {
  return (
    <>
      <PageHeader title="Toast" lead="Act at once, then say what happened, with Undo. The confirmation every AiMY action ends with." />
      <Section title="Assign with Undo, a plain receipt, a second line">
        <ThemePair>
          <ToastDemo />
        </ThemePair>
      </Section>
      <Install name="toast" exports="toast, Toaster" />
      <Section title="Use it">
        <CodeBlock>{"// once, at the root\n<Toaster />\n\n// after any reversible action\nconst was = contact.owner\nassign(contact, \"Lina\")\ntoast(\"Assigned to Lina\", { onUndo: () => assign(contact, was) })\n\n// when a one-off action failed: red, announced at once, with the recovery\ntoast(\"We couldn't export the report\", { tone: \"err\", sub: \"Nothing changed.\", action: { label: \"Try again\", onClick: exportIt } })"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Act, then toast with Undo, for anything reversible." dontText="Ask Are you sure? before something Undo can take back." />
          <DoDont doText="Write what happened: Assigned to Lina." dontText="Write Success! or Action completed." />
          <DoDont doText="When an action failed, say so with tone err and offer the recovery: Try again." dontText="Use a toast for a failure that blocks the page; use RecoveryState." />
        </div>
      </Section>
      <Source>
        <p>Sales&apos; toast, your choice on 28 Oct: the AiMY mark on a 26px tile, a 14px title, an optional second line, Undo after a divider, and the AI-gradient bar counting down. 6s with Undo, 4s without, one at a time (a new one replaces it), as Sales does. Added: Knowledge&apos;s live region, and the countdown waits while hovered or focused so Undo can&apos;t slip away mid-reach. Rises and leaves with transitions.dev&apos;s toast (22). The plan named Sonner as the engine; its own motion would override transitions.dev, so the toast is the library&apos;s own.</p>
      </Source>
      <A11y items={["Announced politely through a live region that is always present.","Undo is a real button and stops the countdown while it has focus."]} />
    </>
  )
}
