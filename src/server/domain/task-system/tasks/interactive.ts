/**
 * Interaktive Aufgaben
 *
 * Multiple-Choice und Drag-and-Drop Aufgaben
 */

import type { Locale } from "@i18n/translations";
import type {
  TaskDefinition,
  TaskInstance,
  ValidationResult,
  ChoiceOption,
  DragDropItem,
  DragDropTarget,
} from "../interfaces";
import { BaseTask } from "../base-task";

// Datentypen
interface MultipleChoiceData {
  correctOptionId: string;
  answer: string | number;
}

interface DragDropData {
  correctMapping: Record<string, string>; // itemId -> targetId
}

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

// Lokalisierte Texte
const texts = {
  de: {
    chooseCorrect: "Wähle die richtige Antwort:",
    matchPairs: "Ordne richtig zu:",
    calculate: "Rechne:",
    whichResult: "Welches Ergebnis ist richtig?",
    orderNumbers: "Ordne die Zahlen der Größe nach:",
    smallest: "Kleinste",
    largest: "Größte",
    matchOperations: "Ordne die Rechnungen den Ergebnissen zu:",
  },
  en: {
    chooseCorrect: "Choose the correct answer:",
    matchPairs: "Match correctly:",
    calculate: "Calculate:",
    whichResult: "Which result is correct?",
    orderNumbers: "Order the numbers by size:",
    smallest: "Smallest",
    largest: "Largest",
    matchOperations: "Match the calculations to the results:",
  },
  uk: {
    chooseCorrect: "Вибери правильну відповідь:",
    matchPairs: "Встанови відповідність:",
    calculate: "Обчисли:",
    whichResult: "Яка відповідь правильна?",
    orderNumbers: "Впорядкуй числа за розміром:",
    smallest: "Найменше",
    largest: "Найбільше",
    matchOperations: "Встанови відповідність між обчисленнями та результатами:",
  },
};

const hints = {
  de: {
    multipleChoice: "Lies alle Optionen durch und rechne sorgfältig nach.",
    dragDrop: "Verbinde jedes Element mit dem passenden Ziel.",
    ordering: "Vergleiche die Zahlen paarweise.",
  },
  en: {
    multipleChoice: "Read all options and calculate carefully.",
    dragDrop: "Connect each item to the matching target.",
    ordering: "Compare the numbers in pairs.",
  },
  uk: {
    multipleChoice: "Прочитай всі варіанти і уважно порахуй.",
    dragDrop: "З'єднай кожен елемент з відповідною ціллю.",
    ordering: "Порівнюй числа попарно.",
  },
};

/**
 * Multiple-Choice Aufgabe
 */
class MultipleChoiceTask extends BaseTask<MultipleChoiceData> {
  validate(userAnswer: string): ValidationResult {
    const isCorrect = userAnswer === this.data.correctOptionId;
    const correctOption = this.choices?.find(
      (c) => c.id === this.data.correctOptionId,
    );

    return {
      isCorrect,
      correctAnswer: correctOption?.label || this.data.answer,
      userAnswer,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.multipleChoice;
  }

  getCorrectAnswer(): string | number {
    return this.data.answer;
  }
}

/**
 * Drag-and-Drop Aufgabe
 */
class DragDropTask extends BaseTask<DragDropData> {
  validate(userAnswer: string): ValidationResult {
    // userAnswer ist JSON: {"itemId": "targetId", ...}
    let userMapping: Record<string, string>;
    try {
      userMapping = JSON.parse(userAnswer);
    } catch {
      return {
        isCorrect: false,
        correctAnswer: JSON.stringify(this.data.correctMapping),
        userAnswer,
        hint: this.getHint(),
      };
    }

    const correctMapping = this.data.correctMapping;
    const isCorrect = Object.keys(correctMapping).every(
      (key) => userMapping[key] === correctMapping[key],
    );

    return {
      isCorrect,
      correctAnswer: JSON.stringify(correctMapping),
      userAnswer: JSON.stringify(userMapping),
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.dragDrop;
  }

  getCorrectAnswer(): string {
    return JSON.stringify(this.data.correctMapping);
  }
}

// ============================================
// Multiple-Choice Aufgaben
// ============================================

export const multipleChoiceAdd: TaskDefinition<MultipleChoiceData> = {
  typeId: "mc-addition",
  category: "arithmetic",
  grade: 1,
  description: "Multiple-Choice Addition",

  generate(locale: Locale): TaskInstance<MultipleChoiceData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    const correctAnswer = a + b;

    // Generiere Distraktoren (falsche Antworten)
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const offset = randomChoice([-2, -1, 1, 2, 10, -10]);
      const distractor = correctAnswer + offset;
      if (distractor > 0 && distractor !== correctAnswer) {
        distractors.add(distractor);
      }
    }

    const correctId = generateId();
    const choices: ChoiceOption[] = shuffle([
      { id: correctId, label: String(correctAnswer), value: correctAnswer },
      ...Array.from(distractors).map((d) => ({
        id: generateId(),
        label: String(d),
        value: d,
      })),
    ]);

    return new MultipleChoiceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { correctOptionId: correctId, answer: correctAnswer },
      inputType: "multiple-choice",
      choices,
    });
  },
};

export const multipleChoiceMult: TaskDefinition<MultipleChoiceData> = {
  typeId: "mc-multiplication",
  category: "arithmetic",
  grade: 2,
  description: "Multiple-Choice Multiplikation",

  generate(locale: Locale): TaskInstance<MultipleChoiceData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    const correctAnswer = a * b;

    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const options = [
        a * (b + 1),
        a * (b - 1),
        (a + 1) * b,
        (a - 1) * b,
        a + b,
        correctAnswer + 10,
        correctAnswer - 10,
      ].filter((x) => x > 0 && x !== correctAnswer);
      if (options.length > 0) {
        distractors.add(randomChoice(options));
      }
    }

    const correctId = generateId();
    const choices: ChoiceOption[] = shuffle([
      { id: correctId, label: String(correctAnswer), value: correctAnswer },
      ...Array.from(distractors)
        .slice(0, 3)
        .map((d) => ({
          id: generateId(),
          label: String(d),
          value: d,
        })),
    ]);

    return new MultipleChoiceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ?`,
      data: { correctOptionId: correctId, answer: correctAnswer },
      inputType: "multiple-choice",
      choices,
    });
  },
};

export const multipleChoiceFraction: TaskDefinition<MultipleChoiceData> = {
  typeId: "mc-fraction",
  category: "arithmetic",
  grade: 4,
  description: "Multiple-Choice Bruch",

  generate(locale: Locale): TaskInstance<MultipleChoiceData> {
    const t = texts[locale] || texts.de;

    // Einfache Bruchvergleiche
    const fractions = [
      { num: 1, den: 2, decimal: 0.5 },
      { num: 1, den: 4, decimal: 0.25 },
      { num: 3, den: 4, decimal: 0.75 },
      { num: 1, den: 3, decimal: 0.33 },
      { num: 2, den: 3, decimal: 0.67 },
    ];

    const correct = randomChoice(fractions);
    const correctAnswer = `${correct.num}/${correct.den}`;

    const distractors = fractions
      .filter((f) => f !== correct)
      .slice(0, 3)
      .map((f) => `${f.num}/${f.den}`);

    const correctId = generateId();
    const choices: ChoiceOption[] = shuffle([
      { id: correctId, label: correctAnswer, value: correctAnswer },
      ...distractors.map((d) => ({
        id: generateId(),
        label: d,
        value: d,
      })),
    ]);

    return new MultipleChoiceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.whichResult} ${correct.decimal} = ?`,
      data: { correctOptionId: correctId, answer: correctAnswer },
      inputType: "multiple-choice",
      choices,
    });
  },
};

// ============================================
// Drag-and-Drop Aufgaben
// ============================================

export const dragDropOrder: TaskDefinition<DragDropData> = {
  typeId: "dd-order-numbers",
  category: "number-sense",
  grade: 1,
  description: "Zahlen ordnen (Drag & Drop)",

  generate(locale: Locale): TaskInstance<DragDropData> {
    const t = texts[locale] || texts.de;

    // Generiere 4 verschiedene Zahlen
    const numbers: number[] = [];
    while (numbers.length < 4) {
      const n = randomInt(1, 20);
      if (!numbers.includes(n)) {
        numbers.push(n);
      }
    }

    const sorted = [...numbers].sort((a, b) => a - b);

    // Items sind die Zahlen
    const dragItems: DragDropItem[] = shuffle(
      numbers.map((n, i) => ({
        id: `num-${n}`,
        content: String(n),
        correctTarget: `pos-${sorted.indexOf(n)}`,
      })),
    );

    // Targets sind die Positionen
    const dropTargets: DragDropTarget[] = [
      { id: "pos-0", label: "1." },
      { id: "pos-1", label: "2." },
      { id: "pos-2", label: "3." },
      { id: "pos-3", label: "4." },
    ];

    // Mapping erstellen
    const correctMapping: Record<string, string> = {};
    dragItems.forEach((item) => {
      correctMapping[item.id] = item.correctTarget;
    });

    return new DragDropTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.orderNumbers}\n${t.smallest} → ${t.largest}`,
      data: { correctMapping },
      inputType: "drag-drop",
      dragItems,
      dropTargets,
    });
  },
};

export const dragDropMatchOperations: TaskDefinition<DragDropData> = {
  typeId: "dd-match-operations",
  category: "arithmetic",
  grade: 2,
  description: "Rechnungen zuordnen (Drag & Drop)",

  generate(locale: Locale): TaskInstance<DragDropData> {
    const t = texts[locale] || texts.de;

    // Generiere 4 einfache Rechnungen mit unterschiedlichen Ergebnissen
    const operations: { expr: string; result: number }[] = [];
    const usedResults = new Set<number>();

    while (operations.length < 4) {
      const a = randomInt(2, 9);
      const b = randomInt(2, 9);
      const op = randomChoice(["+", "-", "×"]);
      let result: number;

      switch (op) {
        case "+":
          result = a + b;
          break;
        case "-":
          result = Math.max(a, b) - Math.min(a, b);
          break;
        case "×":
          result = a * b;
          break;
        default:
          result = a + b;
      }

      if (!usedResults.has(result) && result > 0) {
        usedResults.add(result);
        const expr =
          op === "-"
            ? `${Math.max(a, b)} ${op} ${Math.min(a, b)}`
            : `${a} ${op} ${b}`;
        operations.push({ expr, result });
      }
    }

    // Items sind die Rechnungen
    const dragItems: DragDropItem[] = shuffle(
      operations.map((op, i) => ({
        id: `op-${i}`,
        content: op.expr,
        correctTarget: `res-${op.result}`,
      })),
    );

    // Targets sind die Ergebnisse
    const dropTargets: DragDropTarget[] = shuffle(
      operations.map((op) => ({
        id: `res-${op.result}`,
        label: String(op.result),
      })),
    );

    // Mapping erstellen
    const correctMapping: Record<string, string> = {};
    dragItems.forEach((item) => {
      correctMapping[item.id] = item.correctTarget;
    });

    return new DragDropTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.matchOperations,
      data: { correctMapping },
      inputType: "drag-drop",
      dragItems,
      dropTargets,
    });
  },
};

export const dragDropFractions: TaskDefinition<DragDropData> = {
  typeId: "dd-match-fractions",
  category: "arithmetic",
  grade: 4,
  description: "Brüche zuordnen (Drag & Drop)",

  generate(locale: Locale): TaskInstance<DragDropData> {
    const t = texts[locale] || texts.de;

    // Brüche und ihre Dezimalwerte
    const fractionPairs = shuffle([
      { fraction: "1/2", decimal: "0,5" },
      { fraction: "1/4", decimal: "0,25" },
      { fraction: "3/4", decimal: "0,75" },
      { fraction: "1/5", decimal: "0,2" },
    ]);

    // Items sind die Brüche
    const dragItems: DragDropItem[] = fractionPairs.map((pair, i) => ({
      id: `frac-${i}`,
      content: pair.fraction,
      correctTarget: `dec-${i}`,
    }));

    // Targets sind die Dezimalzahlen (shuffled)
    const shuffledPairs = shuffle([...fractionPairs]);
    const dropTargets: DragDropTarget[] = shuffledPairs.map((pair, i) => ({
      id: `dec-${fractionPairs.indexOf(pair)}`,
      label: pair.decimal,
    }));

    // Mapping erstellen
    const correctMapping: Record<string, string> = {};
    dragItems.forEach((item) => {
      correctMapping[item.id] = item.correctTarget;
    });

    return new DragDropTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.matchPairs,
      data: { correctMapping },
      inputType: "drag-drop",
      dragItems,
      dropTargets,
    });
  },
};

// Export
export const interactiveTasks: TaskDefinition[] = [
  // Multiple-Choice
  multipleChoiceAdd,
  multipleChoiceMult,
  multipleChoiceFraction,
  // Drag-and-Drop
  dragDropOrder,
  dragDropMatchOperations,
  dragDropFractions,
];
