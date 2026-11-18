import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { AmbientBackground } from "@/registry/aimy/ui/ambient-background"
import { Card, CardHead, CardSummary, CardTitle, CardType } from "@/registry/aimy/ui/card"

export const metadata: Metadata = { title: "Background" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Background"
        lead="The wash Sales and Knowledge draw behind the whole app: two soft glows on the ground, under every surface."
      />
      <Section title="Behind a page">
        <ThemePair className="p-0">
          {/* contain makes the frame the box the fixed wash fills, as the shell does. */}
          <div className="relative h-[24rem] overflow-hidden bg-body [contain:layout_paint]">
            <AmbientBackground />
            <div className="relative flex h-full items-center justify-center p-6">
              <Card className="w-full max-w-[22rem]">
                <CardHead>
                  <CardType>Account</CardType>
                </CardHead>
                <CardTitle>Kestrel Logistics</CardTitle>
                <CardSummary>Asked for the renewal terms on Monday. Send them before Thursday&apos;s call.</CardSummary>
              </Card>
            </div>
          </div>
        </ThemePair>
      </Section>
      <Install name="ambient-background" exports="AmbientBackground" />
      <Section title="Use it">
        <div className="flex flex-col gap-3">
          <p data-ai="p" className="max-w-[46rem] text-body text-ink-secondary">
            AppShell draws it for you, on by default. To leave the plain ground, turn it off:
          </p>
          <CodeBlock>{`<AppShell topnav={…} ambient={false}>…</AppShell>`}</CodeBlock>
          <p data-ai="p" className="max-w-[46rem] text-body text-ink-secondary">
            On a page without the shell, put it first in the body and give the app&apos;s root a position, so the app
            paints above the wash:
          </p>
          <CodeBlock>{`<body>
  <AmbientBackground />
  <div className="relative">…</div>
</body>`}</CodeBlock>
        </div>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Draw it once, behind the whole app, and let every surface sit on it."
            dontText="Hang it on a card or a panel, or make anything depend on it being there."
          />
          <DoDont
            doText="Keep it still. It is the ground, not a show."
            dontText="Animate it, or lay a second glow over it."
          />
        </div>
      </Section>
      <Source>
        <p>
          Sales and Knowledge both draw it as <code>#appEllipse</code> (sales.css 1056-1090, knowledge.css 2064-2105),
          and both took it from QA&apos;s <code>my-profile.html</code>, so the three products sit on one wash. The design
          system&apos;s <code>--grad-ellipse-1</code> and <code>-2</code> carry the same idea but centre the glows at 30%
          50% and 75% 70%, tuned for its documentation column. The products centre both glows and place the layer&apos;s
          two halves instead: a large glow (81.25 by 65.625rem) centred at 42% down, and a smaller one (46.875 by
          40.625rem) off the bottom-right corner. Here those are the tokens <code>--ambient-1</code> and{" "}
          <code>-2</code>, with the products&apos; own stops, and light has its own alphas rather than the dark ones
          faded, because the dark ones read as haze on a white ground. The dark ground under the wash is QA&apos;s
          #171a1c (<code>--ambient-body</code>), not the design system&apos;s #0f1215: the alphas are calibrated against
          it, and on the darker ground the same wash reads as a blue bloom. Whatever holds the wash takes that ground,
          so rings cut in <code>--body-bg</code> still match. The layer is fixed, at z-index 0, takes no pointer and
          never moves, so reduced motion has nothing to stop. Inside AppShell it fills the shell, which is the window in
          an app.
        </p>
      </Source>
      <A11y
        items={[
          "The layer is aria-hidden and takes no pointer, so it is never read, focused or clicked.",
          "The glows are at most 18% strong in dark and 7% in light, so words on the ground keep the contrast the ground gives them.",
        ]}
      />
    </>
  )
}
