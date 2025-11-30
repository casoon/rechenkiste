# Rechenkiste (Math Box)

A math practice application for elementary school children, built with the AHA-Stack and demonstrating the `@casoon/fragment-renderer` library.

**Live Demo:** [rechenkiste.casoon.dev](https://rechenkiste.casoon.dev)

## Features

- **Grade-based exercises** (Grades 1-4) with age-appropriate difficulty
- **Multiple task categories:**
  - Arithmetic (addition, subtraction, multiplication, division)
  - Number sense (comparing, ordering, number lines)
  - Geometry (shapes, symmetry, coordinates)
  - Fractions and visual representations
  - Time and clock reading
  - Word problems
  - Measurements (length, weight, volume)
- **Interactive task types:** Multiple choice, drag-and-drop, text input
- **Adaptive difficulty:** Adjusts based on correct/incorrect answers
- **Error retry system:** Missed questions are repeated for reinforcement
- **Multi-language support:** German (de), English (en), Ukrainian (uk)
- **SVG visualizations** for geometry, fractions, and clock tasks

## Tech Stack (AHA-Stack)

| Technology | Purpose |
|------------|---------|
| **Astro** | Server-side rendering, zero-JS default |
| **HTMX** | Dynamic interactions via HTML attributes |
| **Alpine.js** | Lightweight reactive UI components |
| **Tailwind CSS** | Utility-first styling |
| **@casoon/fragment-renderer** | Server-side Astro component rendering for HTMX |

## Project Structure

```
src/
├── components/
│   ├── fragments/          # HTMX fragment components
│   │   ├── TaskArithmetic.astro
│   │   ├── TaskGeometry.astro
│   │   ├── TaskMultipleChoice.astro
│   │   ├── TaskDragDrop.astro
│   │   ├── FeedbackCorrect.astro
│   │   ├── FeedbackIncorrect.astro
│   │   └── ResultDisplay.astro
│   └── layout/
│       └── BaseLayout.astro
├── i18n/
│   └── translations.ts     # Multi-language translations
├── pages/
│   ├── index.astro         # Home page
│   ├── auswahl.astro       # Grade/category selection
│   ├── test.astro          # Test session
│   ├── ergebnis.astro      # Results page
│   ├── technik.astro       # Tech documentation
│   ├── en/                 # English routes
│   └── uk/                 # Ukrainian routes
├── server/
│   ├── domain/
│   │   ├── session.ts      # Session management
│   │   └── task-system/
│   │       ├── interfaces.ts
│   │       ├── base-task.ts
│   │       ├── generator.ts
│   │       ├── registry.ts
│   │       └── tasks/      # Task implementations
│   └── services/
│       ├── task-renderer.ts
│       └── fragment-service.ts
└── styles/
    └── global.css
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment (Cloudflare Workers)

The project is configured for Cloudflare Workers deployment:

```bash
# Build and deploy
pnpm deploy
```

Configuration files:
- `wrangler.toml` - Cloudflare Workers configuration
- `astro.config.mjs` - Astro with Cloudflare adapter

## Fragment Renderer Usage

The application uses `@casoon/fragment-renderer` for server-side rendering of Astro components as HTML fragments, enabling seamless HTMX integration:

```typescript
import { createAstroRuntime } from "@casoon/fragment-renderer";
import { ahaStackPreset } from "@casoon/fragment-renderer/presets/aha-stack";

const runtime = createAstroRuntime({
  ...ahaStackPreset({ locale, htmxHeaders: true }),
  components: [
    { id: "feedback-correct", loader: () => import("./FeedbackCorrect.astro") },
    { id: "feedback-incorrect", loader: () => import("./FeedbackIncorrect.astro") },
  ],
});

// Render component as HTML fragment
const html = await runtime.renderToString({
  componentId: "feedback-correct",
  props: { locale, nextUrl },
});
```

## Task System

Tasks implement a unified interface with self-validation:

```typescript
interface TaskInstance {
  id: string;
  question: string;
  validate(answer: string): ValidationResult;
  getHint(): string;
  getCorrectAnswer(): string | number;
}
```

Each task category (arithmetic, geometry, fractions, etc.) provides:
- Question generation with configurable difficulty
- Answer validation with helpful hints
- SVG visualizations where applicable

## Links

- [casoon.de](https://www.casoon.de) - Web Development & Design
- [@casoon/fragment-renderer](https://www.npmjs.com/package/@casoon/fragment-renderer) - npm package
- [AHA-Stack Example](https://github.com/casoon/aha-stack-example) - Reference implementation

## License

MIT
