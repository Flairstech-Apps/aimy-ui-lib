# AiMY UI design record

What the library ships, written from the shipped files rather than from intentions. When this file and the code disagree, the code wins and this file is wrong. The values live in `package/tokens/`; the docs site renders them live in both themes.

## Where the values come from

- Colour, type, spacing, radius and shadow are extracted from `AiMY/design-system/index.html` by `scripts/extract-tokens.mjs`, with the named patches in `scripts/token-patches.mjs`. Never edit `package/tokens/aimy.css` by hand.
- Motion is the transitions.dev scale (`package/tokens/motion.css`), which Knowledge already used under the `--t-*` names.
- Layers and breakpoints (`package/tokens/layers.css`) are new names for numbers the products already use.

## Theme

Dark is the default. Light is `data-theme="light"`, on `<html>` or on any element to theme just that part (scopes nest). The choice is saved under the localStorage key `aimy-ds-theme`, applied before first paint. Light is designed, not inverted: dark gains elevation by getting lighter, light keeps surfaces white and gains it through shadow.

## Colour

- Colour marks an outcome. A hue says something was decided or something is wrong; it never names a category or a stage.
- Surfaces: `bg-body`, `bg-card`, `bg-raised`, `bg-sunken`, `bg-glass`, `bg-scrim`, `bg-code` (code stays dark in both themes).
- Ink: `text-ink`, `text-ink-secondary`, `text-ink-quiet` (the floor for words), `text-ink-placeholder`, `text-ink-action`, `text-link`. `ink-faint` and `ink-rule` are for glyphs and hairlines only; the doctrine lint rejects them on text.
- Brand `#3369ff` dark, `#1d4ed8` light. Accent is Sales' violet: `#8b4ff4` dark, `#6725cc` light, with `--accent-text` for words.
- Status: `ok`, `warn`, `err`, `info`, `cyan`, each with `-bg` (ground), `-border` and `-text` (words). The plain hue is for marks; in light theme it does not reach 4.5:1 and never carries a sentence.
- Every subtle fill, hairline and hover goes through the wash ramp `--w015` to `--w50`.
- No left-edge stripes; emphasis is a tinted ground. No gradient text.

## Type

- Poppins for every word, JetBrains Mono for code, self-hosted.
- Even steps with a 12px floor: `text-2xs` 12, `text-xs` 14, `text-base` 16, `text-lg` 18, `text-xl` 20, `text-2xl` 24, `text-3xl` 30, `text-4xl` 38, `text-5xl` 46.
- Roles: `text-micro` 12, `text-meta` 14, `text-body` 16, `text-title` 20, each with its line height.
- Weights sit one step low for Poppins: `font-medium` is 400, `font-semibold` 500, `font-bold` 600.
- Line heights 1, 1.25, 1.4, 1.5, 1.6. Wide tracking (0.06em) is for capitals only.
- Neighbouring ranks differ on two of size, weight and ink. Tags are sentence case.

## Space, shape, depth

- 4px scale; the Tailwind number equals the token number (`p-4` is `--sp-4`). Allowed steps: 0, px, 0.5, 1 to 6, 8, 10, 12, 15.
- Radius `xs` 4, `sm` 6, `md` 8, `lg` 10, `xl` 12, `2xl` 16, `pill`. Radius grows with size.
- Shadows `sm` to `xl`: black-based in dark, cool navy in light.

## Motion

- Durations by job: stagger 40, micro 80, quick 150 (close, swap), fast 250 (open), medium 350, slow 400 (panel open), very slow 500 (emphasis).
- Curves: smooth-out (`--ease-out`) to open, close and move; in-out to swap; linear to loop; bounce for a badge; spring for a press.
- Only transform, opacity and filter animate. Properties are named, never `transition-all`. Every snippet keeps its reduced-motion guard.
- Each component uses one named transitions.dev snippet from `package/tokens/transitions.css`. So far: icon swap (09) in the theme toggle.

## Layers and breakpoints

- Bottom to top: loading 5, float 10, popover 20, menu 25, tooltip 100, dropdown 200, preview 300, modal 500, toast 9999. Use `z-(--z-modal)`.
- The shell's rungs: phone 520, canvas 720, column 900, rail 1040, reference 1536. Use `max-rail:` and the rest. A component changes form at the shell's rung; it is never hidden.

## Icons, logo, focus

- Lucide only, 24 grid, stroke 2, square sizes 12, 14, 16, 20, 24 through `<Icon>`.
- `<AimyMark>` (mark or lockup) from the canonical path data; `--aimy-mark: currentColor` on brand-filled controls.
- Focus is `:focus-visible`, 2px `--brand`, offset 2px, set once by the theme. Never the accent.

## Writing

Plain English. "Call", "contacts". A verb on every button, never "Open" or "Learn more". Errors say what happened and what to do. State is said in words and colour, never by muting text.
