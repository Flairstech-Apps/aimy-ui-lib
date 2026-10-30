import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { NAV } from "@/components/docs/nav"
import type { Metadata } from "next"
import { Code, CodeBlock, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Install and start" }

const npmrc = `@flairstech-aimy:registry=https://aimy-ui-lib.aimy.flairstech.com/npm/`

const registries = `{
  "registries": {
    "@aimy": "https://aimy-ui-lib.aimy.flairstech.com/r/{name}.json"
  }
}`

/** One way in: what it is for, then the code at full width so no line is cut. */
function Way({ title, children, code }: { title: string; children: React.ReactNode; code: string[] }) {
  return (
    <div className="flex flex-col gap-4 border-t border-hairline py-8 first:border-t-0 first:pt-0">
      <div className="max-w-[46rem]">
        <h3 data-ai="h3" className="text-lg font-semibold text-ink">
          {title}
        </h3>
        <p data-ai="p" className="mt-1.5 text-body text-ink-secondary">
          {children}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {code.map((c) => (
          <CodeBlock key={c}>{c}</CodeBlock>
        ))}
      </div>
    </div>
  )
}

export default function Start() {
  const groups = NAV.filter((g) => g.label !== "Start here")
  return (
    <>
      <PageHeader
        title="Install and start"
        lead="Four ways in, from one line in .npmrc to copying components into your app. No sign-in and no token."
      />

      <Section title="Install" lead="Anyone can install, on any machine and in CI.">
        <Way title="Point npm at the registry" code={[npmrc]}>
          One line in your project&apos;s <Code>.npmrc</Code>, for installing the npm packages by name. The shadcn
          commands below work without it.
        </Way>
        <Way title="Copy components in" code={[registries, "npx shadcn@latest add @aimy/init"]}>
          For apps on Tailwind v4. Add the registry to <Code>components.json</Code>; init brings the theme, the toast
          and the rules for agents. Then add components by name. The copied code is yours.
        </Way>
        <Way title="Or import the package" code={["npm install @flairstech-aimy/ui @flairstech-aimy/tokens"]}>
          For apps without Tailwind, or when you would rather import than copy. Versioned, so you choose when to
          upgrade.
        </Way>
        <Way title="Tokens only" code={[`@import "@flairstech-aimy/tokens";`]}>
          Colour, type, spacing and motion as plain CSS variables. Works in any page, React or not.
        </Way>
      </Section>

      <Section
        title="Start a new AiMY product"
        lead="Copies a starter already in the AiMY shell, with the theme, fonts and agent rules installed."
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-ink">Vite</p>
            <CodeBlock>
              npx tiged --mode=git https://github.com/Flairstech-Apps/aimy-ui-lib/starter my-product
            </CodeBlock>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-ink">Next.js</p>
            <CodeBlock>
              npx tiged --mode=git https://github.com/Flairstech-Apps/aimy-ui-lib/starter-next my-product
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section title="Browse the library" lead="Start with the foundations; every component rests on them.">
        <ul className="grid gap-3 phone:grid-cols-2 min-[80rem]:grid-cols-3">
          {groups.map((g) => (
            <li key={g.label}>
              <Link
                href={g.items[0]?.href ?? "/"}
                className="group flex h-full flex-col gap-2 rounded-lg border border-hairline p-4 transition-[border-color,background-color] duration-(--t-fast) ease-out hover:border-edge-hover hover:bg-w05"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-body font-semibold text-ink">{g.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={2}
                    className="size-4 shrink-0 text-ink-secondary transition-transform duration-(--t-fast) ease-out group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-meta text-ink-secondary">
                  {g.items.length} {g.items.length === 1 ? "page" : "pages"}:{" "}
                  {g.items
                    .slice(0, 3)
                    .map((i) => i.label)
                    .join(", ")}
                  {g.items.length > 3 ? " and more" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
