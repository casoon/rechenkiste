/**
 * Rehydrierung — stellt aus gespeicherten Aufgabendaten wieder eine echte
 * Aufgaben-Instanz her.
 *
 * Eine Session lebt als JSON im KV, die Aufgaben-Instanz überlebt das nicht.
 * Ohne Rehydrierung läuft beim Prüfen nicht `validate()` der jeweiligen
 * Aufgabenklasse, sondern ein generischer Zahlenvergleich — bei
 * "6 Rest 3" hätte der ein blankes "6" als richtig durchgehen lassen.
 *
 * Welche Klasse zu einer typeId gehört, weiß nur ihre TaskDefinition, und
 * zwar erst im Moment von `generate()`. Deshalb wird pro typeId einmal eine
 * Wegwerf-Aufgabe erzeugt und ihr Konstruktor gemerkt; neue Aufgabentypen
 * sind damit automatisch abgedeckt.
 */

import { BaseTask } from "./base-task";
import { taskRegistry } from "./registry";
import type { TaskInstance } from "./interfaces";

export type TaskParams = ConstructorParameters<typeof BaseTask>[0] & {
  id: string;
};

type TaskConstructor = new (params: TaskParams) => TaskInstance;

const constructors = new Map<string, TaskConstructor | null>();

function taskConstructorFor(typeId: string): TaskConstructor | null {
  const cached = constructors.get(typeId);
  if (cached !== undefined) return cached;

  const definition = taskRegistry.get(typeId);
  let ctor: TaskConstructor | null = null;

  if (definition) {
    try {
      const probe = definition.generate("de");
      ctor = (probe as object).constructor as TaskConstructor;
    } catch {
      ctor = null;
    }
  }

  constructors.set(typeId, ctor);
  return ctor;
}

/**
 * Baut die Aufgabe ihrer Klasse nach. Gibt `undefined` zurück, wenn der Typ
 * unbekannt ist oder sich nicht rekonstruieren lässt — der Aufrufer fällt
 * dann auf den generischen Vergleich zurück.
 */
export function rehydrateTask(params: TaskParams): TaskInstance | undefined {
  const Ctor = taskConstructorFor(params.typeId);
  if (!Ctor) return undefined;

  try {
    return new Ctor(params);
  } catch {
    return undefined;
  }
}
