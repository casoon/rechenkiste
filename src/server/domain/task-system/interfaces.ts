/**
 * Rechenkiste - Unified Task System
 *
 * Dieses Modul definiert ein einheitliches Interface für alle Aufgabentypen.
 * Jede Aufgabe:
 * - Hat eine einheitliche Struktur (Input/Output)
 * - Validiert ihre eigene Antwort
 * - Liefert Hilfestellungen bei falscher Antwort
 * - Kann via Fragment-Renderer visualisiert werden
 */

import type { Locale } from "@i18n/translations";

// Schwierigkeitsstufen entsprechend Klassenstufen 1-5
export type Grade = 1 | 2 | 3 | 4 | 5;

// Kategorien für Aufgaben
export type TaskCategory =
  | "arithmetic" // Rechnen
  | "word-problem" // Textaufgaben
  | "geometry" // Geometrie
  | "number-sense" // Zahlenverständnis
  | "measurement" // Maßeinheiten
  | "data"; // Daten und Diagramme

// Eingabetypen für Aufgaben
export type InputType =
  | "text" // Freie Texteingabe (Standard)
  | "multiple-choice" // Auswahl aus Optionen
  | "drag-drop"; // Drag & Drop Zuordnung

// Multiple-Choice Option
export interface ChoiceOption {
  id: string;
  label: string;
  value: string | number;
}

// Drag-Drop Item
export interface DragDropItem {
  id: string;
  content: string;
  correctTarget: string;
}

// Drag-Drop Target
export interface DragDropTarget {
  id: string;
  label: string;
}

// Das Ergebnis einer Antwort-Validierung
export interface ValidationResult {
  isCorrect: boolean;
  correctAnswer: string | number;
  userAnswer: string | number;
  // Hilfe bei falscher Antwort
  hint?: string;
  // Lösungsweg für Erklärung
  explanation?: string;
  // Zusätzliche Informationen für detailliertes Feedback
  details?: Record<string, unknown>;
}

// Definition eines Aufgabentyps (Factory)
export interface TaskDefinition<TData = unknown> {
  // Eindeutige ID des Aufgabentyps
  readonly typeId: string;
  // Kategorie der Aufgabe
  readonly category: TaskCategory;
  // Klassenstufe für die diese Aufgabe konzipiert ist
  readonly grade: Grade;
  // Beschreibung des Aufgabentyps
  readonly description: string;

  // Generiert eine neue Aufgabe dieses Typs
  generate(locale: Locale): TaskInstance<TData>;
}

// Eine konkrete Aufgaben-Instanz
export interface TaskInstance<TData = unknown> {
  // Eindeutige ID dieser Aufgabe
  readonly id: string;
  // Referenz auf den Aufgabentyp
  readonly typeId: string;
  // Kategorie (von TaskDefinition)
  readonly category: TaskCategory;
  // Schwierigkeit (von TaskDefinition)
  readonly grade: Grade;
  // Die Aufgabenstellung als Text
  readonly question: string;
  // Lokalisierte Sprache
  readonly locale: Locale;
  // Typ-spezifische Daten für die Visualisierung
  readonly data: TData;
  // Eingabetyp (Standard: text)
  readonly inputType?: InputType;
  // Label für das Eingabefeld
  readonly inputLabel?: string;
  // Multiple-Choice Optionen (wenn inputType = "multiple-choice")
  readonly choices?: ChoiceOption[];
  // Drag-Drop Items (wenn inputType = "drag-drop")
  readonly dragItems?: DragDropItem[];
  // Drag-Drop Targets (wenn inputType = "drag-drop")
  readonly dropTargets?: DragDropTarget[];

  // Validiert die Antwort des Benutzers
  validate(userAnswer: string): ValidationResult;

  // Generiert einen Hinweis ohne die Lösung zu verraten
  getHint(): string;

  // Gibt die korrekte Antwort zurück
  getCorrectAnswer(): string | number;
}

// Render-Information für Fragment-Renderer
export interface TaskRenderInfo {
  // ID des Fragment-Components
  componentId: string;
  // Props für das Component
  props: Record<string, unknown>;
}

// Service zum Rendern von Aufgaben
export interface TaskRenderer {
  // Rendert eine Aufgabe als HTML
  renderTask(task: TaskInstance, sessionId: string): Promise<string>;
  // Rendert Feedback als HTML
  renderFeedback(
    result: ValidationResult,
    nextUrl: string,
    isComplete: boolean,
    locale: Locale,
  ): Promise<string>;
}

// Registry für Aufgabentypen
export interface TaskRegistry {
  // Registriert einen neuen Aufgabentyp
  register(definition: TaskDefinition): void;
  // Gibt alle Aufgabentypen für eine Klassenstufe zurück
  getByGrade(grade: Grade): TaskDefinition[];
  // Gibt alle Aufgabentypen einer Kategorie zurück
  getByCategory(category: TaskCategory): TaskDefinition[];
  // Gibt einen spezifischen Aufgabentyp zurück
  get(typeId: string): TaskDefinition | undefined;
  // Gibt alle registrierten Aufgabentypen zurück
  getAll(): TaskDefinition[];
}

// Generator-Service für Aufgaben
export interface TaskGenerator {
  // Generiert eine einzelne Aufgabe für eine Klassenstufe
  generateOne(grade: Grade, locale: Locale): TaskInstance;
  // Generiert mehrere Aufgaben mit gewichteter Verteilung
  generateMany(grade: Grade, count: number, locale: Locale): TaskInstance[];
}
