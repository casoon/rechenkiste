---
title: Overview
description: What Rechenkiste is, how it is built and how this documentation is organised.
order: 0
---

Rechenkiste ("math box") is a maths practice app for primary school children, grades 1 to 5.
A child picks a grade and a number of tasks, answers one task after the other and gets
feedback and a hint after every answer. At the end a result page lists every task with the
given and the correct answer.

The app runs at [rechenkiste.casoon.dev](https://rechenkiste.casoon.dev), in German, English
and Ukrainian.

It is also a working demo of two things:

- the **AHA stack**: Astro renders on the server, htmx swaps HTML fragments, Alpine.js handles
  small pieces of local state such as the number pad;
- **[@casoon/fragment-renderer](https://www.npmjs.com/package/@casoon/fragment-renderer)**,
  which renders Astro components to HTML strings inside API routes, so htmx gets real
  components instead of hand-built template strings.

## What a child can practise

105 task types across six categories: arithmetic, word problems, geometry, number sense,
measurement, and data. They cover mental and written arithmetic with the four operations
(division with remainder included), negative numbers, number sequences, neighbours and
comparisons, fractions, decimals and percentages, counting shapes, perimeter, area and volume,
coordinates, symmetry, bar charts, reading clocks and time spans, money, and units of length,
weight, volume and area.

Answers come in as free text, via an on-screen number pad, as multiple choice or by drag and
drop. Geometry, fraction and clock tasks draw their figure as SVG.

## This documentation

- **Getting started** – running the app locally and deploying it to Cloudflare Workers.
- **Architecture** – the request flow through Astro, htmx and the fragment renderer, the task
  system and the session.
- **Reference** – API routes and the task catalogue.
