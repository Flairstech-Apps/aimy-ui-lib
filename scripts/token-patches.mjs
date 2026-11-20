// Changes the library makes on top of design-system/index.html, each with
// the decision behind it. Every patch is also a fix or a question to send
// back to the design-system repo. Keep this list short and named.

// Rebuilds a Map with one key renamed in place, so token order is kept.
function rename(map, from, to) {
  if (!map.has(from)) return map
  const entries = [...map].map(([k, v]) => [k === from ? to : k, v])
  map.clear()
  for (const [k, v] of entries) map.set(k, v)
  return map
}

const px = (value) => {
  const m = /^(-?\d*\.?\d+)px$/.exec(value)
  return m ? `${Number(m[1]) / 16}rem` : value
}

export const PATCHES = [
  {
    id: "brand-hover",
    why: "dark --brand-hover referred to itself (invalid); set to Knowledge's #4a7bff",
    apply({ dark }) {
      if (dark.get("--brand-hover") === "var(--brand-hover)") dark.set("--brand-hover", "#4a7bff")
    },
  },
  {
    id: "one-accent",
    why: "one global --accent with Sales' values (Nour, 27 Oct); --qa-accent* lives on only in aimy-aliases.css",
    apply({ dark, light }) {
      for (const map of [dark, light]) {
        for (const s of ["", "-rgb", "-dim", "-glow", "-label"]) rename(map, `--qa-accent${s}`, `--accent${s}`)
      }
      dark.set("--accent-label", "#ab7ffb")
      dark.set("--accent-text", "#a06ff7")
      light.set("--accent-label", "var(--accent)")
      light.set("--accent-text", "#6d3bd4")
    },
  },
  {
    id: "on-brand",
    why: "new --on-brand (#fff both themes) for words and marks on brand-filled controls; Sales typed #fff directly (Nour, 28 Oct)",
    apply({ dark, light }) {
      dark.set("--on-brand", "#ffffff")
      light.set("--on-brand", "#ffffff")
    },
  },
  {
    id: "badge-ground",
    why: "Sales' --badge-ground (#d92d20, sales.css:341) for count badges: white on it reads 4.8:1, white on dark --err does not",
    apply({ dark, light }) {
      dark.set("--badge-ground", "#d92d20")
      light.set("--badge-ground", "#d92d20")
    },
  },
  {
    id: "aimy-tile",
    why: "Knowledge's .aimy-av-tile ground and edge behind the AiMY mark (aimy-ds.css:1728 and :787), as tokens so the AI avatar can use them",
    apply({ dark, light }) {
      dark.set("--aimy-tile", "linear-gradient(135deg, #3d1f6b, #1a3a6e)")
      dark.set("--aimy-tile-edge", "rgba(139,79,244,0.3)")
      light.set("--aimy-tile", "linear-gradient(135deg, #f2ecff, #e6efff)")
      light.set("--aimy-tile-edge", "rgba(110,70,220,0.28)")
    },
  },
  {
    id: "product-inks",
    why: "Sales and Knowledge both set --ink-secondary to d200 and --ink-rule to d600, and add --ink-quiet, --ink-faint, --ink-action; where both products agree, they win",
    apply({ dark, light }) {
      for (const map of [dark, light]) {
        map.set("--ink-secondary", "var(--d200)")
        map.set("--ink-rule", "var(--d600)")
      }
      dark.set("--ink-quiet", "var(--d300)")
      dark.set("--ink-faint", "var(--d400)")
      dark.set("--ink-action", "var(--accent-text)")
    },
  },
  {
    id: "product-leading",
    why: "Sales and Knowledge both set line heights to 1.25 / 1.5 / 1.6 (tight / base / relaxed); where both products agree, they win",
    apply({ dark }) {
      dark.set("--lh-tight", "1.25")
      dark.set("--lh-base", "1.5")
      dark.set("--lh-relaxed", "1.6")
    },
  },
  {
    id: "motion-moves-out",
    why: "durations, curves and lifts move to motion.css, which follows transitions.dev (PLAN.md 7a)",
    apply({ dark, light }) {
      for (const map of [dark, light]) {
        for (const k of [
          "--t-fast",
          "--t-base",
          "--t-slow",
          "--t-press",
          "--ease-out",
          "--ease-spring",
          "--transition-fast",
          "--transition-base",
          "--motion-hover-lift-sm",
          "--motion-hover-lift-md",
        ])
          map.delete(k)
      }
    },
  },
  {
    id: "rem",
    why: "sizes in rem so apps can scale them (decision 9); same values at a 16px root",
    apply({ dark, light }) {
      for (const map of [dark, light]) {
        for (const [k, v] of map) {
          if (/^--(r-(xs|sm|md|lg|xl|2xl)|sp-\d+|fs-[a-z0-9]+|topbar-height|sidebar-width)$/.test(k)) map.set(k, px(v))
        }
      }
    },
  },
  {
    id: "safe-areas",
    why: "the phone's own bars never cover the app (Nour, 11 Nov; Sales ead3a9e, Knowledge d3e44a2): --safe-* name the status bar, home indicator and landscape notch (0 on a laptop), and the top bar grows by the status bar so everything hung off it follows",
    apply({ dark }) {
      dark.set("--safe-top", "env(safe-area-inset-top, 0px)")
      dark.set("--safe-bottom", "env(safe-area-inset-bottom, 0px)")
      dark.set("--safe-left", "env(safe-area-inset-left, 0px)")
      dark.set("--safe-right", "env(safe-area-inset-right, 0px)")
      dark.set("--topbar-height", "calc(3.75rem + var(--safe-top))")
    },
  },
  {
    id: "ambient",
    why: "the wash Sales and Knowledge draw behind the app (QA my-profile.html, Sales sales.css 1056-1090, Knowledge knowledge.css 2064-2105): --grad-ellipse-* re-centred at center with the products' own stops, and the dark ground they are calibrated on (#171a1c, QA's); --grad-ellipse-* stay as the design system tunes them for its docs column",
    apply({ dark, light }) {
      dark.set("--ambient-1", "radial-gradient(ellipse at center, rgba(0,102,255,0.18) 0%, rgba(97,173,241,0.1) 28%, transparent 60%)")
      dark.set("--ambient-2", "radial-gradient(ellipse at center, rgba(111,223,226,0.1) 0%, rgba(139,79,244,0.07) 38%, transparent 60%)")
      dark.set("--ambient-body", "#171a1c")
      light.set("--ambient-1", "radial-gradient(ellipse at center, rgba(0,102,255,0.07) 0%, rgba(97,173,241,0.04) 28%, transparent 60%)")
      light.set("--ambient-2", "radial-gradient(ellipse at center, rgba(111,223,226,0.05) 0%, rgba(139,79,244,0.035) 38%, transparent 60%)")
      light.set("--ambient-body", light.get("--body-bg"))
    },
  },
  {
    id: "light-elevated",
    why: "light read flat next to dark (Nour, 20 Nov): the slate ground #eef1f6 greyed every white surface, the brand blue sat a step duller than dark's, the status inks had browned (warn #6b4500), the 14% status grounds read as candy, and the light and glow that make dark feel premium were near zero. Every ink here stays AA on the new ground, on white and on its own 10% ground",
    apply({ light }) {
      // A cleaner ground with half the blue cast: slate under violet and blue light turned it
      // lilac-grey. White cards still lift off it with their edge and shadow. The grey steps
      // move with it, keeping their order and their distance from white.
      light.set("--body-bg", "#f4f5f8")
      light.set("--ambient-body", "#f4f5f8")
      light.set("--d950", "#e7eaef")
      light.set("--d900", "#eff1f5")
      light.set("--d800", "#f4f6f9")
      light.set("--d750", "#e9ecf1")
      light.set("--d700", "#d3d9e1")
      light.set("--surface-sunken", "#f4f6f9")
      // Brand: the same hue as dark's #3369ff, as vivid as white text on it allows (5.9:1).
      light.set("--brand", "#1f55ea")
      light.set("--brand-rgb", "31,85,234")
      light.set("--brand-hover", "#1a49cf")
      light.set("--brand-dim", "rgba(31,85,234,0.10)")
      light.set("--brand-glow", "rgba(31,85,234,0.18)")
      light.set("--text-link", "#1f55ea")
      // AI: brand blue into a clear sky blue (dark's ends at cyan); the old teal end went murky.
      light.set("--ai", "linear-gradient(104deg, #1f55ea 0%, #2563eb 47%, #0a78b0 100%)")
      // Status inks with their colour back: green, amber and red, not forest, brown and wine.
      light.set("--ok-text", "#05764a")
      light.set("--warn-text", "#985600")
      light.set("--err-text", "#bb1a30")
      // The amber fill (bars, arcs, dots; never words, which take --warn-text) as amber, not brown.
      // 3.8:1 on white and 3.5:1 on the ground, past the 3:1 a shape needs.
      light.set("--warn", "#c76a00")
      light.set("--warn-rgb", "199,106,0")
      // Status grounds: a tint, not a fill, and solid: a see-through amber or red over the cool
      // grey ground turned beige and dusty pink, so each is its 10% tint already laid on white
      // and looks the same on the page, a card or a row.
      light.set("--ok-bg", "#e8f7f0")
      light.set("--warn-bg", "#fef4e6")
      light.set("--err-bg", "#feeceb")
      light.set("--info-bg", "#e7f6fd")
      light.set("--cyan-bg", "#e7f4f4")
      // The light behind the app, strong enough to be seen on a light ground.
      light.set("--ambient-1", "radial-gradient(ellipse at center, rgba(0,102,255,0.11) 0%, rgba(97,173,241,0.065) 28%, transparent 60%)")
      light.set("--ambient-2", "radial-gradient(ellipse at center, rgba(111,223,226,0.09) 0%, rgba(139,79,244,0.06) 38%, transparent 60%)")
      light.set("--grad-ellipse-1", "radial-gradient(ellipse at 30% 50%, rgba(0,82,212,0.11) 0%, rgba(97,173,241,0.07) 28%, transparent 60%)")
      light.set("--grad-ellipse-2", "radial-gradient(ellipse at 75% 70%, rgba(10,115,130,0.08) 0%, rgba(115,49,224,0.06) 38%, transparent 60%)")
    },
  },
]
