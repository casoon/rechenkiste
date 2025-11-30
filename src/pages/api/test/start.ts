import type { APIRoute } from "astro";
import {
  createSession,
  saveSession,
  type SessionOptions,
} from "@domain/session";
import type { Grade } from "@domain/task-system";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";

export const POST: APIRoute = async (context) => {
  const { request, redirect } = context;
  const formData = await request.formData();

  const grade = parseInt(formData.get("grade") as string, 10) as Grade;
  const count = parseInt(formData.get("count") as string, 10);
  const locale = (formData.get("locale") as Locale) || "de";

  const adaptiveDifficulty = formData.get("adaptive") === "on";
  const retryIncorrect = formData.get("retry") === "on";

  if (isNaN(grade) || grade < 1 || grade > 5) {
    return redirect(getLocalizedPath("/", locale));
  }

  if (isNaN(count) || ![10, 20, 30].includes(count)) {
    return redirect(getLocalizedPath("/", locale));
  }

  const options: SessionOptions = {
    adaptiveDifficulty,
    retryIncorrect,
    retryAtEnd: true,
  };

  const session = createSession(grade, count, locale, options);

  // Speichere Session in Astro Session (KV)
  await saveSession(context as any, session);

  return redirect(getLocalizedPath("/test", locale));
};
