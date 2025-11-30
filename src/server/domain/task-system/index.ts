/**
 * Rechenkiste Task System
 *
 * Einheitliches Interface für alle Aufgabentypen.
 *
 * Verwendung:
 * ```ts
 * import { initTaskSystem, taskGenerator, taskRegistry } from "@domain/task-system";
 *
 * // Einmalig beim Start
 * initTaskSystem();
 *
 * // Aufgaben generieren
 * const tasks = taskGenerator.generateMany(3, 10, "de");
 *
 * // Aufgabe validieren
 * const result = task.validate(userAnswer);
 * if (!result.isCorrect) {
 *   console.log("Hinweis:", task.getHint());
 * }
 * ```
 */

// Interfaces
export type {
  Grade,
  TaskCategory,
  TaskDefinition,
  TaskInstance,
  TaskGenerator,
  TaskRegistry,
  TaskRenderer,
  TaskRenderInfo,
  ValidationResult,
} from "./interfaces";

// Registry & Generator
export { taskRegistry } from "./registry";
export { taskGenerator } from "./generator";

// Base Task
export { BaseTask, generateId } from "./base-task";
export type {
  ArithmeticData,
  WordProblemData,
  GeometryData,
  NumberSenseData,
} from "./base-task";

// Task Definitions
export { registerAllTasks, allTaskDefinitions } from "./tasks";

// Initialisierung
import { registerAllTasks } from "./tasks";
import { taskRegistry } from "./registry";

let initialized = false;

export function initTaskSystem(): void {
  if (initialized) {
    return;
  }

  // Registriere alle Aufgabentypen
  registerAllTasks();

  initialized = true;
  console.log(
    `[TaskSystem] Initialized with ${taskRegistry.getAll().length} task definitions`,
  );
}
