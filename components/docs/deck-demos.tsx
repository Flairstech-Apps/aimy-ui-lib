"use client"

import { FileCheck, Phone, Search } from "lucide-react"
import registry from "@/registry.json"
import { ChaptersDeck, type ChaptersStory } from "@/registry/aimy/ui/chapters-deck"
import { HorizonDeck, type HorizonStory } from "@/registry/aimy/ui/horizon-deck"
import { LanesDeck, type LanesStory } from "@/registry/aimy/ui/lanes-deck"

// Both decks tell the library's own story, from the project's dated log, so
// the two templates can be compared on the same words.

const PARTS = registry.items.filter((i) => i.type === "registry:component").length

const cover = {
  kicker: "AiMY UI · the story so far",
  title: "From two products to one system.",
  when: "November 2026",
  notes: "Open with the problem: two products drawing the same things two ways. This is how they became one system.",
}

const close = {
  title: "Knowledge to",
  turn: "Action.",
  sub: "Every insight AiMY surfaces comes with a next step.",
  action: { label: "Browse the parts", href: "/start/" },
  where: "aimy-ui-lib.aimy.flairstech.com",
  notes: "Ask everyone to take their next screen from the library, and to tell us when a part is missing.",
}

const HORIZON: HorizonStory = {
  cover,
  moments: [
    {
      when: "27 Oct",
      chapter: "The plan",
      title: "We started with a plan, not code.",
      body: "We read Sales, Knowledge and the design system, then wrote every decision down before building anything.",
      notes: "Nine disagreements between the products were settled on paper before any code.",
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
      notes: "Every part was built because a product draws it; nothing speculative.",
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

// A talk by topic: a proposal to roll AiMY Knowledge out to Customer Support (mock content).
const CHAPTERS: ChaptersStory = {
  cover: {
    kicker: "Proposal · Customer Support",
    title: "Give Support answers in seconds, not minutes.",
    sub: "Rolling AiMY Knowledge out to the Support team in January.",
    when: "Support leads · 3 December 2026",
    notes: "Open with the cost of searching, then the pilot, then the one decision we need today.",
  },
  parts: [
    {
      title: "Why now",
      holds: "What searching costs us today",
      slides: [
        {
          kind: "statement",
          title: "Agents spend a third of every call looking for the answer.",
          sub: "Four tools, two wikis and a shared drive, for every question.",
          notes: "From 120 recorded calls in October.",
        },
        {
          kind: "figures",
          title: "What searching costs today",
          figures: [
            { value: 11, suffix: "min", means: "to answer a question, against the 7-minute target Support set" },
            { value: 34, suffix: "%", means: "of call time goes on searching, not talking" },
            { value: 4, means: "tools checked for a typical question" },
          ],
        },
      ],
    },
    {
      title: "What changes",
      holds: "What agents get, and how their day changes",
      slides: [
        {
          kind: "points",
          title: "What AiMY Knowledge gives every agent",
          points: [
            { icon: Search, head: "One search", line: "Every wiki, drive and past ticket, asked once." },
            { icon: FileCheck, head: "Answers with sources", line: "Each answer cites the policy it came from." },
            { icon: Phone, head: "Inside the call", line: "It sits in the call screen, not another tab." },
          ],
        },
        {
          kind: "compare",
          title: "An everyday question, before and after",
          before: "Today",
          after: "With Knowledge",
          rows: [
            ["Check four tools", "Ask once"],
            ["Copy from an old ticket", "Read the cited policy"],
            ["Escalate when unsure", "See the source and decide"],
          ],
        },
      ],
    },
    {
      title: "The proof",
      holds: "Six weeks with the Sales team",
      slides: [
        {
          kind: "figures",
          title: "Six weeks with the Sales team",
          figures: [
            { value: 41, suffix: "%", means: "faster answers than before the pilot" },
            { value: 4.2, suffix: "/5", means: "trust in the answers, up from 3.1" },
          ],
        },
        { kind: "quote", quote: "I stopped keeping my own notes file. Everything I need is in the answer.", who: "An account manager in the pilot" },
      ],
    },
    {
      title: "The decision",
      holds: "Two ways to roll it out",
      slides: [
        {
          kind: "choice",
          title: "Two ways to roll it out",
          options: [
            { name: "Everyone in January", lines: ["All 60 agents start on 12 January", "One week of training for all", "Fastest, most risk on day one"] },
            { name: "Tier 1 first", recommended: true, lines: ["Tier 1 on 12 January, tier 2 in February", "Tier 1 agents help train tier 2", "Four weeks longer, far less risk"] },
          ],
          notes: "Recommend tier 1 first: the pilot's lesson was that people learn fastest from colleagues.",
        },
      ],
    },
  ],
  close: {
    title: "Answers in",
    turn: "seconds.",
    sub: "Approve tier 1 first, and we start on 12 January.",
    action: { label: "Approve the rollout" },
    where: "Decision by 10 December",
  },
}

export function ChaptersDemo() {
  return <ChaptersDeck story={CHAPTERS} />
}
