import type { Metadata } from "next"
import { CommandBarDemo } from "@/components/docs/command-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Command bar" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Command bar"
        lead="One bar for everything on the page, on Ctrl+K. It finds every action the parts offer and every command the app adds, the same set AiMY works with through the agent bridge. What it can't find becomes a question for AiMY, and Ctrl+Z takes back the last change, whoever made it."
      />
      <Section title="Try it" lead="Everything you run is in What changed with Undo, and in a toast.">
        <CommandBarDemo />
      </Section>
      <Install name="command-bar" exports="CommandBar, useCommand" />
      <Section title="Use it" lead="Put it once inside the AgentProvider. Parts with an agent id bring their actions; useCommand adds the app's own.">
        <CodeBlock>{`<AgentProvider>
  <Combobox agent="deal-company" … />
  <CommandBar onAsk={(question) => askAimy(question)} />
</AgentProvider>

// anywhere inside: a command for people and a tool for AiMY
// AiMY asks before running an app command; navigating is safe, so it says so.
useCommand("go-contacts", { group: "Go to", label: "Contacts", said: "opened Contacts", level: "tell", run: () => router.push("/contacts") })`}</CodeBlock>
        <ul data-ai="ul" className="mt-3 flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-meta text-ink-secondary">
          <li data-ai="li">An action whose params are choices becomes one row per choice: Choose an option: Atlas Energy.</li>
          <li data-ai="li">An action that needs a value asks for it in the same field, then runs.</li>
          <li data-ai="li">Return an undo from run and the command can be taken back from the toast, the log or Ctrl+Z.</li>
        </ul>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Name commands as the person would say them, grouped by the part or place: Go to: Contacts."
            dontText="Expose internal ids or tool names: deal-company__choose."
          />
          <DoDont
            doText="Keep every command reachable some other way on the page too. The bar is the fast way, not the only way."
            dontText="Hide a feature so it only exists in the command bar."
          />
        </div>
      </Section>
      <Source>
        <p>
          Built on AiMY&apos;s agent bridge (<code>commands()</code>, <code>act</code> with the person as the actor,
          <code> undoLast</code>), the listbox behaviour and the dialog primitive. Rows are the Menu&apos;s rows and its
          accent wash; the key hints are the library&apos;s <code>Kbd</code>.
        </p>
      </Source>
      <A11y
        items={[
          "A modal dialog named Commands: focus goes to the field, is held inside, and returns on close.",
          "The field is a combobox over a listbox of grouped options; aria-activedescendant follows the arrows, so focus never leaves the field.",
          "What runs is said in a toast, a polite live region; a refusal is an alert tied to the field.",
        ]}
      />
    </>
  )
}
