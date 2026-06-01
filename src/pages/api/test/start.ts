import type { APIRoute } from "astro";
import {
  createSession,
  saveSession,
  type SessionOptions,
} from "@domain/session";
import type { Grade } from "@domain/task-system";
import type { Locale } from "@i18n/translations";
import { getLocalizedPath } from "@i18n/translations";

type StartParams = {
  get(name: string): FormDataEntryValue | string | null;
};

async function startTest(context: Parameters<APIRoute>[0], params: StartParams) {
  const { redirect } = context;

  const grade = parseInt(params.get("grade") as string, 10) as Grade;
  const count = parseInt(params.get("count") as string, 10);
  const locale = (params.get("locale") as Locale) || "de";

  const adaptiveDifficulty = params.get("adaptive") === "on";
  const retryIncorrect = params.get("retry") === "on";

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
  await saveSession(context, session);

  return redirect(getLocalizedPath("/test", locale));
}

export const GET: APIRoute = async (context) => {
  return startTest(context, context.url.searchParams);
};

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  return startTest(context, formData);
};
