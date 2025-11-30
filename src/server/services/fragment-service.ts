import {
  createAstroRuntime,
  type AstroRuntime,
} from "@casoon/fragment-renderer";
import { ahaStackPreset } from "@casoon/fragment-renderer/presets/aha-stack";
import type { Locale } from "@i18n/translations";

// Singleton runtime instance
let runtime: AstroRuntime | null = null;

export function getRuntime(locale: Locale = "de"): AstroRuntime {
  if (!runtime) {
    const preset = ahaStackPreset({
      locale,
      htmxHeaders: true,
    });

    runtime = createAstroRuntime({
      baseContext: preset.baseContext,
      services: preset.services,
    });
  }

  return runtime;
}

export interface HtmxService {
  getResponseHeaders(options?: {
    retarget?: string;
    reswap?: string;
    trigger?: string;
    refresh?: boolean;
    redirect?: string;
    pushUrl?: string;
  }): Record<string, string>;
  isHtmxRequest(request: Request): boolean;
  getTriggerInfo(request: Request): {
    id: string | null;
    name: string | null;
    target: string | null;
    currentUrl: string | null;
  };
}

export async function getHtmxService(
  locale: Locale = "de",
): Promise<HtmxService> {
  const rt = getRuntime(locale);
  return rt.getService<HtmxService>("htmx");
}
