---
name: aimy-ui-upgrade
description: Bring an app up to the latest AiMY UI release, the npm packages and the copied components, without losing the app's own edits. Use when asked to update or upgrade AiMY UI, after a new release, or when a component looks out of date.
---

<!-- Written by scripts/agent-files.mjs from agents/skills/aimy-ui-upgrade.md. Edit that, not this. -->

# Upgrade AiMY UI

Take the new release without losing what the app changed in its own copies.

## Steps

1. **Read what changed.** Open https://aimy-ui-lib.aimy.flairstech.com/whats-new/ and note every "What to do" for the releases since the app's version.
2. **Start clean.** Commit or stash first, so every overwrite can be compared and undone.
3. **Old setup.** If `.npmrc` or `components.json` still name an older address or send `AIMY_REGISTRY_TOKEN`, change them to https://aimy-ui-lib.aimy.flairstech.com and remove the token lines; installing needs no token.
4. **Packages.** List what is behind with `pnpm outdated @flairstech-aimy/ui @flairstech-aimy/tokens`, then update with the project's own package manager, for example `pnpm up @flairstech-aimy/ui@latest @flairstech-aimy/tokens@latest`. Before a new major version, read its notes and say what it changes.
5. **Copied components.** `npx shadcn@latest diff` lists the ones that changed upstream. For each, run `npx shadcn@latest add @aimy/<name> --overwrite` (or `https://aimy-ui-lib.aimy.flairstech.com/r/<name>.json`), then read `git diff`. Put back the app's own edits that still apply, and say which ones you dropped and why.
6. **Rules for agents.** Refresh them with `npx shadcn@latest add https://aimy-ui-lib.aimy.flairstech.com/r/init.json --overwrite`, which rewrites `AGENTS.md` and these skills.
7. **Check.** Types, lint, tests and the build. Look at each screen that uses a changed component, in both themes.

## Report

Say which versions changed, which components were updated, which of the app's edits were put back or dropped, and anything left for a person to decide.
