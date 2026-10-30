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
