"use client"

import registry from "@/registry.json"
import { HorizonDeck, type HorizonStory } from "@/registry/aimy/ui/horizon-deck"
import { LanesDeck, type LanesStory } from "@/registry/aimy/ui/lanes-deck"

// Both decks tell the library's own story, from the project's dated log, so
// the two templates can be compared on the same words.

const PARTS = registry.items.filter((i) => i.type === "registry:component").length

const cover = {
  kicker: "AiMY UI · the story so far",
  title: "From two products to one system.",
  when: "November 2026",
}

const close = {
  title: "Knowledge to",
  turn: "Action.",
  sub: "Every insight AiMY surfaces comes with a next step.",
  action: { label: "Browse the parts", href: "/start/" },
  where: "aimy-ui-lib.aimy.flairstech.com",
}

const HORIZON: HorizonStory = {
  cover,
  moments: [
    {
      when: "27 Oct",
      chapter: "The plan",
      title: "We started with a plan, not code.",
      body: "We read Sales, Knowledge and the design system, then wrote every decision down before building anything.",
    },
    {
      when: "27 Oct",
      chapter: "Day one",
      title: "The registry went live on day one.",
      body: "A shadcn registry, two npm packages and a starter app, all from one source.",
    },
    {
      when: "28 Oct",
      chapter: "The parts",
      title: "Buttons first, then AiMY's own parts.",
      body: "Forms, menus and toasts, then the conversation, voice, sources and the agent's steps.",
    },
    {
      when: "29 Oct",
      chapter: "1.0.0",
      figure: { value: PARTS, means: "parts today, each page naming the product it came from" },
    },
    {
      when: "11 Nov",
      chapter: "Patches",
      title: "Production found what the docs missed.",
      body: "One chat bubble, widgets that wear it, and widget heads that fit a phone.",
    },
  ],
  close,
}

const LANES: LanesStory = {
  cover: { ...cover, sub: "Every step, told as what we learned and what we did about it." },
  moments: [
    {
      when: "27 Oct",
      chapter: "The plan",
      learned: "Sales and Knowledge already solve the same problems, in two different ways.",
      did: "One plan: the stack, the tokens, the batches, and nine disagreements to settle.",
    },
    {
      when: "27 Oct",
      chapter: "Day one",
      learned: "Teams use what they can install in one command.",
      did: "npx shadcn add @aimy/part, and the code is theirs to own.",
    },
    {
      when: "28 Oct",
      chapter: "The parts",
      learned: "What makes AiMY different lives in its AI parts.",
      did: "Message, Composer, Orb, Citation and Agent steps, measured against both products.",
    },
    {
      when: "29 Oct",
      chapter: "1.0.0",
      figure: { value: PARTS, means: "parts today, each page naming the product it came from" },
      did: "Built what the products draw, skipped the rest, and named each part's source.",
    },
    {
      when: "11 Nov",
      chapter: "Patches",
      learned: "Real screens break in ways a docs page never does.",
      did: "Fixed in the library and shipped the same day, 1.4.3 to 1.4.5.",
    },
  ],
  close,
}

export function HorizonDemo() {
  return <HorizonDeck story={HORIZON} />
}

export function LanesDemo() {
  return <LanesDeck story={LANES} />
}
