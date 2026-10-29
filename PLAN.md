# AiMY UI: the plan

Written 27 Oct 2026. Nothing is built yet. This is the plan to review before any code.

## 1. What we are making, in one paragraph

AiMY UI is a React and TypeScript component library that documents the system AiMY Sales and AiMY Knowledge already ship. It works the way shadcn/ui works: a developer runs one command and the component's source code is copied into their app, where they own it. Nothing here is a new design. Every token and component is lifted from what the products render today, checked against them side by side, and written down as a building block with its rules attached. It has two jobs (your words, 27 Oct): **it installs anywhere**, into any React app however it was set up, and **it kickstarts any AiMY product**, so a new product starts on day one with the AiMY look, shell, AI parts and rules already in place. Because AiMY is an AI product, the library ships the AI parts (composer, thinking, streaming, citations, trust, work state, accept/edit/reject, undo, memory) as first-class components, and it ships instructions that AI coding agents can read, so Claude or Copilot can build AiMY screens correctly too.

## 2. What we found in the code (the ground truth)

Three sources hold the system today.

- **design-system repo** (`AiMY/design-system`). `index.html` is the colour source of truth and holds about 460 component classes. `design-system.md` is the written spec. `00_AiMY_Knowledge_to_Action_Doctrine.md` is the interaction doctrine: Briefing to Canvas, the six work states, the four entry modes, the confirmation ladder, the Always/Never rules.
- **Knowledge** loads its own extracted copy, `Knowledge/assets/aimy-ds.css` (from design-system commit fef41de), in rem units, with an alias layer (`--accent` points at `--qa-accent`, `--hairline` at `--w07`, and so on) and a second ink layer in `knowledge.css` (`--ink-quiet`, `--ink-faint`, `--ink-action`, `--ink-ok` and friends).
- **Sales** loads an older extract, `Sales/assets/aimy-ds.css` (from commit 6817122), in px units, plus `sales.css` and `bdr.css` on top. Sales builds many of its own versions instead of the shared classes: `.b-menu` instead of `.v2-dropdown`, `.b-conf` instead of `.conf-badge`, `.b-cur` instead of `.agent-steps`, `.s-ans-cite` instead of `.cite`.

There is also a fourth thing that matters a lot: **the dev team's React app**, `knowledge-dev/aimy-knowledge-ui`. It is a pnpm and Turborepo monorepo on React 19, Vite 7, Tailwind v4, Radix, cva, clsx, tailwind-merge and lucide-react. It already has a package called `@aimy/ui`, which is stock shadcn (default/destructive/outline button variants) set in Urbanist, not Poppins. So the developers already work the shadcn way, but with the wrong skin. That is the gap this library closes, and it decides the stack below. **We only read that repo, never change it** (your rule, 27 Oct). Everything we build is tested in our own demo app (section 5a).

### Where Sales and Knowledge disagree (must be settled before building those pieces)

Each of these needs one answer. My recommendation is in brackets; the rule I used is "design-system owns colour, the products own structure, and where both products agree, that wins."

1. Dark neutral ramp `--d50` to `--d600`: Sales and Knowledge have different values for seven steps (for example `--d600` is `#4a5b6e` in Sales and `#8091a5` in Knowledge). [Take the design-system values, which Knowledge spliced in most recently.]
2. Motion: `--t-base` is 200ms in Sales and 250ms in Knowledge; `--t-slow` is 300 vs 400. [Settled 27 Oct: motion follows transitions.dev, see section 7a. Knowledge's values already are the transitions.dev scale, so Knowledge wins and Sales moves.]
3. `--ease-out`: Sales' `bdr.css` overrides it to `cubic-bezier(0.23,1,0.32,1)`; the design system has `(0.22,1,0.36,1)`. [Settled: `(0.22,1,0.36,1)`, which is also transitions.dev's `--ease-smooth-out`.]
4. Tag style: Sales tags are saturated fills with a same-hue border; Knowledge tags are borderless `color-mix` tints. The spec says "a label has a fill, a control has an edge". [Knowledge's borderless version, and point tags at the `-text` tokens to fix the 2.94:1 light-theme contrast gap that the design-system status file lists as ready to land.]
5. Toast: Sales has a column body, vertical divider and the AiMY mark as icon; Knowledge has a horizontal divider and a green check. Undo life is 6s, 4s without undo, in Sales. [Your call. I'd take Sales' layout, since Sales has 23 real undo toasts in use.]
6. Topnav: three versions (Sales, Knowledge, QA). Knowledge's has `role="navigation"` and rem units. [Knowledge's markup with Sales' visual values where they differ, decided item by item with screenshots.]
7. Accent name: the design system says one global `--accent` (your decision, 28 Jul) but the code still defines `--qa-accent`. [Settled 27 Oct: one `--accent`, with Sales' values: `#8b4ff4` dark and `#6725cc` light, plus `--accent-text` `#a06ff7` dark and `#6d3bd4` light for accent-coloured words (5.04:1 and 6.51:1), and `--accent-label` `#ab7ffb` dark. These are the same violet the design system called a placeholder, so the placeholder becomes the real accent.]
8. Type roles: Sales has `--ty-masthead` 46 down to `--ty-micro` 12; Knowledge has `--ty-display` 28 down to `--ty-micro` 12. [Ship the design-system `--fs-*` scale as the base and the shared roles (title, body, meta, micro) as named text styles; leave product-only roles in the products.]
9. Units: Sales is px, Knowledge is rem with a scaling rule (`html { font-size: max(1rem, 100vw / 96) }`) that renders 1:1 at 1536 and scales up above it. [Library is rem everywhere. The scaling rule ships as an opt-in, so apps that want Knowledge's large-screen behaviour turn it on.]

## 3. The stack (decided by what the dev team already runs)

- **React 19 and TypeScript 5.8+, strict mode.** Matches `aimy-knowledge-ui`. Components take `ref` as a normal prop (React 19), so no `forwardRef`.
- **Tailwind CSS v4.** Matches the dev team and is what shadcn's install command expects. Every AiMY token becomes a CSS variable, and Tailwind's own palette, font sizes and weights are switched off (`--color-*: initial` and the same for text and weights), so `bg-blue-500` or `text-[13px]` simply doesn't exist in an AiMY app. Only `bg-surface`, `text-ink`, `text-meta` and the other AiMY names do. That is how "no off-scale hardcoded colours" stops being a rule people forget and becomes something the build enforces.
- **Radix UI primitives** for anything with a keyboard model: dropdown/select, menu, dialog, drawer, popover, tooltip, tabs, switch, checkbox, radio. The doctrine says never rebuild the dropdown by hand; Radix supplies the listbox keyboard model, typeahead, focus return and ARIA that `.v2-dropdown` hand-wrote. The dev team already depends on it.
- **cva** for variants, **clsx + tailwind-merge** via a `cn()` helper. Same as the dev team.
- **lucide-react** for icons. Your standing rule, and already in the dev stack. One `Icon` size rule: 24 grid, stroke 2, sizes from tokens. (The design-taste skill discourages Lucide by default; your rule wins.)
- **Poppins and JetBrains Mono, self-hosted** through `@fontsource` packages instead of a Google Fonts link. Only the weights the system uses: 300, 400, 500, 600, 700, plus 400 italic. The `--fw-light` 200 token has no loaded font file today; it is a decision (item 13 in section 12).
- **Sonner** as the toast engine (it is what shadcn uses and handles stacking, timing and screen-reader announcements), rendering the AiMY toast markup through its custom-render API so it looks exactly like the product.
- **transitions.dev for all transitions and animations** (your call, 27 Oct). Its CSS snippets and motion tokens are the motion layer; no animation library is added. The `motion/react` package is not used. Section 7a has the details.

## 3a. What "like shadcn" means here (and what it doesn't)

shadcn is two separate things, and we take only one of them.

- **The delivery method: we take this.** shadcn's install command and registry format copy a component's source into the developer's app. That is pure plumbing. It decides how code travels, not how anything looks.
- **The shadcn look: we take none of it.** No shadcn colours, radii, button styles or variant names. Every visual value comes from AiMY's tokens and is measured against Sales and Knowledge before it counts as done. If a component would change what Sales or Knowledge look like today, it isn't finished.
- **Radix: we take this for behaviour only.** Radix has no look of its own. It supplies the keyboard handling, focus and screen-reader wiring that AiMY's dropdown, menus and dialogs already need. That's the "better structure" part: the same AiMY UI, with the accessibility work done by a well-tested library instead of hand-written each time.
- **Names stay AiMY's**: `brand`, `ghost`, `ok`, `warn`, `err`, `accent`, `sm`, `lg`, and so on (decided 27 Oct).

## 4. How it gets to people (the "upload" part, explained from zero)

You have never shipped a UI library, so here is the whole route. The library is **internal to FlairsTech** (decided 27 Oct).

1. **A private GitHub repo** holds everything: `Flairstech-AIMY/aimy-ui-lib`. You are logged into GitHub as `nourwael-flairs` with repo access already.
2. **The repo is also a website.** It builds two things from the same source: a documentation site (every component with live previews in both themes, code, rules) and a **registry**, which is a folder of small JSON files, one per component, each holding that component's source code and what it depends on.
3. **The website deploys to Cloudflare** the same way Sales does: push to `main`, and about 90 seconds later it's live, for example at `aimy-ui-lib.nour-ali.workers.dev` (a custom domain can come later).
4. **It's locked to FlairsTech.** Two locks, because people and the install command reach it differently:
   - The **docs site** sits behind Cloudflare Access: opening it asks you to sign in with a `@flairstech.com` email. Nobody outside the company can read it.
   - The **registry files** (what the install command downloads) can't do a sign-in screen, so they need a token instead. Each developer puts one shared token in an environment variable, `AIMY_REGISTRY_TOKEN`, and the install command sends it automatically. Without it, the download is refused.
   - Phase 0 checks whether the Cloudflare account behind `nour-ali.workers.dev` has Zero Trust (free for up to 50 users), which Access needs. If it doesn't, the worker checks the token for both the docs and the registry, and the docs get a simple login page.
5. **A developer installs a component** in their app with the standard install command. Once, they add our registry to their `components.json`:

   ```json
   {
     "registries": {
       "@aimy": {
         "url": "https://aimy-ui-lib.nour-ali.workers.dev/r/{name}.json",
         "headers": { "Authorization": "Bearer ${AIMY_REGISTRY_TOKEN}" }
       }
     }
   }
   ```

   Then, for each piece they want:

   ```bash
   npx shadcn@latest add @aimy/theme @aimy/button @aimy/composer
   ```

   The CLI downloads the JSON, writes `components/ui/button.tsx` into their project, installs any npm packages it needs (Radix, lucide-react) and pulls in anything it depends on (the button needs `cn`, the composer needs the button). They own that code from then on.
6. **Updates.** When we change a component, we push to `main` and it's live. Developers see what changed with `npx shadcn@latest diff` and take it with `add --overwrite`. A changelog page lists every change.
7. **AI agents can install it too.** shadcn's MCP server works with any registry, including a private one with a token, so a developer's Claude or Copilot can search AiMY components and add them by name.

### Installs anywhere: three doors, one source

Because the library has to install anywhere, there are three ways in. All three are built from the same source files, so nothing is written twice.

1. **Copy-in (the shadcn way).** Described above. Best for React apps that use Tailwind v4 and want to own and adjust the code. Works in Vite, Next.js (App Router included: interactive components carry `"use client"`) and React Router.
2. **The npm package.** For React apps that don't use Tailwind or just want to import and go: `npm install @flairstech-aimy/ui`, then `import { Button } from "@flairstech-aimy/ui"` and one stylesheet import. It ships compiled CSS, so the app needs no Tailwind. It is served from our own private npm registry at `/npm/` on the same Cloudflare site, behind the same library token (decided 27 Oct, because GitHub Packages is blocked by the org's billing limit). A developer adds two lines to their `.npmrc`:

   ```
   @flairstech-aimy:registry=https://aimy-ui-lib.nour-ali.workers.dev/npm/
   //aimy-ui-lib.nour-ali.workers.dev/npm/:_authToken=${AIMY_REGISTRY_TOKEN}
   ```

   Then `npm install @flairstech-aimy/ui` (or pnpm) works as usual. Updates are versioned (1.0.0, 1.1.0), so teams choose when to upgrade. To publish, bump the version in `package/ui/package.json` and run `pnpm npm:publish ui`: it builds, packs the tarball into `npm-store/` (committed, never overwritten), and the next deploy serves it.
3. **Tokens only.** `@flairstech-aimy/tokens`: the colour, type, spacing, radius, shadow and motion variables as plain CSS, plus the fonts. Works in anything that renders HTML, React or not, including HTML prototypes like Sales and Knowledge. (We don't touch those products; this is just what the package makes possible.)

The package door has one technical risk: compiled Tailwind CSS from the library meeting an app that also runs Tailwind. The plan is to put the library's styles in their own CSS layer so the app's styles always win cleanly. Phase 0 tests this in both a Tailwind app and a non-Tailwind app before we commit to it. The dev team's app already has a local package called `@aimy/ui`. We don't touch it, and our registry namespace `@aimy` doesn't clash with it, because one is a registry name in `components.json` and the other is a package name inside their repo. Whether that team ever adopts the library is their call, later.

## 5. Repo layout

One Next.js app at the root, started from shadcn's official `registry-template` so the registry build is the documented, supported path rather than something we invent. No monorepo until there is a second package to justify it.

```
aimy-ui-lib/
  registry.json              every installable item, its files and dependencies
  registry/aimy/
    theme/                   aimy.css (tokens, dark + light), motion.css (transitions.dev), tailwind theme mapping
    lib/                     cn.ts, ai-types.ts (shared AI data types)
    hooks/                   use-theme.ts, use-undo.ts, use-closing.ts (exit timing), use-reduced-motion.ts
    ui/                      button.tsx, tag.tsx, dropdown.tsx ... (core)
    ai/                      composer.tsx, message.tsx, citation.tsx ... (AI)
    shell/                   topnav.tsx, app-shell.tsx, rail.tsx
    examples/                one demo file per variant; the docs render these
  starter/                   the kickstart app for a new AiMY product (section 5b)
  demo/                      starter + believable mock screens; where we try everything (section 5a)
  package/                   builds @flairstech-aimy/ui and @flairstech-aimy/tokens from the same source
  app/                       the documentation site (Next.js, static export)
  content/docs/              MDX pages: foundations, components, patterns
  public/r/                  generated registry JSON (built, not hand-edited)
  scripts/
    extract-tokens.ts        pulls the two :root blocks from design-system/index.html
    check-tokens.ts          fails CI if a component uses a value that isn't a token
    parity.ts                compares computed styles against Sales/Knowledge
  tests/
    unit/                    behaviour and accessibility per component
    visual/                  screenshots per component, both themes, two widths
  AGENTS.md                  rules for AI coding agents working in this repo
  skills/aimy-ui-lib/SKILL.md  the same rules, packaged for agents in other repos
  PRODUCT.md                 who this is for and why (from /impeccable init)
  DESIGN.md                  generated from the shipped tokens at the end of Phase 1
```

Plus the demo app, below.

## 5a. The demo app (where we try everything)

The real React app is off limits, so the library gets its own demo app to prove the components work the way a developer will actually use them.

- **What it is.** A small React + TypeScript + Vite + Tailwind v4 app in `demo/` inside this repo. It is a believable AiMY screen, not a component gallery: the topnav, a briefing list of contacts with work states and AiMY notes, a card that opens the canvas, the composer, a streamed answer with citations, an Accept / Edit / Reject decision, and a toast with undo. It uses mock data that reads like Sales and Knowledge (plain English, real-sounding names, "call" and "contacts").
- **How it gets its components.** Exactly like a developer would. It has its own `components.json` pointing at our deployed registry with the token, and every component in it was added with `npx shadcn add @aimy/...`. It never imports from the library's source folder. If an install is broken, the demo breaks, which is the point.
- **What it proves.** That the install command works with the private registry. That components fit together on one screen, not just one at a time on a docs page. That the screen looks like Sales and Knowledge at 1536 in both themes. And that the transitions feel right in real flows.
- **How it grows.** It starts in Phase 0 with the walking skeleton, one item. Every batch adds its components to the demo screen. Each checkpoint review is done on the demo, next to the product it came from.
- **Where it lives.** Deployed next to the docs at `/demo`, behind the same company sign-in.
- **CI.** The demo is reinstalled from the freshly built registry and type-checked on every push, so a broken registry item fails the build before it deploys.

## 5b. Kickstarting a new AiMY product

A team starting a new AiMY product (Talent, QA, Connect, whatever comes next) should get a working AiMY app in minutes, not rebuild the shell from screenshots.

- **The starter.** `starter/` in this repo is a minimal AiMY app: React + TypeScript + Vite + Tailwind v4, the theme and fonts installed, dark by default with the light toggle, the shell (topnav with product tabs, rail that becomes a drawer at 1040, main area), the Briefing to Canvas wiring (a briefing list, the canvas overlay, the composer), toast with undo, an empty state, and the product's own accent as a single variable to change. Every component in it came from the registry, so the team owns and can change all of it.
- **The rules come with it.** The starter includes `AGENTS.md` and the AiMY skill, so the first time someone asks Claude or Copilot to build a screen, the agent already knows the tokens, the doctrine (entry modes, work state, never apply silently), your copy rules and the no-muted-text rule.
- **One command to start.** For a new product: `npx tiged --mode=git https://github.com/Flairstech-AIMY/aimy-ui-lib/starter my-product` copies the starter into a new folder, using the developer's own GitHub login for the private repo (checked 27 Oct: the copy installs and builds). The GitHub "Use this template" button is the no-terminal option, which needs the starter mirrored to its own template repo. That mirror is optional and would be a second repo, so I'd ask before creating it.
- **For an existing React app:** one init command (`npx shadcn@latest init` pointed at our `@aimy/init` item) adds the theme, fonts, `cn`, the theme toggle and the agent rules in one go, then components are added one by one.
- **Next.js too.** A Next.js version of the starter follows once the Vite one is solid, because "anywhere" includes server-rendered apps. Both are reinstalled and built in CI on every push.
- **The demo app is the starter plus mock screens.** `demo/` begins as a copy of `starter/` and adds the believable Sales-style screens. So the starter is always proven by the demo, and every checkpoint review shows both.

The local folder is `aimy ui lib` with spaces. Some build tools trip on spaces in paths, so Phase 0 checks this on day one. If anything breaks, we move to a folder named `aimy-ui-lib` and update the memory path.

## 6. Tokens: how they flow and stay in sync

- **Source.** `design-system/index.html` stays the colour source of truth. We do not fork it.
- **Extraction.** `scripts/extract-tokens.ts` reads the dark `:root` block and the light `:root[data-theme="light"]` block from that file (by selector, never by computed line boundaries), and writes `registry/aimy/theme/aimy.css`. It refuses to run if a block is missing or braces don't balance, and it prints a diff of every changed `--name: value` pair so a colour change never slips in unseen. The design-system working copy changes under us (it has before), so extraction always re-reads it right before writing.
- **Corrections.** The upstream file has known faults, for example `--brand-hover: var(--brand-hover)` refers to itself in dark mode. The extractor applies a small, listed patch file instead of hand-editing, and each patch is also reported back to the design-system repo as a fix.
- **Names.** The library uses the design system's names. A separate optional `aimy-aliases.css` ships Knowledge's old names (`--accent`, `--hairline`, `--ai-text`, `--ink-*`) so an existing product can adopt components without a rename sweep. Never a rename sweep in the products.
- **Tailwind mapping.** `theme.css` maps tokens to Tailwind names with `@theme inline`, so classes read in AiMY vocabulary: `bg-body`, `bg-card`, `bg-raised`, `text-ink`, `text-ink-quiet`, `border-hairline`, `text-ok`, `bg-ok-bg`, `rounded-md` (8px), `shadow-md`, `duration-fast`, `ease-out`.
- **Themes.** Dark is the default (doctrine: default to dark). Light is `data-theme="light"` on `<html>`, using the same `aimy-ds-theme` localStorage key the products use, applied by a tiny pre-paint script so there is no flash. Light is designed, not inverted (126 overridden tokens); the library keeps that.

**As built in Phase 1 (27 Oct), where it differs from the above:**
- The script is `scripts/extract-tokens.mjs` (plain Node, no build step) and writes `package/tokens/aimy.css`. `--check` fails if the file is stale.
- The theme lives in the `@flairstech-aimy/tokens` npm package, not in copied files. The shadcn install command can only add simple lines to an app's CSS (its parser breaks on a Tailwind `@theme` block), so the registry's `theme` item installs the package and adds one line: `@import "@flairstech-aimy/tokens/tailwind.css"`. Bonus: tokens update with a version bump instead of a re-copy, and all three doors share one copy.
- Selectors are `:root, [data-theme="dark"]` and `[data-theme="light"]`, so a theme can be set on any element. Every alias token (`--x: var(--y)`) is re-declared in the light block, because an alias resolves where it is declared and children inherit the answer.
- Patches applied: brand-hover self-reference, one `--accent` with Sales' values (plus `--accent-text`, `--accent-label`), the inks both products share (`--ink-secondary` d200, `--ink-rule` d600, new `--ink-quiet`, `--ink-faint`, `--ink-action`), product line heights (1.25 / 1.5 / 1.6), motion moved to `motion.css`, sizes in rem. Disagreement 1 (dark ramp) took the design-system values, so `--d600` to `--d400` differ slightly from Knowledge's spliced copy.
- Tailwind names chosen: the AiMY size names keep their meaning (`text-xs` is 14px, `text-2xs` 12px), weights keep AiMY's ladder (`font-medium` 400), breakpoints are named rungs (`max-rail:`), durations are used as `duration-(--t-fast)`.

## 7. Phase 1: Foundations (the first thing you see)

Each foundation is a docs page and, where it applies, an installable item. Every page shows the real values in both themes, the rule that governs it, and a do/don't pair taken from the doctrine or your feedback.

1. **Colour.** Neutral ramp, wash ramp, ink roles, brand and accent, the AI gradient, status (ok, warn, err, err-strong, info, cyan) with their `-bg`, `-border` and `-text` variants, surfaces, scrim and glass, code colours. Each swatch shows its contrast against the surfaces it's used on. The page states the system's rules in plain words: colour marks an outcome and never names a category; status is always colour plus words or an icon; text never gets dimmed to show a state.
2. **Typography.** Poppins and JetBrains Mono. The even-step scale with the 12px floor (12 marks, 14 smallest sentence, 16 working minimum). The weight ladder re-cut for Poppins: regular 300, medium 400, semibold 500, bold 600, extrabold 700. This is a trap for developers, because Tailwind's `font-medium` normally means 500, so the library renames the weight utilities to AiMY's meaning and the page says so up front. Line heights, tracking, case rules (a tag is a name, sentence case; a control is a verb), and the hierarchy rule (neighbouring ranks differ on two of size, weight and ink).
3. **Spacing.** The 4px scale `--sp-1` to `--sp-15` (4 to 60). Card padding 16 compact, 20 to 24 comfortable.
4. **Radius.** 4, 6, 8, 10, 12, 16, pill. Radius scales with component size.
5. **Elevation and shadow.** `--shadow-sm` to `--shadow-xl`: black-based in dark, cool ink-based in light. Dark gains elevation by getting lighter, light by shadow.
6. **Motion.** The transitions.dev scale (section 7a): durations, easings, distances, scales and blurs, each with the job it is for. Pressed controls scale to 0.97, which both products adopted. Reduced motion turns off shimmer, pulses, spinners and lifts. The page lets you replay every transition in both themes.
7. **Layers (z-index).** The products use only literal numbers today (5, 10, 20, 25, 100, 200, 300, 500, 9999). We define a named scale (base, sticky, dropdown, popover, overlay, modal, toast) mapped to those observed numbers. This is new, so it's flagged as a gap for your approval.
8. **Breakpoints.** Keyed to the shell's rungs, as you decided on 16 Sep: 1040 (rail becomes a drawer), 900 (canvas column becomes a drawer), 720 (canvas takes the window), and 1536 as the reference width. Exposed as Tailwind `max-*` breakpoints named by what happens, not by device. Also new as tokens; flagged.
9. **Icons.** lucide-react, 24 grid, stroke 2, round caps, square sizes only. A short list of the icons the products use for each meaning (send, stop, undo, copy, thumbs), so the same idea always gets the same glyph.
10. **Logo.** The AiMY mark as a component (`<AimyMark />`), using Sales' canonical symbol path and the gradient fix (no `display:none` sprite). Notes the swapped file names in the design-system repo.
11. **Focus.** Always `--brand`, 2px outline, 2px offset, `:focus-visible` only, never the accent.
12. **Writing.** Your copy rules as a page: plain English, "call" not "ring", "contacts" not "board" or "book", no sales slang, never "Open" or "Learn more" when the action has a name, a verb on every button.

**Installable items from Phase 1 (shipped 27 Oct):** `@aimy/theme` (tokens, Tailwind mapping, fonts, transitions, base styles), `@aimy/aliases`, `@aimy/utils` (`cn`), `@aimy/use-theme`, `@aimy/theme-script`, `@aimy/theme-toggle`, `@aimy/icon`, `@aimy/aimy-mark`. Also `@flairstech-aimy/tokens` 0.1.0 and `@flairstech-aimy/ui` 0.1.0 on the npm registry.

## 7a. Motion: transitions.dev

Every transition and animation in the library comes from the transitions.dev skill (32 CSS transitions plus a shared motion-token scale).

**The tokens.** Knowledge already uses this scale under its own names, so this mostly writes down what Knowledge ships:
- Durations: stagger 40, micro 80, quick 150, fast 250, medium 350, slow 400, very slow 500 (ms). Knowledge's `--t-stagger`, `--t-intent`, `--t-fast`, `--t-base`, `--t-medium`, `--t-slow` and `--t-emphasis` are these same values.
- Easings: smooth-out `cubic-bezier(0.22,1,0.36,1)` (the system's existing `--ease-out`), in-out, linear, bounce and strong bounce. The system's spring curve stays for press feedback.
- Distances 4, 6, 8, 12, 30px; scales 0.96 to 0.99; blur 2, 3 and 8px. Knowledge's `--blur-small` and `--blur-medium` already match.

**One name clash, handled.** transitions.dev defines `--ease-out` as the plain `ease-out` keyword (for tooltips), but AiMY's `--ease-out` is the smooth-out curve, with call sites in all three repos. AiMY's meaning wins. The tooltip snippet reads its own `--tt-*` variables, so nothing is lost. `motion.css` ships the transitions.dev scale with that one token left out, plus aliases so both naming styles work (`--t-fast` and `--duration-quick` point at the same value).

**One rule that changes.** The doctrine says "never exceed 300ms", but transitions.dev opens panels at 400ms, closes toasts at 350ms and uses 500ms for emphasis. Knowledge already ships those. The library follows transitions.dev. The replacement rule is "every duration is a motion token, used for the job its token names". A note goes to the design-system repo to update the doctrine.

**Which transition each component uses.** These replace whatever motion the component had, using the snippet's CSS as written:
- Dropdown and Menu: menu dropdown (05), growing from its trigger.
- Dialog and TypeToConfirm: modal (06).
- Drawer, Rail drawer, chat column, peek panel: panel reveal (07).
- Toast with Undo: toast (22). Banner: banner stacking (32), when more than one can show.
- Tooltip, CitationPreview, Confidence explanation: tooltip (17).
- Tabs and Segmented: tabs sliding (16).
- Accordion and Reasoning disclosure: accordion (21).
- Checkbox: checkbox check (25). Switch: toggle (27).
- Skeleton to content: skeleton reveal (14).
- Field error: error shake (12). SearchField clear: input clear (13).
- CountBadge on the bell: notification badge (03). StatCard and KPI numbers: number pop-in (02).
- Send to stop in the composer, copy to copied, sun to moon on the theme toggle: icon swap (09). Button label changes ("Save" to "Saved"): text states swap (04).
- Completed work state and successful saves: success check (10), paired with icon swap when a spinner turns into the check.
- ThinkingIndicator label: thinking states (28). The particle think-mark itself stays the product's own canvas.
- Reasoning while it runs: reasoning stream (29). StreamingText: streaming text (30).
- Card or composer changing size: card resize (01). Two-step flows: page side-by-side (08).

**What we do not add.** The remaining transitions (card tilt, like burst, plus-to-menu morph, learn-more hover, spinning counter, matrix loader, texts reveal, avatar group hover) are not used in Sales or Knowledge. They stay out unless you ask for one. The library documents what exists. Where a product's current motion differs from the snippet, the snippet wins, and the difference goes in the review notes for that batch so you can see it before it lands.

**How the snippets work inside React.** The CSS goes in verbatim, as the skill requires. The small JS orchestration in each snippet (add `.is-open`, swap to `.is-closing`, remove it after the close duration) becomes one shared hook, `use-closing.ts`. It reads the durations from the CSS variables, as the snippets do, so the timing has one source. Radix needs care here. It removes a closing element as soon as its state flips, unless a CSS *animation* is running, and transitions.dev uses CSS *transitions*. So the overlay components keep their content mounted (`forceMount`) and let the hook remove it after the close duration. Every snippet's `prefers-reduced-motion` block stays.

**Checking it.** The transitions-polish skill's review runs on each batch. Its findings, and its `transitions refine` scan for any duration or curve that isn't a token, are part of the definition of done.

## 8. Phase 2: Core components

Built in dependency order, in batches, so each batch can be reviewed as a set. For every one, the reference instance is named first (which product, which class, which file), then rebuilt.

**Batch A: actions and labels.** Button (brand, ghost, err, warn, ok, accent; sm, md, lg; icon-only; loading; the one filled primary per surface), IconButton, ButtonGroup, SplitButton, Link, Tag (ok, warn, err, info, neutral, ai, teal, accent), Chip (filter, active, dismissible), CountBadge, StatusPill with dot, Kbd, Divider, Avatar (human, AI, sizes) and AvatarGroup.

**Batch B: forms.** Field (label above, help, error below; no placeholder as label), Input, Textarea, SearchField, Dropdown (Radix Select dressed as `.v2-dropdown`; the only select), Checkbox, Radio, RadioCards, Switch, CopyField, PasswordField, InputGroup. Later in the batch if needed: TagInput, OTP, date and time pickers.

**Batch C: containers and navigation.** Card (with the `type-card` structure Sales builds: `<article>` with a button title), Tabs, Segmented, Menu (Radix DropdownMenu dressed as Sales' `.b-menu`, which is the one in real use), Tooltip, Popover, Accordion, Breadcrumbs, Pagination, Steps.

**Batch D: feedback and overlays.** Toast with Undo (the system's main confirmation, per the confirmation ladder), Drawer, Dialog, TypeToConfirm (for destructive actions), Banner, InlineNote, Skeleton (shaped like the final layout), Spinner, EmptyState (says how to fill it), ErrorState, OfflineBar, Progress.

Your standing rule shapes these: no modal, picker, choice list or drag as the only way to do something. The Dialog and Drawer docs say this on the page, and every example shows the inline one-click version with toast undo first.

## 9. Phase 3: AI components (the AI-native part)

These come from the design system's AI and doctrine sections, checked against what Sales and Knowledge actually render. Every one has a typed data contract in `lib/ai-types.ts`, so the components don't care where data comes from (the dev team streams over SignalR, others may use the Vercel AI SDK). An optional adapter for the AI SDK's message format can come later.

**Batch AI-1: conversation.**
- Composer: the float input bar, send that becomes stop while generating, the generating "beam" edge, context chips (what the prompt can see, removable), attachments, submit on Enter.
- Message: user and AiMY bubbles, the AiMY avatar tile.
- ThinkingIndicator: the particle think-mark (a canvas, ported verbatim from the products) with its rotating label.
- StreamingText: text that arrives over time, with a reduced-motion fallback that just shows it.
- Reasoning: "Thought for 4s" as a disclosure.
- ResponseActions: copy, regenerate, thumbs up and down.
- Suggestions: opener chips and follow-up chips.
- Canvas: the Briefing to Canvas overlay with its "Based on" context bar and chat list, keeping its `backdrop-filter` as the doctrine requires, and returning the user to the same place on close.

**Batch AI-2: grounding and trust.**
- Citation chip, CitationPreview (opens on hover and on keyboard focus, with feedback per citation) and SourceList.
- TrustState (verified, due, expired, unverified, superseded) and TrustDisclosure (every answer says what it's grounded on, and an excluded source is never silent).
- Confidence: Sales' `.b-conf` with its "where this came from and when" explanation, reconciled with the design system's `.conf-badge`. Medium and low must say what limits them.
- AIDisclaimer and AIUnavailable (says what still works, never loses staged work).

**Batch AI-3: agency and action.**
- WorkState: the six values (detected, recommended, drafted, staged, completed, failed) as a pill and as a pipeline, required on every surfaced item.
- EntryAction: the four entry modes (direct, investigate, prompt, review). The component makes the mode a required prop, so an unclassified action fails to compile. That is the doctrine's "classification is mandatory" turned into TypeScript.
- DecisionZone: Accept, Edit, Reject. Edit is not optional, so the type requires an edit handler.
- SuggestionDiff: the proposed change shown as a diff with accept and reject. AI never applies silently.
- AgentSteps: the live tool-call trace with timings (Sales' `.b-cur` stepper and the design system's `.agent-steps`, reconciled).
- GovernanceChangeRequest (diff, rationale, blast radius), SetScopeBar (bulk work states its scope and what it skipped), AuditTrail (names actor, action, time and whether it can be undone; AiMY's actions are never shown as the user's), VersionHistory (AI edits are ordinary versions with an AI author).

**Batch AI-4: relationship and memory.** This is where the agentic UX idea lives: the product remembers and earns trust over time.
- MemoryPanel: what AiMY is carrying forward, with a way to drop any item.
- AimyNote: the small AiMY note on a card (Sales' `.b-aimy` block).
- BriefingCard: acknowledge, and dismiss with a captured reason and undo; plus the aggregate version for a cluster.
- UsagePill and UsagePopover, ModelPicker.

**Batch AI-5: voice.** VoiceButton, Waveform, VoiceStage (the orb and silk canvas). Last, because it is the heaviest and Sales and Knowledge carry near-identical copies already.

**Gaps, flagged rather than invented.** The doctrine says never invent a component that should exist in the design system. Three ideas from the agentic UX approach have no AiMY component yet: an autonomy setting (how much AiMY may do without asking, growing as trust grows), a per-category "always ask / just do it" control, and a forgetting control beyond the memory panel. These go on a gap list for you to decide, not into the build.

## 9a. Batch M: micro-interactions and usage limits (added 28 Oct, Nour)

Small moments that say something happened, and what happens when a person reaches a limit. Each follows the product that draws it, then the design system, then the doctrine, as before.

**Micro-interactions.**
- Bell wiggle: the bell rocks from its top when something lands, three swings that die away in 600ms (Knowledge's `nt-ring`). Not while its panel is open; still under reduced motion.
- Tip: one line drops from under the bell saying what finished, then goes after about a second: 250ms in, 150ms out, no blur, nothing to press (Knowledge's `nt-peek`). It points at the bell and stays inside the window.
- Count badge pop: the badge on the bell slides on and pops when the count changes (transitions.dev notification badge, 03, which section 7a already names for CountBadge).
- Others found while building it are listed for review rather than added unasked.

**Usage limits.**
- The states the products already say in words: within the share, past the share ("You can keep going"), limit reached, and stopped by an admin ("Ask your admin to turn them back on").
- The composer's stopped state: the placeholder says what still works ("Chats are stopped. Filters still work."), the ring turns red, and nothing typed is lost.
- A limit notice for the surfaces that need it, and the usage meter states (Knowledge's settings meters, which Progress already draws with `limit`).

## 10. Phase 4: Shell and data display

AppShell (topnav, rail, main), Topnav (product tabs, bell, user menu, theme toggle; the nav moves into a menu at 900 to match the rail), Rail with its drawer below 1040, NotificationsPanel, the rail's widgets (added 28 Oct, Nour: Sales' left-rail cards, which Sales calls doors, `.b-door` in `.rail-doors`, bdr.css 4844 and bdr.js 10295-10370: the diary door (the "Today" caption, the day's head, "Open the diary"), the Financials door (the figure gained or signed, the bar to target, the pace sentence, "Open the report"), the year card a client book gets instead when it has no money target, and the conclusion card `.rail-card` above them; each is a button that opens its page, never a panel hanging off the rail), the Diary itself (added 28 Oct, Nour: Sales' diary page, `diaryPage` and `calBody` in bdr.js 9862-10520, `.b-cal` and `.b-diary` in bdr.css 4114-4370: the month head with its count and previous/next buttons, the Monday-first week grid with a dot per meeting coloured by kind, the selected day's agenda under it (hour, kind, who and what, tags), the row for a day with nothing on it, the add row, the AiMY lead line a client's diary opens on (how often we have met and what is next), and the meetings nobody wrote up; stacked on a page, landscape only where width is the spare axis), StatCard and the Sales KPI widget, Timeline, DataTable (with a windowed list for long ones, like Sales' `.b-vlist`), DescriptionList, and the chart primitives (line with goal and crosshair, funnel, sparkline). The shell is last because it is the most diverged between Sales, Knowledge and QA, and it's easiest to settle once the parts inside it exist.

**Settled 28 Oct (Nour), after a survey of all three products:**
- Shell widths: Knowledge's. The nav moves into a menu below 900 and the rail becomes a drawer below 1040, in rem. The rail's width is a setting, 320px by default (Sales'), so the diary and Financials doors fit.
- The bell's panel: Sales' (card surface, a severity dot beside the type in words, the Menu's open and close motion).
- Tables: Knowledge's console parts (the three-state sort header, the grid table, the scrolling table) and Sales' windowed list, plus the two gaps neither product has, a header that stays put on scroll and row selection, built from the design-system spec.
- QA's charts are in: its trend chart with hover, the donut, the heatmap and the leaderboard, beside Sales' and Knowledge's.

**Phase 4 runs in four batches:**
- P4-1, figures and records: StatTile (Sales' `.s-af`, the change said in words), DescriptionList (Sales' `.b-about-dl` beside, Knowledge's `.set2-us-facts` stacked), Timeline (Sales' `.b-tl` call history), DataTable and VirtualList.
- P4-2, charts: the KPI widget (Sales' `.b-wid` line with the promised goal and a hover readout), progress to target (`.s-att`), the funnel (`.b-funnel`), Knowledge's before-and-after sparkline, and QA's trend chart, donut, heatmap, leaderboard and score tile.
- P4-3, the shell: AppShell, Topnav, product menu, user menu, Rail with its drawer, the rail doors, NotificationsPanel, page head.
- P4-4: the Diary, and the note taker's canvas view.

## 11. AI-native for the people building with it

The library itself is used by AI coding agents as much as by people, so it ships for them on purpose.

- **AGENTS.md** in the repo and a packaged **SKILL.md** that teams drop into their own repos. It holds the rules in a form an agent follows: use tokens only, Lucide only, no muted text, classify every action's entry mode, never apply AI changes silently, every insight gets a next step, toast with undo instead of confirm dialogs, plain English copy, never a left border stripe.
- **Every registry item has a written description** aimed at a model: what it's for, when not to use it, which doctrine rule it serves.
- **`llms.txt`** on the docs site, and a "Copy for AI" button on every component page that copies the page as markdown.
- **The shadcn MCP server** works against our registry, so an agent can find and install AiMY components by name.
- **Later, if wanted:** Figma Code Connect, so designers in Figma see the real React component for each Figma component.

## 12. Decisions

**Decided on 27 Oct:**
- Internal to FlairsTech: private repo, docs behind a company sign-in, registry behind a token (section 4).
- Repo name `aimy-ui-lib`. Created 27 Oct as a private repo: https://github.com/Flairstech-AIMY/aimy-ui-lib
- Nour owns the library.
- Accent: Sales' violet (disagreement 7).
- AiMY's own names for variants and sizes. shadcn supplies delivery only, never the look (section 3a).

**Still open:**
1. *(settled: no pilot in the real app; we build our own demo app, section 5a)*
2. *(settled: Claude created the repo)*
3. **The nine disagreements in section 2.** I'll bring each one with a side-by-side screenshot; you pick.
4. *(settled: Sales' accent)*
5. **Light-weight Poppins.** `--fw-light` is 200 but no 200 file is loaded. Load it, or drop the token.
6. **Docs site look.** It should look like AiMY (dark by default, Poppins, the product's chrome), not like a generic docs theme. [Yes. It's the library's best demo.]

**About the real React app.** The developers build the real Knowledge product in React in `Flairstech-AIMY/aimy-knowledge-ui` (your local copy is at `Desktop\AiMY\knowledge-dev\aimy-knowledge-ui`). We read it to learn their stack and nothing more. We never edit, branch, open PRs on or install into it. The demo app in section 5a is where everything gets tried.

## 13. How each component gets done (the definition of done)

A component is finished when all of these are true. This is the checklist for every single one.

1. **Reference named.** Which product, which class, which file and line it comes from, and which disagreements it touches.
2. **Parity measured.** `scripts/parity.ts` opens the product page and the library's demo side by side at 1536px in both themes, with transitions forced off before measuring (the browser pane lies otherwise), and diffs the computed styles of the drawn edges: size, padding, radius, colour, font, weight, line height, shadow. Differences are either fixed or listed with a reason.
3. **States complete.** Default, hover, active (pressed), focus-visible, disabled, loading, error, empty, as applicable.
4. **Keyboard and screen reader.** Full keyboard use, correct roles and names, focus returns where it should. Automated axe check passes.
5. **Motion, reduced motion and both themes** checked. The component uses the transitions.dev snippet named for it in section 7a, and the transitions-polish review has no open findings.
6. **No raw values.** The token check finds no hex, px font size or arbitrary value outside the theme.
7. **Docs page written.** What it is, live preview with theme toggle, install command, usage, variants, states, accessibility notes, do and don't, props.
8. **Registry entry** with a model-readable description and correct dependencies. It installs cleanly into the demo app with one command, and it is exported from the npm package.
9. **Tests.** Behaviour test, accessibility test, and screenshots in both themes at 1536 and at a phone width.
10. **Shown to you** with a screenshot next to the product it came from, then committed. One commit per verified component.

## 14. Quality gates that run on every push

GitHub Actions runs, in order: TypeScript (strict), lint, the token check, a "doctrine lint" (fails on `transition-all`, on a left border stripe, on text opacity used to show state, on a native `<select>`, on inline `onClick` strings in HTML examples, on any duration, curve, distance, scale or blur that isn't a motion token), unit and accessibility tests, the registry build, a test install of every item into the demo app (section 5a) and its type check, then visual screenshot comparison. Only if all pass does `main` deploy.

**Status on 27 Oct.** The workflows are written (`.github/workflows/ci.yml` and `release.yml`) and every check passes locally with `pnpm check`. GitHub refuses to run them because the `Flairstech-AIMY` org (free plan) "has reached its billing limit". Its admins are hadeeremad000, IT-Flaristech and mhsFlairs. Until that's fixed, checks run locally before every commit and deploys go out from this machine. Package publishing no longer depends on GitHub: the packages are served from our own registry (section 4), so the GitHub release workflow was removed.

## 15. The order of work, with checkpoints

Each phase ends with a review where you look at screenshots and say yes before the next one starts. Time ranges are rough guesses, not commitments.

**Phase 0: set-up (about 2 to 3 days).**
- Settle the open decisions 1, 2 and 6.
- Set up the two locks: Cloudflare Access for the docs, a token for the registry.
- Write PRODUCT.md with you (who uses this library and why), via `/impeccable init`.
- Create the repo from shadcn's registry template; set up TypeScript, Tailwind v4, lint, tests, CI.
- Build a walking skeleton: one throwaway item, deployed to Cloudflare, installed into the new demo app (section 5a) with one command. This proves the whole chain (build, deploy, install) works before any real component exists.
- Prove the other two doors with the same throwaway item: publish a `0.0.1` of the package and import it into a non-Tailwind Vite app and into a Tailwind app (the CSS-layer test), and load the tokens package in a plain HTML page.
- Create `starter/` with just the theme and the skeleton item, and check that `npx tiged` copies it into a new folder that builds.
- Check the folder-with-spaces question.
- **Checkpoint:** you run one install command yourself and see it work, and you see the starter come up as a new app.

**Phase 1: foundations (about 1 week).**
- Token extraction script, the theme item and `motion.css`. Settle disagreements 1, 7 and 9 (2 and 3 are settled by transitions.dev).
- The 12 foundation pages. DESIGN.md generated from the shipped tokens.
- **Checkpoint:** you review the colour, type and motion pages in both themes.
- *Status 27 Oct: built, deployed and pushed; waiting on your review.*

**Phase 2: core components (about 2 to 3 weeks, four batches).** Checkpoint after each batch. Settle disagreements 4 and 5 before Batch A and Batch D.

**Phase 3: AI components (about 3 to 4 weeks, five batches).** Checkpoint after each batch. Settle the gap list.

**Phase 4: shell and data display (about 2 weeks).** Settle disagreements 6 and 8.
- *Status 29 Oct: done in four batches (P4-1 figures and records, P4-2 charts, P4-3 the shell, P4-4 the Diary and the meeting in the canvas), packages 0.15.0.*

**Phase 5: adoption.** Finish the starter (Vite and Next.js) so a new AiMY product can start from it, and the demo app as the full reference screen. Publish `1.0.0` of the package. Write the "how to adopt" notes for any React team. Whether the dev team uses the library is their decision; we never change their repo. Feed every design-system fix found along the way back into the design-system repo.
- *Added 29 Oct (Nour): the document tools from Knowledge's document page, ported as their own batch inside Phase 5.*
- *Decided 29 Oct (Nour): this library replaces the design-system repo for developers, so design-system fixes are not fed back to that repo. The step "feed every design-system fix back" is dropped.*
- *Status 29 Oct: P5-1 done (agents/AGENTS.md and the aimy-ui skill generated from the registry, @aimy/init, llms.txt, Copy for AI on every page).*

## 16. Risks and how we handle them

- **The design-system file changes under us.** Extraction always re-reads it, prints a diff, and never trusts an earlier snapshot.
- **The products drift after we document them.** The parity script can be rerun at any time against the live sites and shows what moved.
- **Developers keep using stock shadcn next to ours.** Turning off Tailwind's palette makes stock shadcn components visibly unstyled in an AiMY app, which surfaces the mix at once. The SKILL.md tells agents to install from `@aimy` first.
- **Copy-in means old copies live on.** `shadcn diff` shows what changed, and the changelog says which changes matter.
- **The browser pane lies when measuring.** Transitions forced off before measuring, and anything that matters gets checked in a real browser.
- **Scope creep.** The design system has about 175 sections. We build in the order above and add only what a product actually uses; anything else waits for someone to ask.
