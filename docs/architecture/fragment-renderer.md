---
title: Fragment renderer
description: Rendering Astro components as HTML fragments for htmx with @casoon/fragment-renderer.
order: 2
---

htmx expects HTML from the server. Rechenkiste produces that HTML from ordinary Astro
components with [@casoon/fragment-renderer](https://www.npmjs.com/package/@casoon/fragment-renderer),
which wraps the Astro Container API. All of it lives in `src/server/services/task-renderer.ts`.

## Runtime

One runtime per locale, cached so the container is not rebuilt per request:

```ts
import { createAstroRuntime } from "@casoon/fragment-renderer";
import { ahaStackPreset } from "@casoon/fragment-renderer/presets/aha-stack";

const runtime = createAstroRuntime({
  ...ahaStackPreset({ locale, htmxHeaders: true }),
  components: [
    { id: "task-arithmetic", loader: () => import("@fragments/TaskArithmetic.astro") },
    { id: "feedback-correct", loader: () => import("@fragments/FeedbackCorrect.astro") },
    // …
  ],
});

const html = await runtime.renderToString({ componentId, props });
```

## Components

`src/components/fragments/` holds 12 components. Eight are registered with the runtime:

| Id | Used for |
| --- | --- |
| `task-arithmetic` | Default task: question, optional SVG, answer field |
| `task-word` | Word problems |
| `task-geometry` | Geometry tasks with an SVG figure |
| `task-multiple-choice` | Multiple choice |
| `task-drag-drop` | Drag and drop |
| `feedback-correct` | "Correct" and the automatic step to the next task |
| `feedback-incorrect` | Correct answer, hint, explanation, *Next task* |
| `result-display` | Result page |

The other four – `QuestionBlock`, `AnswerForm`, `AnswerFields`, `AnswerInput` – are shared
building blocks of the task components. Input and formatting logic sits in
`answer-input.ts` and `answer-format.ts`, so the components stay presentational.

The renderer picks the component from the task: its input type first (multiple choice, drag and
drop), then its category (word problem, geometry), then the default. The kind of answer field
follows from the shape of the expected answer: a plain whole number gets the number pad, a
division with remainder two labelled number fields, `:` means a time field, `/` a fraction
field, anything else a decimal field.

## Two rules for fragments

- **No scoped styles.** The Container API does not deliver component-scoped `<style>` blocks.
  Fragment styling belongs in `src/styles/base.css`.
- **Inline scripts work.** `<script is:inline>` comes along with the fragment – the automatic
  step after a correct answer is one.

Rendering through Astro also means Astro escapes the output. Before the fragment renderer came
back, fragments were built as template strings with hand-written escaping, where one missing
call was an XSS hole.
