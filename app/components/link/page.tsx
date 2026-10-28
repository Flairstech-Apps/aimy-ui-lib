import { ArrowUpRight } from "lucide-react"
import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { Link } from "@/registry/aimy/ui/link"

export const metadata: Metadata = { title: "Link" }

export default function LinkPage() {
  return (
    <>
      <PageHeader title="Link" lead="Coloured words for going somewhere. A link has neither a fill nor an edge; anything that does something is a button." />
      <Section title="Variants">
        <ThemePair>
          <div className="flex flex-col gap-4 text-body text-ink-secondary">
            <p>
              <Link href="#link">View the call record</Link>
            </p>
            <p>
              <Link href="#link">
                Open in Salesforce
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </p>
            <p>
              Replies follow the{" "}
              <Link href="#link" variant="inline">
                outreach policy
              </Link>{" "}
              your team set.
            </p>
          </div>
        </ThemePair>
      </Section>
      <Install name="link" exports="Link" />
      <Section title="Use it">
        <CodeBlock>{`<Link href="/calls/42">View the call record</Link>
<Link asChild><NextLink href="/calls/42">View the call record</NextLink></Link>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <DoDont
          doText="Use a link to go to a page or record. Inside a sentence, use variant inline."
          dontText="Style an action as a link (a row of actions that reads like URLs). Use Button variant text."
        />
      </Section>
      <Source>
        <p>
          The design system&apos;s <code>.link</code> and <code>.link.inline</code>, at weight 500 like Sales and the design
          system (Knowledge used 600). The muted variant was dropped: no muted text.
        </p>
      </Source>
      <A11y items={["A real <a>, so it opens in a new tab and shows its address.", "Name where it goes, not \"here\" or \"click here\"."]} />
    </>
  )
}
