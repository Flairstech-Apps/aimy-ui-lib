import type { Metadata } from "next"
import { AutonomyDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Autonomy" }

export default function Page() {
  return (
    <>
      <PageHeader title="Autonomy" lead="How much AiMY may do without asking, per kind of work, earned by evidence." />
      <Section title="One kind of work, and the policy for all of them">
        <ThemePair>
          <AutonomyDemo />
        </ThemePair>
      </Section>
      <Install name="autonomy" exports="Autonomy, AskPolicy" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<Autonomy title="Moving contacts between stages" value={level} onValueChange={setLevel}\n  evidence="AiMY did this 38 times this month. You took back 1." />\n<AskPolicy items={items} onChange={(id, value) => save(id, value)} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show what AiMY has done before giving it more room."
            dontText="Let AiMY act alone on anything that can't be undone."
          />
        </div>
      </Section>
      <Source>
        <p>
          New, your call on 28 Oct: neither product nor the design system has this. It is built from the doctrine&apos;s
          confirmation ladder: Ask me first (AiMY proposes), Do it, then tell me (it acts and the toast offers Undo), Do
          it, keep a log (Activity records each one with Undo). The evidence line says what AiMY has done and how often
          it was taken back, so a person gives it more room when it has earned it. The ask policy sets Always ask or
          Just do it per category. Anything that can&apos;t be undone, or touches scoring, compliance or permissions,
          always asks: those rows are locked and say why. Every change toasts with Undo.
        </p>
      </Source>
      <A11y items={["Each choice is a labelled radio group; locked rows say why in words."]} />
    </>
  )
}
