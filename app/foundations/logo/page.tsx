import type { Metadata } from "next"
import { Code, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"

export const metadata: Metadata = { title: "Logo" }

export default function LogoPage() {
  return (
    <>
      <PageHeader
        title="Logo"
        lead="The AiMY mark and the lockup, drawn from the canonical logo's own path data. The mark is a violet-to-blue radial gradient; the wordmark is a flat blue."
      />
      <Section title="Mark and lockup">
        <ThemePair>
          <div className="flex items-center gap-8">
            <AimyMark className="size-12" />
            <AimyMark variant="lockup" className="h-12" />
          </div>
        </ThemePair>
        <p className="mt-3 text-meta text-ink-secondary">
          <Code>{`<AimyMark />`}</Code> and <Code>{`<AimyMark variant="lockup" />`}</Code>. Its accessible name is
          &quot;AiMY&quot;; pass <Code>title=&quot;&quot;</Code> when the word AiMY is right beside it.
        </p>
      </Section>
      <Section
        title="On a brand-filled control"
        lead="On a filled primary the gradient disappears into the button. Set --aimy-mark: currentColor on the control and the mark takes the button's text colour."
      >
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-on-status">
            <AimyMark title="" className="size-4" />
            Without the fix
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-[var(--d50)] [--aimy-mark:currentColor]">
            <AimyMark title="" className="size-4" />
            Fill them in
          </span>
        </div>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use the AimyMark component, so the gradient renders and every instance has its own gradient id."
            dontText="Paste the SVG files from design-system/assets: their names are swapped (Aimy-full.svg is the mark alone)."
          />
          <DoDont doText="Give the mark room and a plain ground." dontText="Recolour, stretch, outline or rotate the mark." />
        </div>
      </Section>
    </>
  )
}
