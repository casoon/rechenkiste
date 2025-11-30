import type { APIRoute } from "astro";
import { loadSession } from "@domain/session";

export const GET: APIRoute = async (context) => {
  const session = await loadSession(context as any);

  const f = session?.fragmentLoads || 0;
  const p = session?.pageLoads || 0;

  const html = `F:${f} P:${p}`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};
