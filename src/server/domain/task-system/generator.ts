/**
 * Task Generator - Erzeugt Aufgaben mit gewichteter Verteilung
 */

import type { Locale } from "@i18n/translations";
import type { Grade, TaskGenerator, TaskInstance } from "./interfaces";
import { taskRegistry } from "./registry";

// Hilfsfunktion für Zufallszahlen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gewichtete Zufallsauswahl der Klassenstufe
 * - 50% aktuelle Klassenstufe
 * - 30% eine Stufe darunter
 * - 20% zufällig aus niedrigeren Stufen
 */
function weightedRandomGrade(maxGrade: Grade): Grade {
  const rand = Math.random();

  if (rand < 0.5) {
    return maxGrade;
  } else if (rand < 0.8 && maxGrade > 1) {
    return (maxGrade - 1) as Grade;
  } else {
    return randomInt(1, maxGrade) as Grade;
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

    for (let i = 0; i < count; i++) {
      tasks.push(this.generateOne(grade, locale));
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
