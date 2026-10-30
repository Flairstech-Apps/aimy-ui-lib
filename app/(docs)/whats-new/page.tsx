import type { Metadata } from "next"
import { Code, CodeBlock, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "What's new" }

// Newest first. Each entry says what changed and whether anyone has to do anything.
const RELEASES: { version: string; date: string; summary: string; changes: string[]; action?: string }[] = [
  {
    version: "Fix",
    date: "30 Oct 2026",
    summary: "The shadcn commands work in a project with no .npmrc line.",
    changes: [
      "The theme asked npm for @flairstech-aimy/tokens by name, so a project without the .npmrc line looked for it on npmjs and failed with E404. The theme now names the package's file on this site.",
      "package.json records the tokens package by that address. To take newer versions with pnpm up, add the .npmrc line.",
    ],
    action: "If init failed with E404 on @flairstech-aimy/tokens, run the same command again.",
  },
  {
    version: "1.1.0",
    date: "30 Oct 2026",
    summary: "QA's navigation and scroll dot, in the npm package and the registry.",
    changes: [
      "SideNav: QA's left navigation, open with each page's figures or collapsed to icons with counts, and a drawer when narrow. It goes in AppShell's new nav slot.",
      "ScrollDot: QA's scroll indicator, turned on per scrolling area. The rest of the page keeps the library's scrollbar.",
      "The tokens add sidenav.css and scroll-dot.css, imported by index.css and tailwind.css as before.",
    ],
    action:
      "Take it with pnpm up @flairstech-aimy/ui@latest @flairstech-aimy/tokens@latest. Nothing changes for screens you already have.",
  },
  {
    version: "Agents",
    date: "30 Oct 2026",
    summary: "Tools for AI agents: an MCP server and three task skills.",
    changes: [
      "The AiMY UI MCP server at aimy-ui-lib.aimy.flairstech.com/mcp: search the components, take one with its code and install commands, read the rules.",
      "Three skills beside aimy-ui: aimy-ui-build (a screen from a brief), aimy-ui-review (check a screen against the rules) and aimy-ui-upgrade (take a new release).",
      "A new page, Tools for AI agents, says how to connect Claude Code, Copilot and Cursor.",
      "The docs have search: the box in the bar, or Ctrl+K (⌘K on a Mac) from any page. Top navigation has its own page under Shell.",
      "From QA: Side navigation (open with each page's figures, collapsed to icons with counts, a drawer when narrow) and the Scroll dot, an opt-in scroll indicator. Copy them in now; they reach the npm package in its next version.",
    ],
    action: "To get the skills in an existing app, run the init command again with --overwrite.",
  },
  {
    version: "Site",
    date: "29 Oct 2026",
    summary: "The docs moved to Coolify and are open: no sign-in and no token.",
    changes: [
      "The library lives at aimy-ui-lib.aimy.flairstech.com. The starters copy from Flairstech-Apps on GitHub.",
      "Installing needs no token. .npmrc is one line, and components.json names the @aimy registry by its address alone.",
      "Every code block has a Copy button, and every page has On this page and links to the pages either side.",
      "A landing page at the address itself. Install and start moved to /start/; every other page kept its address.",
      "Any item installs from its address with no setup, for example npx shadcn@latest add https://aimy-ui-lib.aimy.flairstech.com/r/init.json.",
    ],
    action:
      "In an app set up before today, change the address in .npmrc and components.json to aimy-ui-lib.aimy.flairstech.com and delete the token lines. AIMY_REGISTRY_TOKEN is no longer needed.",
  },
  {
    version: "1.0.0",
    date: "29 Oct 2026",
    summary: "The first stable release of @flairstech-aimy/ui and @flairstech-aimy/tokens.",
    changes: [
      "The foundations, the components, forms, containers, feedback and overlays.",
      "The shell: AppShell, Topnav, Rail, the notification centre and the page head.",
      "Records, data tables and charts, the diary, and the document page with its writing tools.",
      "The AI parts: conversation, grounding and trust, agency and action, relationship and memory, voice.",
      "Both starters (Vite and Next.js), @aimy/init, and the rules for AI agents.",
    ],
  },
]

export default function WhatsNew() {
  return (
    <>
      <PageHeader
        title="What's new"
        lead="Every release, newest first: what changed and what you need to do, if anything."
      />

      <Section title="Stay up to date">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            To hear about every release, open the repo on GitHub and choose <b className="text-ink">Watch</b>, then{" "}
            <b className="text-ink">Custom</b>, then <b className="text-ink">Releases</b>.
          </li>
          <li>See whether your app is behind:</li>
        </ul>
        <div className="mt-3 flex max-w-[46rem] flex-col gap-3">
          <CodeBlock>pnpm outdated @flairstech-aimy/ui @flairstech-aimy/tokens</CodeBlock>
          <CodeBlock>npx shadcn@latest diff</CodeBlock>
        </div>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          The first lists newer package versions; the second lists copied components that changed here. Take a change
          with <Code>npx shadcn@latest add @aimy/&lt;name&gt; --overwrite</Code>, after committing your own edits.
        </p>
      </Section>

      {RELEASES.map((r) => (
        <Section
          key={r.version}
          title={
            r.version === "Site"
              ? `The site, ${r.date}`
              : r.version === "Agents"
                ? `Tools for agents, ${r.date}`
                : `${r.version}, ${r.date}`
          }
        >
          <p data-ai="p" className="max-w-[46rem] text-body text-ink">
            {r.summary}
          </p>
          <ul className="mt-3 flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-body text-ink-secondary">
            {r.changes.map((c) => (
              <li key={c} data-ai="li">
                {c}
              </li>
            ))}
          </ul>
          {r.action ? (
            <p data-ai="p" className="mt-4 max-w-[46rem] rounded-lg bg-warn-bg p-4 text-meta text-ink">
              <strong className="font-semibold text-warn-text">What to do: </strong>
              {r.action}
            </p>
          ) : null}
        </Section>
      ))}
    </>
  )
}
