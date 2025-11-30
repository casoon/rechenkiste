/**
 * Maßeinheiten-Aufgaben
 *
 * Geld, Gewichte, Längen, Hohlmaße, Flächen, Mengen
 */

import type { Locale } from "@i18n/translations";
import type {
  TaskDefinition,
  TaskInstance,
  ValidationResult,
  ChoiceOption,
} from "@domain/task-system/interfaces";
import { BaseTask } from "@domain/task-system/base-task";

// Datentypen
interface MoneyData {
  euros: number;
  cents: number;
  answer: number;
  operation: "add" | "subtract" | "total" | "change";
}

interface UnitConversionData {
  fromValue: number;
  fromUnit: string;
  toUnit: string;
  answer: number;
  conversionType: "length" | "weight" | "volume" | "area" | "quantity";
}

interface UnitChoiceData {
  correctOptionId: string;
  answer: string;
  category: "length" | "weight" | "volume" | "area";
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
const moneyTexts = {
  de: {
    total: (items: string[]) => `Was kosten ${items.join(" und ")} zusammen?`,
    change: (paid: string, cost: string) =>
      `Du zahlst ${paid} und kaufst etwas für ${cost}. Wie viel Wechselgeld bekommst du?`,
    add: (a: string, b: string) => `${a} + ${b} = ?`,
    currency: "€",
    cents: "Cent",
  },
  en: {
    total: (items: string[]) =>
      `How much do ${items.join(" and ")} cost together?`,
    change: (paid: string, cost: string) =>
      `You pay ${paid} and buy something for ${cost}. How much change do you get?`,
    add: (a: string, b: string) => `${a} + ${b} = ?`,
    currency: "€",
    cents: "cents",
  },
  uk: {
    total: (items: string[]) => `Скільки коштують ${items.join(" і ")} разом?`,
    change: (paid: string, cost: string) =>
      `Ти платиш ${paid} і купуєш щось за ${cost}. Скільки здачі ти отримаєш?`,
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

const conversionTexts = {
  de: {
    convert: (value: number, from: string, to: string) =>
      `Wie viel sind ${value} ${from} in ${to}?`,
    dozen: "Dutzend",
    pieces: "Stück",
  },
  en: {
    convert: (value: number, from: string, to: string) =>
      `How much is ${value} ${from} in ${to}?`,
    dozen: "dozen",
    pieces: "pieces",
  },
  uk: {
    convert: (value: number, from: string, to: string) =>
      `Скільки буде ${value} ${from} в ${to}?`,
    dozen: "дюжин",
    pieces: "штук",
  },
};

const unitChoiceTexts = {
  de: {
    whichUnitFits: (value: number, from: string) => `${value} ${from} = 1 ___`,
    whichUnitForLength: "Welche Einheit misst eine Länge?",
    whichUnitForWeight: "Welche Einheit misst ein Gewicht?",
    whichUnitForVolume: "Welche Einheit misst ein Volumen?",
    whichUnitForArea: "Welche Einheit misst eine Fläche?",
    whatMeasures: (thing: string) => `Womit misst man ${thing}?`,
    // Dinge zum Messen
    distance: "die Entfernung zur Schule",
    milk: "die Menge Milch im Glas",
    appleWeight: "wie schwer ein Apfel ist",
    gardenSize: "wie groß der Garten ist",
    pencilLength: "wie lang ein Bleistift ist",
    waterBottle: "wie viel Wasser in eine Flasche passt",
    bagWeight: "wie schwer die Schultasche ist",
    roomSize: "wie groß das Zimmer ist",
  },
  en: {
    whichUnitFits: (value: number, from: string) => `${value} ${from} = 1 ___`,
    whichUnitForLength: "Which unit measures length?",
    whichUnitForWeight: "Which unit measures weight?",
    whichUnitForVolume: "Which unit measures volume?",
    whichUnitForArea: "Which unit measures area?",
    whatMeasures: (thing: string) => `What do you use to measure ${thing}?`,
    distance: "the distance to school",
    milk: "the amount of milk in the glass",
    appleWeight: "how heavy an apple is",
    gardenSize: "how big the garden is",
    pencilLength: "how long a pencil is",
    waterBottle: "how much water fits in a bottle",
    bagWeight: "how heavy the school bag is",
    roomSize: "how big the room is",
  },
  uk: {
    whichUnitFits: (value: number, from: string) => `${value} ${from} = 1 ___`,
    whichUnitForLength: "Яка одиниця вимірює довжину?",
    whichUnitForWeight: "Яка одиниця вимірює вагу?",
    whichUnitForVolume: "Яка одиниця вимірює об'єм?",
    whichUnitForArea: "Яка одиниця вимірює площу?",
    whatMeasures: (thing: string) => `Чим вимірюють ${thing}?`,
    distance: "відстань до школи",
    milk: "кількість молока в склянці",
    appleWeight: "скільки важить яблуко",
    gardenSize: "який розмір саду",
    pencilLength: "яка довжина олівця",
    waterBottle: "скільки води поміститься в пляшку",
    bagWeight: "скільки важить шкільна сумка",
    roomSize: "який розмір кімнати",
  },
};

const hints = {
  de: {
    money: "1 Euro = 100 Cent. Rechne erst die Cents zusammen!",
    change: "Wechselgeld = Bezahlt - Preis",
    weight: "1 kg = 1000 g, 1 t = 1000 kg",
    length: "1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm",
    volume: "1 l = 1000 ml",
    area: "1 ha = 100 a = 10.000 m², 1 a = 100 m²",
    dozen: "1 Dutzend = 12 Stück",
    unitChoice:
      "Überlege: Was wird hier gemessen - Länge, Gewicht, Volumen oder Fläche?",
  },
  en: {
    money: "1 Euro = 100 cents. Add the cents first!",
    change: "Change = Paid - Price",
    weight: "1 kg = 1000 g, 1 t = 1000 kg",
    length: "1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm",
    volume: "1 l = 1000 ml",
    area: "1 ha = 100 a = 10,000 m², 1 a = 100 m²",
    dozen: "1 dozen = 12 pieces",
    unitChoice:
      "Think: What is being measured - length, weight, volume or area?",
  },
  uk: {
    money: "1 євро = 100 центів. Спочатку додай центи!",
    change: "Здача = Заплачено - Ціна",
    weight: "1 кг = 1000 г, 1 т = 1000 кг",
    length: "1 км = 1000 м, 1 м = 100 см, 1 см = 10 мм",
    volume: "1 л = 1000 мл",
    area: "1 га = 100 а = 10 000 м², 1 а = 100 м²",
    dozen: "1 дюжина = 12 штук",
    unitChoice: "Подумай: Що тут вимірюється - довжина, вага, об'єм чи площа?",
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
    // Akzeptiere verschiedene Formate: "1,50", "1.50", "7,60", "7.6", "150"
    const normalized = userAnswer
      .toLowerCase()
      .trim()
      .replace("€", "")
      .replace("euro", "")
      .replace("cent", "")
      .replace(",", ".")
      .trim();

    // Versuche als Dezimalzahl zu parsen
    const parsed = parseFloat(normalized);
    const correctAnswer = this.data.answer;

    // Vergleich mit Toleranz für Fließkomma-Ungenauigkeiten
    // 7.60 und 7.6 sind gleich, ebenso 7,60 (wird zu 7.60)
    const isCorrect = !isNaN(parsed) && Math.abs(parsed - correctAnswer) < 0.01;

    return {
      isCorrect,
      correctAnswer: formatMoney(
        Math.floor(correctAnswer),
        Math.round((correctAnswer % 1) * 100),
        this.locale,
      ),
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

/**
 * Multiple-Choice Einheiten-Aufgabe
 */
class UnitChoiceTask extends BaseTask<UnitChoiceData> {
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
    return h.unitChoice;
  }

  getCorrectAnswer(): string {
    return this.data.answer;
  }
}

/**
 * Einheitenumrechnung-Aufgabe
 */
class UnitConversionTask extends BaseTask<UnitConversionData> {
  constructor(
    config: ConstructorParameters<typeof BaseTask<UnitConversionData>>[0],
  ) {
    // Setze automatisch inputLabel auf die Ziel-Einheit
    super({
      ...config,
      inputLabel: config.inputLabel || config.data.toUnit,
    });
  }

  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer;

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer: `${correctAnswer} ${this.data.toUnit}`,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, correctAnswer);

    return {
      isCorrect,
      correctAnswer: `${correctAnswer} ${this.data.toUnit}`,
      userAnswer: `${parsed} ${this.data.toUnit}`,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    switch (this.data.conversionType) {
      case "length":
        return h.length;
      case "weight":
        return h.weight;
      case "volume":
        return h.volume;
      case "area":
        return h.area;
      case "quantity":
        return h.dozen;
      default:
        return h.length;
    }
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
  grade: 1,
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
      inputLabel: "€",
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
      question: t.add(
        formatMoney(euros1, cents1, locale),
        formatMoney(euros2, cents2, locale),
      ),
      data: {
        euros: Math.floor(answer),
        cents: Math.round((answer % 1) * 100),
        answer,
        operation: "add",
      },
      inputLabel: "€",
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
      inputLabel: "€",
    });
  },
};

// ============================================
// KLASSE 2: Längen (einfach)
// ============================================

export const lengthCmToMm: TaskDefinition<UnitConversionData> = {
  typeId: "length-cm-to-mm",
  category: "measurement",
  grade: 2,
  description: "Zentimeter in Millimeter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const cm = randomInt(1, 10);
    const answer = cm * 10;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(cm, "cm", "mm"),
      data: {
        fromValue: cm,
        fromUnit: "cm",
        toUnit: "mm",
        answer,
        conversionType: "length",
      },
    });
  },
};

export const lengthMmToCm: TaskDefinition<UnitConversionData> = {
  typeId: "length-mm-to-cm",
  category: "measurement",
  grade: 2,
  description: "Millimeter in Zentimeter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const cm = randomInt(1, 10);
    const mm = cm * 10;
    const answer = cm;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(mm, "mm", "cm"),
      data: {
        fromValue: mm,
        fromUnit: "mm",
        toUnit: "cm",
        answer,
        conversionType: "length",
      },
    });
  },
};

export const lengthMToCm: TaskDefinition<UnitConversionData> = {
  typeId: "length-m-to-cm",
  category: "measurement",
  grade: 2,
  description: "Meter in Zentimeter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const m = randomInt(1, 5);
    const answer = m * 100;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(m, "m", "cm"),
      data: {
        fromValue: m,
        fromUnit: "m",
        toUnit: "cm",
        answer,
        conversionType: "length",
      },
    });
  },
};

export const lengthCmToM: TaskDefinition<UnitConversionData> = {
  typeId: "length-cm-to-m",
  category: "measurement",
  grade: 2,
  description: "Zentimeter in Meter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const m = randomInt(1, 5);
    const cm = m * 100;
    const answer = m;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(cm, "cm", "m"),
      data: {
        fromValue: cm,
        fromUnit: "cm",
        toUnit: "m",
        answer,
        conversionType: "length",
      },
    });
  },
};

// ============================================
// KLASSE 3: Längen (erweitert) & Gewichte
// ============================================

export const lengthKmToM: TaskDefinition<UnitConversionData> = {
  typeId: "length-km-to-m",
  category: "measurement",
  grade: 3,
  description: "Kilometer in Meter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const km = randomInt(1, 9);
    const answer = km * 1000;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(km, "km", "m"),
      data: {
        fromValue: km,
        fromUnit: "km",
        toUnit: "m",
        answer,
        conversionType: "length",
      },
    });
  },
};

export const lengthMToKm: TaskDefinition<UnitConversionData> = {
  typeId: "length-m-to-km",
  category: "measurement",
  grade: 3,
  description: "Meter in Kilometer",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const km = randomInt(1, 9);
    const m = km * 1000;
    const answer = km;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(m, "m", "km"),
      data: {
        fromValue: m,
        fromUnit: "m",
        toUnit: "km",
        answer,
        conversionType: "length",
      },
    });
  },
};

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

// ============================================
// KLASSE 3: Hohlmaße (Volumen)
// ============================================

export const volumeLToMl: TaskDefinition<UnitConversionData> = {
  typeId: "volume-l-to-ml",
  category: "measurement",
  grade: 3,
  description: "Liter in Milliliter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const l = randomInt(1, 5);
    const answer = l * 1000;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(l, "l", "ml"),
      data: {
        fromValue: l,
        fromUnit: "l",
        toUnit: "ml",
        answer,
        conversionType: "volume",
      },
    });
  },
};

export const volumeMlToL: TaskDefinition<UnitConversionData> = {
  typeId: "volume-ml-to-l",
  category: "measurement",
  grade: 3,
  description: "Milliliter in Liter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const l = randomInt(1, 5);
    const ml = l * 1000;
    const answer = l;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(ml, "ml", "l"),
      data: {
        fromValue: ml,
        fromUnit: "ml",
        toUnit: "l",
        answer,
        conversionType: "volume",
      },
    });
  },
};

// ============================================
// KLASSE 3: Mengen (Dutzend)
// ============================================

export const dozenToPieces: TaskDefinition<UnitConversionData> = {
  typeId: "dozen-to-pieces",
  category: "measurement",
  grade: 3,
  description: "Dutzend in Stück",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const dozen = randomInt(1, 5);
    const answer = dozen * 12;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(dozen, t.dozen, t.pieces),
      data: {
        fromValue: dozen,
        fromUnit: t.dozen,
        toUnit: t.pieces,
        answer,
        conversionType: "quantity",
      },
    });
  },
};

export const piecesToDozen: TaskDefinition<UnitConversionData> = {
  typeId: "pieces-to-dozen",
  category: "measurement",
  grade: 3,
  description: "Stück in Dutzend",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const dozen = randomInt(1, 5);
    const pieces = dozen * 12;
    const answer = dozen;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(pieces, t.pieces, t.dozen),
      data: {
        fromValue: pieces,
        fromUnit: t.pieces,
        toUnit: t.dozen,
        answer,
        conversionType: "quantity",
      },
    });
  },
};

// ============================================
// KLASSE 4: Gewichte (erweitert) & Flächen
// ============================================

export const weightKgToT: TaskDefinition<UnitConversionData> = {
  typeId: "weight-kg-to-t",
  category: "measurement",
  grade: 4,
  description: "Kilogramm in Tonnen",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const tons = randomInt(1, 5);
    const kg = tons * 1000;
    const answer = tons;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(kg, "kg", "t"),
      data: {
        fromValue: kg,
        fromUnit: "kg",
        toUnit: "t",
        answer,
        conversionType: "weight",
      },
    });
  },
};

export const weightTToKg: TaskDefinition<UnitConversionData> = {
  typeId: "weight-t-to-kg",
  category: "measurement",
  grade: 4,
  description: "Tonnen in Kilogramm",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const tons = randomInt(1, 5);
    const answer = tons * 1000;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(tons, "t", "kg"),
      data: {
        fromValue: tons,
        fromUnit: "t",
        toUnit: "kg",
        answer,
        conversionType: "weight",
      },
    });
  },
};

export const areaM2ToA: TaskDefinition<UnitConversionData> = {
  typeId: "area-m2-to-a",
  category: "measurement",
  grade: 4,
  description: "Quadratmeter in Ar",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const a = randomInt(1, 10);
    const m2 = a * 100;
    const answer = a;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(m2, "m²", "a"),
      data: {
        fromValue: m2,
        fromUnit: "m²",
        toUnit: "a",
        answer,
        conversionType: "area",
      },
    });
  },
};

export const areaAToM2: TaskDefinition<UnitConversionData> = {
  typeId: "area-a-to-m2",
  category: "measurement",
  grade: 4,
  description: "Ar in Quadratmeter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const a = randomInt(1, 10);
    const answer = a * 100;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(a, "a", "m²"),
      data: {
        fromValue: a,
        fromUnit: "a",
        toUnit: "m²",
        answer,
        conversionType: "area",
      },
    });
  },
};

export const areaAToHa: TaskDefinition<UnitConversionData> = {
  typeId: "area-a-to-ha",
  category: "measurement",
  grade: 4,
  description: "Ar in Hektar",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const ha = randomInt(1, 5);
    const a = ha * 100;
    const answer = ha;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(a, "a", "ha"),
      data: {
        fromValue: a,
        fromUnit: "a",
        toUnit: "ha",
        answer,
        conversionType: "area",
      },
    });
  },
};

export const areaHaToA: TaskDefinition<UnitConversionData> = {
  typeId: "area-ha-to-a",
  category: "measurement",
  grade: 4,
  description: "Hektar in Ar",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const ha = randomInt(1, 5);
    const answer = ha * 100;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(ha, "ha", "a"),
      data: {
        fromValue: ha,
        fromUnit: "ha",
        toUnit: "a",
        answer,
        conversionType: "area",
      },
    });
  },
};

export const areaHaToM2: TaskDefinition<UnitConversionData> = {
  typeId: "area-ha-to-m2",
  category: "measurement",
  grade: 4,
  description: "Hektar in Quadratmeter",

  generate(locale: Locale): TaskInstance<UnitConversionData> {
    const t = conversionTexts[locale] || conversionTexts.de;

    const ha = randomInt(1, 3);
    const answer = ha * 10000;

    return new UnitConversionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.convert(ha, "ha", "m²"),
      data: {
        fromValue: ha,
        fromUnit: "ha",
        toUnit: "m²",
        answer,
        conversionType: "area",
      },
    });
  },
};

// ============================================
// KLASSE 2-3: Multiple-Choice Einheiten
// ============================================

/**
 * Welche Einheit passt? z.B. "1000 m = 1 ___" -> km
 */
export const unitChoiceConversion: TaskDefinition<UnitChoiceData> = {
  typeId: "mc-unit-conversion",
  category: "measurement",
  grade: 2,
  description: "Einheit bei Umrechnung wählen",

  generate(locale: Locale): TaskInstance<UnitChoiceData> {
    const t = unitChoiceTexts[locale] || unitChoiceTexts.de;

    // Umrechnungen mit korrekter Einheit
    const conversions = [
      {
        value: 1000,
        from: "m",
        correct: "km",
        distractors: ["cm", "mm", "ha"],
      },
      { value: 100, from: "cm", correct: "m", distractors: ["km", "mm", "dm"] },
      { value: 10, from: "mm", correct: "cm", distractors: ["m", "km", "dm"] },
      { value: 1000, from: "g", correct: "kg", distractors: ["t", "mg", "l"] },
      { value: 1000, from: "kg", correct: "t", distractors: ["g", "kg", "ha"] },
      { value: 1000, from: "ml", correct: "l", distractors: ["kg", "g", "m"] },
      { value: 100, from: "a", correct: "ha", distractors: ["m²", "km²", "l"] },
      { value: 100, from: "m²", correct: "a", distractors: ["ha", "km²", "m"] },
    ];

    const conv = randomChoice(conversions);
    const correctId = generateId();

    const choices: ChoiceOption[] = shuffle([
      { id: correctId, label: conv.correct, value: conv.correct },
      ...conv.distractors.map((d) => ({
        id: generateId(),
        label: d,
        value: d,
      })),
    ]);

    return new UnitChoiceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.whichUnitFits(conv.value, conv.from),
      data: {
        correctOptionId: correctId,
        answer: conv.correct,
        category: "length",
      },
      inputType: "multiple-choice",
      choices,
    });
  },
};

/**
 * Welche Einheit misst was? z.B. "Womit misst man die Entfernung?" -> km, m, cm
 */
export const unitChoiceCategory: TaskDefinition<UnitChoiceData> = {
  typeId: "mc-unit-category",
  category: "measurement",
  grade: 2,
  description: "Richtige Einheitenkategorie wählen",

  generate(locale: Locale): TaskInstance<UnitChoiceData> {
    const t = unitChoiceTexts[locale] || unitChoiceTexts.de;

    // Fragen mit korrekter Einheit und Distraktoren aus anderen Kategorien
    const questions: Array<{
      thing: keyof typeof t;
      correct: string;
      category: "length" | "weight" | "volume" | "area";
      distractors: string[];
    }> = [
      {
        thing: "distance",
        correct: "km",
        category: "length",
        distractors: ["kg", "l", "ha"],
      },
      {
        thing: "pencilLength",
        correct: "cm",
        category: "length",
        distractors: ["g", "ml", "m²"],
      },
      {
        thing: "milk",
        correct: "ml",
        category: "volume",
        distractors: ["g", "cm", "a"],
      },
      {
        thing: "waterBottle",
        correct: "l",
        category: "volume",
        distractors: ["kg", "m", "m²"],
      },
      {
        thing: "appleWeight",
        correct: "g",
        category: "weight",
        distractors: ["ml", "cm", "a"],
      },
      {
        thing: "bagWeight",
        correct: "kg",
        category: "weight",
        distractors: ["l", "m", "ha"],
      },
      {
        thing: "gardenSize",
        correct: "m²",
        category: "area",
        distractors: ["m", "kg", "l"],
      },
      {
        thing: "roomSize",
        correct: "m²",
        category: "area",
        distractors: ["m", "l", "kg"],
      },
    ];

    const q = randomChoice(questions);
    const correctId = generateId();
    const thingText = t[q.thing] as string;

    const choices: ChoiceOption[] = shuffle([
      { id: correctId, label: q.correct, value: q.correct },
      ...q.distractors.map((d) => ({
        id: generateId(),
        label: d,
        value: d,
      })),
    ]);

    return new UnitChoiceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.whatMeasures(thingText),
      data: {
        correctOptionId: correctId,
        answer: q.correct,
        category: q.category,
      },
      inputType: "multiple-choice",
      choices,
    });
  },
};

/**
 * Erweiterte Einheitenfragen für Klasse 3-4 mit ha, a, t
 */
export const unitChoiceAdvanced: TaskDefinition<UnitChoiceData> = {
  typeId: "mc-unit-advanced",
  category: "measurement",
  grade: 3,
  description: "Erweiterte Einheitenwahl (ha, a, t)",

  generate(locale: Locale): TaskInstance<UnitChoiceData> {
    const t = unitChoiceTexts[locale] || unitChoiceTexts.de;

    const conversions = [
      {
        value: 10000,
        from: "m²",
        correct: "ha",
        distractors: ["a", "km²", "km"],
      },
      { value: 100, from: "m²", correct: "a", distractors: ["ha", "km²", "m"] },
      {
        value: 100,
        from: "a",
        correct: "ha",
        distractors: ["m²", "km²", "km"],
      },
      { value: 1000, from: "kg", correct: "t", distractors: ["g", "ha", "km"] },
      {
        value: 12,
        from: "Stück",
        correct: "Dutzend",
        distractors: ["kg", "m", "l"],
      },
    ];

    const conv = randomChoice(conversions);
    const correctId = generateId();

    const choices: ChoiceOption[] = shuffle([
      { id: correctId, label: conv.correct, value: conv.correct },
      ...conv.distractors.map((d) => ({
        id: generateId(),
        label: d,
        value: d,
      })),
    ]);

    return new UnitChoiceTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: t.whichUnitFits(conv.value, conv.from),
      data: {
        correctOptionId: correctId,
        answer: conv.correct,
        category: "area",
      },
      inputType: "multiple-choice",
      choices,
    });
  },
};

// Export
export const measurementTasks: TaskDefinition[] = [
  // Klasse 2 - Geld
  moneyAddSimple,
  moneyAddWithCents,
  moneyChange,
  // Klasse 2 - Längen (einfach)
  lengthCmToMm,
  lengthMmToCm,
  lengthMToCm,
  lengthCmToM,
  // Klasse 3 - Längen (erweitert)
  lengthKmToM,
  lengthMToKm,
  // Klasse 3 - Gewichte
  weightConvertKgToG,
  weightConvertGToKg,
  weightAddGrams,
  // Klasse 3 - Hohlmaße
  volumeLToMl,
  volumeMlToL,
  // Klasse 3 - Mengen (Dutzend)
  dozenToPieces,
  piecesToDozen,
  // Klasse 4 - Gewichte (erweitert)
  weightKgToT,
  weightTToKg,
  // Klasse 4 - Flächen
  areaM2ToA,
  areaAToM2,
  areaAToHa,
  areaHaToA,
  areaHaToM2,
  // Klasse 2-3 - Multiple-Choice Einheiten
  unitChoiceConversion,
  unitChoiceCategory,
  unitChoiceAdvanced,
];
