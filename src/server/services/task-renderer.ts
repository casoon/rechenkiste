/**
 * Task Renderer Service
 *
 * Verwendet @casoon/fragment-renderer für die Visualisierung von Aufgaben.
 */

import { createAstroRuntime } from "@casoon/fragment-renderer";
import { ahaStackPreset } from "@casoon/fragment-renderer/presets/aha-stack";
import type { TaskInstance, ValidationResult } from "@domain/task-system";
import type { Locale } from "@i18n/translations";

// Fragment Components
import TaskArithmetic from "@fragments/TaskArithmetic.astro";
import TaskWord from "@fragments/TaskWord.astro";
import TaskGeometry from "@fragments/TaskGeometry.astro";
import TaskMultipleChoice from "@fragments/TaskMultipleChoice.astro";
import TaskDragDrop from "@fragments/TaskDragDrop.astro";
import FeedbackCorrect from "@fragments/FeedbackCorrect.astro";
import FeedbackIncorrect from "@fragments/FeedbackIncorrect.astro";
import ResultDisplay from "@fragments/ResultDisplay.astro";
import type { TestSession } from "@domain/session";

// Create runtime with AHA-Stack preset
function createRuntime(locale: Locale) {
  const preset = ahaStackPreset({ locale, htmxHeaders: true });

  return createAstroRuntime({
    baseContext: {
      ...preset.baseContext,
      locale,
    },
    components: [
      {
        id: "task-arithmetic",
        loader: () => Promise.resolve({ default: TaskArithmetic }),
      },
      {
        id: "task-word",
        loader: () => Promise.resolve({ default: TaskWord }),
      },
      {
        id: "task-geometry",
        loader: () => Promise.resolve({ default: TaskGeometry }),
      },
      {
        id: "task-multiple-choice",
        loader: () => Promise.resolve({ default: TaskMultipleChoice }),
      },
      {
        id: "task-drag-drop",
        loader: () => Promise.resolve({ default: TaskDragDrop }),
      },
      {
        id: "feedback-correct",
        loader: () => Promise.resolve({ default: FeedbackCorrect }),
      },
      {
        id: "feedback-incorrect",
        loader: () => Promise.resolve({ default: FeedbackIncorrect }),
      },
      {
        id: "result-display",
        loader: () => Promise.resolve({ default: ResultDisplay }),
      },
    ],
    services: preset.services,
  });
}

/**
 * Progress-Info für Task-Fragments
 */
export interface TaskProgress {
  current: number;
  total: number;
}

/**
 * Rendert eine Aufgabe als HTML-Fragment
 */
export async function renderTaskFragment(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
  progress?: TaskProgress,
): Promise<string> {
  const runtime = createRuntime(locale);

  // Wähle Component basierend auf InputType oder Kategorie
  const componentId = (() => {
    // Zuerst InputType prüfen
    if (task.inputType === "multiple-choice") {
      return "task-multiple-choice";
    }
    if (task.inputType === "drag-drop") {
      return "task-drag-drop";
    }

    // Dann Kategorie
    switch (task.category) {
      case "word-problem":
        return "task-word";
      case "geometry":
        // Nur echte Geometrie-Tasks mit svgMarkup in data verwenden TaskGeometry
        // Andere (wie Koordinaten, Dreieck, Quader) haben SVG in question
        if (
          task.data &&
          typeof task.data === "object" &&
          "svgMarkup" in task.data &&
          "prompt" in task.data
        ) {
          return "task-geometry";
        }
        return "task-arithmetic";
      case "arithmetic":
      case "number-sense":
      case "measurement":
      case "data":
      default:
        // TaskArithmetic kann SVG in question handhaben
        return "task-arithmetic";
    }
  })();

  return runtime.renderToString({
    componentId,
    props: {
      task,
      locale,
      sessionId,
      progress,
    },
  });
}

/**
 * Rendert Feedback als HTML-Fragment
 */
export async function renderFeedbackFragment(
  result: ValidationResult,
  nextUrl: string,
  isComplete: boolean,
  locale: Locale,
): Promise<string> {
  const runtime = createRuntime(locale);

  if (result.isCorrect) {
    return runtime.renderToString({
      componentId: "feedback-correct",
      props: { locale, nextUrl, isComplete },
    });
  } else {
    return runtime.renderToString({
      componentId: "feedback-incorrect",
      props: {
        locale,
        correctAnswer: result.correctAnswer,
        hint: result.hint,
        explanation: result.explanation,
        nextUrl,
        isComplete,
      },
    });
  }
}

/**
 * Rendert Feedback als Response mit HTMX-Headers
 */
export async function renderFeedbackResponse(
  result: ValidationResult,
  nextUrl: string,
  isComplete: boolean,
  locale: Locale,
): Promise<Response> {
  const html = await renderFeedbackFragment(
    result,
    nextUrl,
    isComplete,
    locale,
  );

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "HX-Trigger": "feedbackShown",
    },
  });
}

/**
 * Rendert das Ergebnis als HTML-Fragment
 */
export async function renderResultFragment(
  session: TestSession,
  resultData: {
    correct: number;
    total: number;
    percent: number;
    results: Array<{
      isCorrect: boolean;
      userAnswer: string | number;
      correctAnswer: string | number;
    }>;
    tasks: Array<{
      category: string;
      question: string;
      data: unknown;
    }>;
  },
  locale: Locale,
): Promise<string> {
  const runtime = createRuntime(locale);

  return runtime.renderToString({
    componentId: "result-display",
    props: {
      locale,
      session,
      resultData,
    },
  });
}

/**
 * Rendert das Ergebnis als Response mit HTMX-Headers
 */
export async function renderResultResponse(
  session: TestSession,
  resultData: {
    correct: number;
    total: number;
    percent: number;
    results: Array<{
      isCorrect: boolean;
      userAnswer: string | number;
      correctAnswer: string | number;
    }>;
    tasks: Array<{
      category: string;
      question: string;
      data: unknown;
    }>;
  },
  locale: Locale,
): Promise<Response> {
  const html = await renderResultFragment(session, resultData, locale);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "HX-Trigger": "resultShown",
    },
  });
}

// Legacy-Export für Abwärtskompatibilität
export { renderTaskFragment as renderTask };
