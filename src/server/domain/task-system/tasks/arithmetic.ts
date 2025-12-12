/**
 * Arithmetik-Aufgaben
 *
 * Alle Rechenaufgaben von Klasse 1-5
 */

import type { Locale } from "@i18n/translations";
import type {
  TaskDefinition,
  TaskInstance,
  ValidationResult,
} from "../interfaces";
import { BaseTask, type ArithmeticData } from "../base-task";

// Lokalisierte Texte
const texts = {
  de: {
    calculateWritten: "Rechne schriftlich:",
  },
  en: {
    calculateWritten: "Calculate in writing:",
  },
  uk: {
    calculateWritten: "Обчисли письмово:",
  },
};

// Lokalisierte Texte für Hints
const hints = {
  de: {
    addition: (a: number, b: number) => `Zähle ${a} und dann noch ${b} dazu.`,
    subtraction: (a: number, b: number) => `Nimm von ${a} genau ${b} weg.`,
    multiplication: (a: number, b: number) =>
      `Rechne ${a} mal ${b}. Das ist ${b} + ${b}... (${a} mal).`,
    division: (a: number, b: number) => `Teile ${a} in ${b} gleiche Teile.`,
    complement: (sum: number, b: number) =>
      `Welche Zahl plus ${b} ergibt ${sum}?`,
  },
  en: {
    addition: (a: number, b: number) => `Count ${a} and then add ${b} more.`,
    subtraction: (a: number, b: number) => `Take ${b} away from ${a}.`,
    multiplication: (a: number, b: number) =>
      `Calculate ${a} times ${b}. That's ${b} + ${b}... (${a} times).`,
    division: (a: number, b: number) => `Divide ${a} into ${b} equal parts.`,
    complement: (sum: number, b: number) =>
      `What number plus ${b} equals ${sum}?`,
  },
  uk: {
    addition: (a: number, b: number) => `Порахуй ${a}, а потім додай ще ${b}.`,
    subtraction: (a: number, b: number) => `Від ${a} забери ${b}.`,
    multiplication: (a: number, b: number) =>
      `Порахуй ${a} помножити на ${b}. Це ${b} + ${b}... (${a} рази).`,
    division: (a: number, b: number) => `Поділи ${a} на ${b} рівних частин.`,
    complement: (sum: number, b: number) =>
      `Яке число плюс ${b} дорівнює ${sum}?`,
  },
};

const explanations = {
  de: {
    addition: (a: number, b: number, answer: number) =>
      `${a} + ${b} = ${answer}`,
    subtraction: (a: number, b: number, answer: number) =>
      `${a} - ${b} = ${answer}`,
    multiplication: (a: number, b: number, answer: number) =>
      `${a} × ${b} = ${answer}`,
    division: (a: number, b: number, answer: number) =>
      `${a} ÷ ${b} = ${answer}`,
  },
  en: {
    addition: (a: number, b: number, answer: number) =>
      `${a} + ${b} = ${answer}`,
    subtraction: (a: number, b: number, answer: number) =>
      `${a} - ${b} = ${answer}`,
    multiplication: (a: number, b: number, answer: number) =>
      `${a} × ${b} = ${answer}`,
    division: (a: number, b: number, answer: number) =>
      `${a} ÷ ${b} = ${answer}`,
  },
  uk: {
    addition: (a: number, b: number, answer: number) =>
      `${a} + ${b} = ${answer}`,
    subtraction: (a: number, b: number, answer: number) =>
      `${a} - ${b} = ${answer}`,
    multiplication: (a: number, b: number, answer: number) =>
      `${a} × ${b} = ${answer}`,
    division: (a: number, b: number, answer: number) =>
      `${a} ÷ ${b} = ${answer}`,
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
 * Konkrete Arithmetik-Aufgabe
 */
class ArithmeticTask extends BaseTask<ArithmeticData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer: this.data.answer,
        userAnswer: userAnswer,
        hint: this.getHint(),
        explanation: this.getExplanation(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, this.data.answer);

    return {
      isCorrect,
      correctAnswer: this.data.answer,
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
      explanation: this.getExplanation(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    const { a, b, operator, placeholder } = this.data;

    if (placeholder === "a") {
      // Ergänzungsaufgabe: _ + b = result
      const sum = this.data.answer + b;
      return h.complement(sum, b);
    }

    switch (operator) {
      case "+":
        return h.addition(a, b);
      case "-":
        return h.subtraction(a, b);
      case "*":
        return h.multiplication(a, b);
      case "/":
        return h.division(a, b);
    }
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }

  private getExplanation(): string {
    const e = explanations[this.locale] || explanations.de;
    const { a, b, answer, operator } = this.data;

    switch (operator) {
      case "+":
        return e.addition(a, b, answer);
      case "-":
        return e.subtraction(a, b, answer);
      case "*":
        return e.multiplication(a, b, answer);
      case "/":
        return e.division(a, b, answer);
    }
  }
}

// ============================================
// KLASSE 1: Addition und Subtraktion bis 20
// ============================================

export const additionTo10: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-10",
  category: "arithmetic",
  grade: 1,
  description: "Addition bis 10",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const additionTo20: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-20",
  category: "arithmetic",
  grade: 1,
  description: "Addition bis 20",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(1, 10);
    const b = randomInt(1, 10);
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const subtractionTo10: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-sub-10",
  category: "arithmetic",
  grade: 1,
  description: "Subtraktion bis 10",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const answer = randomInt(1, 5);
    const b = randomInt(1, 5);
    const a = answer + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

export const subtractionTo20: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-sub-20",
  category: "arithmetic",
  grade: 1,
  description: "Subtraktion bis 20",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const answer = randomInt(1, 10);
    const b = randomInt(1, 10);
    const a = answer + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

export const complementTo10: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-complement-10",
  category: "arithmetic",
  grade: 1,
  description: "Ergänzungsaufgaben bis 10",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const answer = randomInt(1, 9);
    const b = randomInt(1, 10 - answer);
    const sum = answer + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `_ + ${b} = ${sum}`,
      data: { a: answer, b, operator: "+", answer, placeholder: "a" },
    });
  },
};

// ============================================
// KLASSE 2: Addition/Subtraktion bis 100, Einmaleins
// ============================================

export const additionTensTo100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-tens-100",
  category: "arithmetic",
  grade: 2,
  description: "Addition Zehner bis 100",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(1, 9) * 10;
    const b = randomInt(1, Math.floor((100 - a) / 10)) * 10;
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const additionTo100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-100",
  category: "arithmetic",
  grade: 2,
  description: "Addition bis 100",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(10, 50);
    const b = randomInt(10, 50);
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const subtractionTensTo100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-sub-tens-100",
  category: "arithmetic",
  grade: 2,
  description: "Subtraktion Zehner bis 100",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(3, 10) * 10;
    const b = randomInt(1, Math.floor(a / 10) - 1) * 10;
    const answer = a - b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

export const subtractionTo100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-sub-100",
  category: "arithmetic",
  grade: 2,
  description: "Subtraktion bis 100",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const answer = randomInt(10, 50);
    const b = randomInt(10, 40);
    const a = answer + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

export const multiplication2_5_10: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-mult-2-5-10",
  category: "arithmetic",
  grade: 2,
  description: "Einmaleins 2, 5, 10",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const multipliers = [2, 5, 10];
    const a = randomChoice(multipliers);
    const b = randomInt(1, 10);
    const answer = a * b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer },
    });
  },
};

export const multiplicationSmall: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-mult-small",
  category: "arithmetic",
  grade: 2,
  description: "Kleines Einmaleins (2-5)",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(2, 5);
    const b = randomInt(2, 5);
    const answer = a * b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer },
    });
  },
};

export const doubling: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-double",
  category: "arithmetic",
  grade: 2,
  description: "Verdoppeln",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(2, 50);
    const answer = a * 2;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${a} = ?`,
      data: { a, b: a, operator: "+", answer },
    });
  },
};

// ============================================
// KLASSE 3: Großes Einmaleins, Division
// ============================================

export const multiplicationFull: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-mult-full",
  category: "arithmetic",
  grade: 3,
  description: "Großes Einmaleins",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    const answer = a * b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer },
    });
  },
};

export const divisionBasic: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-div-basic",
  category: "arithmetic",
  grade: 3,
  description: "Division Grundlagen",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const b = randomInt(2, 10);
    const answer = randomInt(2, 10);
    const a = b * answer;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} ÷ ${b} = ?`,
      data: { a, b, operator: "/", answer },
    });
  },
};

export const additionOver100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-over-100",
  category: "arithmetic",
  grade: 3,
  description: "Addition dreistellig",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(50, 150);
    const b = randomInt(50, 150);
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const subtractionOver100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-sub-over-100",
  category: "arithmetic",
  grade: 3,
  description: "Subtraktion dreistellig",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const answer = randomInt(50, 150);
    const b = randomInt(50, 100);
    const a = answer + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

// ============================================
// KLASSE 4: Größere Zahlen
// ============================================

export const additionTo1000: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-1000",
  category: "arithmetic",
  grade: 4,
  description: "Addition bis 1000",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(100, 500);
    const b = randomInt(100, 500);
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const subtractionTo1000: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-sub-1000",
  category: "arithmetic",
  grade: 4,
  description: "Subtraktion bis 1000",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const answer = randomInt(100, 400);
    const b = randomInt(100, 300);
    const a = answer + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

export const multiplicationBy10_100: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-mult-10-100",
  category: "arithmetic",
  grade: 4,
  description: "Multiplikation ×10, ×100",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const multipliers = [10, 100];
    const b = randomChoice(multipliers);
    const a = randomInt(2, 99);
    const answer = a * b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer },
    });
  },
};

export const multiplicationLarger: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-mult-larger",
  category: "arithmetic",
  grade: 4,
  description: "Größere Multiplikation",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(10, 25);
    const b = randomInt(2, 9);
    const answer = a * b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer },
    });
  },
};

export const divisionLarger: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-div-larger",
  category: "arithmetic",
  grade: 4,
  description: "Größere Division",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const b = randomInt(2, 12);
    const answer = randomInt(5, 20);
    const a = b * answer;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} ÷ ${b} = ?`,
      data: { a, b, operator: "/", answer },
    });
  },
};

// ============================================
// KLASSE 5: Sehr große Zahlen
// ============================================

export const additionTo10000: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-add-10000",
  category: "arithmetic",
  grade: 5,
  description: "Addition bis 10000",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(1000, 5000);
    const b = randomInt(1000, 5000);
    const answer = a + b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const multiplicationLarge: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-mult-large",
  category: "arithmetic",
  grade: 5,
  description: "Große Multiplikation (schriftlich)",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const t = texts[locale] || texts.de;
    const a = randomInt(10, 50);
    const b = randomInt(10, 30);
    const answer = a * b;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.calculateWritten}\n${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer },
    });
  },
};

export const divisionLarge: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-div-large",
  category: "arithmetic",
  grade: 5,
  description: "Große Division (schriftlich)",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const t = texts[locale] || texts.de;
    const b = randomInt(5, 12);
    const answer = randomInt(10, 25);
    const a = b * answer;

    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.calculateWritten}\n${a} ÷ ${b} = ?`,
      data: { a, b, operator: "/", answer },
    });
  },
};

// ============================================
// KLASSE 2: Tausch- und Umkehraufgaben
// ============================================

export const swapTask: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-swap",
  category: "arithmetic",
  grade: 2,
  description: "Tauschaufgaben",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    const answer = a * b;

    // Zeige zuerst a×b, frage nach b×a
    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} × ${b} = ${answer}\n${b} × ${a} = ?`,
      data: { a: b, b: a, operator: "*", answer },
    });
  },
};

export const reverseAddition: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-reverse-add",
  category: "arithmetic",
  grade: 2,
  description: "Umkehraufgaben Addition",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(5, 15);
    const b = randomInt(5, 15);
    const sum = a + b;

    // Zeige Subtraktion, frage nach Addition
    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${sum} - ${b} = ${a}\n${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer: sum },
    });
  },
};

export const reverseSubtraction: TaskDefinition<ArithmeticData> = {
  typeId: "arithmetic-reverse-sub",
  category: "arithmetic",
  grade: 2,
  description: "Umkehraufgaben Subtraktion",

  generate(locale: Locale): TaskInstance<ArithmeticData> {
    const a = randomInt(5, 15);
    const b = randomInt(5, 15);
    const sum = a + b;

    // Zeige Addition, frage nach Subtraktion
    return new ArithmeticTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${b} = ${sum}\n${sum} - ${a} = ?`,
      data: { a: sum, b: a, operator: "-", answer: b },
    });
  },
};

// ============================================
// KLASSE 3: Division mit Rest
// ============================================

// Division mit Rest - eigener Task-Typ
interface DivisionWithRemainderData {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

class DivisionRemainderTask extends BaseTask<DivisionWithRemainderData> {
  validate(userAnswer: string): ValidationResult {
    // Erwarte Format "X Rest Y" oder "X R Y" oder einfach "X"
    const normalized = userAnswer.toLowerCase().trim();
    const { quotient, remainder } = this.data;

    // Prüfe verschiedene Formate
    const formats = [
      `${quotient} rest ${remainder}`,
      `${quotient} r ${remainder}`,
      `${quotient}r${remainder}`,
      `${quotient} rest${remainder}`,
    ];

    // Wenn kein Rest, akzeptiere auch nur die Zahl
    if (remainder === 0 && normalized === String(quotient)) {
      return {
        isCorrect: true,
        correctAnswer: `${quotient}`,
        userAnswer: normalized,
      };
    }

    const isCorrect =
      formats.some((f) => normalized === f) ||
      normalized === `${quotient} rest ${remainder}`;

    const correctAnswer =
      remainder > 0 ? `${quotient} Rest ${remainder}` : `${quotient}`;

    return {
      isCorrect,
      correctAnswer,
      userAnswer: normalized,
      hint: isCorrect ? undefined : this.getHint(),
      explanation: `${this.data.dividend} ÷ ${this.data.divisor} = ${quotient} Rest ${remainder}`,
    };
  }

  getHint(): string {
    const hints: Record<string, string> = {
      de: `Teile ${this.data.dividend} durch ${this.data.divisor}. Was bleibt übrig? Schreibe "X Rest Y"`,
      en: `Divide ${this.data.dividend} by ${this.data.divisor}. What remains? Write "X Rest Y"`,
      uk: `Поділи ${this.data.dividend} на ${this.data.divisor}. Що залишиться? Напиши "X Rest Y"`,
    };
    return hints[this.locale] || hints.de;
  }

  getCorrectAnswer(): string {
    const { quotient, remainder } = this.data;
    return remainder > 0 ? `${quotient} Rest ${remainder}` : `${quotient}`;
  }
}

export const divisionWithRemainder: TaskDefinition<DivisionWithRemainderData> =
  {
    typeId: "arithmetic-div-remainder",
    category: "arithmetic",
    grade: 3,
    description: "Division mit Rest",

    generate(locale: Locale): TaskInstance<DivisionWithRemainderData> {
      const divisor = randomInt(2, 9);
      const quotient = randomInt(2, 10);
      const remainder = randomInt(1, divisor - 1);
      const dividend = divisor * quotient + remainder;

      const questionTexts: Record<string, string> = {
        de: `${dividend} ÷ ${divisor} = ? (mit Rest)`,
        en: `${dividend} ÷ ${divisor} = ? (with remainder)`,
        uk: `${dividend} ÷ ${divisor} = ? (з остачею)`,
      };

      return new DivisionRemainderTask({
        typeId: this.typeId,
        category: this.category,
        grade: this.grade,
        locale,
        question: questionTexts[locale] || questionTexts.de,
        data: { dividend, divisor, quotient, remainder },
      });
    },
  };

// Export aller Arithmetik-Aufgabentypen
export const arithmeticTasks: TaskDefinition[] = [
  // Klasse 1
  additionTo10,
  additionTo20,
  subtractionTo10,
  subtractionTo20,
  complementTo10,
  // Klasse 2
  additionTensTo100,
  additionTo100,
  subtractionTensTo100,
  subtractionTo100,
  multiplication2_5_10,
  multiplicationSmall,
  doubling,
  swapTask,
  reverseAddition,
  reverseSubtraction,
  // Klasse 3
  multiplicationFull,
  divisionBasic,
  additionOver100,
  subtractionOver100,
  divisionWithRemainder,
  // Klasse 4
  additionTo1000,
  subtractionTo1000,
  multiplicationBy10_100,
  multiplicationLarger,
  divisionLarger,
  // Klasse 5
  additionTo10000,
  multiplicationLarge,
  divisionLarge,
];
