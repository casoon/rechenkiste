---
title: Task system
description: Task definitions, the registry, the generator, validation and sessions.
order: 3
---

The task system lives in `src/server/domain/task-system/`. It has no dependency on the web
layer, so it is tested directly with Vitest.

## Definitions and instances

A `TaskDefinition` describes a task type – `typeId`, `category`, `grade`, `description` – and
generates instances. A `TaskInstance` is one concrete task:

```ts
interface TaskInstance<TData = unknown> {
  readonly id: string;
  readonly typeId: string;
  readonly category: TaskCategory;
  readonly grade: Grade; // 1 | 2 | 3 | 4 | 5
  readonly question: string;
  readonly locale: Locale;
  readonly data: TData;
  readonly inputType?: "text" | "multiple-choice" | "drag-drop";
  // … input label, choices, drag items, drop targets

  validate(userAnswer: string): ValidationResult;
  getHint(): string;
  getCorrectAnswer(): string | number;
}
```

Each task checks its own answer and supplies the hint shown after a wrong one. Validation
accepts equivalent notations: a decimal comma or point, equivalent fractions (6/8 for 3/4),
money compared in whole cents.

## Registry and generator

All definitions from `tasks/` are registered in one registry – 105 at the moment, listed in the
[task catalogue](../../reference/task-catalogue/). The generator fills a run from the chosen
grade and the grade below and avoids repeating a task type until all have been used. On the
selection page (`/auswahl`) a child can instead pick individual task types and 10 to 50 tasks.

## Session

A run is a `TestSession`: the serialised tasks, the results, the current index, the options and
the counters. It is stored with Astro sessions, which the Cloudflare adapter keeps in the
`SESSION` KV namespace.

Serialised tasks lose their class. `rehydrate.ts` restores each task through the class of its
own type before validation, so a task like "57 ÷ 9 = ? (with remainder)" is checked by its own
rules and a bare "6" does not pass for "6 Rest 3".

## Options

- **Adaptive difficulty** – three correct answers in a row raise the difficulty by one grade,
  three wrong ones lower it; up to three upcoming tasks are regenerated at the new level.
- **Retry incorrect** – tasks answered wrongly are asked again in a retry round at the end.
