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
        lead="The gradient would sink into a filled button, so the button sets --aimy-mark: currentColor and the mark takes the button's white text colour, as Sales' primary does."
      >
        <ThemePair>
          {/* Sales .s-insight-lnk.primary: brand ground, #fff text, pill, mark in currentColor. */}
          <span className="inline-flex min-h-8 items-center gap-2 rounded-pill bg-brand px-4 text-xs font-bold text-[#fff] [--aimy-mark:currentColor]">
            <AimyMark title="" className="size-3.5" />
            Prepare me for it
          </span>
        </ThemePair>
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
