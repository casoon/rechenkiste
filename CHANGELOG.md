# Changelog

All notable changes to this project are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Rechenkiste is an app and is deployed
from `main`; versions mark the state of `package.json`.

## [Unreleased]

### Added

- "Rechenheft" design on all pages: squared paper, ink blue and red pen, Lexend font, grade and
  count tiles, progress dots, a number pad for whole-number answers, a row of stamps on the
  result page.
- Read-aloud for pages and tasks via the browser's speech synthesis, offered only when a voice
  for the locale exists.
- Division with remainder gets two labelled number fields sharing the number pad.
- Vitest suite, including a grading probe over all task types.

### Changed

- **App icons:** replace the abstract mark with colourful arithmetic blocks, with PNG home-screen icons for iPhone, iPad and Android.
- **Pages:** the project site uses the current shared theme (0.12.8).
- **SEO:** the start page title names what the app is ("Mathe-Übungen für Klasse 1–5"), and the
  tech page has its own meta description.
- Upgrade to Astro 7 with `@astrojs/cloudflare`; `@casoon/astro-site-files` generates sitemap,
  robots.txt and llms.txt.
- htmx and Alpine.js are bundled from npm instead of loaded from a CDN.
- Task, feedback and result fragments are rendered again with `@casoon/fragment-renderer`
  instead of hand-built template strings; the renderer shrank from 702 to 262 lines.
- The answer field type follows from the shape of the expected answer, so time tasks get a
  keyboard with ":" on iOS.
- The pause after a correct answer is 600 ms instead of 1500 ms.
- Licensed under MIT.
- Dependencies updated (Astro 7.4, `@casoon/astro-site-files` 0.7, chartlet 0.23 for the project
  page); robots.txt now states `Allow: /` for all crawlers instead of an empty group.
- **Project page:** the start page shows a fresh capture of the live app as its hero and a diagram of how an answer becomes an htmx fragment; the code excerpts moved to the documentation, where [Request flow](https://casoon.github.io/rechenkiste/docs/architecture/aha-stack/) now carries a sequence diagram of a practice run.
- **Project page:** the start page now carries a release teaser and an FAQ (theme 0.11.1).

### Fixed

- Number pad no longer drops a digit on iPad/iOS Safari when two keys are tapped quickly
  (double-tap zoom swallowed the tap, so "64" arrived as "6").
- A test no longer contains the same task twice.
- hreflang links point to the same page in the other languages instead of to the start pages,
  without a trailing slash, matching canonical and sitemap.
- Each task validates with its own rules again after being read back from the session; before,
  a generic numeric comparison accepted "6" for "6 Rest 3".
- Money tasks compare in whole cents; float residue had accepted answers one cent off.
- `visual-symmetry` no longer accepts an empty answer, `coordinate-read` accepts surrounding
  spaces.
- SVG in multiple-choice and drag-and-drop questions is shown as a figure instead of escaped
  source.
- The answer field receives focus on page load and keeps the caret in place while typing.
- The category line on the task page updates after each htmx swap.

## [0.1.2] - 2025-12-12

### Added

- SEO and PWA metadata: description, Open Graph, canonical and hreflang links, JSON-LD, web app
  manifest and icons.
- ESLint with Tailwind v4 rules (`eslint-plugin-better-tailwindcss`).
- Symmetry tasks show a single shape and are answered with yes/no.

### Fixed

- Equivalent fractions count as correct (6/8 = 3/4).
- Money answers accept comma or point and are displayed as "4,40 €".
- Result page shows readable answers for drag and drop and multiple choice.
- All `astro check` errors resolved.
- Vite HMR ignores the `.wrangler` directory.

## [0.1.1] - 2025-11-30

### Added

- Task navigation with htmx fragments instead of page reloads, via `/api/test/task`.
- Fragment and page load counter, kept in the server-side session.

## [0.1.0] - 2025-11-30

### Added

- Maths tasks for grades 1 to 5: arithmetic, fractions, geometry, measurements.
- Text input and multiple choice, with input validation and unit suffixes.
- No repeated task type within a session.
- German, English and Ukrainian.
- Deployment to Cloudflare Workers with sessions in KV.
- AHA stack: Astro, htmx, Alpine.js.
