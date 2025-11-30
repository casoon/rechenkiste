import type { APIRoute } from "astro";
import {
  loadSession,
  saveSession,
  submitAnswer,
  nextTask,
  isTestComplete,
  incrementFragmentLoads,
} from "@domain/session";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";
import { renderFeedbackResponse } from "@services/task-renderer";

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const formData = await request.formData();

  const answer = formData.get("answer") as string;
  const locale = (formData.get("locale") as Locale) || "de";

  if (!answer) {
    return new Response("Bad Request", { status: 400 });
  }

  // Lade Session aus Astro Session
  const session = await loadSession(context as any);

  if (!session) {
    return new Response("Session not found", { status: 404 });
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
  await saveSession(context as any, session);

  // Check if test is complete
  const complete = isTestComplete(session);
  const nextUrl = complete
    ? getLocalizedPath("/ergebnis", locale)
    : getLocalizedPath("/test", locale);

  // Render feedback fragment
  return renderFeedbackResponse(result, nextUrl, complete, locale);
};
