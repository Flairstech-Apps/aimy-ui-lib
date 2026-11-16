// Transitions and gestures: panels that open to their own height, hidden
// content the browser's find can still reach, enter and exit states for CSS
// animations (the transitions.dev snippets key off data-state), and the
// physics a gesture needs: velocity, where a flick lands, springs and
// rubber-banding past an edge. Reduced motion skips the waiting, never the
// state change.

import { type Cleanup, cleanups, reducedMotion } from "./behaviors-core"

// ── Waiting for CSS ─────────────────────────────────────────

/** Resolves when every animation and transition running on el has finished (at once under reduced motion). */
export function animationsDone(el: Element): Promise<void> {
  if (reducedMotion() || typeof el.getAnimations !== "function") return Promise.resolve()
  const running = el.getAnimations()
  if (!running.length) return Promise.resolve()
  return Promise.allSettled(running.map((a) => a.finished)).then(() => undefined)
}

/**
 * Sets data-starting-style for one frame so a CSS transition runs from it,
 * for browsers without @starting-style. Returns a cleanup.
 */
export function animateIn(el: HTMLElement): Cleanup {
  el.setAttribute("data-starting-style", "")
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => el.removeAttribute("data-starting-style"))
  })
  return () => cancelAnimationFrame(frame)
}

/** Sets data-ending-style, waits for the exit animation, then calls done. */
export function animateOut(el: HTMLElement, done: () => void): Cleanup {
  let live = true
  el.setAttribute("data-ending-style", "")
  requestAnimationFrame(() => {
    animationsDone(el).then(() => {
      if (!live) return
      el.removeAttribute("data-ending-style")
      done()
    })
  })
  return () => {
    live = false
    el.removeAttribute("data-ending-style")
  }
}

// ── Hidden but findable ─────────────────────────────────────

export function supportsHiddenUntilFound(): boolean {
  return typeof document !== "undefined" && "onbeforematch" in document.body
}

/** Attributes for content that is closed: hidden, or hidden until the browser's find matches it. */
export function hiddenAttrs(open: boolean, findable = false): { hidden?: true | "until-found" } {
  if (open) return {}
  return { hidden: findable && supportsHiddenUntilFound() ? "until-found" : true }
}

/** Opens a closed section when find-in-page matches text inside it. */
export function bindFindable(el: HTMLElement, onReveal: () => void): Cleanup {
  const fn = () => onReveal()
  el.addEventListener("beforematch", fn)
  return () => el.removeEventListener("beforematch", fn)
}

// ── Panel ───────────────────────────────────────────────────

/**
 * An accordion or disclosure body that opens to its own height: sets
 * --panel-height to the measured height so CSS can transition to it, sets
 * data-state, hides the body once closed, and moves focus back to the
 * trigger if it was inside when the panel closed.
 */
export function bindPanel(panel: HTMLElement, options: { trigger?: HTMLElement | null; findable?: boolean; onReveal?: () => void }) {
  let token = 0
  const c = cleanups()
  if (options.findable && options.onReveal) c.add(bindFindable(panel, options.onReveal))

  function set(open: boolean) {
    const mine = ++token
    if (open) {
      panel.removeAttribute("hidden")
      panel.style.setProperty("--panel-height", `${panel.scrollHeight}px`)
      panel.setAttribute("data-state", "open")
      animationsDone(panel).then(() => {
        if (mine === token) panel.style.setProperty("--panel-height", "auto")
      })
    } else {
      if (panel.contains(document.activeElement)) options.trigger?.focus({ preventScroll: true })
      panel.style.setProperty("--panel-height", `${panel.scrollHeight}px`)
      // Force the measured height to apply before transitioning to 0.
      void panel.offsetHeight
      panel.style.setProperty("--panel-height", "0px")
      panel.setAttribute("data-state", "closed")
      animationsDone(panel).then(() => {
        if (mine !== token) return
        const h = hiddenAttrs(false, options.findable).hidden
        panel.setAttribute("hidden", h === "until-found" ? "until-found" : "")
      })
    }
  }
  return { set, destroy: c.run }
}

// ── Gestures ────────────────────────────────────────────────

/** Measures velocity (px per ms) from the last 100ms of positions. */
export function createVelocityTracker(window = 100) {
  let samples: { v: number; t: number }[] = []
  return {
    push(v: number, t = performance.now()) {
      samples.push({ v, t })
      samples = samples.filter((s) => t - s.t <= window)
    },
    velocity(): number {
      if (samples.length < 2) return 0
      const a = samples[0]!
      const b = samples[samples.length - 1]!
      return (b.v - a.v) / Math.max(1, b.t - a.t)
    },
    reset: () => (samples = []),
  }
}

/**
 * How far a value keeps travelling after release at a velocity (px per ms),
 * slowing by `deceleration` per ms (0.998 is a normal scroll, 0.99 is fast).
 */
export function projectDistance(velocity: number, deceleration = 0.998): number {
  return (velocity * deceleration) / (1 - deceleration)
}

export type SpringConfig = { stiffness?: number; damping?: number; mass?: number }

/**
 * A damped spring's position and velocity at time t (ms), moving from
 * `from` to `to` with a starting velocity (units per ms). Closed form, so
 * any frame can be sampled.
 */
export function solveSpring(
  { stiffness = 170, damping = 26, mass = 1 }: SpringConfig,
  from: number,
  to: number,
  t: number,
  v0 = 0
): { value: number; velocity: number; done: boolean } {
  const s = t / 1000
  const x0 = from - to
  const v = v0 * 1000
  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  let x: number
  let dx: number
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta)
    const A = x0
    const B = (v + zeta * w0 * x0) / wd
    const e = Math.exp(-zeta * w0 * s)
    x = e * (A * Math.cos(wd * s) + B * Math.sin(wd * s))
    dx = -zeta * w0 * x + e * (-A * wd * Math.sin(wd * s) + B * wd * Math.cos(wd * s))
  } else if (zeta === 1) {
    const e = Math.exp(-w0 * s)
    x = e * (x0 + (v + w0 * x0) * s)
    dx = e * (v + w0 * x0) - w0 * x
  } else {
    const r = w0 * Math.sqrt(zeta * zeta - 1)
    const r1 = -zeta * w0 + r
    const r2 = -zeta * w0 - r
    const c2 = (v - r1 * x0) / (r2 - r1)
    const c1 = x0 - c2
    x = c1 * Math.exp(r1 * s) + c2 * Math.exp(r2 * s)
    dx = c1 * r1 * Math.exp(r1 * s) + c2 * r2 * Math.exp(r2 * s)
  }
  const done = Math.abs(x) < 0.01 && Math.abs(dx) < 0.01
  return { value: done ? to : to + x, velocity: dx / 1000, done }
}

/** Resistance past an edge: the further the overshoot, the less it moves (iOS rubber band). */
export function rubberBand(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0
  const sign = Math.sign(overshoot)
  const o = Math.abs(overshoot)
  return sign * (1 - 1 / ((o * constant) / dimension + 1)) * dimension
}

/**
 * Which of `count` sectors a stroke points into (a radial menu), with sector
 * 0 centred on `start` radians (0 is right, counting clockwise as on screen).
 * Returns -1 inside the dead zone.
 */
export function sectorOf(dx: number, dy: number, count: number, start = -Math.PI / 2, deadZone = 12): number {
  if (Math.hypot(dx, dy) < deadZone) return -1
  const size = (Math.PI * 2) / count
  let a = Math.atan2(dy, dx) - start + size / 2
  a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  return Math.floor(a / size) % count
}

/** Runs a spring with requestAnimationFrame; returns a stop function. */
export function runSpring(from: number, to: number, onFrame: (v: number) => void, config: SpringConfig = {}, v0 = 0): Cleanup {
  if (reducedMotion()) {
    onFrame(to)
    return () => {}
  }
  const t0 = performance.now()
  let frame = 0
  const tick = (now: number) => {
    const r = solveSpring(config, from, to, now - t0, v0)
    onFrame(r.value)
    if (!r.done) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

