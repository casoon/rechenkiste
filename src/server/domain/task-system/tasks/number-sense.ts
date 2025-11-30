/**
 * Zahlenverständnis-Aufgaben
 *
 * Zahlenreihen, Vergleiche, Nachbarzahlen, etc.
 */

import type { Locale } from "@i18n/translations";
import type {
  Grade,
  TaskDefinition,
  TaskInstance,
  ValidationResult,
} from "../interfaces";
import { BaseTask, type NumberSenseData } from "../base-task";

// Lokalisierte Texte
const texts = {
  de: {
    sequence: "Welche Zahl fehlt?",
    compare: "Welche Zahl ist größer?",
    compareInstruction: "Trage <, > oder = ein",
    neighbors: "Welche Zahl kommt direkt nach {num}?",
    neighborsBefore: "Welche Zahl kommt direkt vor {num}?",
    order: "Ordne die Zahlen der Größe nach. Welche ist die {position}?",
    smallest: "kleinste",
    largest: "größte",
  },
  en: {
    sequence: "Which number is missing?",
    compare: "Which number is bigger?",
    compareInstruction: "Enter <, > or =",
    neighbors: "Which number comes right after {num}?",
    neighborsBefore: "Which number comes right before {num}?",
    order: "Order the numbers by size. Which is the {position}?",
    smallest: "smallest",
    largest: "largest",
  },
  uk: {
    sequence: "Яке число пропущено?",
    compare: "Яке число більше?",
    compareInstruction: "Введи <, > або =",
    neighbors: "Яке число йде одразу після {num}?",
    neighborsBefore: "Яке число йде одразу перед {num}?",
    order: "Впорядкуй числа за розміром. Яке {position}?",
    smallest: "найменше",
    largest: "найбільше",
  },
};

const hints = {
  de: {
    sequence:
      "Schau dir das Muster an. Um wie viel wird jede Zahl größer oder kleiner?",
    compare: "Vergleiche die beiden Zahlen. Welche ist größer?",
    neighbors: "Zähle einfach eins weiter!",
    neighborsBefore: "Zähle einfach eins zurück!",
  },
  en: {
    sequence:
      "Look at the pattern. By how much does each number increase or decrease?",
    compare: "Compare the two numbers. Which one is bigger?",
    neighbors: "Just count one more!",
    neighborsBefore: "Just count one back!",
  },
  uk: {
    sequence:
      "Подивись на закономірність. На скільки збільшується або зменшується кожне число?",
    compare: "Порівняй два числа. Яке більше?",
    neighbors: "Просто порахуй на одне більше!",
    neighborsBefore: "Просто порахуй на одне менше!",
  },
};

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Zahlenreihen-Aufgabe
 */
class SequenceTask extends BaseTask<NumberSenseData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer as number;

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, correctAnswer);

    return {
      isCorrect,
      correctAnswer,
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
      explanation: this.getExplanation(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.sequence;
  }

  getCorrectAnswer(): number {
    return this.data.answer as number;
  }

  private getExplanation(): string {
    const step = this.data.extra?.step as number;
    const nums = this.data.numbers;
    if (step > 0) {
      return `+${step}: ${nums.join(", ")}`;
    } else {
      return `${step}: ${nums.join(", ")}`;
    }
  }
}

/**
 * Vergleichs-Aufgabe
 */
class CompareTask extends BaseTask<NumberSenseData> {
  validate(userAnswer: string): ValidationResult {
    const correctAnswer = this.data.answer as string;
    const normalized = userAnswer.trim();

    const isCorrect = normalized === correctAnswer;

    return {
      isCorrect,
      correctAnswer,
      userAnswer: normalized,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.compare;
  }

  getCorrectAnswer(): string {
    return this.data.answer as string;
  }
}

/**
 * Nachbarzahlen-Aufgabe
 */
class NeighborsTask extends BaseTask<NumberSenseData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer as number;

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, correctAnswer);

    return {
      isCorrect,
      correctAnswer,
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    const direction = this.data.extra?.direction as string;
    return direction === "before" ? h.neighborsBefore : h.neighbors;
  }

  getCorrectAnswer(): number {
    return this.data.answer as number;
  }
}

// ============================================
// KLASSE 1: Zahlenverständnis
// ============================================

export const sequenceSimple: TaskDefinition<NumberSenseData> = {
  typeId: "number-sequence-simple",
  category: "number-sense",
  grade: 1,
  description: "Einfache Zahlenreihen",

  generate(locale: Locale): TaskInstance<NumberSenseData> {
    const t = texts[locale] || texts.de;

    // Einfache Reihen: +1, +2
    const step = randomChoice([1, 2]);
    const start = randomInt(1, 10);
    const missingIndex = randomInt(1, 3); // Position 1-3 (nicht erste oder letzte)

    const numbers: (number | string)[] = [];
    for (let i = 0; i < 5; i++) {
      const num = start + i * step;
      if (i === missingIndex) {
        numbers.push("_");
      } else {
        numbers.push(num);
      }
    }

    const answer = start + missingIndex * step;
    const fullNumbers = Array.from({ length: 5 }, (_, i) => start + i * step);

    return new SequenceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.sequence}\n${numbers.join(", ")}`,
      data: {
        subtype: "sequence",
        numbers: fullNumbers,
        answer,
        extra: { step, missingIndex },
      },
    });
  },
};

export const compareSimple: TaskDefinition<NumberSenseData> = {
  typeId: "number-compare-simple",
  category: "number-sense",
  grade: 1,
  description: "Größer/Kleiner Vergleiche",

  generate(locale: Locale): TaskInstance<NumberSenseData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(1, 20);
    let b = randomInt(1, 20);

    // Manchmal gleiche Zahlen
    if (Math.random() < 0.2) {
      b = a;
    }

    let answer: string;
    if (a < b) {
      answer = "<";
    } else if (a > b) {
      answer = ">";
    } else {
      answer = "=";
    }

    return new CompareTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.compare}\n\n${a}  ___  ${b}\n\n${t.compareInstruction}`,
      data: {
        subtype: "compare",
        numbers: [a, b],
        answer,
      },
    });
  },
};

export const neighborsAfter: TaskDefinition<NumberSenseData> = {
  typeId: "number-neighbors-after",
  category: "number-sense",
  grade: 1,
  description: "Nachbarzahlen (danach)",

  generate(locale: Locale): TaskInstance<NumberSenseData> {
    const t = texts[locale] || texts.de;

    const num = randomInt(1, 19);
    const answer = num + 1;

    return new NeighborsTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.neighbors.replace("{num}", String(num)),
      data: {
        subtype: "neighbors",
        numbers: [num],
        answer,
        extra: { direction: "after" },
      },
    });
  },
};

export const neighborsBefore: TaskDefinition<NumberSenseData> = {
  typeId: "number-neighbors-before",
  category: "number-sense",
  grade: 1,
  description: "Nachbarzahlen (davor)",

  generate(locale: Locale): TaskInstance<NumberSenseData> {
    const t = texts[locale] || texts.de;

    const num = randomInt(2, 20);
    const answer = num - 1;

    return new NeighborsTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.neighborsBefore.replace("{num}", String(num)),
      data: {
        subtype: "neighbors",
        numbers: [num],
        answer,
        extra: { direction: "before" },
      },
    });
  },
};

// ============================================
// KLASSE 2: Erweiterte Zahlenreihen
// ============================================

export const sequenceMedium: TaskDefinition<NumberSenseData> = {
  typeId: "number-sequence-medium",
  category: "number-sense",
  grade: 2,
  description: "Zahlenreihen bis 100",

  generate(locale: Locale): TaskInstance<NumberSenseData> {
    const t = texts[locale] || texts.de;

    // Reihen: +5, +10, -2, -5
    const step = randomChoice([5, 10, -2, -5]);
    const start = step > 0 ? randomInt(1, 50) : randomInt(50, 100);
    const missingIndex = randomInt(1, 3);

    const numbers: (number | string)[] = [];
    for (let i = 0; i < 5; i++) {
      const num = start + i * step;
      if (i === missingIndex) {
        numbers.push("_");
      } else {
        numbers.push(num);
      }
    }

    const answer = start + missingIndex * step;
    const fullNumbers = Array.from({ length: 5 }, (_, i) => start + i * step);

    return new SequenceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.sequence}\n${numbers.join(", ")}`,
      data: {
        subtype: "sequence",
        numbers: fullNumbers,
        answer,
        extra: { step, missingIndex },
      },
    });
  },
};

export const compareMedium: TaskDefinition<NumberSenseData> = {
  typeId: "number-compare-medium",
  category: "number-sense",
  grade: 2,
  description: "Vergleiche bis 100",

  generate(locale: Locale): TaskInstance<NumberSenseData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(10, 100);
    let b = randomInt(10, 100);

    if (Math.random() < 0.15) {
      b = a;
    }

    let answer: string;
    if (a < b) {
      answer = "<";
    } else if (a > b) {
      answer = ">";
    } else {
      answer = "=";
    }

    return new CompareTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.compare}\n\n${a}  ___  ${b}\n\n${t.compareInstruction}`,
      data: {
        subtype: "compare",
        numbers: [a, b],
        answer,
      },
    });
  },
};

// Export aller Zahlenverständnis-Aufgaben
export const numberSenseTasks: TaskDefinition[] = [
  // Klasse 1
  sequenceSimple,
  compareSimple,
  neighborsAfter,
  neighborsBefore,
  // Klasse 2
  sequenceMedium,
  compareMedium,
];
