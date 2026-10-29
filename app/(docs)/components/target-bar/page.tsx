import type { Metadata } from "next"
import { TargetBarDemo } from "@/components/docs/charts-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Progress to target" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Progress to target"
        lead="How far a figure has got toward its target, and what could still come."
      />
      <Section title="This quarter, with AiMY's projection and today's pace; and a target passed">
        <ThemePair>
          <TargetBarDemo />
        </ThemePair>
      </Section>
      <Install name="target-bar" exports="TargetBar" />
      <Section title="Use it">
        <CodeBlock>
          {
            "<TargetBar value={182400} target={300000} forecast={268000} elapsed={0.61}\n  format={(n) => `€${Math.round(n / 1000)}k`} arriving />"
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Hatch what is projected, so it never reads as already in."
            dontText="Draw a projection in the same solid fill as what is in."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; attainment bar (<code>.s-att</code>, sales.css 8797-8862, built in bdr.js 14249-14537). The figure
          and &quot;of&quot; the target, the share in words, turning green at 100%. One 20px bar in two layers, because
          the fills need clipping to the corners and the marks need to overhang: what is in, solid accent; what AiMY
          expects could still come, hatched at 115° so it reads as not yet real. The target crosses the bar with 4px
          over each edge in the brightest ink; where you should be today is a tick inside it a step quieter, so the two
          differ in kind, not shade. The scale is the target plus a fifth, so the target lands at 83% with room to pass
          it, and a figure past even that widens the scale rather than clipping. The key names each band and mark in
          plain words: Gained, Could still come (with the AiMY mark, and the amount), Target, Where you should be today.
          The fills wipe in, the projection 220ms after.
        </p>
      </Source>
      <A11y items={["The bar is an image named in a sentence: the figure, the target, and what AiMY expects."]} />
    </>
  )
}
