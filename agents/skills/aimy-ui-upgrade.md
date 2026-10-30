---
name: aimy-ui-upgrade
description: Bring an app up to the latest AiMY UI release, the npm packages and the copied components, without losing the app's own edits. Use when asked to update or upgrade AiMY UI, after a new release, or when a component looks out of date.
---

# Upgrade AiMY UI

Take the new release without losing what the app changed in its own copies.

## Steps

1. **Read what changed.** Open {{SITE}}/whats-new/ and note every "What to do" for the releases since the app's version.
2. **Start clean.** Commit or stash first, so every overwrite can be compared and undone.
3. **Setup.** If `.npmrc` or `components.json` still name an older address or send `AIMY_REGISTRY_TOKEN`, change them to {{SITE}} and remove the token lines; installing needs no token. If the project's `.npmrc` has no `@flairstech-aimy:registry` line, add `@flairstech-aimy:registry={{SITE}}/npm/` (create the file if there is none), so the package manager can find the packages by name.
4. **Copied components.** `npx shadcn@latest diff` lists the ones that changed upstream. For each, run `npx shadcn@latest add @aimy/<name> --overwrite` (or `{{SITE}}/r/<name>.json`), then read `git diff`. Put back the app's own edits that still apply, and say which ones you dropped and why.
5. **Rules for agents.** Refresh them with `npx shadcn@latest add {{SITE}}/r/init.json --overwrite`, which rewrites `AGENTS.md` and these skills.
6. **Packages, last.** The shadcn commands above install `@flairstech-aimy/tokens` by its file address (`…/tokens-<version>.tgz`), which pins it to one version, so do this after them:
   - In `package.json`, find every `@flairstech-aimy/*` dependency whose value is an address instead of a version range.
   - Install each one again by name with the project's own package manager, for example `pnpm add @flairstech-aimy/tokens@latest`, `npm install @flairstech-aimy/tokens@latest` or `yarn add @flairstech-aimy/tokens@latest`. Use `-D` if it was a dev dependency.
   - Check that `package.json` now shows a range such as `^1.1.0`. If the install fails with E404, the `.npmrc` line from step 3 is missing or wrong.
   - Then list what is behind with `pnpm outdated @flairstech-aimy/ui @flairstech-aimy/tokens` and update the rest, for example `pnpm up @flairstech-aimy/ui@latest`. Before a new major version, read its notes and say what it changes.
7. **Check.** Types, lint, tests and the build. Look at each screen that uses a changed component, in both themes.

## Report

Say which versions changed, whether a package was moved from a file address to a version range, which components were updated, which of the app's edits were put back or dropped, and anything left for a person to decide.
