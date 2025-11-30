/**
 * Task Types Index
 *
 * Exportiert alle Aufgabentypen und registriert sie
 */

import { taskRegistry } from "../registry";
import { arithmeticTasks } from "./arithmetic";
import { wordProblemTasks } from "./word-problems";
import { geometryTasks } from "./geometry";
import { numberSenseTasks } from "./number-sense";
import { measurementTasks } from "./measurements";
import { fractionTasks } from "./fractions";
import { visualTasks } from "./visual";
import { timeTasks } from "./time";
import { advancedTasks } from "./advanced";
import { interactiveTasks } from "./interactive";

// Alle Aufgabentypen
export const allTaskDefinitions = [
  ...arithmeticTasks,
  ...wordProblemTasks,
  ...geometryTasks,
  ...numberSenseTasks,
  ...measurementTasks,
  ...fractionTasks,
  ...visualTasks,
  ...timeTasks,
  ...advancedTasks,
  ...interactiveTasks,
];

// Registriere alle Aufgabentypen
export function registerAllTasks(): void {
  for (const definition of allTaskDefinitions) {
    taskRegistry.register(definition);
  }
}

// Re-exports
export * from "./arithmetic";
export * from "./word-problems";
export * from "./geometry";
export * from "./number-sense";
export * from "./measurements";
export * from "./fractions";
export * from "./visual";
export * from "./time";
export * from "./advanced";
export * from "./interactive";
