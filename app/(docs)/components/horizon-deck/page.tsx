import type { Metadata } from "next"
import { A11y, Install, Source } from "@/components/docs/component"
import { HorizonDemo } from "@/components/docs/deck-demos"
import { CodeBlock, DoDont, PageHeader, Section } from "@/components/docs/page"

export const metadata: Metadata = { title: "Horizon deck" }

export default function HorizonDeckPage() {
  return (
    <>
      <PageHeader
        title="Horizon deck"
        lead="A presentation told on the orb's horizon. The orb rises on the cover, then hops along the horizon from moment to moment, and the AiMY mark flies to the header and back for the close. For keynotes, launches and all-hands."
      />
      <Section
        title="Try it"
        lead="Click the deck, then use the arrow keys or Space. Present takes it full screen. The site's theme switch shows it in light."
      >
        <HorizonDemo />
      </Section>
      <Install name="horizon-deck" exports="HorizonDeck" />
      <Section title="Use it">
        <CodeBlock>{`<HorizonDeck
  story={{
    cover: { kicker: "Q4 review", title: "From two products to one system.", when: "November 2026" },
    moments: [
      { when: "27 Oct", chapter: "The plan", title: "We started with a plan, not code.", body: "Every decision written down first." },
      { when: "29 Oct", chapter: "1.0.0", figure: { value: 113, means: "parts, each naming the product it came from" } },
      { when: "11 Nov", chapter: "Patches", title: "Production found what the docs missed." },
    ],
    close: { title: "Knowledge to", turn: "Action.", sub: "Every insight comes with a next step.", action: { label: "Browse the parts", href: "/start/" } },
  }}
/>`}</CodeBlock>
        <ul data-ai="ul" className="mt-3 flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-meta text-ink-secondary">
          <li data-ai="li">
            Each moment is a date and a chapter on the horizon, and a headline with a line under it on the slide. Two
            to seven moments fit; five reads best.
          </li>
          <li data-ai="li">
            A figure takes the headline&apos;s place: the number counts up when its slide arrives, with what it means
            under it.
          </li>
          <li data-ai="li">
            The close&apos;s <code className="font-mono text-ink">turn</code> is set in AiMY blue after its title, as
            the brand line does.
          </li>
        </ul>
      </Section>
      <Section title="What moves">
        <ul data-ai="ul" className="flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-body text-ink-secondary">
          <li data-ai="li">
            The mark rests large on the cover. Leaving it, the mark winds up, flies to the header in an arc with one
            turn, lands with a spring, and the word AiMY wipes in behind it. It flies back for the close.
          </li>
          <li data-ai="li">
            Between moments the header mark comes apart into dots, turns once and gathers back: AiMY thinking.
          </li>
          <li data-ai="li">
            The orb hops along an arc to the next date and lights its path in the sky; a light runs along the horizon
            ahead of it, the ground ripples where it lands, and the date rises onto a glass chip.
          </li>
          <li data-ai="li">
            Titles arrive word by word; dust rises out of the horizon. The timings are the deck motion tokens (
            <code className="font-mono text-ink">--deck-flight</code>, <code className="font-mono text-ink">--deck-hop</code>{" "}
            and the rest in motion.css).
          </li>
        </ul>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Give each slide one headline and at most two lines under it. When there is more to say, add a moment."
            dontText="Fill a slide with a list. The horizon is for a story told aloud; a deck people read alone is the Two lanes deck."
          />
          <DoDont
            doText="Make every figure say what it means: the number, then what it counts."
            dontText="Put a bare number on a slide, or one nobody can act on."
          />
        </div>
      </Section>
      <Source>
        <p>
          Chosen from <code>docs/deck-variants.html</code> (variant C). The horizon is the landing page&apos;s footer (
          <code>.horizon-glow</code> and <code>.horizon-ground</code>), the orb is the library&apos;s{" "}
          <code>Orb</code>. The logo flight, the thinking mark, the blooms and the dust are the Chrome extension&apos;s
          (<code>Knowledge/extension/popup.js</code> <code>buildKeyframes</code> and <code>thinkFrame</code>,{" "}
          <code>popup.css</code> ambient field), scaled to the stage. The brand line and its blue turn are from the
          brand guidelines.
        </p>
      </Source>
      <A11y
        items={[
          "A region named by the deck, announced as a slide deck. Arrows, Space, Page Up and Down, Home and End move through it; the slide count is a live region.",
          "Only the current slide is read; the others are hidden from screen readers while they are off the screen. The timeline on the ground is drawing, not content: the slide says its date.",
          "Under reduced motion nothing travels: each slide appears in place, the orb is still and figures show their value.",
        ]}
      />
    </>
  )
}
