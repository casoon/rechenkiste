---
title: Pages and API routes
description: Every page and every API route of the app, with parameters and responses.
order: 1
---

All routes render on the server. English pages live under `/en/`, Ukrainian under `/uk/`; they
reuse the German page components. API routes take the locale as a parameter.

## Pages

| Route | Page |
| --- | --- |
| `/` | Start: grade (1–5), number of tasks (10, 20, 30), adaptive difficulty, retry incorrect |
| `/auswahl` | Custom selection: individual task types grouped by category, 10 to 50 tasks |
| `/test` | Current task of the session; redirects to `/` without a session and to `/ergebnis` when done |
| `/ergebnis` | Result: score and every task with the given and the correct answer |
| `/technik` | Technical background: the AHA stack, the fragment renderer, the task system |

## API routes

All live under `src/pages/api/test/`.

| Route | Method | Parameters | Response |
| --- | --- | --- | --- |
| `/api/test/start` | GET, POST | `grade` (1–5), `count` (10, 20 or 30), `locale`, `adaptive`, `retry` | Creates a session, redirects to `/test`; invalid input redirects to the start page |
| `/api/test/custom` | POST | `selectedTypes` (JSON array of type ids), `count` (10–100), `locale`, `adaptive`, `retry` | Creates a session from the chosen types, redirects to `/test`; invalid input redirects to `/auswahl` |
| `/api/test/task` | GET | `locale` | Current task as a fragment inside `#task-wrapper` with progress in `data-*` attributes; header `HX-Trigger: taskLoaded` |
| `/api/test/answer` | POST | `answer`, optional `remainder`, `locale`, `sessionId`, `taskId` | Feedback fragment, header `HX-Trigger: feedbackShown`; `400` without an answer, `404` without a session, `409` for a stale task |
| `/api/test/result` | GET | `locale` | Result fragment, header `HX-Trigger: resultShown` |
| `/api/test/counter` | GET | – | `F:n P:n`, fragment and page loads of the session |

`adaptive` and `retry` are checkboxes: the value `on` switches the option on. For a division
with remainder the answer form sends `answer` and `remainder`, and the route joins them to the
form the task expects.

Fragment responses are sent with `Cache-Control: no-store, no-cache, must-revalidate`.
