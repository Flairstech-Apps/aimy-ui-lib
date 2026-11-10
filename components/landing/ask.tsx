"use client"

// The landing's finder: ask the library for a part in plain words and get the
// part back, with an answer to stream and follow-up questions that lead to
// related parts. Used by the hero (ask-hero.tsx), the footer (site-footer.tsx)
// and the lab's variants. Canned matches, not a search: every question it
// suggests resolves to a real part.

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { AgentLoop, ConversationCard, GroundedCard, LiveProposal } from "@/components/landing/live"
import type { VoicePhase } from "@/registry/aimy/hooks/use-voice"
import { Button } from "@/registry/aimy/ui/button"

export const SITE = "https://aimy-ui-lib.aimy.flairstech.com"
export const INIT = `npx shadcn@latest add ${SITE}/r/init.json`

/* ── The finder: a question in, the library part out ─────────────────────── */

// follow: what a developer would ask next about the library once this part is
// on screen. Each one is worded so the finder resolves it to another real part.
export type Match = {
  item: string
  name: string
  href: string
  answer: string
  follow: string[]
  preview: () => React.ReactNode
}

export const MATCHES: [RegExp, Match][] = [
  [
    /step|agent|progress|working/i,
    {
      item: "agent-steps",
      name: "Agent steps",
      href: "/components/agent-steps/",
      answer: "Agent steps: every step AiMY takes, timed, with the running one live.",
      follow: ["Can the user accept the draft?", "Where are its sources?", "How does the reply stream?"],
      preview: () => <AgentLoop />,
    },
  ],
  [
    /cite|source|ground|where/i,
    {
      item: "citation",
      name: "Citation",
      href: "/components/citation/",
      answer: "Citation and Source list: a chip in the sentence opens where it came from.",
      follow: ["What steps led here?", "Can I accept an edit?", "How does it stream?"],
      preview: () => <GroundedCard />,
    },
  ],
  [
    /propos|accept|suggest|change|edit/i,
    {
      item: "suggestion",
      name: "Suggestion",
      href: "/components/suggestion/",
      answer: "Suggestion: AiMY's edit, struck and inserted, with Accept and Undo.",
      follow: ["What steps drafted it?", "Which source backs it?", "How does it stream?"],
      preview: () => <LiveProposal />,
    },
  ],
]

export const CHAT: Match = {
  item: "message",
  name: "Message",
  href: "/components/message/",
  answer: "Message and Composer: the thread, with answers streaming in word by word.",
  follow: ["Which part shows agent steps?", "How do I cite a source?", "How do I accept an edit?"],
  preview: () => <ConversationCard />,
}

// Openers, asked the way a developer asks the library.
export const ASKS = ["Which part shows agent steps?", "How do I cite a source?", "How do I accept an edit?"]

export const find = (q: string) => MATCHES.find(([re]) => re.test(q))?.[1] ?? CHAT
export const install = (m: Match) => `npx shadcn@latest add ${SITE}/r/${m.item}.json`

export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

/** Ask, think, then speak while the answer streams; the orb follows the phase. */
export function useAsk() {
  const [phase, setPhase] = useState<VoicePhase>("listening")
  const [question, setQuestion] = useState("")
  const [shown, setShown] = useState("")
  const [match, setMatch] = useState<Match | null>(null)
  const [level, setLevel] = useState(0)
  const timers = useRef<number[]>([])
  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

  const ask = useCallback((q: string) => {
    clear()
    const m = find(q)
    setQuestion(q)
    setShown("")
    setMatch(null)
    setPhase("thinking")
    const words = m.answer.split(" ")
    later(1400, () => {
      setPhase("speaking")
      words.forEach((_, i) => later(i * 60, () => setShown(words.slice(0, i + 1).join(" "))))
      later(words.length * 60 + 200, () => setMatch(m))
      later(words.length * 60 + 900, () => setPhase("listening"))
    })
  }, [])

  const stop = () => {
    clear()
    setPhase("listening")
  }

  useEffect(() => {
    if (phase !== "listening") return
    const t = window.setInterval(() => setLevel(0.15 + 0.35 * Math.abs(Math.sin(Date.now() / 650))), 140)
    return () => window.clearInterval(t)
  }, [phase])
  useEffect(() => () => clear(), [])

  const busy = phase === "thinking" || phase === "speaking"
  return { phase, question, shown, match, level, ask, stop, busy }
}

/** Plays the first ask once, when the block first comes into view. */
export function useFirstAsk(inView: boolean, ask: (q: string) => void, q: string) {
  const played = useRef(false)
  useEffect(() => {
    if (!inView || played.current) return
    played.current = true
    const t = window.setTimeout(() => ask(q), 700)
    return () => window.clearTimeout(t)
  }, [inView, ask, q])
}

export function Ctas({ center = false }: { center?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${center ? "justify-center" : ""}`}>
      <Button asChild variant="brand" size="lg">
        <Link href="/components/button/">Browse components</Link>
      </Button>
      {/* The nav's frosted glass (.nav-glass), so it holds up over the hero's ribbed glass in both
          themes; the library's Button itself is unchanged. */}
      <Button asChild size="lg" className="nav-glass">
        <Link href="/start/">Read the docs</Link>
      </Button>
    </div>
  )
}
