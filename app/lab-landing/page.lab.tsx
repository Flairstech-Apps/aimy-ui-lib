import type { Metadata } from "next"
import {
  FooterAsk,
  FooterMap,
  FooterStatement,
  HeroAsk,
  HeroFloat,
  HeroThread,
} from "@/components/landing/variants"
import registry from "@/registry.json"

// Dev-only (page.lab.tsx): hero and footer options for the landing page.
export const metadata: Metadata = { title: "Landing variants" }

const COUNT = registry.items.filter((i) => i.type === "registry:component").length

function Variant({ id, title, idea, children }: { id: string; title: string; idea: string; children: React.ReactNode }) {
  return (
    <div id={id} className="border-t-4 border-edge">
      <div className="mx-auto flex max-w-[80rem] flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="text-meta text-ink-secondary">{idea}</p>
      </div>
      <div className="border-t border-hairline">{children}</div>
    </div>
  )
}

export default function LandingVariants() {
  return (
    <main>
      <header className="mx-auto max-w-[80rem] px-5 pt-10 pb-8">
        <p className="text-xs font-semibold text-ink-secondary">Lab, dev only</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Landing: hero and footer options</h1>
        <p className="mt-3 max-w-[48rem] text-body text-ink-secondary">
          Every hero keeps the orb and the chat, the Browse components button and the install command. The chat answers
          by finding the library part that does the job and showing it live. Try the suggestions or type a request.
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-meta font-semibold text-ink-action">
          <a href="#hero-a">Hero A</a>
          <a href="#hero-b">Hero B</a>
          <a href="#hero-c">Hero C</a>
          <a href="#footer-a">Footer A</a>
          <a href="#footer-b">Footer B</a>
          <a href="#footer-c">Footer C</a>
        </nav>
      </header>
      <Variant
        id="hero-a"
        title="Hero A: Ask the library"
        idea="Centred. The orb is the object and the composer the main control; the answer is the part, live, with its install line."
      >
        <HeroAsk count={COUNT} />
      </Variant>
      <Variant
        id="hero-b"
        title="Hero B: A conversation beside the promise"
        idea="Split, no box. The promise and install on the left; a real thread on the right, the orb speaking at its head."
      >
        <HeroThread count={COUNT} />
      </Variant>
      <Variant
        id="hero-c"
        title="Hero C: The product's float bar"
        idea="The orb as the stage, the composer docked like Sales' float bar, the answer rising in the Peek. Open it to lay the part out."
      >
        <HeroFloat count={COUNT} />
      </Variant>
      <Variant
        id="footer-a"
        title="Footer A: The site map"
        idea="Mark and release on the left, four columns of where to go next."
      >
        <FooterMap />
      </Variant>
      <Variant
        id="footer-b"
        title="Footer B: One more question"
        idea="Bookends the hero: a resting orb and a composer that names the part, then a slim row of links."
      >
        <FooterAsk />
      </Variant>
      <Variant
        id="footer-c"
        title="Footer C: The statement"
        idea="The install command and the links, then the AiMY lockup set large and cropped by the page's edge."
      >
        <FooterStatement />
      </Variant>
    </main>
  )
}
