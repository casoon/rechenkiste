import { describe, expect, it } from "vitest";
import {
  initTaskSystem,
  taskRegistry,
  rehydrateTask,
  type TaskInstance,
} from "./index";

initTaskSystem();

function answerFor(task: TaskInstance): string {
  if (task.inputType === "multiple-choice") {
    const expected = String(task.getCorrectAnswer());
    const hit = task.choices?.find(
      (c) =>
        String(c.value).toLowerCase() === expected.toLowerCase() ||
        String(c.label).toLowerCase() === expected.toLowerCase(),
    );
    return hit?.id ?? "";
  }
  if (task.inputType === "drag-drop") {
    const map: Record<string, string> = {};
    for (const item of task.dragItems ?? []) map[item.id] = item.correctTarget;
    return JSON.stringify(map);
  }
  return String(task.getCorrectAnswer());
}

describe("rehydrateTask", () => {
  it("accepts the correct answer for every task type after a session round trip", () => {
    const broken: string[] = [];

    for (const def of taskRegistry.getAll()) {
      for (let i = 0; i < 5; i++) {
        const original = def.generate("de");
        const restored = rehydrateTask({
          id: original.id,
          typeId: original.typeId,
          category: original.category,
          grade: original.grade,
          locale: original.locale,
          question: original.question,
          data: JSON.parse(JSON.stringify(original.data)),
          inputType: original.inputType,
          inputLabel: original.inputLabel,
          choices: original.choices,
          dragItems: original.dragItems,
          dropTargets: original.dropTargets,
        });

        if (!restored) {
          broken.push(`${def.typeId}: nicht rekonstruierbar`);
          break;
        }
        const answer = answerFor(restored);
        if (!restored.validate(answer).isCorrect) {
          broken.push(`${def.typeId}: "${answer}" gilt als falsch`);
          break;
        }
        if (restored.getHint() === undefined) {
          broken.push(`${def.typeId}: kein Hinweis`);
          break;
        }
      }
    }

    expect(broken).toEqual([]);
  });
});
