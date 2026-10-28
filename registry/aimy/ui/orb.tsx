"use client"

import { useEffect, useRef } from "react"
import type { VoicePhase } from "@/hooks/use-voice"
import { cn } from "@/lib/utils"

// The orb: Silk. Ported line for line from the products' voice.js (makeSilk),
// which Knowledge also lends to its note taker and agent profile.
//
// Hair-fine strands of light wound round an invisible drum that turns. Each
// strand is a line of latitude on a sphere, so the strands end at different
// points round a soft circular edge. Light adds where strands cross, a bloom
// pass glows under them, the strands facing you carry a white sheen, and
// each runs cyan to blue to violet along its length. Every quantity a phase
// controls chases its goal with a time constant, so a phase change blends.
//
//   listening   turns slowly; your voice (level) swells the waves
//   thinking    draws in tighter, turns faster
//   speaking    breathes: a wave travels out from the centre
//   muted       slows almost to a stop and drains to grey
//   error       greyer and dimmer still
//   connecting  half-lit, waiting
//
// On a light page the strands are deeper blues with normal compositing.
// Under reduced motion it draws one still frame per phase and never loops.

const SILK_N = 40 /* strands */
const SILK_PTS = 64 /* points per strand */
const SILK_BLOOM = 7 /* px (CSS): the glow under the strands */
const TAU_PHASE = 0.6 /* s: phase blends */
const TAU_UP = 0.2 /* s: voice rising */
const TAU_DOWN = 0.7 /* s: voice falling */
const BREATH_W = (Math.PI * 2) / 2.4 /* rad/s: one breath per 2.4s */
type RGB = [number, number, number]
const SILK_DARK: RGB[] = [
  [69, 211, 230],
  [64, 140, 255],
  [140, 110, 255],
]
const SILK_LIGHT: RGB[] = [
  [0, 120, 214],
  [0, 86, 230],
  [86, 58, 214],
]
const SILK_GREY: RGB[] = [
  [150, 162, 178],
  [126, 138, 156],
  [150, 150, 170],
]

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

function makeSilk(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  const off = document.createElement("canvas")
  const octx = off.getContext("2d")
  if (!ctx || !octx) return null
  // Canvas filters arrived late in Safari; without one the bloom is skipped.
  const canBloom = typeof ctx.filter === "string"
  const TAU = Math.PI * 2
  let w = 0
  let h = 0
  let dpr = 1
  let raf = 0
  let last = 0
  let t = 0
  let rot = 0
  let ph = 0
  let phase: VoicePhase = "connecting"
  let want = 0
  let lvl = 0
  let light = false
  const E = { spin: 0.2, height: 0.78, amp: 0.045, colour: 1, alpha: 0.45, breath: 0 }

  const goals = () => {
    const quiet = phase === "muted" || phase === "error"
    return {
      spin: phase === "thinking" ? 1.15 : phase === "speaking" ? 0.42 : quiet ? 0.05 : 0.2,
      height: phase === "thinking" ? 0.58 : 0.86,
      amp: quiet ? 0.02 : phase === "thinking" ? 0.07 : 0.045,
      colour: quiet ? 0 : 1,
      alpha: phase === "error" ? 0.35 : phase === "connecting" ? 0.45 : phase === "muted" ? 0.6 : 1,
      breath: phase === "speaking" ? 1 : 0,
    }
  }
  const mix = (a: RGB, b: RGB, f: number) => a.map((v, i) => Math.round(v + (b[i]! - v) * f)) as RGB
  const rgba = (c: RGB, a: number) => "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + Math.max(0, a).toFixed(3) + ")"

  function fit() {
    dpr = Math.min(2, window.devicePixelRatio || 1)
    const cw = Math.round(canvas.clientWidth * dpr)
    const ch = Math.round(canvas.clientHeight * dpr)
    if (cw && (cw !== w || ch !== h)) {
      w = canvas.width = off.width = cw
      h = canvas.height = off.height = ch
    }
    // The nearest theme scope, so an orb inside a light panel draws light.
    light = canvas.closest("[data-theme]")?.getAttribute("data-theme") === "light"
  }

  function draw(dt: number) {
    if (!ctx || !octx) return
    const G = goals()
    const kp = dt ? 1 - Math.exp(-dt / TAU_PHASE) : 1
    for (const key of Object.keys(G) as (keyof typeof G)[]) E[key] += (G[key] - E[key]) * kp
    const target = phase === "listening" ? want : 0
    lvl += (target - lvl) * (dt ? 1 - Math.exp(-dt / (target > lvl ? TAU_UP : TAU_DOWN)) : 1)

    t += dt
    rot += dt * E.spin
    ph += dt * (0.9 + E.spin * 1.4 + lvl * 0.9)
    if (!w) return

    const cx = w / 2
    const cy = h / 2
    const S = Math.min(w, h) * 0.44
    const swell = E.breath * (0.5 - 0.5 * Math.cos(t * BREATH_W))
    const pinch = phase === "thinking" ? 1 + 0.03 * Math.sin(t * 1.6) : 1
    const H = S * E.height * (1 + swell * 0.04 + lvl * 0.06) * pinch
    const A = S * (E.amp + lvl * 0.22 + swell * 0.065)
    const pal = (light ? SILK_LIGHT : SILK_DARK).map((c, i) => mix(SILK_GREY[i]!, c, E.colour))

    octx.clearRect(0, 0, w, h)
    octx.globalCompositeOperation = light ? "source-over" : "lighter"
    octx.lineCap = "butt"
    for (let k = 0; k < SILK_N; k++) {
      const th = (k / SILK_N) * TAU + rot
      const depth = (Math.cos(th) + 1) / 2
      const base = Math.sin(th) * H
      // Its own latitude: half-width of the sphere at this height.
      const L = Math.sqrt(Math.max(S * S * 0.03, S * S - base * base))
      const a = E.alpha * (0.06 + 0.72 * depth * depth) * (light ? 1.15 : 1)
      const grad = octx.createLinearGradient(cx - L, 0, cx + L, 0)
      grad.addColorStop(0, rgba(pal[0]!, 0))
      grad.addColorStop(0.26, rgba(pal[0]!, a * 0.8))
      grad.addColorStop(0.5, rgba(pal[1]!, a))
      grad.addColorStop(0.74, rgba(pal[2]!, a * 0.8))
      grad.addColorStop(1, rgba(pal[2]!, 0))

      octx.beginPath()
      for (let i = 0; i <= SILK_PTS; i++) {
        const u = (i / SILK_PTS) * 2 - 1
        const env = Math.pow(Math.max(0, 1 - u * u), 0.8)
        const wave =
          Math.sin(u * 3.1 + ph + k * 0.43) +
          0.5 * Math.sin(u * 5.9 - ph * 1.27 + k * 0.91) +
          E.breath * 0.55 * Math.sin(Math.abs(u) * 5 - t * 2.6)
        const x = cx + u * L
        const y = cy + base + env * wave * A * (0.55 + 0.45 * depth)
        if (i) octx.lineTo(x, y)
        else octx.moveTo(x, y)
      }
      octx.strokeStyle = grad
      octx.lineWidth = (0.4 + 1.1 * depth) * dpr
      octx.stroke()

      // The sheen, on the strands that face you full-on, faded at its ends.
      if (!light && depth > 0.88) {
        const sa = ((0.45 * (depth - 0.88)) / 0.12) * E.colour * E.alpha
        const sheen = octx.createLinearGradient(cx - L, 0, cx + L, 0)
        sheen.addColorStop(0.2, "rgba(255,255,255,0)")
        sheen.addColorStop(0.5, "rgba(255,255,255," + sa.toFixed(3) + ")")
        sheen.addColorStop(0.8, "rgba(255,255,255,0)")
        octx.strokeStyle = sheen
        octx.lineWidth = 0.6 * dpr
        octx.stroke()
      }
    }
    octx.globalCompositeOperation = "source-over"

    ctx.clearRect(0, 0, w, h)

    // The light the silk throws on the room behind it.
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 1.15)
    glow.addColorStop(
      0,
      rgba(
        mix(SILK_GREY[1]!, [0, 102, 255], E.colour),
        (light ? 0.08 : 0.2) * E.alpha * (0.7 + lvl * 0.8 + swell * 0.4)
      )
    )
    glow.addColorStop(1, rgba([0, 102, 255], 0))
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)

    // Bloom, then the strands sharp over their own glow.
    if (canBloom) {
      ctx.globalCompositeOperation = light ? "source-over" : "lighter"
      ctx.globalAlpha = light ? 0.35 : 0.85
      ctx.filter = "blur(" + SILK_BLOOM * dpr + "px)"
      ctx.drawImage(off, 0, 0)
      ctx.filter = "none"
      ctx.globalAlpha = 1
    }
    ctx.globalCompositeOperation = light ? "source-over" : "lighter"
    ctx.drawImage(off, 0, 0)
    ctx.globalCompositeOperation = "source-over"
  }

  function loop(now: number) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    fit()
    draw(dt)
    raf = requestAnimationFrame(loop)
  }

  // One still frame, every eased value at its goal.
  function still() {
    fit()
    lvl = 0
    draw(0)
  }

  return {
    start() {
      if (reduced()) {
        still()
        return
      }
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(loop)
      }
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
    phase(p: VoicePhase) {
      phase = p
      if (reduced()) still()
    },
    level(v: number) {
      want = v
    },
  }
}

type OrbProps = {
  phase?: VoicePhase
  /** Your voice, 0 to 1. The orb only hears it while listening. */
  level?: number
  /** False stops the frame loop, e.g. while the orb is out of view. */
  running?: boolean
  className?: string
}

/** The Silk orb on its own. It fills its box; size the box. */
export function Orb({ phase = "listening", level = 0, running = true, className }: OrbProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const silk = useRef<ReturnType<typeof makeSilk>>(null)

  useEffect(() => {
    if (ref.current && !silk.current) silk.current = makeSilk(ref.current)
  }, [])
  useEffect(() => {
    silk.current?.phase(phase)
  }, [phase])
  useEffect(() => {
    silk.current?.level(level)
  }, [level])
  useEffect(() => {
    const s = silk.current
    if (!s) return
    if (running) s.start()
    else s.stop()
    return () => s.stop()
  }, [running])

  return <canvas ref={ref} data-slot="orb" aria-hidden="true" className={cn("block size-full", className)} />
}
