---
title: Local development
description: Install the dependencies, start the dev server and run the checks.
order: 1
---

## Requirements

- Node.js 22.12 or newer (Astro 7). The repository pins Node 24 for Volta.
- pnpm. The repository pins `pnpm@9.14.2` in `packageManager`.

## Install and start

```sh
git clone https://github.com/casoon/rechenkiste.git
cd rechenkiste
pnpm install
pnpm dev
```

The app uses the Cloudflare adapter with `output: "server"`. In development Astro runs it in
workerd, and the `SESSION` KV binding from `wrangler.toml` is simulated locally in `.wrangler/`,
so a full practice run works without a Cloudflare account.

German is served at `/`, English at `/en/` and Ukrainian at `/uk/`.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Starts the Astro dev server |
| `pnpm build` | Builds the app for production |
| `pnpm preview` | Serves the production build locally |
| `pnpm check` | Type-checks TypeScript and Astro components (`astro check`) |
| `pnpm test` | Runs the Vitest tests |
| `pnpm lint` | Lints `src/` with ESLint, including Tailwind class rules |
| `pnpm lint:fix` | Fixes ESLint findings where possible |
| `pnpm cf-deploy` | Builds and deploys to Cloudflare with `wrangler deploy` |

## Tests

The Vitest suite lives next to the domain code in `src/server/domain/`:

- `session.test.ts` – the retry round, matching results to tasks, restored tasks validating
  with their own rules, and rejecting submissions for another session or a stale task;
- `task-system/grading.test.ts` – a probe over every registered task type: wrong answers,
  equivalent notations, empty or nonsensical input, and whether the correct answer can be
  typed into the field the task shows;
- `task-system/rehydrate.test.ts` – every task type accepts its correct answer after a round
  trip through the session.

Because the grading probe iterates over the registry, a new task type is covered automatically.
