import type { TaskInstance } from "@domain/task-system";

export type AnswerInputMode = "none" | "text" | "decimal";

export interface AnswerInputConfig {
  /** Ziffernblock statt Tastatur */
  numpad: boolean;
  inputmode: AnswerInputMode;
  /** Zeichen, die beim Tippen verworfen werden (leer beim Ziffernblock) */
  pattern: string;
  /** Zwei Zahlenfelder "Ergebnis" und "Rest" statt einem */
  remainder: boolean;
}

/** Kanonische Form einer Antwort mit Rest — so prüft DivisionRemainderTask */
const REMAINDER_ANSWER = /^\d+ Rest \d+$/;

/** Fügt Ergebnis und Rest zu der Antwort zusammen, die die Aufgabe erwartet */
export function composeRemainderAnswer(
  quotient: string,
  remainder: string,
): string {
  return `${quotient.trim()} Rest ${remainder.trim()}`;
}

/**
 * Die Form der erwarteten Antwort bestimmt die Eingabe — nicht typeId oder
 * Fragetext. "time-span-*" etwa heißt "time", erwartet aber eine blanke Zahl,
 * und "3/4 als Dezimalzahl" enthält ein "/", will aber keinen Bruch.
 */
export function resolveAnswerInput(task: TaskInstance): AnswerInputConfig {
  const expected = String(task.getCorrectAnswer() ?? "");

  // Ziffernblock, wenn eine reine Zahl ohne Vorzeichen erwartet wird
  if (/^\d{1,8}$/.test(expected)) {
    return { numpad: true, inputmode: "none", pattern: "", remainder: false };
  }

  // "6 Rest 3" bekommt zwei beschriftete Zahlenfelder: in einem Feld wäre
  // weder das Format erkennbar noch "Rest" eintippbar.
  if (REMAINDER_ANSWER.test(expected)) {
    return { numpad: true, inputmode: "none", pattern: "", remainder: true };
  }

  const needsTimeInput = expected.includes(":");
  const needsFractionInput = !needsTimeInput && expected.includes("/");

  // Uhrzeiten brauchen ":" und Brüche "/" — beide Zeichen fehlen auf den
  // numerischen Tastaturen von iOS und Android, deshalb dort inputmode="text".
  return {
    numpad: false,
    remainder: false,
    inputmode: needsTimeInput || needsFractionInput ? "text" : "decimal",
    pattern: needsTimeInput
      ? "[^0-9:]"
      : needsFractionInput
        ? "[^0-9/]"
        : "[^0-9,.\\-]",
  };
}
