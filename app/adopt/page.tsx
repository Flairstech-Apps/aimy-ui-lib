import type { Metadata } from "next"
import Link from "next/link"
import { Code, CodeBlock, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "How to adopt" }

export default function Adopt() {
  return (
    <>
      <PageHeader
        title="How to adopt"
        lead="For a React team taking up AiMY UI: which way in suits your app, what to set up once, how to stay up to date, and what comes with it."
      />

      <Section
        title="Pick your way in"
        lead="All three are built from the same source, so nothing is written twice and you can mix them."
      >
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            <b className="text-ink">Copy the components in</b> if your app uses Tailwind v4 and you want to own the
            code: <Code>npx shadcn@latest add @aimy/button</Code>. Each component lands in your project, with what it
            depends on. Best for a new AiMY product, and for any team that will adjust components.
          </li>
          <li>
            <b className="text-ink">Import the package</b> if your app does not use Tailwind, or you would rather import
            than copy: <Code>import {"{ Button }"} from &quot;@flairstech-aimy/ui&quot;</Code> and one stylesheet,{" "}
            <Code>@flairstech-aimy/ui/styles.css</Code>. Its styles are in CSS layers, so your app&apos;s own unlayered
            styles win where they meet. Versioned, so you choose when to upgrade.
          </li>
          <li>
            <b className="text-ink">Use the tokens only</b> for anything that renders HTML, React or not:{" "}
            <Code>@flairstech-aimy/tokens</Code> gives the colours, type, spacing, radius, shadows, motion and fonts.
          </li>
        </ul>
      </Section>

      <Section title="Set up once" lead="No sign-in and no token: every install works on any machine and in CI.">
        <ol data-ai="li" className="flex max-w-[46rem] list-decimal flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            For the package and the tokens, add the line from{" "}
            <Link className="text-ink-action underline" href="/">
              Install and start
            </Link>{" "}
            to your <Code>.npmrc</Code>.
          </li>
          <li>
            For copying components in, add the @aimy registry to <Code>components.json</Code> (also on that page).
          </li>
        </ol>
      </Section>

      <Section
        title="Starting a new AiMY product"
        lead="Start from a starter: the AiMY shell, a briefing, the canvas and toast with undo are already wired."
      >
        <CodeBlock>npx tiged --mode=git https://github.com/Flairstech-Apps/aimy-ui-lib/starter my-product</CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-body text-ink-secondary">
          That is Vite. For Next.js (App Router), copy <Code>starter-next</Code> the same way. Both use your own GitHub
          login for the private repo. Then rename the product and the person at the top of the screen file, and replace{" "}
          <Code>answer()</Code> in <Code>src/conversation.tsx</Code> with your backend&apos;s stream.
        </p>
      </Section>

      <Section
        title="Adding AiMY to an app you already have"
        lead="One command brings the theme, the toast and the rules for agents; then add components as you need them."
      >
        <CodeBlock>npx shadcn@latest add @aimy/init</CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-body text-ink-secondary">
          It adds the theme and fonts, <Code>cn</Code>, the theme toggle, toast with undo, and AGENTS.md with the
          aimy-ui Claude skill at the root of your project. Put the theme script in your <Code>&lt;head&gt;</Code> so
          the page never flashes the wrong theme, then move a screen at a time: the shell first (AppShell, Topnav,
          Rail), then the parts inside it.
        </p>
      </Section>

      <Section title="Staying up to date">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            Copied components are yours. See what changed upstream with <Code>npx shadcn@latest diff</Code>, and take a
            change with <Code>npx shadcn@latest add @aimy/&lt;name&gt; --overwrite</Code>. Commit first, so your own
            edits are easy to put back.
          </li>
          <li>
            The package and the tokens follow semantic versions: a patch fixes, a minor adds, a major can change what
            you use. Pin the tokens to the version the components were written against.
          </li>
          <li>
            Refresh the agent rules with <Code>npx shadcn@latest add @aimy/init --overwrite</Code>.
          </li>
        </ul>
      </Section>

      <Section title="What comes with it" lead="The library is the products' rules as much as their pixels.">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>
            AGENTS.md and the aimy-ui skill teach Claude Code and Copilot the doctrine, the accessibility and writing
            rules, and which component to use for what. The docs site has <Code>/llms.txt</Code>, and every page has
            Copy for AI.
          </li>
          <li>
            Every action declares its entry mode and every item its work state. AiMY never applies a change silently: a
            proposal is accepted, edited or rejected, and a direct action ends in a toast with Undo.
          </li>
          <li>Dark by default, WCAG 2.2 AA in both themes, no muted text, Lucide icons, plain English.</li>
        </ul>
      </Section>

      <Section title="When something is missing">
        <p data-ai="p" className="max-w-[46rem] text-body text-ink-secondary">
          Don&apos;t build a lookalike. Tell the AiMY UI owner what the screen needs and where the products already draw
          it; the library documents what Sales and Knowledge do, so a missing piece is ported from them, not invented.
          Fixes go upstream the same way, so every product gets them.
        </p>
      </Section>
    </>
  )
}
