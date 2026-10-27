# New AiMY product

Started from the AiMY UI starter. Everything in `src/components` came from the AiMY registry, so this project owns it.

## First run

1. Get the library token from the AiMY UI owner and put it in your environment as `AIMY_REGISTRY_TOKEN` (copy `.env.example` to `.env` for your own reference; the install command reads the environment variable).
2. Install and start:

   ```bash
   pnpm install
   pnpm dev
   ```

## Adding AiMY components

```bash
pnpm aimy:add @aimy/<name>
```

The full list, with previews and rules, is on the AiMY UI docs site: https://aimy-ui-lib.nour-ali.workers.dev
