// The hero's backdrop: AiMY's blue and violet glowing behind ribbed frosted
// glass, finished with grain. Nour's reference (2 Nov) was Pryzm's Purple
// Haze; this is drawn in CSS so it follows the theme and needs no image or
// WebGL. Each rib shows the same glow, shifted and stretched a little, which
// reads as glass bending the light. The glow drifts slowly and stands still
// under reduced motion. Styles live in app/globals.css (.haze).

const RIBS = 26

export function Haze() {
  return (
    <div aria-hidden="true" className="haze pointer-events-none absolute inset-0">
      <div className="haze-ribs" style={{ "--n": RIBS } as React.CSSProperties}>
        {Array.from({ length: RIBS }, (_, i) => {
          // Where this rib looks into the glow: its own slice, nudged sideways
          // and stretched, so neighbouring ribs disagree slightly. Never less
          // than the rib's height (100% to 128%), or the bare page shows
          // through at its top and bottom as dark blocks.
          const x = ((i + 0.45 * Math.sin(i * 1.7)) / (RIBS - 1)) * 100
          const h = 114 + 14 * Math.cos(i * 0.9)
          return (
            <span
              key={i}
              className="haze-rib"
              style={{ backgroundPosition: `${x.toFixed(2)}% 50%`, backgroundSize: `${RIBS * 100}% ${h.toFixed(1)}%` }}
            />
          )
        })}
      </div>
      <div className="haze-grain" />
      <div className="haze-fade" />
    </div>
  )
}
