import type { APIRoute } from "astro";
import {
  loadSession,
  saveSession,
  submitAnswer,
  nextTask,
  isTestComplete,
  incrementFragmentLoads,
  isCurrentTaskSubmission,
} from "@domain/session";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";
import { renderFeedbackResponse } from "@services/task-renderer";
import { composeRemainderAnswer } from "@services/answer-input";

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const formData = await request.formData();

  const quotient = formData.get("answer") as string;
  // Aufgaben mit Rest schicken zwei Felder — die Aufgabe erwartet "6 Rest 3"
  const remainder = formData.get("remainder")?.toString() ?? null;
  const answer =
    remainder !== null ? composeRemainderAnswer(quotient, remainder) : quotient;
  const locale = (formData.get("locale") as Locale) || "de";
  const sessionId = formData.get("sessionId")?.toString() ?? null;
  const taskId = formData.get("taskId")?.toString() ?? null;

  if (!quotient || (remainder !== null && !remainder.trim())) {
    return new Response("Bad Request", { status: 400 });
  }

  // Lade Session aus Astro Session
  const session = await loadSession(context);

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  if (!isCurrentTaskSubmission(session, sessionId, taskId)) {
    return new Response("Stale task submission", { status: 409 });
  }

  // Submit and validate the answer
  const result = submitAnswer(session, answer);

  if (!result) {
    return new Response("No current task", { status: 400 });
  }

  // Move to next task
  nextTask(session);

  // Fragment-Load zählen
  incrementFragmentLoads(session);

  // Speichere aktualisierte Session
  await saveSession(context, session);

  // Check if test is complete
  const complete = isTestComplete(session);
  const nextUrl = complete
    ? getLocalizedPath("/ergebnis", locale)
    : getLocalizedPath("/test", locale);

  // Render feedback fragment
  return renderFeedbackResponse(result, nextUrl, complete, locale);
};
