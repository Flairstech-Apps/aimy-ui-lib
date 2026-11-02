// A subtle ground for each landing section after the hero, each its own
// motif and each about what the section says (Nour, 2 Nov: "something
// different and subtle for each section"). Only the hero has the ribbed
// glass (haze.tsx). All CSS, still, theme-aware; styles in app/globals.css.
//
//   dots     the numbers: a faint dot grid, like data
//   aurora   the AI moments: soft light with no edges
//   grid     the ways in: a blueprint grid falling from the top
//   split    the themes: a dark half and a light half
//   rings    the agents: rings spreading from the MCP command
//   horizon  the start: a lit horizon rising from the bottom

export type BackdropKind = "dots" | "aurora" | "grid" | "split" | "rings" | "horizon"

export function Backdrop({ kind }: { kind: BackdropKind }) {
  return <div aria-hidden="true" data-kind={kind} className="backdrop pointer-events-none absolute inset-0" />
}
