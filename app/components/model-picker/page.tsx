import type { Metadata } from "next"
import { ModelPickerDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Model picker" }

export default function Page() {
  return (
    <>
      <PageHeader title="Model picker" lead="Which AiMY model answers, and what each is for." />
      <Section title="Two models">
        <ThemePair>
          <ModelPickerDemo />
        </ThemePair>
      </Section>
      <Install name="model-picker" exports="ModelPicker" />
      <Section title="Use it">
        <CodeBlock>{"<ModelPicker value={model} onValueChange={setModel} models={models} />"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Say what each model is for." dontText="List models by internal name." />
        </div>
      </Section>
      <Source>
        <p>
          Built from the design system&apos;s <code>.model-picker</code> (neither product has a model choice yet): the
          AI dot, the model&apos;s name and its tag. The spec leaves the menu open; here it is the library&apos;s Menu,
          where each model says what it is for.
        </p>
      </Source>
      <A11y items={["A menu button named with the current model; models are radio items."]} />
    </>
  )
}
