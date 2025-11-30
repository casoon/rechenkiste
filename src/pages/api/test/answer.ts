import type { APIRoute } from "astro";
import { submitAnswer, nextTask, isTestComplete } from "@domain/session";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";
import { renderFeedbackResponse } from "@services/task-renderer";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const sessionId = formData.get("sessionId") as string;
  const answer = formData.get("answer") as string;
  const locale = (formData.get("locale") as Locale) || "de";

  if (!sessionId || !answer) {
    return new Response("Bad Request", { status: 400 });
  }

  // Submit and validate the answer using new task system
  const submitResult = submitAnswer(sessionId, answer);

  if (!submitResult) {
    return new Response("Session not found", { status: 404 });
  }

  const { result, session } = submitResult;

  // Move to next task
  nextTask(sessionId);

  // Check if test is complete
  const complete = isTestComplete(session);
  const nextUrl = complete
    ? getLocalizedPath(`/ergebnis?session=${sessionId}`, locale)
    : getLocalizedPath(`/test?session=${sessionId}`, locale);

  // Render feedback fragment using @casoon/fragment-renderer
  return renderFeedbackResponse(result, nextUrl, complete, locale);
};
