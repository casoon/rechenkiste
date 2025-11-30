/**
 * Session Management
 *
 * Verwaltet Test-Sessions mit dem neuen Task-System
 * Nutzt Astro Sessions für Cloudflare Workers Kompatibilität
 */

import type { Locale } from "@i18n/translations";
import {
  type Grade,
  type TaskInstance,
  type ValidationResult,
  type TaskCategory,
  type InputType,
  type ChoiceOption,
  type DragDropItem,
  type DragDropTarget,
  initTaskSystem,
  taskGenerator,
  taskRegistry,
} from "@domain/task-system";
import type { AstroGlobal } from "astro";

// Initialisiere Task-System
initTaskSystem();

// Session-Ergebnis für eine Aufgabe
export interface TaskResultRecord {
  taskId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string | number;
  hint?: string;
  attempts: number;
  isRetry: boolean;
}

// Session-Optionen
export interface SessionOptions {
  adaptiveDifficulty?: boolean;
  retryIncorrect?: boolean;
  retryAtEnd?: boolean;
}

// Serialisierbare Task-Daten (für Session-Speicherung)
export interface SerializedTask {
  id: string;
  typeId: string;
  question: string;
  correctAnswer: string | number;
  hint: string;
  category: TaskCategory;
  grade: Grade;
  locale: Locale;
  data?: unknown;
  // Input-Typ und zugehörige Daten
  inputType?: InputType;
  inputLabel?: string;
  choices?: ChoiceOption[];
  dragItems?: DragDropItem[];
  dropTargets?: DragDropTarget[];
}

// Test-Session (serialisierbar für KV)
export interface TestSession {
  id: string;
  grade: Grade;
  totalTasks: number;
  currentIndex: number;
  tasks: SerializedTask[];
  results: TaskResultRecord[];
  locale: Locale;
  options: SessionOptions;
  currentDifficulty: Grade;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  incorrectTaskIds: string[];
  retryMode: boolean;
}

// ID-Generator
function generateSessionId(): string {
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

// Serialisiert eine TaskInstance für die Speicherung
function serializeTask(task: TaskInstance): SerializedTask {
  return {
    id: task.id,
    typeId: task.typeId,
    question: task.question,
    correctAnswer: task.getCorrectAnswer(),
    hint: task.getHint(),
    category: task.category,
    grade: task.grade,
    locale: task.locale,
    data: task.data,
    inputType: task.inputType,
    inputLabel: task.inputLabel,
    choices: task.choices,
    dragItems: task.dragItems,
    dropTargets: task.dropTargets,
  };
}

// Erstellt eine TaskInstance aus serialisierten Daten
function deserializeTask(data: SerializedTask): TaskInstance {
  return {
    id: data.id,
    typeId: data.typeId,
    question: data.question,
    category: data.category,
    grade: data.grade,
    locale: data.locale,
    data: data.data,
    inputType: data.inputType,
    inputLabel: data.inputLabel,
    choices: data.choices,
    dragItems: data.dragItems,
    dropTargets: data.dropTargets,
    validate: (answer: string): ValidationResult => {
      const correctAnswer = data.correctAnswer;

      // Für Drag-Drop: JSON-Vergleich
      if (data.inputType === "drag-drop" && data.dragItems) {
        try {
          const userAssignments = JSON.parse(answer);
          // Prüfe ob alle Items korrekt zugeordnet sind
          let allCorrect = true;
          for (const item of data.dragItems) {
            if (userAssignments[item.id] !== item.correctTarget) {
              allCorrect = false;
              break;
            }
          }
          return {
            isCorrect: allCorrect,
            correctAnswer,
            userAnswer: answer,
            hint: allCorrect ? undefined : data.hint,
          };
        } catch {
          return {
            isCorrect: false,
            correctAnswer,
            userAnswer: answer,
            hint: data.hint,
          };
        }
      }

      // Standard-Vergleich
      const normalizedAnswer = answer.trim().toLowerCase();
      const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
      const isCorrect = normalizedAnswer === normalizedCorrect;
      return {
        isCorrect,
        correctAnswer,
        userAnswer: answer,
        hint: isCorrect ? undefined : data.hint,
      };
    },
    getHint: () => data.hint,
    getCorrectAnswer: () => data.correctAnswer,
  };
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
  const taskInstances = taskGenerator.generateMany(grade, taskCount, locale);
  const tasks = taskInstances.map(serializeTask);

  const session: TestSession = {
    id,
    grade,
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
    currentDifficulty: grade,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    incorrectTaskIds: [],
    retryMode: false,
  };

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
  const validDefinitions = taskTypeIds
    .map((id) => taskRegistry.get(id))
    .filter((def): def is NonNullable<typeof def> => def !== undefined);

  if (validDefinitions.length === 0) {
    return null;
  }

  const id = generateSessionId();

  const taskInstances: TaskInstance[] = [];
  const usedTypeIds = new Set<string>();

  for (let i = 0; i < taskCount; i++) {
    // Filtere bereits verwendete Typen heraus
    const unusedDefinitions = validDefinitions.filter(
      (def) => !usedTypeIds.has(def.typeId),
    );

    // Falls alle Typen verwendet wurden, erlaube Wiederholungen
    const candidates =
      unusedDefinitions.length > 0 ? unusedDefinitions : validDefinitions;

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const definition = candidates[randomIndex];
    usedTypeIds.add(definition.typeId);
    const task = definition.generate(locale);
    taskInstances.push(task);
  }

  const tasks = taskInstances.map(serializeTask);

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

  return session;
}

/**
 * Speichert eine Session in Astro Session
 */
export async function saveSession(
  astro: AstroGlobal,
  session: TestSession,
): Promise<void> {
  const astroSession = await astro.session;
  if (astroSession) {
    await astroSession.set("testSession", session);
  }
}

/**
 * Lädt eine Session aus Astro Session
 */
export async function loadSession(
  astro: AstroGlobal,
): Promise<TestSession | undefined> {
  const astroSession = await astro.session;
  if (astroSession) {
    return (await astroSession.get("testSession")) as TestSession | undefined;
  }
  return undefined;
}

/**
 * Gibt die aktuelle Aufgabe zurück
 */
export function getCurrentTask(session: TestSession): TaskInstance | undefined {
  const serialized = session.tasks[session.currentIndex];
  if (!serialized) return undefined;
  return deserializeTask(serialized);
}

/**
 * Gibt eine Aufgabe nach ID zurück
 */
export function getTaskById(
  session: TestSession,
  taskId: string,
): TaskInstance | undefined {
  const serialized = session.tasks.find((t) => t.id === taskId);
  if (!serialized) return undefined;
  return deserializeTask(serialized);
}

/**
 * Passt die Schwierigkeit basierend auf Performance an
 */
function adjustDifficulty(session: TestSession): void {
  if (!session.options.adaptiveDifficulty) return;

  if (session.consecutiveCorrect >= 3 && session.currentDifficulty < 5) {
    session.currentDifficulty = Math.min(
      5,
      session.currentDifficulty + 1,
    ) as Grade;
    session.consecutiveCorrect = 0;

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
        session.tasks[session.currentIndex + 1 + i] = serializeTask(
          newTasks[i],
        );
      }
    }
  }

  if (session.consecutiveIncorrect >= 3 && session.currentDifficulty > 1) {
    session.currentDifficulty = Math.max(
      1,
      session.currentDifficulty - 1,
    ) as Grade;
    session.consecutiveIncorrect = 0;

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
        session.tasks[session.currentIndex + 1 + i] = serializeTask(
          newTasks[i],
        );
      }
    }
  }
}

/**
 * Prüft eine Antwort und speichert das Ergebnis
 */
export function submitAnswer(
  session: TestSession,
  answer: string,
): ValidationResult | undefined {
  const currentTask = getCurrentTask(session);
  if (!currentTask) return undefined;

  const result = currentTask.validate(answer);

  const existingResult = session.results.find(
    (r) => r.taskId === currentTask.id,
  );
  const attempts = existingResult ? existingResult.attempts + 1 : 1;
  const isRetry = session.retryMode || existingResult !== undefined;

  const record: TaskResultRecord = {
    taskId: currentTask.id,
    userAnswer: answer,
    isCorrect: result.isCorrect,
    correctAnswer: result.correctAnswer,
    hint: result.hint,
    attempts,
    isRetry,
  };

  if (existingResult) {
    const idx = session.results.indexOf(existingResult);
    session.results[idx] = record;
  } else {
    session.results.push(record);
  }

  if (result.isCorrect) {
    session.consecutiveCorrect++;
    session.consecutiveIncorrect = 0;
  } else {
    session.consecutiveIncorrect++;
    session.consecutiveCorrect = 0;

    if (
      session.options.retryIncorrect &&
      !session.incorrectTaskIds.includes(currentTask.id)
    ) {
      session.incorrectTaskIds.push(currentTask.id);
    }
  }

  adjustDifficulty(session);

  return result;
}

/**
 * Geht zur nächsten Aufgabe
 */
export function nextTask(session: TestSession): void {
  session.currentIndex++;

  if (
    session.options.retryIncorrect &&
    session.options.retryAtEnd &&
    session.currentIndex >= session.totalTasks &&
    session.incorrectTaskIds.length > 0 &&
    !session.retryMode
  ) {
    session.retryMode = true;
    session.currentIndex = 0;

    const incorrectTasks = session.incorrectTaskIds
      .map((id) => session.tasks.find((t) => t.id === id))
      .filter((t): t is SerializedTask => t !== undefined);

    session.tasks = incorrectTasks;
    session.totalTasks = incorrectTasks.length;
    session.incorrectTaskIds = [];
  }
}

/**
 * Prüft ob der Test abgeschlossen ist
 */
export function isTestComplete(session: TestSession): boolean {
  if (
    session.options.retryIncorrect &&
    session.options.retryAtEnd &&
    !session.retryMode &&
    session.currentIndex >= session.totalTasks &&
    session.incorrectTaskIds.length > 0
  ) {
    return false;
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
  const total = session.results.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    correct,
    total,
    percent,
    results: session.results,
    tasks: session.tasks.map(deserializeTask),
  };
}

// Legacy-Exporte für Abwärtskompatibilität
export type { Grade as DifficultyLevel } from "@domain/task-system";
