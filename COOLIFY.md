# Hosting AiMY UI on Coolify

Coolify builds the repo's `Dockerfile` and runs `server/index.mjs`. It serves the same build as the Cloudflare Worker, behind the same locks.

## Set up the application

- Source: `Flairstech-Apps/aimy-ui-lib`, branch `main`.
- Build pack: **Dockerfile**.
- Port: **3000**.
- Health check: the image has one (`/healthz`), so nothing to add.
- Environment variables: see below. Coolify keeps them out of the build; never put them in the repo.

## Environment variables

Always:

- `REGISTRY_TOKEN`: the library token, the same value as `AIMY_REGISTRY_TOKEN` in `.env.local`. The shadcn CLI, npm and pnpm send it to `/r` and `/npm`.

For company sign-in (Cognito) to the docs. Leave these out and the docs ask for the token instead:

- `OIDC_ISSUER`: for Cognito, `https://cognito-idp.<region>.amazonaws.com/<user pool id>`.
- `OIDC_CLIENT_ID`: the Cognito app client ID.
- `OIDC_CLIENT_SECRET`: the Cognito app client secret.
- `ALLOWED_EMAIL_DOMAINS`: `flairstech.com`, so only company accounts get in.

Optional:

- `PUBLIC_URL`: the site's address, if links ever come out with the wrong one. Normally the server reads it from the request.
- `SESSION_SECRET`: a long random string that signs the sign-in cookie. Without it, a key derived from the client secret is used. Changing it signs everyone out.
- `OIDC_SCOPES`: defaults to `openid email profile`.

## What the Cognito app client needs

Whoever owns Cognito sets these on the app client:

- Allowed callback URL: `https://<the Coolify address>/auth/callback`.
- Allowed sign-out URL: `https://<the Coolify address>/auth/signed-out`.
- OAuth grant type: authorization code. Scopes: `openid`, `email`, `profile`.
- A client secret (a confidential client).
- The company identity provider (Microsoft) enabled on it, if Cognito signs people in through Microsoft.

## How it behaves

- The docs: people sign in with their company account and stay signed in for 12 hours. `/auth/logout` signs them out. Agents can still read the docs with the token as a Bearer header.
- `/r` and `/npm`: need the token as a Bearer header, as today. A terminal can't use company sign-in.
- Addresses: the build has the Cloudflare address baked in. The server swaps it for the address the request came in on, so install commands and npm download links point at Coolify.
