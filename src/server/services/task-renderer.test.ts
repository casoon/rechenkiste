import { describe, expect, it, vi } from "vitest";
import { initTaskSystem, taskRegistry } from "@domain/task-system";
import { renderTaskFragment } from "./task-renderer";

// Die Astro-Fragmente laufen nur im Astro-Build — hier zählen die Props,
// die der Renderer an sie übergibt.
vi.mock("@casoon/fragment-renderer", () => ({
  createAstroRuntime: () => ({
    renderToString: async ({ props }: { props: Record<string, unknown> }) =>
      String(props.questionHtml ?? props.svg ?? props.svgMarkup ?? ""),
  }),
}));
vi.mock("@casoon/fragment-renderer/presets/aha-stack", () => ({
  ahaStackPreset: () => ({}),
}));

initTaskSystem();

describe("renderTaskFragment", () => {
  it("gibt SVG-Grafiken als Markup aus, nie als escapten Quelltext", async () => {
    const broken: string[] = [];

    for (const def of taskRegistry.getAll()) {
      for (let i = 0; i < 5; i++) {
        const task = def.generate("de");
        if (!task.question.includes("<svg")) continue;

        const html = await renderTaskFragment(task, "session", "de");
        if (html.includes("&lt;") || !html.includes("<svg")) {
          broken.push(`${def.typeId} (${task.inputType})`);
          break;
        }
      }
    }

    expect(broken).toEqual([]);
  });
});
