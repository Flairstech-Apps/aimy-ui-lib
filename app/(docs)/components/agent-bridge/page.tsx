import type { Metadata } from "next"
import { AgentBridgeDemo } from "@/components/docs/agent-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Agent bridge" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Agent bridge"
        lead="Lets AiMY see the screen and work it the way a person would: choose, rename, reorder, open. Every action follows the person's autonomy setting, lights up the part it touches, and can be taken back."
      />
      <Section
        title="Try it"
        lead="Press Let AiMY do it and watch each part light up as AiMY works it. Set the ladder to Ask me first to approve each step, or to Do it, keep a log to let it work quietly. Undo is in the toast and in What AiMY did."
      >
        <AgentBridgeDemo />
      </Section>
      <Install name="agent-bridge" exports="AgentProvider, AgentAsks, AgentLog, useAgent, useAgentSurface" />
      <Section title="Show parts to AiMY" lead="Wrap the page, and give each part AiMY may work an agent id. Parts without one stay invisible to it.">
        <CodeBlock>{`<AgentProvider levelFor={(surface, action) => autonomy[surface] ?? "tell"} webmcp>
  <InlineEdit agent="deal-name" label="Deal name" value={name} onSave={setName} />
  <Field label="Company">
    <Combobox agent="deal-company" options={companies} value={company} onValueChange={setCompany} />
  </Field>
  <SortableList agent="deal-steps" label="Next steps" items={steps} … />
  <AgentAsks />
  <AgentLog />
</AgentProvider>`}</CodeBlock>
      </Section>
      <Section title="Hand the tools to a model" lead="bridge.tools() gives one tool per action plus read_screen, in the shape tool use expects. Send them with the conversation; run each tool call the model makes with bridge.act and send back what it returns.">
        <CodeBlock>{`const bridge = useAgent()

// with the request to your model
tools: bridge.tools()

// for each tool call in its reply
const result = await bridge.act(call.name, call.input)
// result: { ok: true, message: "AiMY chose Atlas Energy in Company.", state }
//      or { ok: false, message: "option must be one of: …" }  → send it back so the model can correct itself`}</CodeBlock>
      </Section>
      <Section title="Your own parts" lead="Any part can show itself with useAgentSurface: what it is, the state it shows, and actions that return how to undo them.">
        <CodeBlock>{`useAgentSurface("deal-owner", {
  kind: "owner picker",
  label: "Owner",
  state: () => ({ owner: owner?.name ?? null }),
  actions: {
    assign: {
      description: "Assign an owner",
      params: { person: { type: "string", description: "Their name", enum: people.map((p) => p.name) } },
      say: (p) => \`assigned \${p.person}\`,
      run: (p) => {
        const before = owner
        setOwner(byName(p.person))
        return () => setOwner(before) // no undo returned: it always asks
      },
    },
  },
}, element)`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Return an undo from every action that has one. Mark actions that can't be taken back (sending, deleting) undoable: false, so they always ask."
            dontText="Give AiMY an action whose effect the person can't see or reverse."
          />
          <DoDont
            doText="Let the person's Autonomy setting decide: pass it to levelFor per kind of work."
            dontText="Hard-code tell for everything because asking slows the demo down."
          />
          <DoDont
            doText="Write say in the past tense, as the person would describe it: chose Atlas Energy."
            dontText="Log tool names or JSON where people read: deal-company__choose."
          />
        </div>
      </Section>
      <Source>
        <p>
          Modelled on UI SDK&apos;s connect-an-agent (vercel-labs/ui, Apache-2.0): parts expose state and actions, an app
          approves what runs, and WebMCP offers the same tools to the browser&apos;s agent. The ladder is AiMY&apos;s own
          (doctrine §3.1, the <code>Autonomy</code> part): ask, tell with a toast and Undo, log with Activity and Undo.
          The approval card is an AiMY note on the brand wash; the highlight is the AI ink ring with the brand glow
          (<code>[data-agent-acting]</code> in ai.css).
        </p>
      </Source>
      <A11y
        items={[
          "What AiMY does is announced in a polite live region as it happens: what it is working on, then what it did.",
          "The highlight is never the only signal: the toast, the log and the announcement say the same in words.",
          "Approval cards are groups named by what AiMY wants to do, with Go ahead and Not now as real buttons.",
        ]}
      />
    </>
  )
}
