/**
 * Maßeinheiten-Aufgaben
 *
 * Geld, Gewichte, Längen, Zeit
 */

import type { Locale } from "@i18n/translations";
import type {
  Grade,
  TaskDefinition,
  TaskInstance,
  ValidationResult,
} from "../interfaces";
import { BaseTask } from "../base-task";

// Datentypen
interface MoneyData {
  euros: number;
  cents: number;
  answer: number;
  operation: "add" | "subtract" | "total" | "change";
}

interface WeightData {
  grams?: number;
  kilograms?: number;
  answer: number;
  unit: "g" | "kg";
  operation: "convert" | "add" | "compare";
}

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Lokalisierte Texte
const moneyTexts = {
  de: {
    total: (items: string[]) => `Was kosten ${items.join(" und ")} zusammen?`,
    change: (paid: string, cost: string) => `Du zahlst ${paid} und kaufst etwas für ${cost}. Wie viel Wechselgeld bekommst du?`,
    add: (a: string, b: string) => `${a} + ${b} = ?`,
    currency: "€",
    cents: "Cent",
  },
  en: {
    total: (items: string[]) => `How much do ${items.join(" and ")} cost together?`,
    change: (paid: string, cost: string) => `You pay ${paid} and buy something for ${cost}. How much change do you get?`,
    add: (a: string, b: string) => `${a} + ${b} = ?`,
    currency: "€",
    cents: "cents",
  },
  uk: {
    total: (items: string[]) => `Скільки коштують ${items.join(" і ")} разом?`,
    change: (paid: string, cost: string) => `Ти платиш ${paid} і купуєш щось за ${cost}. Скільки здачі ти отримаєш?`,
    add: (a: string, b: string) => `${a} + ${b} = ?`,
    currency: "€",
    cents: "центів",
  },
};

const weightTexts = {
  de: {
    convert: (value: number, from: string, to: string) =>
      `Wie viel sind ${value} ${from} in ${to}?`,
    compare: "Was ist schwerer?",
    add: (a: string, b: string) => `${a} + ${b} = ?`,
  },
  en: {
    convert: (value: number, from: string, to: string) =>
      `How much is ${value} ${from} in ${to}?`,
    compare: "Which is heavier?",
    add: (a: string, b: string) => `${a} + ${b} = ?`,
  },
  uk: {
    convert: (value: number, from: string, to: string) =>
      `Скільки буде ${value} ${from} в ${to}?`,
    compare: "Що важче?",
    add: (a: string, b: string) => `${a} + ${b} = ?`,
  },
};

const hints = {
  de: {
    money: "1 Euro = 100 Cent. Rechne erst die Cents zusammen!",
    change: "Wechselgeld = Bezahlt - Preis",
    weight: "1 kg = 1000 g",
  },
  en: {
    money: "1 Euro = 100 cents. Add the cents first!",
    change: "Change = Paid - Price",
    weight: "1 kg = 1000 g",
  },
  uk: {
    money: "1 євро = 100 центів. Спочатку додай центи!",
    change: "Здача = Заплачено - Ціна",
    weight: "1 кг = 1000 г",
  },
};

// Formatierung
function formatMoney(euros: number, cents: number, locale: Locale): string {
  if (cents === 0) {
    return `${euros} €`;
  }
  return `${euros},${cents.toString().padStart(2, "0")} €`;
}

function formatCents(cents: number, locale: Locale): string {
  const t = moneyTexts[locale] || moneyTexts.de;
  if (cents >= 100) {
    const euros = Math.floor(cents / 100);
    const remainingCents = cents % 100;
    return formatMoney(euros, remainingCents, locale);
  }
  return `${cents} ${t.cents}`;
}

/**
 * Geld-Aufgabe
 */
class MoneyTask extends BaseTask<MoneyData> {
  validate(userAnswer: string): ValidationResult {
    // Akzeptiere verschiedene Formate: "1,50", "1.50", "150", "1 Euro 50 Cent"
    let parsed: number | null = null;
    const normalized = userAnswer.toLowerCase().trim()
      .replace("€", "")
      .replace("euro", "")
      .replace("cent", "")
      .replace(",", ".")
      .trim();

    // Versuche als Dezimalzahl zu parsen
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      // Wenn < 10 und keine Dezimalstelle, könnte es Euro sein
      if (num < 100 && !normalized.includes(".")) {
        // Könnte Cent oder Euro sein - prüfe beide
        if (Math.abs(num - this.data.answer) < 0.01) {
          parsed = num;
        } else if (Math.abs(num * 100 - this.data.answer * 100) < 1) {
          parsed = num;
        } else {
          parsed = num;
        }
      } else {
        parsed = num;
      }
    }

    const correctAnswer = this.data.answer;
    const isCorrect = parsed !== null && Math.abs(parsed - correctAnswer) < 0.01;

    return {
      isCorrect,
      correctAnswer: formatMoney(Math.floor(correctAnswer), Math.round((correctAnswer % 1) * 100), this.locale),
      userAnswer: userAnswer,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return this.data.operation === "change" ? h.change : h.money;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

/**
 * Gewichts-Aufgabe
 */
class WeightTask extends BaseTask<WeightData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer;

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer: `${correctAnswer} ${this.data.unit}`,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, correctAnswer);

    return {
      isCorrect,
      correctAnswer: `${correctAnswer} ${this.data.unit}`,
      userAnswer: `${parsed} ${this.data.unit}`,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.weight;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 2: Geldrechnen
// ============================================

export const moneyAddSimple: TaskDefinition<MoneyData> = {
  typeId: "money-add-simple",
  category: "measurement",
  grade: 2,
  description: "Geld addieren (einfach)",

  generate(locale: Locale): TaskInstance<MoneyData> {
    const t = moneyTexts[locale] || moneyTexts.de;

    // Nur Euro, keine Cents
    const a = randomInt(1, 10);
    const b = randomInt(1, 10);
    const answer = a + b;

    return new MoneyTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.add(`${a} €`, `${b} €`),
      data: { euros: answer, cents: 0, answer, operation: "add" },
    });
  },
};

export const moneyAddWithCents: TaskDefinition<MoneyData> = {
  typeId: "money-add-cents",
  category: "measurement",
  grade: 2,
  description: "Geld addieren mit Cent",

  generate(locale: Locale): TaskInstance<MoneyData> {
    const t = moneyTexts[locale] || moneyTexts.de;

    const euros1 = randomInt(1, 5);
    const cents1 = randomChoice([10, 20, 25, 50]);
    const euros2 = randomInt(1, 5);
    const cents2 = randomChoice([10, 20, 25, 50]);

    const totalCents = euros1 * 100 + cents1 + euros2 * 100 + cents2;
    const answer = totalCents / 100;

    return new MoneyTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.add(formatMoney(euros1, cents1, locale), formatMoney(euros2, cents2, locale)),
      data: {
        euros: Math.floor(answer),
        cents: Math.round((answer % 1) * 100),
        answer,
        operation: "add"
      },
    });
  },
};

export const moneyChange: TaskDefinition<MoneyData> = {
  typeId: "money-change",
  category: "measurement",
  grade: 2,
  description: "Wechselgeld berechnen",

  generate(locale: Locale): TaskInstance<MoneyData> {
    const t = moneyTexts[locale] || moneyTexts.de;

    const paid = randomChoice([5, 10, 20]);
    const cost = randomInt(1, paid - 1);
    const answer = paid - cost;

    return new MoneyTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.change(`${paid} €`, `${cost} €`),
      data: { euros: answer, cents: 0, answer, operation: "change" },
    });
  },
};

// ============================================
// KLASSE 3: Gewichte
// ============================================

export const weightConvertKgToG: TaskDefinition<WeightData> = {
  typeId: "weight-kg-to-g",
  category: "measurement",
  grade: 3,
  description: "Kilogramm in Gramm",

  generate(locale: Locale): TaskInstance<WeightData> {
    const t = weightTexts[locale] || weightTexts.de;

    const kg = randomInt(1, 9);
    const answer = kg * 1000;

    return new WeightTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(kg, "kg", "g"),
      data: { kilograms: kg, answer, unit: "g", operation: "convert" },
    });
  },
};

export const weightConvertGToKg: TaskDefinition<WeightData> = {
  typeId: "weight-g-to-kg",
  category: "measurement",
  grade: 3,
  description: "Gramm in Kilogramm",

  generate(locale: Locale): TaskInstance<WeightData> {
    const t = weightTexts[locale] || weightTexts.de;

    const kg = randomInt(1, 9);
    const g = kg * 1000;
    const answer = kg;

    return new WeightTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(g, "g", "kg"),
      data: { grams: g, answer, unit: "kg", operation: "convert" },
    });
  },
};

export const weightAddGrams: TaskDefinition<WeightData> = {
  typeId: "weight-add-g",
  category: "measurement",
  grade: 3,
  description: "Gramm addieren",

  generate(locale: Locale): TaskInstance<WeightData> {
    const t = weightTexts[locale] || weightTexts.de;

    const a = randomInt(100, 500);
    const b = randomInt(100, 500);
    const answer = a + b;

    return new WeightTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.add(`${a} g`, `${b} g`),
      data: { grams: answer, answer, unit: "g", operation: "add" },
    });
  },
};

// Export
export const measurementTasks: TaskDefinition[] = [
  // Klasse 2 - Geld
  moneyAddSimple,
  moneyAddWithCents,
  moneyChange,
  // Klasse 3 - Gewichte
  weightConvertKgToG,
  weightConvertGToKg,
  weightAddGrams,
];
