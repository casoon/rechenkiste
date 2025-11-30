/**
 * Bruch- und Dezimalzahlen-Aufgaben
 *
 * Brüche erkennen, Bruchrechnung, Dezimalzahlen, Prozent
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
interface FractionData {
  numerator: number;
  denominator: number;
  answer: string | number;
  type: "identify" | "add" | "compare" | "simplify";
}

interface DecimalData {
  value: number;
  answer: number;
  operation: "convert" | "add" | "round";
}

interface PercentData {
  percent: number;
  base?: number;
  answer: number;
  type: "identify" | "calculate" | "convert";
}

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Lokalisierte Texte
const fractionTexts = {
  de: {
    identify: "Welcher Bruch ist markiert?",
    whatIs: "Was ist",
    simplify: "Kürze den Bruch:",
    compare: "Welches Zeichen gehört in die Lücke?",
    add: "Rechne:",
    asDecimal: "Als Dezimalzahl:",
    asPercent: "Als Prozent:",
    ofNumber: "von",
  },
  en: {
    identify: "Which fraction is marked?",
    whatIs: "What is",
    simplify: "Simplify the fraction:",
    compare: "Which sign goes in the gap?",
    add: "Calculate:",
    asDecimal: "As decimal:",
    asPercent: "As percent:",
    ofNumber: "of",
  },
  uk: {
    identify: "Який дріб позначено?",
    whatIs: "Що таке",
    simplify: "Скороти дріб:",
    compare: "Який знак потрібен?",
    add: "Обчисли:",
    asDecimal: "Як десятковий дріб:",
    asPercent: "У відсотках:",
    ofNumber: "від",
  },
};

const hints = {
  de: {
    fraction: "Zähle die markierten Teile und alle Teile insgesamt.",
    decimal: "1/2 = 0,5 | 1/4 = 0,25 | 3/4 = 0,75",
    decimalAdd:
      "Rechne erst die Nachkommastellen zusammen. 10 Zehntel = 1 Ganzes.",
    percent: "Prozent bedeutet 'von 100'. 50% = 50/100 = 1/2",
    add: "Bei gleichem Nenner: Zähler addieren, Nenner bleibt gleich.",
  },
  en: {
    fraction: "Count the marked parts and all parts in total.",
    decimal: "1/2 = 0.5 | 1/4 = 0.25 | 3/4 = 0.75",
    decimalAdd: "First add the decimal places. 10 tenths = 1 whole.",
    percent: "Percent means 'out of 100'. 50% = 50/100 = 1/2",
    add: "Same denominator: add numerators, keep denominator.",
  },
  uk: {
    fraction: "Порахуй позначені частини і всі частини загалом.",
    decimal: "1/2 = 0,5 | 1/4 = 0,25 | 3/4 = 0,75",
    decimalAdd: "Спочатку додай десяті. 10 десятих = 1 ціле.",
    percent: "Відсоток означає 'зі 100'. 50% = 50/100 = 1/2",
    add: "При однаковому знаменнику: додай чисельники, знаменник залишається.",
  },
};

// SVG für Bruch-Visualisierung (Kreis)
function generateFractionCircleSvg(
  numerator: number,
  denominator: number,
): string {
  const cx = 100;
  const cy = 100;
  const r = 80;

  let paths = "";
  const anglePerPart = (2 * Math.PI) / denominator;

  for (let i = 0; i < denominator; i++) {
    const startAngle = i * anglePerPart - Math.PI / 2;
    const endAngle = (i + 1) * anglePerPart - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = anglePerPart > Math.PI ? 1 : 0;
    const filled = i < numerator;

    paths += `
      <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z"
            fill="${filled ? "#4ecdc4" : "#e5e7eb"}"
            stroke="#333"
            stroke-width="2"/>
    `;
  }

  return `<svg viewBox="0 0 200 200" class="w-32 h-32 mx-auto">${paths}</svg>`;
}

// SVG für Bruch-Visualisierung (Rechteck)
function generateFractionBarSvg(
  numerator: number,
  denominator: number,
): string {
  const width = 200;
  const height = 40;
  const partWidth = width / denominator;

  let rects = "";
  for (let i = 0; i < denominator; i++) {
    const filled = i < numerator;
    rects += `
      <rect x="${i * partWidth}" y="0" width="${partWidth}" height="${height}"
            fill="${filled ? "#4ecdc4" : "#e5e7eb"}"
            stroke="#333"
            stroke-width="2"/>
    `;
  }

  return `<svg viewBox="0 0 200 40" class="w-full h-12">${rects}</svg>`;
}

/**
 * Bruch-Aufgabe
 */
class FractionTask extends BaseTask<FractionData> {
  validate(userAnswer: string): ValidationResult {
    const normalized = userAnswer.trim().toLowerCase();
    const correctAnswer = String(this.data.answer);

    // Akzeptiere verschiedene Formate: "1/2", "1 / 2", "½"
    const normalizedAnswer = normalized
      .replace(/\s+/g, "")
      .replace("½", "1/2")
      .replace("¼", "1/4")
      .replace("¾", "3/4")
      .replace("⅓", "1/3")
      .replace("⅔", "2/3");

    const normalizedCorrect = correctAnswer.replace(/\s+/g, "");

    // Direkter Vergleich
    if (normalizedAnswer === normalizedCorrect) {
      return {
        isCorrect: true,
        correctAnswer,
        userAnswer: normalized,
      };
    }

    // Prüfe auf äquivalente Brüche (z.B. 6/8 = 3/4)
    const userMatch = normalizedAnswer.match(/^(\d+)\/(\d+)$/);
    const correctMatch = normalizedCorrect.match(/^(\d+)\/(\d+)$/);

    if (userMatch && correctMatch) {
      const userNum = parseInt(userMatch[1], 10);
      const userDen = parseInt(userMatch[2], 10);
      const correctNum = parseInt(correctMatch[1], 10);
      const correctDen = parseInt(correctMatch[2], 10);

      // Prüfe ob Brüche äquivalent sind (Kreuzprodukt)
      if (userNum * correctDen === correctNum * userDen) {
        return {
          isCorrect: true,
          correctAnswer,
          userAnswer: normalized,
        };
      }
    }

    return {
      isCorrect: false,
      correctAnswer,
      userAnswer: normalized,
      hint: this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.fraction;
  }

  getCorrectAnswer(): string {
    return String(this.data.answer);
  }
}

/**
 * Dezimal-Aufgabe
 */
class DecimalTask extends BaseTask<DecimalData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer;

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer: this.formatAnswer(correctAnswer),
        userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, correctAnswer, 0.01);

    return {
      isCorrect,
      correctAnswer: this.formatAnswer(correctAnswer),
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  private formatAnswer(value: number): string {
    // Format mit Komma für deutsche Locale
    if (this.locale === "de" || this.locale === "uk") {
      return value.toFixed(1).replace(".", ",");
    }
    return value.toFixed(1);
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    // Unterschiedlicher Hinweis je nach Operation
    return this.data.operation === "add" ? h.decimalAdd : h.decimal;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

/**
 * Prozent-Aufgabe
 */
class PercentTask extends BaseTask<PercentData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer.replace("%", "").trim());
    const correctAnswer = this.data.answer;

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, correctAnswer, 0.1);

    return {
      isCorrect,
      correctAnswer:
        this.data.type === "convert" ? `${correctAnswer}%` : correctAnswer,
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.percent;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 4: Brüche erkennen
// ============================================

export const fractionIdentifyCircle: TaskDefinition<FractionData> = {
  typeId: "fraction-identify-circle",
  category: "arithmetic",
  grade: 4,
  description: "Bruch erkennen (Kreis)",

  generate(locale: Locale): TaskInstance<FractionData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    const denominator = randomChoice([2, 3, 4, 6, 8]);
    const numerator = randomInt(1, denominator - 1);

    const svg = generateFractionCircleSvg(numerator, denominator);
    const answer = `${numerator}/${denominator}`;

    return new FractionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.identify}`,
      data: { numerator, denominator, answer, type: "identify" },
    });
  },
};

export const fractionIdentifyBar: TaskDefinition<FractionData> = {
  typeId: "fraction-identify-bar",
  category: "arithmetic",
  grade: 4,
  description: "Bruch erkennen (Balken)",

  generate(locale: Locale): TaskInstance<FractionData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    const denominator = randomChoice([2, 4, 5, 8, 10]);
    const numerator = randomInt(1, denominator - 1);

    const svg = generateFractionBarSvg(numerator, denominator);
    const answer = `${numerator}/${denominator}`;

    return new FractionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.identify}`,
      data: { numerator, denominator, answer, type: "identify" },
    });
  },
};

export const fractionToDecimal: TaskDefinition<DecimalData> = {
  typeId: "fraction-to-decimal",
  category: "arithmetic",
  grade: 4,
  description: "Bruch als Dezimalzahl",

  generate(locale: Locale): TaskInstance<DecimalData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    // Einfache Brüche mit schönen Dezimalwerten
    const fractions: [number, number, number][] = [
      [1, 2, 0.5],
      [1, 4, 0.25],
      [3, 4, 0.75],
      [1, 5, 0.2],
      [2, 5, 0.4],
      [3, 5, 0.6],
      [4, 5, 0.8],
      [1, 10, 0.1],
      [3, 10, 0.3],
      [7, 10, 0.7],
    ];

    const [num, denom, answer] = randomChoice(fractions);

    return new DecimalTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.asDecimal} ${num}/${denom} = ?`,
      data: { value: num / denom, answer, operation: "convert" },
    });
  },
};

// ============================================
// KLASSE 5: Bruchrechnung
// ============================================

export const fractionAddSameDenom: TaskDefinition<FractionData> = {
  typeId: "fraction-add-same",
  category: "arithmetic",
  grade: 5,
  description: "Brüche addieren (gleicher Nenner)",

  generate(locale: Locale): TaskInstance<FractionData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    const denominator = randomChoice([4, 5, 6, 8, 10]);
    const num1 = randomInt(1, Math.floor(denominator / 2));
    const num2 = randomInt(1, denominator - num1 - 1);
    const resultNum = num1 + num2;

    // Kürzen wenn möglich
    const divisor = gcd(resultNum, denominator);
    const answer = `${resultNum / divisor}/${denominator / divisor}`;

    return new FractionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${num1}/${denominator} + ${num2}/${denominator} = ?`,
      data: { numerator: resultNum, denominator, answer, type: "add" },
    });
  },
};

export const decimalAdd: TaskDefinition<DecimalData> = {
  typeId: "decimal-add",
  category: "arithmetic",
  grade: 5,
  description: "Dezimalzahlen addieren",

  generate(locale: Locale): TaskInstance<DecimalData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    // Einfache Dezimalzahlen mit einer Nachkommastelle
    const a = randomInt(1, 9) + randomInt(1, 9) / 10;
    const b = randomInt(1, 9) + randomInt(1, 9) / 10;
    const answer = Math.round((a + b) * 10) / 10;

    const aStr = a.toFixed(1).replace(".", ",");
    const bStr = b.toFixed(1).replace(".", ",");

    return new DecimalTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${aStr} + ${bStr} = ?`,
      data: { value: a + b, answer, operation: "add" },
    });
  },
};

export const percentIdentify: TaskDefinition<FractionData> = {
  typeId: "percent-identify",
  category: "arithmetic",
  grade: 5,
  description: "Prozent als Bruch",

  generate(locale: Locale): TaskInstance<FractionData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    // Einfache Prozente: 25%, 50%, 75%, 10%, 20%
    const percents: [number, number, number][] = [
      [25, 1, 4], // 25% = 1/4
      [50, 1, 2], // 50% = 1/2
      [75, 3, 4], // 75% = 3/4
      [10, 1, 10], // 10% = 1/10
      [20, 1, 5], // 20% = 1/5
    ];

    const [percent, numerator, denominator] = randomChoice(percents);
    const answer = `${numerator}/${denominator}`;

    return new FractionTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.whatIs} ${percent}% als Bruch?`,
      data: { numerator, denominator, answer, type: "identify" },
    });
  },
};

export const percentOfNumber: TaskDefinition<PercentData> = {
  typeId: "percent-of-number",
  category: "arithmetic",
  grade: 5,
  description: "Prozent einer Zahl",

  generate(locale: Locale): TaskInstance<PercentData> {
    const t = fractionTexts[locale] || fractionTexts.de;

    // Einfache Berechnungen: 10%, 25%, 50% von runden Zahlen
    const percent = randomChoice([10, 25, 50]);
    const base = randomChoice([20, 40, 60, 80, 100, 200]);
    const answer = (percent / 100) * base;

    return new PercentTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.whatIs} ${percent}% ${t.ofNumber} ${base}?`,
      data: { percent, base, answer, type: "calculate" },
    });
  },
};

// Export
export const fractionTasks: TaskDefinition[] = [
  // Klasse 4
  fractionIdentifyCircle,
  fractionIdentifyBar,
  fractionToDecimal,
  // Klasse 5
  fractionAddSameDenom,
  decimalAdd,
  percentIdentify,
  percentOfNumber,
];
