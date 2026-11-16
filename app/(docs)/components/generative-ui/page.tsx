import type { Metadata } from "next"
import { GenerativeUIDemo, PromptPreview } from "@/components/docs/generative-ui-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Generative UI" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Generative UI"
        lead="AiMY answers with interface, not only words: figures, a trend, a ranked list, a table, the next step as a button. The model describes the answer; the library draws it with its own parts, so every answer is on brand and accessible, and no model code ever runs."
      />
      <Section title="Try it" lead="Each answer streams in the way a reply arrives; a part draws the moment it is whole.">
        <GenerativeUIDemo />
      </Section>
      <Install name="generative-ui" exports="GenerativeUI, AIMY_UI, AIMY_UI_RENDER" />
      <Section
        title="Give the model the parts"
        lead="uiPrompt describes the catalogue for the system prompt; showUiTool is the show_ui tool whose input is the answer, with a JSON Schema for every part."
      >
        <CodeBlock>{`import { showUiTool, uiPrompt } from "@/lib/generative-ui"
import { AIMY_UI } from "@/components/generative-ui"

// with the request to your model
system: uiPrompt(AIMY_UI)
tools: [showUiTool(AIMY_UI)]`}</CodeBlock>
        <div className="mt-3">
          <PromptPreview />
        </div>
      </Section>
      <Section title="Draw the answer" lead="Stream the tool call's input as it arrives, then the finished spec. Send what was left out back to the model.">
        <CodeBlock>{`<Message speaker="aimy" status={done ? "done" : "streaming"}>
  <GenerativeUI
    stream={done ? undefined : partialJson}
    spec={done ? toolInput.ui : undefined}
    onAction={(action, payload) => run(action, payload)}
    onProblems={(problems) => problems.length && reply.toModel(problems)}
  />
</Message>`}</CodeBlock>
      </Section>
      <Section title="Add your own parts" lead="Spread AIMY_UI and AIMY_UI_RENDER and add a part: its props as a schema, and how it is drawn.">
        <CodeBlock>{`const catalog = {
  ...AIMY_UI,
  Candidate: { description: "One candidate", props: { name: { type: "string", description: "Their name" } } },
}
const render = { ...AIMY_UI_RENDER, Candidate: (p) => <CandidateCard name={String(p.name)} /> }

<GenerativeUI spec={answer} catalog={catalog} render={render} />`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Answer with interface when a table, figures or a chart says it better than sentences, and keep the words for what they mean."
            dontText="Answer every question with widgets. A one-line answer is a sentence."
          />
          <DoDont
            doText="Make every figure say what it means beside it. The catalogue needs it: a stat tile without its sub is left out."
            dontText="Invent a target to compare against. Compare with a usual day, what is needed, or a target someone set."
          />
          <DoDont
            doText="Let buttons in an answer go through onAction, and through the agent bridge when they change something."
            dontText="Let a model's answer change data on its own."
          />
        </div>
      </Section>
      <Source>
        <p>
          The answer widgets are the library&apos;s own: <code>WidgetFrame</code>, <code>StatTiles</code>,{" "}
          <code>TrendChart</code>, <code>KpiWidget</code>, <code>RankedList</code>, <code>DataTable</code>,{" "}
          <code>Donut</code>, <code>TargetBar</code>, <code>DescriptionList</code>, <code>Notice</code>, <code>Tag</code>{" "}
          and <code>Button</code>, inside AiMY&apos;s <code>Message</code>. The rule that every number says what it
          means is the library&apos;s doctrine, written into the catalogue.
        </p>
      </Source>
      <A11y
        items={[
          "Every part is the library's accessible part, so a generated answer has the same names, roles and keyboard model as a hand-built one.",
          "While an answer streams, its container is aria-busy, so screen readers read it once it is whole.",
          "Charts carry their one-sentence summary for screen readers; the catalogue asks the model for it.",
        ]}
      />
    </>
  )
}
