import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { QaSideNavDemo, SideNavDemo } from "@/components/docs/nav-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Side navigation" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Side navigation"
        lead="The pages of a product down the left. Sales' tabs are the main form: a few pages at the top of the rail, the one you are on holding AiMY's reading of it. QA's form is the variant, for a product with many pages and nested flows."
      />
      <Section title="Which one">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink">
          <li>
            <b>Sales&apos; tabs (the default)</b> for a product with a few pages to move between, four or five. They sit
            in the first card of the <code className="font-mono">Rail</code>, above its doors, so the rail stays one
            short thing to read. Most AiMY products are this.
          </li>
          <li>
            <b>QA&apos;s form (variant=&quot;qa&quot;)</b> for a product with many pages and nested flows, where each page
            needs its own headline figures and the list has to collapse to icons. It is its own column in
            AppShell&apos;s <code className="font-mono">nav</code> slot. Only QA uses it today.
          </li>
          <li>Never both in one product, and never QA&apos;s form for a handful of pages.</li>
        </ul>
      </Section>
      <Section title="Sales' tabs, in the rail">
        <SideNavDemo />
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Click a tab: its reading opens while the last one shuts. The rail is drawn here as the column Sales shows on a
          laptop. Below 1040px of the shell it becomes a drawer with the tabs in it, opened from the bar&apos;s rail
          toggle (see App shell), so the tabs need no narrow form of their own, and choosing a page closes the drawer.
        </p>
      </Section>
      <Section title="Variant: QA's pages, open and collapsed">
        <QaSideNavDemo />
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Collapse it with the button in its head and open it again with the mark. Narrow the shell and it stays
          collapsed, and the mark opens it as a drawer. In this demo it goes narrow below 900px, so the open form fits
          the page; in an app it is 1100px.
        </p>
      </Section>
      <Install name="side-nav" exports="SideNav, SideNavRead, SideNavPage, SideNavFinding" />
      <Section title="Use it">
        <CodeBlock>
          {
            'const pages: SideNavPage[] = [\n  { id: "today", label: "Today", href: "/", icon: <Sun />, current: true,\n    read: (\n      <SideNavRead state="staged" action={{ label: "Show the 5", onClick: showCallbacks }}>\n        <b>5 people</b> asked to be called back, across your 9 campaigns.\n      </SideNavRead>\n    ) },\n  { id: "contacts", label: "Contacts", href: "/contacts", icon: <Users />, badge: 109 },\n  { id: "campaigns", label: "Campaigns", href: "/campaigns", icon: <Flag />, badge: 9 },\n]\n\n<AppShell topnav={<Topnav … />} rail={\n  <Rail foot={…}>\n    <SideNav pages={pages} label="Sales pages" />\n    <RailDoors>…</RailDoors>\n  </Rail>\n}>\n  <Page>…</Page>\n</AppShell>'
          }
        </CodeBlock>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Give each page its <code className="font-mono text-ink">read</code>: only the current one shows, and keeping
          the others lets a change of page close one while the next opens. The reading&apos;s state is one of the six
          work states, in Sales&apos; words; <code className="font-mono text-ink">tone</code> paints it err, warn or ok.
        </p>
        <p data-ai="p" className="mt-4 max-w-[46rem] text-meta text-ink-secondary">The QA variant, in its own column:</p>
        <div className="mt-3">
          <CodeBlock>
            {
              'const pages: SideNavPage[] = [\n  { id: "dashboard", label: "Dashboard", href: "/", icon: <LayoutGrid />, current: true,\n    badge: 2, tip: "29 points below target",\n    findings: [{ fig: "29", text: "points below target", active: true }] },\n  { id: "reviews", label: "Reviews", href: "/reviews", icon: <Settings2 />, badge: 12,\n    findings: [{ fig: "12", text: "calls waiting", href: "/reviews", bar: 0.62 }] },\n  { id: "settings", label: "Settings", href: "/settings", icon: <Settings /> },\n]\n\n<AppShell topnav={<Topnav … />} nav={<SideNav variant="qa" pages={pages} summary="6 insights" count={6} label="QA pages" />}>\n  <Page>…</Page>\n</AppShell>'
            }
          </CodeBlock>
        </div>
        <p data-ai="p" className="mt-3 max-w-[46rem] text-meta text-ink-secondary">
          Findings are optional: without them each page is one line. Pass{" "}
          <code className="font-mono text-ink">onNavigate</code> to either form to route with your app&apos;s router
          instead of following the link.
        </p>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use Sales' tabs for a few pages, at the top of the rail, with AiMY's reading of the page you are on."
            dontText="Reach for QA's column because it looks fuller. It is for many pages and nested flows."
          />
          <DoDont
            doText="Write the reading as one sentence about that page's set, with the numbers in bold and one way in."
            dontText="Repeat the page's title in the reading, or fill it with every number the page has."
          />
          <DoDont
            doText="In QA's form, give each page its one or two figures that need someone, in words: 12 calls waiting for review."
            dontText="Hide either form on a narrow screen. Sales' goes into the rail's drawer; QA's collapses and opens as one."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales&apos; tabs: <code>railNav</code> and <code>tabRead</code> in <code>assets/bdr.js</code> and section 111
          of <code>assets/bdr.css</code> (Sales d24d176). A card (6px padding, the card border, radius 2xl, the small
          shadow and a 1px inner highlight) with a 40px pill row per page: icon 16px, name, and the count in tabular
          figures. The page you are on is the tinted block, QA&apos;s current section (a radial and a linear accent
          wash, a 42% accent edge), its icon and count in the accent ink, and it opens to hold AiMY&apos;s reading:
          the state in capitals in its tone, the sentence at 14px, the figures as pills and a full-width pill button.
          Changing page closes the old reading while the new one opens, grid rows 0fr to 1fr over 250ms with the tint
          crossfading. Changed: the rows are links (Sales uses buttons carrying a script), and every page&apos;s
          reading stays in the page, shut and inert, so React needs no timers for the accordion.
        </p>
        <p className="mt-3">
          QA&apos;s form: <code>assets/aimy-rail.css</code> and <code>aimy-rail.js</code>, with the base in{" "}
          <code>index.html</code> 883-989 (QA origin/main 9911c5e). Open it is 272px: a sticky head with the mark,
          &quot;AiMY&quot; in the AI ink, the count of insights and the collapse button (Lucide panel-left); then a
          section per page, the current one first in the accent card that says &quot;You&apos;re here&quot;, the others
          with a chevron that steps right on hover. Each finding is a figure in a 42px right-aligned column and its
          words, with an optional bar for a share. Collapsed it is 64px: the mark&apos;s button with the total, then
          40px icon squares with count badges and tooltips. The choice is kept in localStorage. Below 1100px it stays
          collapsed, and the mark opens a drawer of min(308px, 88%) over a 45% scrim. Not ported: QA&apos;s reorder
          animation on clicking another page, which delays the navigation.
        </p>
      </Source>
      <A11y
        items={[
          "Both forms are a named nav, and the current page is marked aria-current.",
          "Sales' tabs are links; the shut readings are inert, so neither the keyboard nor a screen reader meets them. The reading's action is a button that says what it opens.",
          "QA's collapsed icons are links named with the page and its figure, and say so when you are on that page. The collapse and expand buttons say what they do and carry aria-expanded; the drawer is a named region, inert while closed.",
        ]}
      />
    </>
  )
}
