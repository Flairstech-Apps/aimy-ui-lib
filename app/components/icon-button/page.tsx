import { Bold, Copy, Ellipsis, Italic, Phone, X } from "lucide-react"
import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { IconButton } from "@/registry/aimy/ui/icon-button"

export const metadata: Metadata = { title: "Icon button" }

export default function IconButtonPage() {
  return (
    <>
      <PageHeader
        title="Icon button"
        lead="A square control for an icon on its own. Because there are no words, it always carries a label: the name screen readers read and the tooltip people see."
      />
      <Section title="Variants and sizes">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="default: on the raised surface, with an edge">
              <IconButton label="Call Kestrel">
                <Phone />
              </IconButton>
              <IconButton label="Copy the summary">
                <Copy />
              </IconButton>
              <IconButton label="More actions">
                <Ellipsis />
              </IconButton>
            </Row>
            <Row label="toolbar: no box until hovered; on state in the accent">
              <IconButton variant="toolbar" label="Bold" aria-pressed>
                <Bold />
              </IconButton>
              <IconButton variant="toolbar" label="Italic" aria-pressed={false}>
                <Italic />
              </IconButton>
            </Row>
            <Row label="sm 28, md 32, lg 36">
              <IconButton size="sm" label="Close">
                <X />
              </IconButton>
              <IconButton label="Close">
                <X />
              </IconButton>
              <IconButton size="lg" label="Close">
                <X />
              </IconButton>
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Install name="icon-button" exports="IconButton" />
      <Section title="Use it">
        <CodeBlock>{`<IconButton label="Copy the summary" onClick={copy}><Copy /></IconButton>
<IconButton variant="toolbar" label="Bold" aria-pressed={isBold} onClick={toggleBold}><Bold /></IconButton>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont
          doText="Use an icon button only where the icon is unmistakable and space is short. Write the label as the action: Copy the summary."
          dontText="Use an icon button for an important or unusual action. Give it words: use a Button."
        />
      </Section>
      <Source>
        <p>
          Knowledge and the design system&apos;s <code>.icon-btn</code> (34px there; 32 here to sit on the button scale), and
          Knowledge&apos;s toolbar form <code>.toolbar .icon-btn</code>. Hover turns the glyph to the accent ink.
        </p>
      </Source>
      <A11y
        items={[
          "label is required by the types: it becomes aria-label and the title tooltip.",
          "A toggle uses aria-pressed, which also drives the on state's look.",
        ]}
      />
    </>
  )
}
