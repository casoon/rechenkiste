import type { APIRoute } from "astro";
import { createSession, type SessionOptions } from "@domain/session";
import type { Grade } from "@domain/task-system";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const grade = parseInt(formData.get("grade") as string, 10) as Grade;
  const count = parseInt(formData.get("count") as string, 10);
  const locale = (formData.get("locale") as Locale) || "de";

  // Neue Optionen
  const adaptiveDifficulty = formData.get("adaptive") === "on";
  const retryIncorrect = formData.get("retry") === "on";

  // Validate inputs
  if (isNaN(grade) || grade < 1 || grade > 5) {
    return redirect(getLocalizedPath("/", locale));
  }

  if (isNaN(count) || ![10, 20, 30].includes(count)) {
    return redirect(getLocalizedPath("/", locale));
  }

  // Session-Optionen
  const options: SessionOptions = {
    adaptiveDifficulty,
    retryIncorrect,
    retryAtEnd: true,
  };

  // Create session with new task system
  const session = createSession(grade, count, locale, options);

  // Redirect to test page
  return redirect(getLocalizedPath(`/test?session=${session.id}`, locale));
};
