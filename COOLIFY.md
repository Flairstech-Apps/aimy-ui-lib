# Hosting AiMY UI on Coolify

Coolify builds the repo's `Dockerfile` and runs `server/index.mjs`. It serves the same build as the Cloudflare Worker, behind the same locks.

## Set up the application

- Source: `Flairstech-Apps/aimy-ui-lib`, branch `main`.
- Build pack: **Dockerfile**.
- Port: **3000**.
- Health check: the image has one (`/healthz`), so nothing to add.
- Environment variables: see below. Coolify keeps them out of the build; never put them in the repo.

## Environment variables

None are needed for the token. The server checks it against `server/token.sha256`, the token's SHA-256, which is committed (the token is 32 random characters, so the hash can't be turned back into it). Setting `REGISTRY_TOKEN` in Coolify overrides the file.

To replace the token: make a new one, put it in `.env.local`, write its SHA-256 to `server/token.sha256`, run `npx wrangler secret put REGISTRY_TOKEN` for Cloudflare, then commit and push. Coolify picks it up when it redeploys. Never commit the token itself.

Company sign-in (Cognito) to the docs needs no environment variables either. Commit `server/sso.json`; without it the docs ask for the token:

```json
{
  "issuer": "https://cognito-idp.<region>.amazonaws.com/<user pool id>",
  "clientId": "<the Cognito app client ID>",
  "allowedEmailDomains": ["flairstech.com"]
}
```

Neither value is a secret. The app client is a public client: it signs in with PKCE and has no client secret.

Optional, in Coolify's environment variables, for whoever has access:

- `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `ALLOWED_EMAIL_DOMAINS`, `OIDC_SCOPES`: override `sso.json`.
- `OIDC_CLIENT_SECRET`: only if the app client was made with a secret.
- `SESSION_SECRET`: a long random string that signs the sign-in cookie. Without it, a new key is made on each start, so a redeploy signs people out and Cognito signs them straight back in.
- `PUBLIC_URL`: the site's address, if links ever come out with the wrong one. Normally the server reads it from the request.

## What the Cognito app client needs

Whoever owns Cognito sets these on the app client:

- Client type: public client, no client secret ("Single-page application" in the Cognito console).
- Allowed callback URL: `https://aimy-ui-lib.aimy.flairstech.com/auth/callback`.
- Allowed sign-out URL: `https://aimy-ui-lib.aimy.flairstech.com/auth/signed-out`.
- OAuth grant type: authorization code. Scopes: `openid`, `email`, `profile`.
- The company identity provider (Microsoft) enabled on it, if Cognito signs people in through Microsoft.

Then they send the user pool ID with its region, and the app client ID.

## When Coolify is live: make it the home

Until then, every install command, the How to adopt page, the agent rules and the starters name the Cloudflare address. One switch moves them all, with the repo the starters are copied from:

```bash
node scripts/set-address.mjs https://<the Coolify address> --repo Flairstech-Apps/aimy-ui-lib
```

Then `pnpm check`, commit and push. Coolify rebuilds from `main`, and the docs lead to Coolify for installing and adopting. Run it with `--dry-run` first to see the 24 files it touches. `site.json` remembers the current address, so the switch can be run again later. Keep Cloudflare running until every app's `.npmrc` and `components.json` name the new address. Packages already installed keep working, because the lockfile records where each one came from.

## How it behaves

- The docs: people sign in with their company account and stay signed in for 12 hours. `/auth/logout` signs them out. Agents can still read the docs with the token as a Bearer header.
- `/r` and `/npm`: need the token as a Bearer header, as today. A terminal can't use company sign-in.
- Addresses: the build has the Cloudflare address baked in. The server swaps it for the address the request came in on, so install commands and npm download links point at Coolify.
