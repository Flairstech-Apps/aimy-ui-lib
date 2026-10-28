import type { Metadata } from "next"
import { AppShellDemo } from "@/components/docs/shell-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "App shell" }

export default function Page() {
  return (
    <>
      <PageHeader title="App shell" lead="The frame every AiMY product sits in: the bar, the rail, the page." />
      <Section title="Sales in the shell, at four widths">
        <AppShellDemo />
      </Section>
      <Install
        name="app-shell topnav rail notification-center"
        exports="AppShell, useShell, Page, PageHead, Topnav, UserMenu, Rail, RailLink"
      />
      <Section title="Use it">
        <CodeBlock>
          {
            '<AppShell\n  topnav={<Topnav logo={<AimyMark variant="lockup" />} products={products}\n    actions={<><ThemeToggle /><NotificationCenter items={items} /><UserMenu name="Engy Hassan" role="Account executive">…</UserMenu></>} />}\n  rail={<Rail foot={<RailLink icon={<Settings />} href="/console">Console</RailLink>}>…</Rail>}>\n  <Page><PageHead title="Today" stamp="Read 09:12" /></Page>\n</AppShell>'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Change a part's form as the shell narrows: a menu, a drawer, the face alone."
            dontText="Hide the products or the rail when there is no room for them."
          />
        </div>
      </Section>
      <Source>
        <p>
          Your calls on 28 Oct: Knowledge&apos;s widths, Knowledge&apos;s markup with Sales&apos; values where they
          differ, and the rail&apos;s width a setting, 320px by default (Sales&apos;) so the doors fit. The bar is
          Knowledge&apos;s (<code>.app-topnav</code>, knowledge.css 1985-2470): 60px, a hairline under it, the mark on
          the left, the products in a pill strip centred by two equal flanks (a <code>nav</code>, as Knowledge marks
          it), and on the right the theme, the bell and the account pill. The current product is in the accent&apos;s
          text ink and a step bolder. A product not open to you yet is shown and says so. The ladder, on the
          shell&apos;s own width so it can be shown here: below 1120 the account drops its name; below 1040 the rail
          becomes Knowledge&apos;s drawer (fixed under the bar, glass, a scrim behind it, in on --t-slow and out on
          --t-medium) and a toggle for it joins the bar; below 900 the strip leaves the bar for a chevron menu beside
          the mark; below 355 the bar tightens. Opening the drawer moves focus into it; Escape, the scrim or the toggle
          closes it and focus returns to the toggle. The rail is Sales&apos; column (<code>.app-rail</code>, sales.css
          4390-4459) with its gutter always kept, so nothing reflows when it grows a scrollbar, and Sales&apos; Console
          row at its foot. The page is Knowledge&apos;s: 1.5rem by 2rem padding, a 72.5rem measure, and a head with the
          title, its stamp and controls on the right.
        </p>
      </Source>
      <A11y
        items={[
          "The products are a named nav with the current one marked aria-current; the rail toggle has aria-expanded and aria-controls; the rail is a named region that takes focus as a drawer; the page has one h1.",
        ]}
      />
    </>
  )
}
