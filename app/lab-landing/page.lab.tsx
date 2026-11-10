import type { Metadata } from "next"
import {
  FooterAsk,
  FooterMap,
  FooterStatement,
  HeroAsk,
  HeroFloat,
  HeroThread,
} from "@/components/landing/variants"
import {
  FooterRelease,
  FooterSetup,
  FooterSignoff,
  HeroCanvas,
  HeroHorizon,
  HeroShelf,
} from "@/components/landing/variants-more"
import { FooterArc, FooterHorizon } from "@/components/landing/variants-footers"
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
          <a href="#hero-c2">C2</a>
          <a href="#hero-c3">C3</a>
          <a href="#hero-c4">C4</a>
          <a href="#footer-a">Footer A</a>
          <a href="#footer-b">Footer B</a>
          <a href="#footer-c">Footer C</a>
          <a href="#footer-d">Footer D</a>
          <a href="#footer-e">Footer E</a>
          <a href="#footer-f">Footer F</a>
          <a href="#footer-g">Footer G</a>
          <a href="#footer-h">Footer H</a>
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
        idea="The orb as the stage, the composer docked like Sales' float bar, the answer rising in the Peek. Drag the peek up: it becomes one wide canvas with the part, the answer and its install line."
      >
        <HeroFloat count={COUNT} />
      </Variant>
      <Variant
        id="hero-c2"
        title="Hero C2: Stage and canvas"
        idea="C's orb and float bar on the left; the part opens on a canvas beside them, as Knowledge's canvas opens beside the chat."
      >
        <HeroCanvas count={COUNT} />
      </Variant>
      <Variant
        id="hero-c3"
        title="Hero C3: Horizon, redesigned"
        idea="A dark sky and the orb rising behind the curve of a lit ground; the float bar rests on the horizon, the asks wait below. Drag the peek up to open the canvas."
      >
        <HeroHorizon count={COUNT} />
      </Variant>
      <Variant
        id="hero-c4"
        title="Hero C4: The bar and the shelf"
        idea="C's bar with the parts it can find as tiles under it; the one AiMY names lights up and opens. A tile asks too."
      >
        <HeroShelf count={COUNT} />
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
      <Variant
        id="footer-d"
        title="Footer D: Get set up"
        idea="The three ways in (your app, your agent, a new product) on one switch, each with its command."
      >
        <FooterSetup />
      </Variant>
      <Variant
        id="footer-e"
        title="Footer E: What's new"
        idea="The latest release's parts as cards into their pages, beside the version and every release."
      >
        <FooterRelease />
      </Variant>
      <Variant
        id="footer-f"
        title="Footer F: The sign-off"
        idea="A small resting orb and Ask AiMY that take you back to the float bar, then one row of links."
      >
        <FooterSignoff barId="hero-c" />
      </Variant>
      <Variant
        id="footer-g"
        title="Footer G: The arc, made luxurious"
        idea="Today's lit arc as two fine hairlines fading at their ends, the AiMY mark at the apex, light roomy type, the links resting in the bowl."
      >
        <FooterArc />
      </Variant>
      <Variant
        id="footer-h"
        title="Footer H: The orb horizon"
        idea="The page ends where C3 begins: the orb rising behind a lit ground, the bar on the line, links, release and maker below."
      >
        <FooterHorizon />
      </Variant>
    </main>
  )
}
