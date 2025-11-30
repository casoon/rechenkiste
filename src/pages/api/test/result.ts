import type { APIRoute } from "astro";
import { getSession, getResults } from "@domain/session";
import type { Locale } from "@i18n/translations";
import { renderResultResponse } from "@services/task-renderer";

export const GET: APIRoute = async ({ request, url }) => {
  const sessionId = url.searchParams.get("session");
  const locale = (url.searchParams.get("locale") as Locale) || "de";

  if (!sessionId) {
    return new Response("Session ID required", { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  const resultData = getResults(session);

  // Render result fragment using @casoon/fragment-renderer
  return renderResultResponse(session, resultData, locale);
};
