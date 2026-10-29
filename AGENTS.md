# Working on AiMY UI

This repo is the library itself. The rules for building AiMY products with it are in `agents/AGENTS.md` (written by `scripts/agent-files.mjs` from `agents/rules.md` and `registry.json`; edit those, not the output). Everything there applies here too.

## How a component gets in

- Port, don't invent. Find the component in AiMY Sales (`assets/sales.css`, then `bdr.css`, rendered by `bdr.js`) or Knowledge (`assets/aimy-ds.css`, then `knowledge.css`), take its effective CSS, and name the source file and lines in the CSS comment and on the docs page. Where the products differ, ask the owner which wins.
- Deviations from the source are on purpose and listed at the top of the CSS file: muted and faint words become secondary ink; breakpoints become container queries where the component can sit in a column.
- CSS lives in `package/tokens/*.css` (imported by `index.css`, exported in `package/tokens/package.json`). Components live in `registry/aimy/ui/`, with an entry in `registry.json` and an export in `package/ui/src/index.ts`. A component another component imports needs a one-line alias in `components/`.
- Docs pages are `app/components/<name>/page.tsx` with demos in `components/docs/*-demos.tsx` and an entry in `components/docs/nav.ts`. Tests are `tests/unit/*.test.tsx`, each with an axe check.

## Checks

- `pnpm check` runs types, lint, the doctrine lint and the tests. It must pass before every commit.
- Format TypeScript with `npx prettier --no-semi --print-width 120 --trailing-comma es5`. Never run prettier on `package/tokens/*.css`; it reflows the hand-compacted rules.
- Look at every change in both themes at 1536px, and in a real browser when it moves (`scripts/shot.mjs` for screenshots).

## Shipping

- Bump `package/tokens` and `package/ui` together, publish both (`node scripts/npm-registry.mjs publish tokens|ui`, with `AIMY_REGISTRY_TOKEN` exported), then `pnpm run deploy`. The npm store is append-only: a fix after publishing is a new patch version.
- Two hosts serve the same build behind the same locks: Cloudflare (`worker/index.ts`, `pnpm run deploy`) and Coolify (`Dockerfile` + `server/index.mjs`, deployed by pushing `main`, set up as in `COOLIFY.md`). A lock change goes into both files. Only the Coolify server has company sign-in (OIDC, for Cognito).
- The token lives in `.env.local`, which is ignored. Never commit it; check every commit with `git diff --cached | grep -F "$AIMY_REGISTRY_TOKEN"`.
- Never edit, branch or open pull requests on the product repos or the dev team's `aimy-knowledge-ui`. Try changes in `demo/`, then copy into `starter/`.
