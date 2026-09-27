---
title: Deployment
description: Deploy the app to Cloudflare Workers with a KV namespace for sessions.
order: 2
---

Rechenkiste deploys as a Cloudflare Worker. Static assets are served from `dist/client` through
the `ASSETS` binding, everything else runs through the Astro server entry point of
`@astrojs/cloudflare`.

## Deploy

```sh
pnpm cf-deploy
```

This runs `astro build` and then `wrangler deploy`.

## Configuration

`wrangler.toml` holds:

- `main = "@astrojs/cloudflare/entrypoints/server"` and the `nodejs_compat` flag;
- `[assets]` with `directory = "./dist/client"` and binding `ASSETS`;
- a `[[kv_namespaces]]` entry with binding `SESSION` – Astro stores the practice session there;
- `account_id`, because `wrangler deploy` otherwise stops in non-interactive runs when the
  login has access to several accounts.

To deploy to your own account, replace `account_id` and create a KV namespace:

```sh
pnpm wrangler kv namespace create SESSION
```

Put the returned id into the `SESSION` entry of `wrangler.toml`.

## Site files

`@casoon/astro-site-files` generates `sitemap.xml` (with the three language versions),
`robots.txt` and `llms.txt` at build time. Their content is configured in `astro.config.mjs`.
