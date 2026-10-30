import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"
import { TopnavDemo } from "@/components/docs/shell-demos"

export const metadata: Metadata = { title: "Top navigation" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Top navigation"
        lead="The bar across the top of every AiMY product: the mark, the products, and on the right the theme, the bell and the account."
      />
      <Section title="The bar at four widths">
        <TopnavDemo />
      </Section>
      <Install name="topnav" exports="Topnav, UserMenu" />
      <Section title="Use it">
        <CodeBlock>
          {
            'const products = [\n  { label: "Knowledge", href: "/knowledge" },\n  { label: "Sales", current: true },\n  { label: "Talent", soon: "soon" },\n]\n\n<Topnav\n  logo={<AimyMark variant="lockup" title="AiMY Sales" />}\n  products={products}\n  actions={\n    <>\n      <ThemeToggle />\n      <NotificationCenter items={items} onMarkAllRead={markAllRead} />\n      <UserMenu name="Engy Hassan" role="Account executive">\n        <MenuItem onSelect={openSettings}>Settings</MenuItem>\n        <MenuItem onSelect={signOut}>Sign out</MenuItem>\n      </UserMenu>\n    </>\n  }\n/>'
          }
        </CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Put it in <code className="font-mono text-ink">AppShell</code>&apos;s{" "}
          <code className="font-mono text-ink">topnav</code>, which gives it the shell&apos;s width ladder and, when
          there is a rail, the toggle for the rail&apos;s drawer.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Show every product, and say in words when one is not open to you yet."
            dontText="Hide a product the person cannot use, or grey it out without saying why."
          />
          <DoDont
            doText="Let the bar change form as it narrows: the products move into a menu by the mark."
            dontText="Let the products wrap to a second line or run off the edge."
          />
        </div>
      </Section>
      <Source>
        <p>
          The bar every AiMY product shares (<code>.app-topnav</code> in aimy-ds.css, drawn as Knowledge draws it,
          knowledge.css 1985-2470): 60px, a hairline under it, the mark on the left, the products in a pill strip
          centred by two equal flanks, and on the right the theme, the bell and the account pill. The current product is
          in the accent&apos;s text ink and a step bolder. Below 1120 the account drops its name; below 900 the strip
          leaves the bar for a chevron menu beside the mark; below 355 the bar tightens.
        </p>
      </Source>
      <A11y
        items={[
          "The products are a named nav with the current one marked aria-current. The product menu and the account menu are menus that open from buttons, move with the arrow keys and close on Escape.",
        ]}
      />
    </>
  )
}
