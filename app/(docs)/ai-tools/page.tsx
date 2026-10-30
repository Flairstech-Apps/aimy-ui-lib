import type { Metadata } from "next"
import { Code, CodeBlock, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Tools for AI agents" }

const SITE = "https://aimy-ui-lib.aimy.flairstech.com"

const SKILLS: [string, string][] = [
  [
    "aimy-ui",
    "The rules every AiMY screen follows, and which component to use for what. Claude reads it whenever it builds AiMY UI.",
  ],
  [
    "aimy-ui-build",
    "Builds a screen, panel or flow from a screenshot, a mock-up or a description, from library parts only, and stops at a gap instead of inventing a component.",
  ],
  [
    "aimy-ui-review",
    "Checks a screen or a diff against the rules (doctrine, accessibility, writing) and reports each break with the file, what a person would notice, and the fix.",
  ],
  [
    "aimy-ui-upgrade",
    "Takes a new release: updates the packages and the copied components, then puts back the app's own edits that still apply.",
  ],
]

export default function AiTools() {
  return (
    <>
      <PageHeader
        title="Tools for AI agents"
        lead="Claude Code, Copilot and Cursor can build with AiMY UI the way a person who knows it would: an MCP server that knows every component, and skills for the common jobs."
      />

      <Section
        title="The MCP server"
        lead="Connect it once. Your agent can then search the components, take one with its code and install commands, and read the rules, from inside the conversation."
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-ink">Claude Code</p>
            <CodeBlock>{`claude mcp add --transport http aimy-ui ${SITE}/mcp`}</CodeBlock>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-ink">VS Code with Copilot, in .vscode/mcp.json</p>
            <CodeBlock>{`{
  "servers": {
    "aimy-ui": { "type": "http", "url": "${SITE}/mcp" }
  }
}`}</CodeBlock>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-ink">Cursor, in .cursor/mcp.json</p>
            <CodeBlock>{`{
  "mcpServers": {
    "aimy-ui": { "url": "${SITE}/mcp" }
  }
}`}</CodeBlock>
          </div>
        </div>
        <ul data-ai="li" className="mt-6 flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            <Code>search_components</Code>: finds parts by what the screen needs, such as &quot;a table that sorts&quot;
            or &quot;AI proposes a change&quot;.
          </li>
          <li>
            <Code>get_component</Code>: one component with its docs page, install commands, what it depends on, and its
            full source.
          </li>
          <li>
            <Code>get_rules</Code>: the doctrine, accessibility and writing rules, and the component index.
          </li>
          <li>
            <Code>get_skill</Code>: any of the skills below as instructions. Clients that show MCP prompts also list
            them as prompts, such as <Code>/aimy-ui-review</Code>.
          </li>
        </ul>
      </Section>

      <Section
        title="The skills"
        lead="One command puts them in your project, with AGENTS.md for agents that read it. Run it again with --overwrite to take a newer version."
      >
        <CodeBlock>{`npx shadcn@latest add ${SITE}/r/init.json`}</CodeBlock>
        <ul data-ai="li" className="mt-6 flex max-w-[46rem] flex-col gap-4 text-body text-ink-secondary">
          {SKILLS.map(([name, words]) => (
            <li key={name}>
              <a className="font-mono text-ink underline" href={`/skills/${name}/SKILL.md`}>
                {name}
              </a>
              : {words}
            </li>
          ))}
        </ul>
        <p data-ai="p" className="mt-4 max-w-[46rem] text-meta text-ink-secondary">
          Both starters ship with all four. Each is a plain SKILL.md file, so you can also read it or copy it by hand.
        </p>
      </Section>

      <Section
        title="How to use them"
        lead="Once both are in, ask in plain words. The agent picks the skill that fits and calls the MCP server for the components it needs."
      >
        <div className="flex max-w-[46rem] flex-col gap-6">
          <div>
            <h3 data-ai="h3" className="text-lg font-semibold text-ink">
              Check the server is connected
            </h3>
            <p data-ai="p" className="mt-1.5 text-body text-ink-secondary">
              In Claude Code, type <Code>/mcp</Code>: aimy-ui should say connected. In VS Code, open the MCP servers
              list from the Command Palette (MCP: List Servers) and start aimy-ui if it is stopped. In Cursor, it shows
              under Settings, then MCP, with a green dot.
            </p>
          </div>
          <div>
            <h3 data-ai="h3" className="text-lg font-semibold text-ink">
              What to ask
            </h3>
            <ul data-ai="li" className="mt-2 flex list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
              <li>
                <b className="text-ink">To build:</b> &quot;Build the reviews page from this screenshot with AiMY
                UI.&quot; The agent uses aimy-ui-build: it lists the parts, finds each one with{" "}
                <Code>search_components</Code>, takes the code with <Code>get_component</Code>, and stops to tell you if
                a part is missing instead of inventing one.
              </li>
              <li>
                <b className="text-ink">To review:</b> &quot;Review my changes against AiMY&apos;s rules.&quot; It uses
                aimy-ui-review and lists each break with the file, what a person would notice, and the fix. It only
                changes code if you ask.
              </li>
              <li>
                <b className="text-ink">To upgrade:</b> &quot;Upgrade AiMY UI to the latest release.&quot; It uses
                aimy-ui-upgrade: packages first, then each copied component, putting back your own edits.
              </li>
              <li>
                <b className="text-ink">To find a part:</b> &quot;Which AiMY component shows a change AiMY
                proposes?&quot; It searches the library and answers with the component and its page.
              </li>
            </ul>
          </div>
          <div>
            <h3 data-ai="h3" className="text-lg font-semibold text-ink">
              Call a skill by name
            </h3>
            <p data-ai="p" className="mt-1.5 text-body text-ink-secondary">
              When you want one skill and no guessing:
            </p>
            <ul data-ai="li" className="mt-2 flex list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
              <li>
                Claude Code, with the skills in your project: <Code>/aimy-ui-review</Code>, <Code>/aimy-ui-build</Code>{" "}
                or <Code>/aimy-ui-upgrade</Code>, followed by what it is for.
              </li>
              <li>
                Claude Code, from the MCP server: <Code>/mcp__aimy-ui__aimy-ui-review src/App.tsx</Code>. The text after
                the name is what to review, or for build, what to build.
              </li>
              <li>
                VS Code with Copilot, in agent mode: type <Code>/</Code> and choose the aimy-ui prompt, such as{" "}
                <Code>/mcp.aimy-ui.aimy-ui-review</Code>.
              </li>
              <li>
                Cursor, in agent mode: say which one, such as &quot;Use the aimy-ui-review skill on my changes&quot;. It
                reads the skill through <Code>get_skill</Code>.
              </li>
            </ul>
          </div>
          <div>
            <h3 data-ai="h3" className="text-lg font-semibold text-ink">
              What a review looks like
            </h3>
            <CodeBlock
              what="the example review"
              wrap
            >{`- No muted text, at src/Reviews.tsx:42: the "Disputed" state is shown by fading the row to 50%, so people with low vision miss it. Fix: keep the row's ink and add a StatusPill that says "Disputed".
- AI never applies a change silently, at src/Reviews.tsx:88: the AI summary is written straight into the notes. Fix: show it in a Suggestion with Accept, Edit and Reject.

Not checked: motion and focus in a real browser.`}</CodeBlock>
          </div>
        </div>
      </Section>

      <Section title="For agents that read the web">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            <Code>/llms.txt</Code> lists every component with its page; <Code>/AGENTS.md</Code> has the rules.
          </li>
          <li>Every docs page has Copy for AI, which copies the page as clean markdown, without the live previews.</li>
        </ul>
      </Section>
    </>
  )
}
