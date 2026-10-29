import Link from "next/link"
import { Code, CodeBlock, PageHeader, Section } from "@/components/docs/page"

const npmrc = `@flairstech-aimy:registry=https://aimy-ui-lib.nour-ali.workers.dev/npm/
//aimy-ui-lib.nour-ali.workers.dev/npm/:_authToken=\${AIMY_REGISTRY_TOKEN}`

const registries = `{
  "registries": {
    "@aimy": {
      "url": "https://aimy-ui-lib.nour-ali.workers.dev/r/{name}.json",
      "headers": { "Authorization": "Bearer \${AIMY_REGISTRY_TOKEN}" }
    }
  }
}`

export default function Home() {
  return (
    <>
      <PageHeader
        title="AiMY UI"
        lead="The building blocks of AiMY Sales and Knowledge, ready to install in any React app. Nothing here is a new design: every value is lifted from the products and checked against them."
      />

      <Section
        title="Before anything: the token"
        lead="The library is internal to FlairsTech. Ask the AiMY UI owner for the library token and set it in your environment as AIMY_REGISTRY_TOKEN. Every install below sends it."
      >
        <CodeBlock>{npmrc}</CodeBlock>
        <p className="mt-3 text-meta text-ink-secondary">
          Put these two lines in your project&apos;s <Code>.npmrc</Code>. The theme and the npm package come from this
          private registry.
        </p>
      </Section>

      <Section
        title="Start a new AiMY product"
        lead="Copies the starter: React, TypeScript, Vite and Tailwind v4, already in the AiMY shell, with the theme, fonts and agent rules installed. For Next.js, copy starter-next instead."
      >
        <CodeBlock>npx tiged --mode=git https://github.com/Flairstech-AIMY/aimy-ui-lib/starter my-product</CodeBlock>
        <div className="mt-3">
          <CodeBlock>
            npx tiged --mode=git https://github.com/Flairstech-AIMY/aimy-ui-lib/starter-next my-product
          </CodeBlock>
        </div>
      </Section>

      <Section
        title="Add AiMY to an existing app (Tailwind v4)"
        lead="Components are copied into your project, so you own them. Add the registry once, then init brings the theme, the toast and the rules for agents; add components by name after that."
      >
        <CodeBlock>{registries}</CodeBlock>
        <div className="mt-3">
          <CodeBlock>npx shadcn@latest add @aimy/init</CodeBlock>
        </div>
      </Section>

      <Section
        title="Or import the npm package"
        lead="For React apps without Tailwind, or when you'd rather import than copy. Versioned, so you choose when to upgrade."
      >
        <CodeBlock>npm install @flairstech-aimy/ui @flairstech-aimy/tokens</CodeBlock>
      </Section>

      <Section
        title="Tokens only"
        lead="Colour, type, spacing and motion as plain CSS variables. Works in any page, React or not."
      >
        <CodeBlock>{`@import "@flairstech-aimy/tokens";`}</CodeBlock>
      </Section>

      <Section title="Foundations" lead="Start with the rules the whole system rests on.">
        <ul className="grid gap-2 column:grid-cols-3">
          {[
            ["Colour", "/foundations/color/"],
            ["Typography", "/foundations/typography/"],
            ["Motion", "/foundations/motion/"],
          ].map(([label, href]) => (
            <li key={href}>
              <Link
                href={href!}
                className="block rounded-lg border border-edge bg-card p-4 text-body font-semibold text-ink transition-[border-color,background-color] duration-(--t-fast) ease-out hover:border-edge-hover hover:bg-raised"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
