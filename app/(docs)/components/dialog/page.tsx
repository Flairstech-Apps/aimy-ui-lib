import type { Metadata } from "next"
import { DialogDemo } from "@/components/docs/batch-d-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Dialog" }

export default function Page() {
  return (
    <>
      <PageHeader title="Dialog" lead="For an ordered form, or a change with consequences. Never to confirm something Undo can take back." />
      <Section title="A form, and type-to-confirm for a destructive change">
        <ThemePair>
          <DialogDemo />
        </ThemePair>
      </Section>
      <Install name="dialog" exports="Dialog, DialogTrigger, DialogClose, DialogContent, TypeToConfirm" />
      <Section title="Use it">
        <CodeBlock>{"<Dialog>\n  <DialogTrigger asChild><Button>Add a person</Button></DialogTrigger>\n  <DialogContent title=\"Add a person\" footer={<><DialogClose asChild><Button>Cancel</Button></DialogClose><Button variant=\"brand\">Add Lina</Button></>}>\n    …fields\n  </DialogContent>\n</Dialog>\n\n<TypeToConfirm open={open} onOpenChange={setOpen} title=\"Delete 1,284 records\"\n  description=\"This can't be undone.\" word=\"1,284\" actionLabel=\"Delete 1,284 records\" onConfirm={remove} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Use type-to-confirm only for destructive or governed changes, and name the action: Delete 1,284 records." dontText="Put a dialog in front of a reversible action." />
        </div>
      </Section>
      <Source>
        <p>Knowledge&apos;s settings modal (<code>.set2-modal</code>): the card ground, 10px corners, a 20px title, a scrolling body and a footer on the raised ground. TypeToConfirm is Knowledge&apos;s commit surface and delete-records modal: the named action stays disabled until the word or count is typed (case, spaces and commas ignored). Sales has no dialogs at all, by policy: writes go through and are undone from the toast. Opens and closes with transitions.dev&apos;s modal (06). Knowledge&apos;s commit surface had no Escape, focus trap or scroll lock; this has all three.</p>
      </Source>
      <A11y items={["Focus moves in and stays in; Escape closes and focus returns to the control that opened it.","The page behind can't scroll or be clicked."]} />
    </>
  )
}
