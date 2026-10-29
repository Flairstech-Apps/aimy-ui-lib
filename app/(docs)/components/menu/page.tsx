import type { Metadata } from "next"
import { MenuDemo } from "@/components/docs/batch-c-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Menu" }

export default function Page() {
  return (
    <>
      <PageHeader title="Menu" lead="A list of actions or choices that opens from a control." />
      <Section title="One answer with people, several answers with search, and actions">
        <ThemePair>
          <MenuDemo />
        </ThemePair>
      </Section>
      <Install name="menu" exports="Menu, MenuTrigger, MenuContent, MenuItem, MenuRadioGroup, MenuRadioItem, MenuCheckboxItem, MenuLabel, MenuSeparator, MenuSearch" />
      <Section title="Use it">
        <CodeBlock>{"<Menu>\n  <MenuTrigger asChild><Button>Sells: {sells.join(\", \")}</Button></MenuTrigger>\n  <MenuContent>\n    <MenuSearch label=\"Find a product\" value={q} onValueChange={setQ} />\n    {products.map(p => (\n      <MenuCheckboxItem key={p} checked={sells.includes(p)} onCheckedChange={…}>{p}</MenuCheckboxItem>\n    ))}\n  </MenuContent>\n</Menu>"}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Name the control after what it holds: Sells: Cloud, Data." dontText="Label the control Options or More when it has a real name." />
        </div>
      </Section>
      <Source>
        <p>Sales&apos; pick menus (<code>.b-menu</code>: the draft field pickers, the persona switcher) and Knowledge&apos;s account menu (<code>.menu</code>). A raised panel with an edge, 14px items with an optional line under the name, the highlight and the chosen ones on an accent wash. Several answers keep the menu open, as Sales&apos; did. Corners are 12px (Sales used 14, Knowledge 10; 12 is on the scale). Opens and closes with transitions.dev&apos;s menu dropdown (05), which is the timing Sales already used. Sales&apos; menus lacked arrow keys, typeahead, aria-expanded and focus return; these have them.</p>
      </Source>
      <A11y items={["A menu with menuitem, menuitemradio and menuitemcheckbox roles.","Arrow keys, Home, End and typeahead move between items; Escape closes and focus returns to the control."]} />
    </>
  )
}
