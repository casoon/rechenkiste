import type { APIRoute } from "astro";
import { createCustomSession } from "@domain/session";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const locale = (formData.get("locale") as Locale) || "de";
  const count = parseInt(formData.get("count") as string, 10) || 10;
  const selectedTypesJson = formData.get("selectedTypes") as string;

  // Parse selected task types
  let selectedTypes: string[] = [];
  try {
    selectedTypes = JSON.parse(selectedTypesJson);
  } catch {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  // Validate
  if (!Array.isArray(selectedTypes) || selectedTypes.length === 0) {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  if (isNaN(count) || count < 10 || count > 100) {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  // Options
  const adaptiveDifficulty = formData.get("adaptive") === "on";
  const retryIncorrect = formData.get("retry") === "on";

  // Create custom session
  const session = createCustomSession(selectedTypes, count, locale, {
    adaptiveDifficulty,
    retryIncorrect,
    retryAtEnd: true,
  });

  if (!session) {
    return redirect(getLocalizedPath("/auswahl", locale));
  }

  // Redirect to test page
  return redirect(getLocalizedPath(`/test?session=${session.id}`, locale));
};
