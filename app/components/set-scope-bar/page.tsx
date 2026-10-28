import type { Metadata } from "next"
import { SetScopeBarDemo } from "@/components/docs/ai4-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Set-scope bar" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Set-scope bar"
        lead="Bulk work says what it is about to act on: how many, of what, filtered how."
      />
      <Section title="Eighteen cards selected">
        <ThemePair>
          <SetScopeBarDemo />
        </ThemePair>
      </Section>
      <Install name="set-scope-bar" exports="SetScopeBar" />
      <Section title="Use it">
        <CodeBlock>
          {
            '<SetScopeBar count={18} scope={<>of <strong>240 cards</strong> · filtered to <strong>Policies</strong></>}\n  actions={<EntryAction mode="review" onClick={review}>Request verification</EntryAction>} onClear={clear} />'
          }
        </CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say how many and of what, before acting on them."
            dontText="Act on a selection the person can't see."
          />
        </div>
      </Section>
      <Source>
        <p>
          Built from the design system&apos;s <code>.set-scope-bar</code>, your call on 28 Oct: neither product draws
          one. The count, the scope with the parts that narrow it in strong, the actions that apply to every selected
          item, and Clear. The action names the operation and its count (&quot;Send 15 requests&quot;), never
          &quot;Apply&quot;; anything with consequences opens a ChangeReview, which says what it will skip.
        </p>
      </Source>
      <A11y items={["A region named Selection; the count is announced when it changes."]} />
    </>
  )
}
