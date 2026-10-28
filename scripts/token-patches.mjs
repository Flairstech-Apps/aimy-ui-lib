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
]
