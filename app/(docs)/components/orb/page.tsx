import type { Metadata } from "next"
import { OrbDemo } from "@/components/docs/voice-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Orb" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Orb"
        lead="AiMY's presence in a voice conversation: strands of light that listen, think and answer."
      />
      <Section title="Each phase">
        <ThemePair>
          <OrbDemo />
        </ThemePair>
      </Section>
      <Install name="orb" exports="Orb" />
      <Section title="Use it">
        <CodeBlock>{'<div className="size-72">\n  <Orb phase={phase} level={micLevel} />\n</div>'}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Pair the orb with words that say what it is doing."
            dontText="Use the orb as the only sign of a state."
          />
        </div>
      </Section>
      <Source>
        <p>
          Silk, ported line for line from both products&apos; <code>voice.js</code> (<code>makeSilk</code>), which
          Knowledge also lends to its note taker. Forty hair-fine strands wind round an invisible drum that turns. Light
          adds where they cross, a bloom glows under them, and each runs cyan to blue to violet. Every quantity a phase
          controls eases to its goal, so a change of phase blends rather than cuts. Listening turns slowly and your
          voice swells it; thinking draws in and turns faster; speaking breathes on a 2.4s cycle; muted slows almost to
          a stop and drains to grey; error is greyer still; connecting is half lit. On a light page the strands are
          deeper blues. Under reduced motion it draws one still frame per phase.
        </p>
      </Source>
      <A11y items={["Decoration: hidden from screen readers. Say the state in words beside it (VoiceStage does)."]} />
    </>
  )
}
