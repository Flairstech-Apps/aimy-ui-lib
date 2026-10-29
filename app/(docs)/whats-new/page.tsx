import type { Metadata } from "next"
import { Code, CodeBlock, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "What's new" }

// Newest first. Each entry says what changed and whether anyone has to do anything.
const RELEASES: { version: string; date: string; summary: string; changes: string[]; action?: string }[] = [
  {
    version: "Site",
    date: "29 Oct 2026",
    summary: "The docs moved to Coolify and are open: no sign-in and no token.",
    changes: [
      "The library lives at aimy-ui-lib.aimy.flairstech.com. The starters copy from Flairstech-Apps on GitHub.",
      "Installing needs no token. .npmrc is one line, and components.json names the @aimy registry by its address alone.",
      "Every code block has a Copy button, and every page has On this page and links to the pages either side.",
      "A landing page at the address itself. Install and start moved to /start/; every other page kept its address.",
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
        <Section key={r.version} title={r.version === "Site" ? `The site, ${r.date}` : `${r.version}, ${r.date}`}>
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
