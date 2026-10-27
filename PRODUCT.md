# Product

AiMY UI is the component library for AiMY products at FlairsTech. It documents the system AiMY Sales and AiMY Knowledge already ship (tokens, components, AI parts and the rules behind them) as building blocks anyone can install. It is not a new design.

## Platform

web

## Stack

React 19 and TypeScript, Tailwind CSS v4, Radix primitives for behaviour, cva, lucide-react, Poppins and JetBrains Mono. Delivered three ways from one source: a private shadcn-style registry (copy-in), an npm package on GitHub Packages (`@flairstech-aimy/ui`, compiled CSS, no Tailwind needed), and a tokens-only CSS package (`@flairstech-aimy/tokens`). The docs site is a static Next.js export served by a Cloudflare Worker that requires the library token.

## Users

- FlairsTech React developers building AiMY products, who install components into their apps.
- Nour Ali, the library's owner and AiMY's designer-engineer, who uses it to build AiMY screens and prototypes faster.
- AI coding agents (Claude, Copilot) that build AiMY screens from the registry and the packaged rules.
- Teams starting a new AiMY product, who begin from the starter.

## Product Purpose

Make every AiMY product look and behave like Sales and Knowledge without anyone rebuilding the system by hand. Success looks like:

- Screens built with the library match the Sales and Knowledge designs with no design fixes.
- A new AiMY product has a working shell on day one.
- Products stop drifting apart because they share one source.
- AI agents produce AiMY screens that follow the doctrine.

## Positioning

A record of a system that already exists, made installable. Where Sales and Knowledge disagree, the owner decides; the library never invents a component the design system should own, and flags gaps instead.

## Operating Context

Internal to FlairsTech. The repo (`Flairstech-AIMY/aimy-ui-lib`) is private, the docs and registry are locked behind a shared token, and packages are on the org's GitHub Packages. Reference viewport is 1536px; dark theme is the default, light is designed rather than inverted.

## Capabilities and Constraints

- Colour comes from `AiMY/design-system/index.html`; structure comes from what Sales and Knowledge render; behaviour comes from the Knowledge-to-Action Doctrine.
- All motion comes from the transitions.dev scale and snippets.
- The dev team's real React app (`Flairstech-AIMY/aimy-knowledge-ui`) is read-only to this project. Everything is tried in the library's own demo app.
- Installs anywhere: Vite, Next.js and React Router apps, with or without Tailwind; tokens work in plain HTML.

## Brand Commitments

- Poppins for everything, JetBrains Mono for code. Even type steps with a 12px floor.
- Accent is Sales' violet (`#8b4ff4` dark, `#6725cc` light). Focus is always `--brand`.
- Colour marks an outcome, never a category. A label has a fill, a control has an edge, a link has neither.
- No left-edge accent stripes. Icons are Lucide, verbatim, on the 24 grid.
- The docs site looks like AiMY itself: dark by default, Poppins, the product's chrome.

## Evidence on Hand

- Sales: `Sales/assets/aimy-ds.css`, `sales.css`, `bdr.css`, `bdr.js` (live at aimy-sales.nour-ali.workers.dev).
- Knowledge: `Knowledge/assets/aimy-ds.css`, `knowledge.css`, `chat.css`, `voice.css`, `settings.css`.
- Design system: `design-system/index.html`, `design-system.md`, `00_AiMY_Knowledge_to_Action_Doctrine.md`.
- The plan: `PLAN.md` in this repo.

## Product Principles

- Document, don't invent. Every value is measured against the product it came from.
- AI never applies a change silently: Accept, Edit, Reject, and undo for direct actions.
- Every action declares its entry mode; every surfaced item declares its work state.
- One-click inline controls with toast undo. No modal, picker, choice list or drag as the only way to do something.
- When space runs out, change the component's form; never hide it or shrink it past use.
- Plain English copy: "call", "contacts", a verb on every button, no sales slang.

## Accessibility & Inclusion

- WCAG 2.2 AA in both themes. No muted text: a state is said in words and colour, never by lowering contrast.
- Status is always colour plus words or an icon.
- Full keyboard use, visible `:focus-visible` rings, correct roles and names.
- Every animation honours `prefers-reduced-motion`.
