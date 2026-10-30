import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { SideNavDemo } from "@/components/docs/nav-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Side navigation" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Side navigation"
        lead="The pages of a product down the left, as QA draws them: open, each page with its headline figures; collapsed, icons with counts. The current page always leads."
      />
      <Section title="QA's pages, open and collapsed">
        <SideNavDemo />
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Collapse it with the button in its head and open it again with the mark. Narrow the shell and it stays
          collapsed, and the mark opens it as a drawer. In this demo it goes narrow below 900px, so the open form fits
          the page; in an app it is 1100px.
        </p>
      </Section>
      <Install name="side-nav" exports="SideNav, SideNavPage, SideNavFinding" />
      <Section title="Use it">
        <CodeBlock>
          {
            'const pages: SideNavPage[] = [\n  { id: "dashboard", label: "Dashboard", href: "/", icon: <LayoutGrid />, current: true,\n    badge: 2, tip: "29 points below target",\n    findings: [{ fig: "29", text: "points below target", active: true }] },\n  { id: "reviews", label: "Reviews", href: "/reviews", icon: <Settings2 />, badge: 12,\n    findings: [{ fig: "12", text: "calls waiting", href: "/reviews", bar: 0.62 }] },\n  { id: "settings", label: "Settings", href: "/settings", icon: <Settings /> },\n]\n\n<AppShell topnav={<Topnav … />} nav={<SideNav pages={pages} summary="6 insights" count={6} label="QA pages" />}>\n  <Page>…</Page>\n</AppShell>'
          }
        </CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Findings are optional: without them each page is one line, so it works as a plain page list. Pass{" "}
          <code className="font-mono text-ink">onNavigate</code> to route with your app&apos;s router instead of
          following the link.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Give each page its one or two figures that need someone, in words: 12 calls waiting for review."
            dontText="Fill the open form with every number the page has."
          />
          <DoDont
            doText="Let it collapse to icons and open as a drawer when the shell narrows."
            dontText="Hide the navigation on a narrow screen."
          />
        </div>
      </Section>
      <Source>
        <p>
          QA&apos;s left navigation (<code>assets/aimy-rail.css</code> and <code>aimy-rail.js</code>, with the base in{" "}
          <code>index.html</code> 883-989, QA origin/main 9911c5e). Open it is 272px: a sticky head with the mark,
          &quot;AiMY&quot; in the AI ink, the count of insights and the collapse button (Lucide panel-left); then a
          section per page, the current one first in an accent card (a radial and a linear accent wash, a 42% accent
          edge) that says &quot;You&apos;re here&quot;, the others with a chevron that steps right on hover and a
          hairline between them. Each finding is a figure in a 42px right-aligned column and its words, with an optional
          bar for a share. Collapsed it is 64px: the mark&apos;s button with the total, then 40px icon squares, the
          current one first in the accent with a gap under it, each with a count badge and a tooltip naming the page and
          its figure. The choice is kept in localStorage. Below 1100px it stays collapsed, and the mark opens a drawer
          of min(308px, 88%) over a 45% scrim; Escape, the scrim or a link closes it and focus returns to the mark. The
          sections arrive in turn (240ms, 30ms apart) when it opens. Not ported: QA&apos;s reorder animation on clicking
          another page, which delays the navigation; and the tooltip is the library&apos;s Tooltip rather than QA&apos;s
          pseudo-element.
        </p>
      </Source>
      <A11y
        items={[
          "A named nav. The current page is marked aria-current in both forms. Collapsed icons are links named with the page and its figure, and say so when you are on that page. The collapse and expand buttons say what they do and carry aria-expanded; the drawer is a named region, inert while closed.",
        ]}
      />
    </>
  )
}
