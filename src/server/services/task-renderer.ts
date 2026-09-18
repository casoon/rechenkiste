/**
 * Task Renderer Service
 *
 * Rendert Aufgaben-, Feedback- und Ergebnis-Fragmente als HTML über den
 * @casoon/fragment-renderer (Astro Container API).
 *
 * Wichtig: die Container-API liefert KEINE component-scoped <style>-Blöcke aus.
 * Styling der Fragmente gehört deshalb nach src/styles/base.css, nicht in die
 * Komponente. Inline-Scripts (is:inline) kommen dagegen mit.
 */

import {
  createAstroRuntime,
  type AstroRuntime,
} from "@casoon/fragment-renderer";
import { ahaStackPreset } from "@casoon/fragment-renderer/presets/aha-stack";
import type { TaskInstance, ValidationResult } from "@domain/task-system";
import type { SerializedTask, TestSession } from "@domain/session";
import type { Locale } from "@i18n/translations";
import { resolveAnswerInput } from "@services/answer-input";

export interface TaskProgress {
  current: number;
  total: number;
}

type ResultData = {
  correct: number;
  total: number;
  percent: number;
  results: Array<{
    taskId: string;
    isCorrect: boolean;
    userAnswer: string | number;
    correctAnswer: string | number;
  }>;
  tasks: Array<SerializedTask | TaskInstance>;
};

/**
 * Wartezeit nach einer richtigen Antwort: lang genug, um das grüne
 * "Richtig!" wahrzunehmen, kurz genug, dass ein Durchlauf nicht zäh wird.
 */
const CORRECT_FEEDBACK_DELAY_MS = 600;

// Runtime je Locale, damit der Container nicht pro Anfrage neu entsteht
const runtimes = new Map<Locale, AstroRuntime>();

function getRuntime(locale: Locale): AstroRuntime {
  const cached = runtimes.get(locale);
  if (cached) return cached;

  const runtime = createAstroRuntime({
    ...ahaStackPreset({ locale, htmxHeaders: true }),
    components: [
      {
        id: "task-arithmetic",
        loader: () => import("@fragments/TaskArithmetic.astro"),
      },
      {
        id: "task-word",
        loader: () => import("@fragments/TaskWord.astro"),
      },
      {
        id: "task-geometry",
        loader: () => import("@fragments/TaskGeometry.astro"),
      },
      {
        id: "task-multiple-choice",
        loader: () => import("@fragments/TaskMultipleChoice.astro"),
      },
      {
        id: "task-drag-drop",
        loader: () => import("@fragments/TaskDragDrop.astro"),
      },
      {
        id: "feedback-correct",
        loader: () => import("@fragments/FeedbackCorrect.astro"),
      },
      {
        id: "feedback-incorrect",
        loader: () => import("@fragments/FeedbackIncorrect.astro"),
      },
      {
        id: "result-display",
        loader: () => import("@fragments/ResultDisplay.astro"),
      },
    ],
  });

  runtimes.set(locale, runtime);
  return runtime;
}

function render(
  locale: Locale,
  componentId: string,
  props: Record<string, unknown>,
): Promise<string> {
  return getRuntime(locale).renderToString({ componentId, props });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Zeilenumbrüche in der Frage als <br> — der Rest wird escaped */
function withLineBreaks(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function splitSvgQuestion(question: string): { svg: string; text: string } {
  const svgMatch = question.match(/<svg[\s\S]*?<\/svg>/);
  if (!svgMatch) return { svg: "", text: question };
  return {
    svg: svgMatch[0],
    text: question.replace(svgMatch[0], "").trim(),
  };
}

export async function renderTaskFragment(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
  _progress?: TaskProgress,
): Promise<string> {
  const base = { locale, sessionId, taskId: task.id };

  if (task.inputType === "multiple-choice") {
    return render(locale, "task-multiple-choice", {
      ...base,
      questionHtml: withLineBreaks(task.question),
      choices: task.choices ?? [],
    });
  }

  if (task.inputType === "drag-drop") {
    return render(locale, "task-drag-drop", {
      ...base,
      questionHtml: withLineBreaks(task.question),
      dragItems: task.dragItems ?? [],
      dropTargets: task.dropTargets ?? [],
    });
  }

  if (task.category === "word-problem") {
    const data = task.data as { story?: string } | undefined;
    return render(locale, "task-word", {
      ...base,
      story: data?.story ?? task.question,
    });
  }

  const answerInput = resolveAnswerInput(task);

  if (
    task.category === "geometry" &&
    task.data &&
    typeof task.data === "object" &&
    "svgMarkup" in task.data &&
    "prompt" in task.data
  ) {
    const data = task.data as { svgMarkup?: string; prompt?: string };
    return render(locale, "task-geometry", {
      ...base,
      svgMarkup: data.svgMarkup ?? "",
      prompt: data.prompt ?? task.question,
      inputLabel: task.inputLabel,
      answerInput,
    });
  }

  const { svg, text } = splitSvgQuestion(task.question);
  return render(locale, "task-arithmetic", {
    ...base,
    question: task.question,
    svg,
    text,
    inputLabel: task.inputLabel,
    answerInput,
  });
}

export async function renderFeedbackFragment(
  result: ValidationResult,
  nextUrl: string,
  isComplete: boolean,
  locale: Locale,
): Promise<string> {
  if (result.isCorrect) {
    return render(locale, "feedback-correct", {
      locale,
      nextUrl,
      isComplete,
      delayMs: CORRECT_FEEDBACK_DELAY_MS,
    });
  }

  return render(locale, "feedback-incorrect", {
    locale,
    correctAnswer: result.correctAnswer,
    hint: result.hint,
    explanation: result.explanation,
    nextUrl,
    isComplete,
  });
}

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
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function renderResultFragment(
  session: TestSession,
  resultData: ResultData,
  locale: Locale,
): Promise<string> {
  return render(locale, "result-display", { locale, session, resultData });
}

export async function renderResultResponse(
  session: TestSession,
  resultData: ResultData,
  locale: Locale,
): Promise<Response> {
  const html = await renderResultFragment(session, resultData, locale);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "HX-Trigger": "resultShown",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export { renderTaskFragment as renderTask };
