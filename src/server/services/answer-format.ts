import type { TaskInstance } from "@domain/task-system";
import type { SerializedTask } from "@domain/session";

type AnyTask = SerializedTask | TaskInstance;

function formatAssignments(answer: string, task: AnyTask): string | null {
  if (!task.dragItems || !task.dropTargets) return null;
  try {
    const assignments = JSON.parse(answer) as Record<string, string>;
    const parts: string[] = [];
    for (const [itemId, targetId] of Object.entries(assignments)) {
      const item = task.dragItems.find((i) => i.id === itemId);
      const target = task.dropTargets.find((drop) => drop.id === targetId);
      if (item && target) {
        parts.push(`${item.content} → ${target.label}`);
      }
    }
    return parts.join(", ");
  } catch {
    return answer;
  }
}

export function formatUserAnswer(
  answer: string | number,
  task: AnyTask,
): string {
  const answerStr = String(answer);

  if (task.inputType === "multiple-choice" && task.choices) {
    const choice = task.choices.find((c) => c.id === answerStr);
    if (choice) return choice.label;
  }

  if (task.inputType === "drag-drop") {
    const formatted = formatAssignments(answerStr, task);
    if (formatted !== null) return formatted;
  }

  if (task.typeId?.includes("money") && !answerStr.includes("€")) {
    return `${answerStr} €`;
  }

  return answerStr;
}

export function formatCorrectAnswer(
  answer: string | number,
  task: AnyTask,
): string {
  const answerStr = String(answer);

  if (task.inputType === "drag-drop") {
    const formatted = formatAssignments(answerStr, task);
    if (formatted !== null) return formatted;
  }

  return answerStr;
}

export function resultFeedback(percent: number): {
  feedbackKey: "excellent" | "great" | "good" | "keepPracticing";
  stars: number;
} {
  if (percent >= 90) return { feedbackKey: "excellent", stars: 5 };
  if (percent >= 70) return { feedbackKey: "great", stars: 4 };
  if (percent >= 50) return { feedbackKey: "good", stars: 3 };
  return { feedbackKey: "keepPracticing", stars: 2 };
}

/** Entfernt eingebettete SVGs, damit in der Durchsicht nur der Fragetext steht */
export function questionText(task: AnyTask): string {
  const data = task.data as { story?: string } | undefined;
  const text =
    task.category === "word-problem" && data?.story ? data.story : task.question;
  return text?.includes("<svg")
    ? text.replace(/<svg[\s\S]*?<\/svg>/gi, "").trim()
    : text;
}
