# New AiMY product

Started from the AiMY UI Next.js starter: React, TypeScript, Next.js (App Router) and Tailwind v4, already in the AiMY shell. Everything in `src/components` came from the AiMY registry, so this project owns it and can change it.

## First run

1. Get the library token from the AiMY UI owner and put it in your environment as `AIMY_REGISTRY_TOKEN`. It is needed to install packages and components. Never commit it (`.env.example` shows the name only).
2. Install and start:

   ```bash
   pnpm install
   pnpm dev
   ```

## What is already here

- **The shell** (`src/screen.tsx`, a client component rendered by `src/app/page.tsx`): the bar with the AiMY products, the theme, the bell and the account; the rail of standing facts, which becomes a drawer below 1040px; the page with its head. Rename `PRODUCT` and `ME` at the top of the file.
- **A briefing** (`DayBrief`): the day in sentences, each number a link to its set, and ways to start.
- **The AiMY Canvas** (`src/conversation.tsx`): ask from the float bar and the canvas opens over the page with the thread. `answer()` streams a stand-in sentence; replace it with your backend's stream, mapped to the same `Turn` shape.
- **Toast with Undo**: every direct action ends in `toast("…", { onUndo })`.
- **An empty state** that says how to fill it.
- **Dark by default**, with the light theme one toggle away. The accent is AiMY's violet; `src/app/globals.css` shows what to change if your product is given its own.

## Rules for AI agents

`AGENTS.md` and the Claude skill in `.claude/skills/aimy-ui/` carry AiMY's rules (the doctrine, accessibility, writing, which component for what). Claude Code and Copilot read them, so the first screen an agent builds already follows them. They are written from the library; to refresh them, run `pnpm aimy:add @aimy/init --overwrite`.

## Adding AiMY components

```bash
pnpm aimy:add @aimy/<name>
```

The full list, with previews, rules and where each comes from in Sales and Knowledge, is on the AiMY UI docs site: https://aimy-ui-lib.nour-ali.workers.dev. Every page has "Copy for AI".
