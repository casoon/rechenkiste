import type { APIRoute } from "astro";
import { loadSession, getResults } from "@domain/session";
import type { Locale } from "@i18n/translations";
import { renderResultResponse } from "@services/task-renderer";

export const GET: APIRoute = async (context) => {
  const { url } = context;
  const locale = (url.searchParams.get("locale") as Locale) || "de";

  const session = await loadSession(context as any);
  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  const resultData = getResults(session);

  return renderResultResponse(session, resultData, locale);
};
