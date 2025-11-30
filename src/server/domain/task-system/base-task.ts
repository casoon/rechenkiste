/**
 * Base Task - Abstrakte Basisklasse für Aufgaben
 *
 * Enthält gemeinsame Logik für alle Aufgabentypen.
 */

import type { Locale } from "@i18n/translations";
import type {
  Grade,
  TaskCategory,
  TaskInstance,
  ValidationResult,
  InputType,
  ChoiceOption,
  DragDropItem,
  DragDropTarget,
} from "./interfaces";

// ID-Generator
let idCounter = 0;
export function generateId(): string {
  idCounter++;
  return `task-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/**
 * Abstrakte Basisklasse für Aufgaben-Instanzen
 */
export abstract class BaseTask<TData = unknown> implements TaskInstance<TData> {
  readonly id: string;
  readonly typeId: string;
  readonly category: TaskCategory;
  readonly grade: Grade;
  readonly locale: Locale;
  readonly question: string;
  readonly data: TData;
  readonly inputType?: InputType;
  readonly choices?: ChoiceOption[];
  readonly dragItems?: DragDropItem[];
  readonly dropTargets?: DragDropTarget[];

  constructor(params: {
    typeId: string;
    category: TaskCategory;
    grade: Grade;
    locale: Locale;
    question: string;
    data: TData;
    inputType?: InputType;
    choices?: ChoiceOption[];
    dragItems?: DragDropItem[];
    dropTargets?: DragDropTarget[];
  }) {
    this.id = generateId();
    this.typeId = params.typeId;
    this.category = params.category;
    this.grade = params.grade;
    this.locale = params.locale;
    this.question = params.question;
    this.data = params.data;
    this.inputType = params.inputType;
    this.choices = params.choices;
    this.dragItems = params.dragItems;
    this.dropTargets = params.dropTargets;
  }

  abstract validate(userAnswer: string): ValidationResult;
  abstract getHint(): string;
  abstract getCorrectAnswer(): string | number;

  /**
   * Hilfsmethode: Parst eine numerische Antwort
   * Entfernt Einheiten wie cm³, cm², kg, m, l, etc.
   * Lehnt ungültige Zeichen (Buchstaben etc.) ab
   */
  protected parseNumericAnswer(userAnswer: string): number | null {
    // Einheiten entfernen (cm³, cm², m², ha, kg, g, l, ml, etc.)
    let normalized = userAnswer
      .replace(/\s+/g, "") // Leerzeichen entfernen
      .replace(/cm³|cm3|cm²|cm2|m³|m3|m²|m2|km²|km2/gi, "")
      .replace(/ha|mm|cm|dm|km|m/gi, "")
      .replace(/mg|kg|g|t/gi, "")
      .replace(/ml|l/gi, "")
      .replace(/€|euro|cent/gi, "")
      .replace(/stück|stuck|dutzend/gi, "")
      .replace(",", ".") // Komma durch Punkt für Dezimalzahlen
      .trim();

    // Prüfe ob nur gültige Zeichen übrig sind (Ziffern, Punkt, Minus)
    if (!/^-?\d*\.?\d+$/.test(normalized)) {
      return null;
    }

    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  }

  /**
   * Hilfsmethode: Vergleicht numerische Antworten mit Toleranz
   */
  protected compareNumeric(
    userAnswer: number,
    correctAnswer: number,
    tolerance: number = 0.001,
  ): boolean {
    return Math.abs(userAnswer - correctAnswer) <= tolerance;
  }
}

/**
 * Arithmetik-Aufgabe Daten
 */
export interface ArithmeticData {
  a: number;
  b: number;
  operator: "+" | "-" | "*" | "/";
  answer: number;
  // Optional: Bei Platzhalter-Aufgaben
  placeholder?: "a" | "b" | "result";
}

/**
 * Textaufgaben Daten
 */
export interface WordProblemData {
  story: string;
  answer: number;
  // Schritte zur Lösung
  steps?: string[];
}

/**
 * Geometrie-Aufgaben Daten
 */
export interface GeometryData {
  svgMarkup: string;
  prompt: string;
  answer: number;
  // Art der Geometrie-Aufgabe
  subtype: "count" | "perimeter" | "area" | "angle";
}

/**
 * Zahlenverständnis Daten
 */
export interface NumberSenseData {
  // Zahlenreihe, Vergleich, Nachbarzahlen, etc.
  subtype: "sequence" | "compare" | "neighbors" | "order";
  numbers: number[];
  answer: number | string;
  // Zusätzliche Informationen je nach Subtype
  extra?: Record<string, unknown>;
}
