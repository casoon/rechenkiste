import type { APIRoute } from "astro";
import {
  loadSession,
  saveSession,
  getCurrentTask,
  incrementFragmentLoads,
} from "@domain/session";
import type { Locale } from "@i18n/translations";
import { renderTaskFragment } from "@services/task-renderer";

export const GET: APIRoute = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const locale = (url.searchParams.get("locale") as Locale) || "de";

  // Lade Session
  const session = await loadSession(context as any);

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  const currentTask = getCurrentTask(session);

  if (!currentTask) {
    return new Response("No current task", { status: 400 });
  }

  // Fragment-Load zählen
  incrementFragmentLoads(session);
  await saveSession(context as any, session);

  // Render task fragment
  const taskHtml = await renderTaskFragment(currentTask, session.id, locale);

  // Progress berechnen
  const current = session.currentIndex + 1;
  const total = session.totalTasks;
  const percent = Math.round((session.currentIndex / total) * 100);

  // Wrapper mit Progress-Daten hinzufügen
  const html = `<div id="task-wrapper" data-current="${current}" data-total="${total}" data-percent="${percent}">${taskHtml}</div>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "HX-Trigger": "taskLoaded",
    },
  });
};
