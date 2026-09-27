---
title: Request flow
description: How Astro, htmx and Alpine.js share the work in one practice run.
order: 1
---

Rechenkiste is a server-rendered Astro app (`output: "server"`) on Cloudflare Workers. htmx and
Alpine.js are bundled from npm and started in `BaseLayout.astro`; nothing loads from a CDN.

| Layer | Job in Rechenkiste |
| --- | --- |
| **Astro** | Renders the pages, the API routes and – through the fragment renderer – every task, feedback and result fragment |
| **htmx** | Posts answers and swaps the returned HTML into the page |
| **Alpine.js** | Local UI state only: the grade and count tiles on the start page, the number pad, the character filter of the answer field |
| **Tailwind CSS 4** | Styling, via the Vite plugin |

## One practice run

1. **Start.** The start page submits grade, task count and the two options to
   `/api/test/start`. The route creates a session with all tasks, stores it in the Astro
   session (KV) and redirects to `/test`.
2. **First task.** `test.astro` loads the session and renders the current task on the server
   with `renderTaskFragment()` – the same function the API routes use.
3. **Answer.** The answer form carries htmx attributes:

   ```html
   <form
     id="answer-form"
     hx-post="/api/test/answer"
     hx-target="#feedback-container"
     hx-swap="innerHTML"
     hx-disabled-elt="find button[type='submit']"
   >
   ```

   `/api/test/answer` checks that the submission belongs to the current session and task
   (otherwise `409`), validates the answer with the task's own rules, advances the session and
   returns the rendered feedback fragment with the header `HX-Trigger: feedbackShown`.
4. **Next task.** After a correct answer the feedback waits 600 ms and fetches
   `/api/test/task` into `#task-container` via `htmx.ajax`. After a wrong answer the child
   reads the hint and presses *Next task*, an `hx-get` to the same route.
5. **Result.** When the run is complete, the feedback leads to `/ergebnis`, which renders the
   result fragment: score, a row of stamps and every task with both answers.

## Fragment and page counter

The footer shows `F:n P:n` – fragment loads against page loads in the current session. It is
refreshed by htmx from `/api/test/counter` whenever a task or feedback arrives, and shows how
many requests of a run were answered with a fragment instead of a full page.
