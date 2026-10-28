"use client"

import { useEffect, useRef, useState } from "react"
import { MARK_BOX, MARK_GRADIENT, MARK_ICON } from "@/components/aimy-mark"
import { cn, cssDuration } from "@/lib/utils"

// AiMY at work, before any words: the think-mark and a line saying what it is
// doing. Both products draw the same thing (Knowledge knowledge.js:15444,
// copied verbatim into Sales bdr.js:29242): the AiMY mark comes apart into
// about ninety dots, orbits, and gathers back, each dot keeping the colour of
// the petal it left. Ported line for line. It stops drawing when it leaves
// the page, and under reduced motion it draws the mark once, at rest: the
// state is information, only the movement is decoration.
//
// The line is transitions.dev's thinking states (28): it shimmers while a
// state holds, then swaps up to the next. Give one label for a fixed line
// (Sales: "Reading the record…") or several to step through (Knowledge:
// "Searching the corpus", "Reading 3 documents", "Composing the answer").

const THINK_N = 90
const T_SCATTER = 620
const T_ORBIT = 900
const T_GATHER = 620
const T_HOLD = 420
const T_CYCLE = T_SCATTER + T_ORBIT + T_GATHER + T_HOLD
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

type Pt = {
  x: number
  y: number
  c: string
  ox: number
  oy: number
  sp: number
  sz: number
}
let POINTS: Pt[] | null = null

type Channels = [number, number, number]

function channels(hex: string): Channels {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const STOPS = MARK_GRADIENT.stops.map(([at, c]: [number, string]) => ({
  o: at,
  c: channels(c),
}))

/* SVG's rule at the ends: before the first stop and after the last, the
   gradient holds that stop's colour. */
function stopColour(o: number): Channels {
  let prev = STOPS[0]!
  if (o <= prev.o) return prev.c
  for (const next of STOPS.slice(1)) {
    if (o <= next.o) {
      const t = (o - prev.o) / (next.o - prev.o || 1)
      return [0, 1, 2].map((k) => Math.round(prev.c[k]! + (next.c[k]! - prev.c[k]!) * t)) as Channels
    }
    prev = next
  }
  return prev.c
}

/* A jittered grid over the mark, so an even spread reads as the shape. Each
   point gets a fixed orbit seat, so it always leaves for the same place and
   comes back to the same petal. */
function sampleMark(): Pt[] {
  if (POINTS) return POINTS
  POINTS = []
  try {
    const cv = document.createElement("canvas")
    const ctx = cv.getContext("2d")
    if (!ctx || typeof Path2D === "undefined") return POINTS
    const p2 = new Path2D(MARK_ICON)
    const { w: VW, h: VH } = MARK_BOX
    const g = MARK_GRADIENT
    cv.width = Math.ceil(VW)
    cv.height = Math.ceil(VH)
    const pts: Pt[] = []
    const step = Math.sqrt((VW * VH) / (THINK_N * 2.2))
    for (let y = step / 2; y < VH; y += step) {
      for (let x = step / 2; x < VW; x += step) {
        const jx = x + (((x * 7 + y * 13) % 10) / 10 - 0.5) * step * 0.8
        const jy = y + (((x * 11 + y * 5) % 10) / 10 - 0.5) * step * 0.8
        if (ctx.isPointInPath(p2, jx, jy)) {
          const off = Math.sqrt((jx - g.cx) * (jx - g.cx) + (jy - g.cy) * (jy - g.cy)) / g.r
          const c = stopColour(off)
          pts.push({
            x: jx / VW - 0.5,
            y: jy / VH - 0.5,
            c: `rgb(${c[0]},${c[1]},${c[2]})`,
            ox: 0,
            oy: 0,
            sp: 0,
            sz: 0,
          })
        }
      }
    }
    pts.forEach((pt, i) => {
      const a = Math.atan2(pt.y, pt.x) + (i % 5) * 0.21
      const r = 0.34 + ((i * 37) % 11) / 55
      pt.ox = Math.cos(a) * r
      pt.oy = Math.sin(a) * r
      pt.sp = 0.6 + ((i * 17) % 7) / 10
      pt.sz = 0.7 + ((i * 23) % 5) / 8
    })
    POINTS = pts
  } catch {
    POINTS = []
  }
  return POINTS
}

function frame(cv: HTMLCanvasElement, css: number, ms: number) {
  const ctx = cv.getContext("2d")
  const pts = sampleMark()
  if (!ctx || !pts.length) return false
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (cv.width !== Math.round(css * dpr)) {
    cv.width = Math.round(css * dpr)
    cv.height = Math.round(css * dpr)
  }
  const S = cv.width
  ctx.clearRect(0, 0, S, S)
  const phase = ms % T_CYCLE
  // 0 in the mark, 1 in the orbit.
  let mix: number
  if (phase < T_SCATTER) mix = easeInOut(phase / T_SCATTER)
  else if (phase < T_SCATTER + T_ORBIT) mix = 1
  else if (phase < T_SCATTER + T_ORBIT + T_GATHER) mix = 1 - easeInOut((phase - T_SCATTER - T_ORBIT) / T_GATHER)
  else mix = 0
  const spin = (ms / 2600) * Math.PI * 2
  for (const p of pts) {
    const a = spin * p.sp
    const ox = p.ox * Math.cos(a) - p.oy * Math.sin(a)
    const oy = p.ox * Math.sin(a) + p.oy * Math.cos(a)
    const x = (p.x + (ox - p.x) * mix) * S * 0.92 + S / 2
    const y = (p.y + (oy - p.y) * mix) * S * 0.92 + S / 2
    const r = Math.max(0.6, p.sz * (S / 26) * (1 - mix * 0.25))
    ctx.globalAlpha = 0.45 + (1 - mix) * 0.55
    ctx.fillStyle = p.c
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  return true
}

/** The particle mark on its own (26px; 22px in a peek card). */
export function ThinkMark({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const css = cv.clientWidth || 26
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (still) {
      frame(cv, css, T_SCATTER + T_ORBIT + T_GATHER + 1)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const step = () => {
      if (!frame(cv, css, performance.now() - t0)) return
      raf = requestAnimationFrame(step)
    }
    step()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <canvas
      ref={ref}
      data-slot="think-mark"
      width={26}
      height={26}
      aria-hidden="true"
      className={cn("size-[1.625rem] shrink-0 text-ai-ink", className)}
    />
  )
}

/* Transitions.dev 28: hold, then swap. Both lines sit over a box the hidden
   sizer holds steady, so the pill never resizes mid-swap. */
function ThinkLine({ states }: { states: string[] }) {
  // gen counts swaps; it keys the incoming line so each one mounts fresh.
  const [gen, setGen] = useState(0)
  const [leaving, setLeaving] = useState<{ key: number; text: string } | null>(null)
  const [entering, setEntering] = useState(false)
  const i = Math.min(gen, states.length - 1)
  const many = states.length > 1

  // A caller may pass a fresh array each render; the words are what count.
  const current = states[i] ?? ""
  const last = i === states.length - 1

  // Hold, then start a swap. Knowledge steps through its beats once and keeps
  // the last one, so nothing is scheduled after it.
  useEffect(() => {
    if (!many || last) return
    const t = window.setTimeout(
      () => {
        setLeaving({ key: gen, text: current })
        setEntering(true)
        setGen(gen + 1)
      },
      cssDuration("--think-hold", 2000)
    )
    return () => window.clearTimeout(t)
  }, [gen, current, many, last])

  // Finish a swap: release the incoming line after the gap, drop the outgoing
  // one once both have moved.
  useEffect(() => {
    if (gen === 0) return
    const gap = cssDuration("--think-gap", 50)
    const a = window.setTimeout(() => setEntering(false), gap)
    const b = window.setTimeout(() => setLeaving(null), cssDuration("--think-swap", 150) + gap)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [gen])

  const text = current
  const longest = states.reduce((a, b) => (b.length > a.length ? b : a), "")
  return (
    <span className="t-think text-left text-sm font-semibold">
      <span className="t-think-sizer" aria-hidden="true">
        {longest}
      </span>
      {leaving ? (
        <span key={`out-${leaving.key}`} className="t-think-text is-exit" data-text={leaving.text} aria-hidden="true">
          {leaving.text}
        </span>
      ) : null}
      <span key={`in-${gen}`} className={cn("t-think-text", entering && "is-enter-start")} data-text={text}>
        {text}
      </span>
    </span>
  )
}

type ThinkingIndicatorProps = {
  /** One line, or the beats to step through (each held 2s, the last kept). */
  label?: string | string[]
  /** "pill" in a thread; "bare" inside a peek card or a message bubble. */
  variant?: "pill" | "bare"
  className?: string
}

export function ThinkingIndicator({ label = "Thinking", variant = "pill", className }: ThinkingIndicatorProps) {
  const states = Array.isArray(label) ? label : [label]
  return (
    <span
      data-slot="thinking"
      role="status"
      className={cn(
        "inline-flex items-center",
        variant === "pill" ? "gap-2.5 rounded-pill border border-edge bg-raised px-4 py-2" : "gap-2",
        className
      )}
    >
      <ThinkMark className={variant === "bare" ? "size-[1.375rem]" : undefined} />
      <ThinkLine states={states} />
    </span>
  )
}
