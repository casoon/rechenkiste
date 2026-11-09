/**
 * Task Generator - Erzeugt Aufgaben mit gewichteter Verteilung
 */

import type { Locale } from "@i18n/translations";
import type {
  Grade,
  TaskDefinition,
  TaskGenerator,
  TaskInstance,
} from "./interfaces";
import { taskRegistry } from "./registry";

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Erzeugt eine Aufgabe, die in dieser Session noch nicht vorkam.
 * Kleine Aufgabentypen (z. B. "81 ÷ 9") würfeln sonst leicht Doppelte; nach
 * einigen Versuchen wird die Wiederholung hingenommen.
 */
export function generateUnique(
  definition: TaskDefinition,
  locale: Locale,
  usedTasks: Set<string>,
): TaskInstance {
  // Frage allein reicht nicht: Sortieraufgaben teilen den Fragetext
  const key = (task: TaskInstance) =>
    `${task.question}|${JSON.stringify(task.data)}`;
  let task = definition.generate(locale);
  for (let attempt = 0; attempt < 20 && usedTasks.has(key(task)); attempt++) {
    task = definition.generate(locale);
  }
  usedTasks.add(key(task));
  return task;
}

/**
 * Gewichtete Zufallsauswahl der Klassenstufe
 * - 70% aktuelle Klassenstufe
 * - 30% eine Stufe darunter (falls vorhanden)
 */
function weightedRandomGrade(maxGrade: Grade): Grade {
  const rand = Math.random();

  if (rand < 0.7 || maxGrade === 1) {
    return maxGrade;
  } else {
    return (maxGrade - 1) as Grade;
  }
}

class TaskGeneratorImpl implements TaskGenerator {
  generateOne(grade: Grade, locale: Locale): TaskInstance {
    const selectedGrade = weightedRandomGrade(grade);
    const definitions = taskRegistry.getByGrade(selectedGrade);

    if (definitions.length === 0) {
      throw new Error(`No task definitions found for grade ${selectedGrade}`);
    }

    const definition = randomChoice(definitions);
    return definition.generate(locale);
  }

  generateMany(grade: Grade, count: number, locale: Locale): TaskInstance[] {
    const tasks: TaskInstance[] = [];
    const usedTypeIds = new Set<string>();
    const usedTasks = new Set<string>();

    // Sammle alle verfügbaren Task-Definitionen für die relevanten Klassenstufen
    const availableDefinitions = [
      ...taskRegistry.getByGrade(grade),
      ...(grade > 1 ? taskRegistry.getByGrade((grade - 1) as Grade) : []),
    ];

    for (let i = 0; i < count; i++) {
      // Filtere bereits verwendete Typen heraus
      const unusedDefinitions = availableDefinitions.filter(
        (def) => !usedTypeIds.has(def.typeId),
      );

      // Falls alle Typen verwendet wurden, erlaube Wiederholungen
      const candidates =
        unusedDefinitions.length > 0 ? unusedDefinitions : availableDefinitions;

      // Gewichtete Auswahl: bevorzuge aktuelle Klassenstufe (70%)
      const currentGradeDefs = candidates.filter((d) => d.grade === grade);
      const lowerGradeDefs = candidates.filter((d) => d.grade < grade);

      let definition;
      if (
        currentGradeDefs.length > 0 &&
        (lowerGradeDefs.length === 0 || Math.random() < 0.7)
      ) {
        definition = randomChoice(currentGradeDefs);
      } else if (lowerGradeDefs.length > 0) {
        definition = randomChoice(lowerGradeDefs);
      } else {
        definition = randomChoice(candidates);
      }

      usedTypeIds.add(definition.typeId);
      tasks.push(generateUnique(definition, locale, usedTasks));
    }

    return tasks;
  }

  // Generiert eine Aufgabe eines bestimmten Typs
  generateByType(typeId: string, locale: Locale): TaskInstance {
    const definition = taskRegistry.get(typeId);

    if (!definition) {
      throw new Error(`Task definition "${typeId}" not found`);
    }

    return definition.generate(locale);
  }
}

// Singleton-Instanz
export const taskGenerator = new TaskGeneratorImpl();
