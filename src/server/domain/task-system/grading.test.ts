/**
 * Bewertungs-Sonde über alle registrierten Aufgabentypen.
 *
 * Jeder Typ wird mehrfach erzeugt, durch den Session-Roundtrip geschickt und
 * dann mit falschen, gleichwertigen und unsinnigen Eingaben konfrontiert.
 * Die Aufgaben sind zufällig, deshalb die hohe Stichprobenzahl: ein Typ, der
 * nur manchmal falsch bewertet, fällt damit zuverlässig auf.
 */

import { describe, expect, it } from "vitest";
import {
  initTaskSystem,
  taskRegistry,
  rehydrateTask,
  type TaskInstance,
} from "./index";
import { resolveAnswerInput } from "@services/answer-input";

initTaskSystem();

const SAMPLES = 30;

/** Aufgabe so herstellen, wie die Session sie nach dem Speichern liefert */
function roundTrip(task: TaskInstance): TaskInstance {
  return (
    rehydrateTask({
      id: task.id,
      typeId: task.typeId,
      category: task.category,
      grade: task.grade,
      locale: task.locale,
      question: task.question,
      data: JSON.parse(JSON.stringify(task.data)),
      inputType: task.inputType,
      inputLabel: task.inputLabel,
      choices: task.choices,
      dragItems: task.dragItems,
      dropTargets: task.dropTargets,
    }) ?? task
  );
}

/** Die Eingabe, die die Oberfläche bei richtiger Antwort schickt */
function correctInput(task: TaskInstance): string {
  if (task.inputType === "multiple-choice") {
    const expected = String(task.getCorrectAnswer());
    const hit = task.choices?.find(
      (c) =>
        String(c.value).toLowerCase() === expected.toLowerCase() ||
        String(c.label).toLowerCase() === expected.toLowerCase(),
    );
    return hit?.id ?? "";
  }
  if (task.inputType === "drag-drop") {
    const map: Record<string, string> = {};
    for (const item of task.dragItems ?? []) map[item.id] = item.correctTarget;
    return JSON.stringify(map);
  }
  return String(task.getCorrectAnswer());
}

/** Ersetzt die erste oder letzte Zahl im Text durch die nächstgrößere */
function bumpNumber(value: string, which: "first" | "last"): string | null {
  const matches = [...value.matchAll(/\d+/g)];
  if (matches.length === 0) return null;
  const m = which === "first" ? matches[0] : matches[matches.length - 1];
  const at = m.index ?? 0;
  return value.slice(0, at) + String(Number(m[0]) + 1) + value.slice(at + m[0].length);
}

function wrongInputs(task: TaskInstance): string[] {
  if (task.inputType === "multiple-choice") {
    const right = correctInput(task);
    return (task.choices ?? []).map((c) => c.id).filter((id) => id !== right);
  }

  if (task.inputType === "drag-drop") {
    const items = task.dragItems ?? [];
    const targets = [...new Set(items.map((i) => i.correctTarget))];
    if (items.length < 2 || targets.length < 2) return [];
    const map: Record<string, string> = {};
    for (const item of items) map[item.id] = item.correctTarget;
    const first = items[0];
    map[first.id] = targets.find((t) => t !== first.correctTarget)!;
    return [JSON.stringify(map)];
  }

  const right = correctInput(task);
  const out: string[] = [];
  for (const which of ["first", "last"] as const) {
    const wrong = bumpNumber(right, which);
    if (wrong) out.push(wrong);
  }
  // Zahlendreher
  const digits = right.match(/\d{2,}/);
  if (digits) {
    const d = digits[0];
    out.push(right.replace(d, d[1] + d[0] + d.slice(2)));
  }
  // Faktor 10 und Vorzeichen
  const asNumber = Number(right.replace(",", "."));
  if (Number.isFinite(asNumber) && asNumber !== 0) {
    out.push(String(asNumber * 10), String(-asNumber));
  }
  return out.filter((w) => w !== right);
}

/** Schreibweisen, die dieselbe richtige Antwort meinen */
function equivalentInputs(task: TaskInstance): string[] {
  if (task.inputType && task.inputType !== "text") return [];
  const right = correctInput(task);
  const out = [` ${right} `];
  // Komma und Punkt sind nur bei einer blanken Dezimalzahl austauschbar —
  // in "(2, 1)" trennt das Komma zwei Koordinaten
  if (/^\d+,\d+$/.test(right)) out.push(right.replace(",", "."));
  if (/^\d+\.\d+$/.test(right)) out.push(right.replace(".", ","));
  return out;
}

/** Was von der richtigen Antwort übrig bleibt, wenn man sie ins Feld tippt */
function typeable(task: TaskInstance): string {
  const expected = String(task.getCorrectAnswer());
  const input = resolveAnswerInput(task);
  if (input.remainder) return expected; // zwei Felder, vom Endpoint gefügt
  if (input.numpad) return expected.replace(/\D/g, "");
  return expected.replace(new RegExp(input.pattern, "g"), "");
}

/** Sammelt je Aufgabentyp höchstens einen Befund */
function probe(
  check: (task: TaskInstance) => string | undefined,
  samples = SAMPLES,
): string[] {
  const findings: string[] = [];

  for (const def of taskRegistry.getAll()) {
    for (let i = 0; i < samples; i++) {
      const finding = check(roundTrip(def.generate("de")));
      if (finding) {
        findings.push(`${def.typeId}: ${finding}`);
        break;
      }
    }
  }

  return findings;
}

describe("Bewertung", () => {
  it("weist falsche Antworten zurück", () => {
    const findings = probe((task) => {
      const right = correctInput(task);
      const accepted = wrongInputs(task).find(
        (wrong) => task.validate(wrong).isCorrect,
      );
      return accepted === undefined
        ? undefined
        : `"${accepted}" gilt als richtig, richtig wäre "${right}"`;
    });

    expect(findings).toEqual([]);
  });

  it("akzeptiert gleichwertige Schreibweisen der richtigen Antwort", () => {
    const findings = probe((task) => {
      const rejected = equivalentInputs(task).find(
        (variant) => !task.validate(variant).isCorrect,
      );
      return rejected === undefined
        ? undefined
        : `"${rejected}" gilt als falsch, meint aber "${correctInput(task)}"`;
    });

    expect(findings).toEqual([]);
  });

  it("weist leere und unsinnige Eingaben zurück", () => {
    const findings = probe((task) => {
      const accepted = ["", "   ", "abc", "-", "?"].find(
        (junk) => junk !== correctInput(task) && task.validate(junk).isCorrect,
      );
      return accepted === undefined
        ? undefined
        : `"${accepted}" gilt als richtig`;
    });

    expect(findings).toEqual([]);
  });

  it("lässt die richtige Antwort im jeweiligen Feld eintippen", () => {
    const findings = probe((task) => {
      if (task.inputType && task.inputType !== "text") return undefined;
      const typed = typeable(task);
      return task.validate(typed).isCorrect
        ? undefined
        : `erwartet "${task.getCorrectAnswer()}", eintippbar ist nur "${typed}"`;
    });

    expect(findings).toEqual([]);
  });
});
