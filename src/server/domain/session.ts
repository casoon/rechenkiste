/**
 * Session Management
 *
 * Verwaltet Test-Sessions mit dem neuen Task-System
 */

import type { Locale } from "@i18n/translations";
import {
  type Grade,
  type TaskInstance,
  type ValidationResult,
  initTaskSystem,
  taskGenerator,
  taskRegistry,
} from "@domain/task-system";

// Initialisiere Task-System
initTaskSystem();

// Session-Ergebnis für eine Aufgabe
export interface TaskResultRecord {
  taskId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string | number;
  hint?: string;
  // Für Wiederholung
  attempts: number;
  isRetry: boolean;
}

// Session-Optionen
export interface SessionOptions {
  adaptiveDifficulty?: boolean; // Schwierigkeit anpassen
  retryIncorrect?: boolean; // Falsche Aufgaben wiederholen
  retryAtEnd?: boolean; // Wiederholung am Ende statt sofort
}

// Test-Session
export interface TestSession {
  id: string;
  grade: Grade;
  totalTasks: number;
  currentIndex: number;
  tasks: TaskInstance[];
  results: TaskResultRecord[];
  locale: Locale;
  // Neue Features
  options: SessionOptions;
  currentDifficulty: Grade; // Aktuelle angepasste Schwierigkeit
  consecutiveCorrect: number; // Aufeinanderfolgende richtige Antworten
  consecutiveIncorrect: number; // Aufeinanderfolgende falsche Antworten
  incorrectTaskIds: string[]; // IDs falscher Aufgaben für Wiederholung
  retryMode: boolean; // Sind wir im Wiederholungsmodus?
}

// In-Memory Store für Sessions
const sessions = new Map<string, TestSession>();

// ID-Generator
function generateSessionId(): string {
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Erstellt eine neue Test-Session
 */
export function createSession(
  grade: Grade,
  taskCount: number,
  locale: Locale,
  options: SessionOptions = {},
): TestSession {
  const id = generateSessionId();
  const tasks = taskGenerator.generateMany(grade, taskCount, locale);

  const session: TestSession = {
    id,
    grade,
    totalTasks: taskCount,
    currentIndex: 0,
    tasks,
    results: [],
    locale,
    // Neue Features
    options: {
      adaptiveDifficulty: options.adaptiveDifficulty ?? false,
      retryIncorrect: options.retryIncorrect ?? false,
      retryAtEnd: options.retryAtEnd ?? true,
    },
    currentDifficulty: grade,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    incorrectTaskIds: [],
    retryMode: false,
  };

  sessions.set(id, session);
  return session;
}

/**
 * Erstellt eine benutzerdefinierte Session mit ausgewählten Aufgabentypen
 */
export function createCustomSession(
  taskTypeIds: string[],
  taskCount: number,
  locale: Locale,
  options: SessionOptions = {},
): TestSession | null {
  // Validiere Task-Types
  const validDefinitions = taskTypeIds
    .map((id) => taskRegistry.get(id))
    .filter((def): def is NonNullable<typeof def> => def !== undefined);

  if (validDefinitions.length === 0) {
    return null;
  }

  const id = generateSessionId();

  // Generiere Aufgaben gleichgewichtet aus den ausgewählten Typen
  const tasks: TaskInstance[] = [];
  for (let i = 0; i < taskCount; i++) {
    // Wähle zufällig einen der ausgewählten Aufgabentypen (gleichgewichtet)
    const randomIndex = Math.floor(Math.random() * validDefinitions.length);
    const definition = validDefinitions[randomIndex];
    const task = definition.generate(locale);
    tasks.push(task);
  }

  // Bestimme die durchschnittliche/höchste Klassenstufe für adaptive Schwierigkeit
  const grades = validDefinitions.map((d) => d.grade);
  const avgGrade = Math.round(
    grades.reduce((a, b) => a + b, 0) / grades.length,
  ) as Grade;

  const session: TestSession = {
    id,
    grade: avgGrade,
    totalTasks: taskCount,
    currentIndex: 0,
    tasks,
    results: [],
    locale,
    options: {
      adaptiveDifficulty: options.adaptiveDifficulty ?? false,
      retryIncorrect: options.retryIncorrect ?? false,
      retryAtEnd: options.retryAtEnd ?? true,
    },
    currentDifficulty: avgGrade,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    incorrectTaskIds: [],
    retryMode: false,
  };

  sessions.set(id, session);
  return session;
}

/**
 * Holt eine Session
 */
export function getSession(id: string): TestSession | undefined {
  return sessions.get(id);
}

/**
 * Gibt die aktuelle Aufgabe zurück
 */
export function getCurrentTask(session: TestSession): TaskInstance | undefined {
  return session.tasks[session.currentIndex];
}

/**
 * Passt die Schwierigkeit basierend auf Performance an
 */
function adjustDifficulty(session: TestSession): void {
  if (!session.options.adaptiveDifficulty) return;

  // Nach 3 richtigen Antworten: Schwierigkeit erhöhen
  if (session.consecutiveCorrect >= 3 && session.currentDifficulty < 5) {
    session.currentDifficulty = Math.min(
      5,
      session.currentDifficulty + 1,
    ) as Grade;
    session.consecutiveCorrect = 0;

    // Neue schwierigere Aufgaben für die restlichen Slots generieren
    const remaining = session.totalTasks - session.currentIndex - 1;
    if (remaining > 0) {
      const newTasks = taskGenerator.generateMany(
        session.currentDifficulty,
        Math.min(remaining, 3), // Maximal 3 neue Aufgaben
        session.locale,
      );
      // Ersetze einige der verbleibenden Aufgaben
      for (
        let i = 0;
        i < newTasks.length &&
        session.currentIndex + 1 + i < session.tasks.length;
        i++
      ) {
        session.tasks[session.currentIndex + 1 + i] = newTasks[i];
      }
    }
  }

  // Nach 3 falschen Antworten: Schwierigkeit verringern
  if (session.consecutiveIncorrect >= 3 && session.currentDifficulty > 1) {
    session.currentDifficulty = Math.max(
      1,
      session.currentDifficulty - 1,
    ) as Grade;
    session.consecutiveIncorrect = 0;

    // Neue einfachere Aufgaben für die restlichen Slots generieren
    const remaining = session.totalTasks - session.currentIndex - 1;
    if (remaining > 0) {
      const newTasks = taskGenerator.generateMany(
        session.currentDifficulty,
        Math.min(remaining, 3),
        session.locale,
      );
      for (
        let i = 0;
        i < newTasks.length &&
        session.currentIndex + 1 + i < session.tasks.length;
        i++
      ) {
        session.tasks[session.currentIndex + 1 + i] = newTasks[i];
      }
    }
  }
}

/**
 * Prüft eine Antwort und speichert das Ergebnis
 */
export function submitAnswer(
  sessionId: string,
  answer: string,
): { result: ValidationResult; session: TestSession } | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const currentTask = session.tasks[session.currentIndex];
  if (!currentTask) return undefined;

  // Validiere mit dem neuen Task-System
  const result = currentTask.validate(answer);

  // Prüfe ob dies ein Wiederholungsversuch ist
  const existingResult = session.results.find(
    (r) => r.taskId === currentTask.id,
  );
  const attempts = existingResult ? existingResult.attempts + 1 : 1;
  const isRetry = session.retryMode || existingResult !== undefined;

  // Speichere Ergebnis
  const record: TaskResultRecord = {
    taskId: currentTask.id,
    userAnswer: answer,
    isCorrect: result.isCorrect,
    correctAnswer: result.correctAnswer,
    hint: result.hint,
    attempts,
    isRetry,
  };

  // Bei Wiederholung: altes Ergebnis aktualisieren
  if (existingResult) {
    const idx = session.results.indexOf(existingResult);
    session.results[idx] = record;
  } else {
    session.results.push(record);
  }

  // Adaptive Schwierigkeit: Zähler aktualisieren
  if (result.isCorrect) {
    session.consecutiveCorrect++;
    session.consecutiveIncorrect = 0;
  } else {
    session.consecutiveIncorrect++;
    session.consecutiveCorrect = 0;

    // Falsche Aufgabe für spätere Wiederholung merken
    if (
      session.options.retryIncorrect &&
      !session.incorrectTaskIds.includes(currentTask.id)
    ) {
      session.incorrectTaskIds.push(currentTask.id);
    }
  }

  // Schwierigkeit anpassen
  adjustDifficulty(session);

  return { result, session };
}

/**
 * Geht zur nächsten Aufgabe
 */
export function nextTask(sessionId: string): TestSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.currentIndex++;

  // Prüfe ob wir in den Wiederholungsmodus wechseln sollen
  if (
    session.options.retryIncorrect &&
    session.options.retryAtEnd &&
    session.currentIndex >= session.totalTasks &&
    session.incorrectTaskIds.length > 0 &&
    !session.retryMode
  ) {
    // Wechsle in Wiederholungsmodus
    session.retryMode = true;
    session.currentIndex = 0;

    // Ersetze Tasks mit den falschen Aufgaben
    const incorrectTasks = session.incorrectTaskIds
      .map((id) => session.tasks.find((t) => t.id === id))
      .filter((t): t is TaskInstance => t !== undefined);

    session.tasks = incorrectTasks;
    session.totalTasks = incorrectTasks.length;
    session.incorrectTaskIds = []; // Reset für diese Runde
  }

  return session;
}

/**
 * Prüft ob der Test abgeschlossen ist
 */
export function isTestComplete(session: TestSession): boolean {
  // Wenn retryAtEnd aktiv und noch Fehler vorhanden, ist der Test noch nicht fertig
  if (
    session.options.retryIncorrect &&
    session.options.retryAtEnd &&
    !session.retryMode &&
    session.currentIndex >= session.totalTasks &&
    session.incorrectTaskIds.length > 0
  ) {
    return false; // nextTask wird den Wiederholungsmodus aktivieren
  }

  return session.currentIndex >= session.totalTasks;
}

/**
 * Gibt Informationen über den Wiederholungsmodus zurück
 */
export function getRetryInfo(session: TestSession): {
  isRetryMode: boolean;
  incorrectCount: number;
  originalTotal: number;
} {
  return {
    isRetryMode: session.retryMode,
    incorrectCount: session.incorrectTaskIds.length,
    originalTotal: session.results.length,
  };
}

/**
 * Gibt die Ergebnisse zurück
 */
export function getResults(session: TestSession): {
  correct: number;
  total: number;
  percent: number;
  results: TaskResultRecord[];
  tasks: TaskInstance[];
} {
  const correct = session.results.filter((r) => r.isCorrect).length;
  const total = session.totalTasks;
  const percent = Math.round((correct / total) * 100);

  return {
    correct,
    total,
    percent,
    results: session.results,
    tasks: session.tasks,
  };
}

/**
 * Löscht eine Session
 */
export function deleteSession(id: string): void {
  sessions.delete(id);
}

// Legacy-Exporte für Abwärtskompatibilität
export type { Grade as DifficultyLevel } from "@domain/task-system";
