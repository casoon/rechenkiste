/**
 * Task Registry - Zentrale Verwaltung aller Aufgabentypen
 */

import type {
  Grade,
  TaskCategory,
  TaskDefinition,
  TaskRegistry,
} from "./interfaces";

class TaskRegistryImpl implements TaskRegistry {
  private definitions: Map<string, TaskDefinition> = new Map();

  register(definition: TaskDefinition): void {
    if (this.definitions.has(definition.typeId)) {
      console.warn(
        `TaskDefinition "${definition.typeId}" already registered, overwriting.`,
      );
    }
    this.definitions.set(definition.typeId, definition);
  }

  get(typeId: string): TaskDefinition | undefined {
    return this.definitions.get(typeId);
  }

  getByGrade(grade: Grade): TaskDefinition[] {
    return Array.from(this.definitions.values()).filter(
      (def) => def.grade === grade,
    );
  }

  getByCategory(category: TaskCategory): TaskDefinition[] {
    return Array.from(this.definitions.values()).filter(
      (def) => def.category === category,
    );
  }

  getAll(): TaskDefinition[] {
    return Array.from(this.definitions.values());
  }

  // Hilfsmethode: Gibt Aufgaben für Klassenstufe und darunter zurück
  getForGradeAndBelow(grade: Grade): TaskDefinition[] {
    return Array.from(this.definitions.values()).filter(
      (def) => def.grade <= grade,
    );
  }
}

// Singleton-Instanz
export const taskRegistry = new TaskRegistryImpl();
