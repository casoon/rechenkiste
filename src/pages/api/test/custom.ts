import type { APIRoute } from "astro";
import { createCustomSession, saveSession } from "@domain/session";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";

export const POST: APIRoute = async (context) => {
  const { request, redirect } = context;
  const formData = await request.formData();

  const locale = (formData.get("locale") as Locale) || "de";
  const count = parseInt(formData.get("count") as string, 10) || 10;
  const selectedTypesJson = formData.get("selectedTypes") as string;

  let selectedTypes: string[] = [];
  try {
    selectedTypes = JSON.parse(selectedTypesJson);
  } catch {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  if (!Array.isArray(selectedTypes) || selectedTypes.length === 0) {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  if (isNaN(count) || count < 10 || count > 100) {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  const adaptiveDifficulty = formData.get("adaptive") === "on";
  const retryIncorrect = formData.get("retry") === "on";

  const session = createCustomSession(selectedTypes, count, locale, {
    adaptiveDifficulty,
    retryIncorrect,
    retryAtEnd: true,
  });

  if (!session) {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  // Speichere Session in Astro Session (KV)
  await saveSession(context as any, session);

  return redirect(getLocalizedPath("/test", locale));
};
