import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { LanesDemo } from "@/components/docs/deck-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Two lanes deck" }

export default function LanesDeckPage() {
  return (
    <>
      <PageHeader
        title="Two lanes deck"
        lead="A presentation told in two lanes on one time axis: what we learned above it, what we did below it, and an arrow drawn between. Knowledge to Action as a layout. For reviews, retrospectives and updates."
      />
      <Section
        title="Try it"
        lead="Click the deck, then use the arrow keys or Space. Present takes it full screen. The site's theme switch shows it in light."
      >
        <LanesDemo />
      </Section>
      <Install name="lanes-deck" exports="LanesDeck" />
      <Section title="Use it">
        <CodeBlock>{`<LanesDeck
  story={{
    cover: { kicker: "Q4 review", title: "From two products to one system.", sub: "What we learned, and what we did about it." },
    moments: [
      { when: "27 Oct", chapter: "The plan", learned: "Two products solve the same problems.", did: "One plan, nine disagreements settled." },
      { when: "29 Oct", chapter: "1.0.0", figure: { value: 113, means: "parts" }, did: "Built what the products draw." },
      { when: "Nov", chapter: "Trust", figure: { value: 4.2, suffix: "/5", means: "trust score, up from 3.1" }, did: "Next: citations everywhere.", notes: "Say where the score comes from." },
    ],
    close: { title: "Knowledge to", turn: "Action.", action: { label: "Browse the parts", href: "/start/" } },
  }}
/>`}</CodeBlock>
        <ul data-ai="ul" className="mt-3 flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-meta text-ink-secondary">
          <li data-ai="li">
            Every moment needs both halves: what was learned (or a figure) and what was done about it. When nothing
            was done yet, say &quot;Next: …&quot;; never invent it. A figure takes the learned card&apos;s words, with
            its unit in <code className="font-mono text-ink">prefix</code> or{" "}
            <code className="font-mono text-ink">suffix</code>.
          </li>
          <li data-ai="li">
            <code className="font-mono text-ink">notes</code> on any slide add Speaker view beside Present, and{" "}
            <code className="font-mono text-ink">cover.when</code> shows top right.
          </li>
          <li data-ai="li">
            A column&apos;s cards are set smaller together until both fit, and the deck says what to cut (console in
            development, or <code className="font-mono text-ink">onProblems</code>).
          </li>
          <li data-ai="li">
            The rail names the lanes Knowledge and Action. Pass <code className="font-mono text-ink">lanes</code> to
            name them for your story, for example Signal and Move.
          </li>
          <li data-ai="li">Any number of moments: the axis travels; past columns stay on screen.</li>
        </ul>
      </Section>
      <Section title="What moves">
        <ul data-ai="ul" className="flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-body text-ink-secondary">
          <li data-ai="li">
            The mark flies from the cover to the header, lands on the glass rail as it slides in, and flies back for the
            close. Between moments it comes apart into dots and gathers back.
          </li>
          <li data-ai="li">
            A light runs along the axis to the next moment and the line fills behind it. What we learned rises, the
            arrow draws down, and what we did lands with a spring.
          </li>
          <li data-ai="li">
            The rail says where the story is: the chapter in words and a bar per chapter. Blooms drift and dust rises
            behind it all.
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Pair every insight with what was done about it. A moment without a next step is a note, not a slide."
            dontText="Leave a lane empty to fill later, or put two insights in one card."
          />
          <DoDont
            doText="Keep both cards to a sentence or two, so the past columns stay readable beside the current one."
            dontText="Shrink the cards to fit more in. Add a moment instead."
          />
        </div>
      </Section>
      <Source>
        <p>
          Chosen from <code>docs/deck-variants.html</code> (variant D), built on the brand guidelines&apos; line,
          Knowledge to Action. The logo flight, the thinking mark, the blooms and the dust are the Chrome
          extension&apos;s (<code>Knowledge/extension/popup.js</code> and <code>popup.css</code>), scaled to the stage.
          The rail&apos;s glass is the library&apos;s <code>--glass-soft</code> and <code>--glass-border</code>; the
          legend&apos;s icons are Lucide&apos;s lightbulb and zap.
        </p>
      </Source>
      <A11y
        items={[
          "A region named by the deck, announced as a slide deck. Arrows, Space, Page Up and Down, Home and End move through it; the slide count is a live region.",
          "Only the current column and slide are read; past columns stay on screen for sighted people and are hidden from screen readers, so each slide is heard once.",
          "Under reduced motion nothing travels: each slide appears in place and figures show their value.",
        ]}
      />
    </>
  )
}
