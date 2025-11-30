/**
 * Visuelle Aufgaben
 *
 * Mengen zählen, Symmetrie erkennen, Diagramme lesen
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
interface CountingData {
  count: number;
  shape: string;
  answer: number;
}

interface SymmetryData {
  isSymmetric: boolean;
  answer: string;
  axisType?: "vertical" | "horizontal" | "both";
}

interface DiagramData {
  values: number[];
  labels: string[];
  question: string;
  answer: number;
  type: "bar" | "pie" | "line";
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

// Lokalisierte Texte
const texts = {
  de: {
    countShapes: "Zähle die Formen:",
    howMany: "Wie viele",
    areThese: "sind das?",
    circle: "Kreise",
    square: "Quadrate",
    triangle: "Dreiecke",
    star: "Sterne",
    heart: "Herzen",
    isSymmetric: "Ist diese Form symmetrisch?",
    answerInstruction: "Antworte mit ja oder nein",
    yes: "ja",
    no: "nein",
    diagramQuestion: "Schau dir das Diagramm an:",
    howManyTotal: "Wie viele insgesamt?",
    whichMost: "Welche Kategorie hat am meisten?",
    howManyMore: "Wie viel mehr hat {a} als {b}?",
  },
  en: {
    countShapes: "Count the shapes:",
    howMany: "How many",
    areThese: "are there?",
    circle: "circles",
    square: "squares",
    triangle: "triangles",
    star: "stars",
    heart: "hearts",
    isSymmetric: "Is this shape symmetric?",
    answerInstruction: "Answer with yes or no",
    yes: "yes",
    no: "no",
    diagramQuestion: "Look at the diagram:",
    howManyTotal: "How many in total?",
    whichMost: "Which category has the most?",
    howManyMore: "How many more does {a} have than {b}?",
  },
  uk: {
    countShapes: "Порахуй фігури:",
    howMany: "Скільки",
    areThese: "тут?",
    circle: "кіл",
    square: "квадратів",
    triangle: "трикутників",
    star: "зірок",
    heart: "сердець",
    isSymmetric: "Чи є ця фігура симетричною?",
    answerInstruction: "Відповідай так або ні",
    yes: "так",
    no: "ні",
    diagramQuestion: "Подивись на діаграму:",
    howManyTotal: "Скільки всього?",
    whichMost: "Яка категорія має найбільше?",
    howManyMore: "На скільки більше має {a} ніж {b}?",
  },
};

const hints = {
  de: {
    counting: "Zähle jede Form einzeln. Markiere die gezählten mit dem Finger.",
    symmetry:
      "Eine Form ist symmetrisch, wenn sie auf beiden Seiten gleich aussieht.",
    diagram: "Lies die Werte von den Balken ab.",
  },
  en: {
    counting:
      "Count each shape one by one. Mark the counted ones with your finger.",
    symmetry: "A shape is symmetric if it looks the same on both sides.",
    diagram: "Read the values from the bars.",
  },
  uk: {
    counting: "Рахуй кожну фігуру окремо. Позначай пораховані пальцем.",
    symmetry: "Фігура симетрична, якщо вона виглядає однаково з обох сторін.",
    diagram: "Зчитуй значення зі стовпчиків.",
  },
};

// SVG Formen
const shapes = {
  circle: (x: number, y: number, color: string) =>
    `<circle cx="${x}" cy="${y}" r="12" fill="${color}" stroke="#333" stroke-width="1.5"/>`,
  square: (x: number, y: number, color: string) =>
    `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" fill="${color}" stroke="#333" stroke-width="1.5"/>`,
  triangle: (x: number, y: number, color: string) =>
    `<polygon points="${x},${y - 12} ${x - 12},${y + 10} ${x + 12},${y + 10}" fill="${color}" stroke="#333" stroke-width="1.5"/>`,
  star: (x: number, y: number, color: string) => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 72 - 90) * (Math.PI / 180);
      const innerAngle = (i * 72 + 36 - 90) * (Math.PI / 180);
      points.push(
        `${x + 12 * Math.cos(outerAngle)},${y + 12 * Math.sin(outerAngle)}`,
      );
      points.push(
        `${x + 5 * Math.cos(innerAngle)},${y + 5 * Math.sin(innerAngle)}`,
      );
    }
    return `<polygon points="${points.join(" ")}" fill="${color}" stroke="#333" stroke-width="1.5"/>`;
  },
  heart: (x: number, y: number, color: string) =>
    `<path d="M ${x} ${y + 5} C ${x - 12} ${y - 8}, ${x - 12} ${y - 15}, ${x} ${y - 8} C ${x + 12} ${y - 15}, ${x + 12} ${y - 8}, ${x} ${y + 5} Z" fill="${color}" stroke="#333" stroke-width="1.5"/>`,
};

const colors = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#ffeaa7",
  "#dfe6e9",
  "#fd79a8",
];

function generateCountingSvg(
  shapeType: keyof typeof shapes,
  count: number,
): string {
  const positions: { x: number; y: number }[] = [];
  const width = 280;
  const height = 140;

  // Generiere zufällige Positionen ohne Überlappung
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = randomInt(25, width - 25);
      y = randomInt(25, height - 25);
      attempts++;
    } while (
      attempts < 50 &&
      positions.some((p) => Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 30)
    );
    positions.push({ x, y });
  }

  const shapeFn = shapes[shapeType];
  const shapesSvg = positions
    .map((p) => shapeFn(p.x, p.y, randomChoice(colors)))
    .join("\n");

  return `<svg viewBox="0 0 ${width} ${height}" class="w-full h-32 bg-white rounded-lg border">${shapesSvg}</svg>`;
}

// Symmetrie-SVGs
function generateSymmetrySvg(isSymmetric: boolean): {
  svg: string;
  axisType: "vertical" | "horizontal" | "both";
} {
  const width = 200;
  const height = 150;

  if (isSymmetric) {
    // Symmetrische Formen
    const type = randomChoice(["vertical", "horizontal", "both"] as const);
    let shape: string;

    if (type === "vertical" || type === "both") {
      // Schmetterling-ähnliche Form
      shape = `
        <ellipse cx="70" cy="75" rx="30" ry="40" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
        <ellipse cx="130" cy="75" rx="30" ry="40" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
        <rect x="95" y="55" width="10" height="40" fill="#333"/>
        <line x1="100" y1="20" x2="100" y2="130" stroke="#999" stroke-width="1" stroke-dasharray="5,5"/>
      `;
    } else {
      // Horizontal symmetrisch
      shape = `
        <ellipse cx="100" cy="55" rx="50" ry="25" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
        <ellipse cx="100" cy="95" rx="50" ry="25" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
        <line x1="30" y1="75" x2="170" y2="75" stroke="#999" stroke-width="1" stroke-dasharray="5,5"/>
      `;
    }

    return {
      svg: `<svg viewBox="0 0 ${width} ${height}" class="w-full h-36 bg-white rounded-lg border">${shape}</svg>`,
      axisType: type,
    };
  } else {
    // Asymmetrische Form
    const shape = `
      <ellipse cx="60" cy="60" rx="35" ry="25" fill="#ffeaa7" stroke="#333" stroke-width="2"/>
      <rect x="110" y="80" width="40" height="50" fill="#96ceb4" stroke="#333" stroke-width="2"/>
      <polygon points="150,40 180,90 120,90" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
    `;

    return {
      svg: `<svg viewBox="0 0 ${width} ${height}" class="w-full h-36 bg-white rounded-lg border">${shape}</svg>`,
      axisType: "vertical",
    };
  }
}

// Balkendiagramm SVG
function generateBarChartSvg(values: number[], labels: string[]): string {
  const width = 280;
  const height = 160;
  const barWidth = 40;
  const maxValue = Math.max(...values);
  const chartHeight = 100;
  const startX = 40;
  const startY = 130;

  let bars = "";
  const barColors = ["#4ecdc4", "#ff6b6b", "#ffeaa7", "#96ceb4", "#45b7d1"];

  values.forEach((value, i) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = startX + i * (barWidth + 15);
    const y = startY - barHeight;

    bars += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${barColors[i % barColors.length]}" stroke="#333" stroke-width="1"/>
      <text x="${x + barWidth / 2}" y="${startY + 15}" text-anchor="middle" font-size="10">${labels[i]}</text>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="10" font-weight="bold">${value}</text>
    `;
  });

  // Y-Achse
  const yAxis = `<line x1="35" y1="${startY - chartHeight - 10}" x2="35" y2="${startY}" stroke="#333" stroke-width="1"/>`;

  return `<svg viewBox="0 0 ${width} ${height}" class="w-full h-40 bg-white rounded-lg border">${yAxis}${bars}</svg>`;
}

/**
 * Zähl-Aufgabe
 */
class CountingTask extends BaseTask<CountingData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer;

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
    return h.counting;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

/**
 * Symmetrie-Aufgabe
 */
class SymmetryTask extends BaseTask<SymmetryData> {
  validate(userAnswer: string): ValidationResult {
    const t = texts[this.locale] || texts.de;
    const normalized = userAnswer.toLowerCase().trim();

    const yesAnswers = ["ja", "yes", "так", "j", "y", "1", "true"];
    const noAnswers = ["nein", "no", "ні", "n", "0", "false"];

    let userSaidYes: boolean | null = null;
    if (yesAnswers.includes(normalized)) {
      userSaidYes = true;
    } else if (noAnswers.includes(normalized)) {
      userSaidYes = false;
    }

    if (userSaidYes === null) {
      return {
        isCorrect: false,
        correctAnswer: this.data.isSymmetric ? t.yes : t.no,
        userAnswer: normalized,
        hint: this.getHint(),
      };
    }

    const isCorrect = userSaidYes === this.data.isSymmetric;

    return {
      isCorrect,
      correctAnswer: this.data.isSymmetric ? t.yes : t.no,
      userAnswer: userSaidYes ? t.yes : t.no,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.symmetry;
  }

  getCorrectAnswer(): string {
    const t = texts[this.locale] || texts.de;
    return this.data.isSymmetric ? t.yes : t.no;
  }
}

/**
 * Diagramm-Aufgabe
 */
class DiagramTask extends BaseTask<DiagramData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);
    const correctAnswer = this.data.answer;

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
    return h.diagram;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 1: Mengen zählen
// ============================================

export const countCircles: TaskDefinition<CountingData> = {
  typeId: "visual-count-circles",
  category: "number-sense",
  grade: 1,
  description: "Kreise zählen",

  generate(locale: Locale): TaskInstance<CountingData> {
    const t = texts[locale] || texts.de;
    const count = randomInt(3, 10);
    const svg = generateCountingSvg("circle", count);

    return new CountingTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.howMany} ${t.circle} ${t.areThese}`,
      data: { count, shape: "circle", answer: count },
    });
  },
};

export const countSquares: TaskDefinition<CountingData> = {
  typeId: "visual-count-squares",
  category: "number-sense",
  grade: 1,
  description: "Quadrate zählen",

  generate(locale: Locale): TaskInstance<CountingData> {
    const t = texts[locale] || texts.de;
    const count = randomInt(3, 10);
    const svg = generateCountingSvg("square", count);

    return new CountingTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.howMany} ${t.square} ${t.areThese}`,
      data: { count, shape: "square", answer: count },
    });
  },
};

export const countTriangles: TaskDefinition<CountingData> = {
  typeId: "visual-count-triangles",
  category: "number-sense",
  grade: 1,
  description: "Dreiecke zählen",

  generate(locale: Locale): TaskInstance<CountingData> {
    const t = texts[locale] || texts.de;
    const count = randomInt(3, 10);
    const svg = generateCountingSvg("triangle", count);

    return new CountingTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.howMany} ${t.triangle} ${t.areThese}`,
      data: { count, shape: "triangle", answer: count },
    });
  },
};

export const countMixed: TaskDefinition<CountingData> = {
  typeId: "visual-count-mixed",
  category: "number-sense",
  grade: 1,
  description: "Gemischte Formen zählen",

  generate(locale: Locale): TaskInstance<CountingData> {
    const t = texts[locale] || texts.de;
    const shapeTypes: (keyof typeof shapes)[] = [
      "circle",
      "square",
      "triangle",
      "star",
    ];
    const targetShape = randomChoice(shapeTypes);
    const targetCount = randomInt(2, 6);

    // Generiere SVG mit verschiedenen Formen
    const width = 280;
    const height = 140;
    const positions: { x: number; y: number; shape: keyof typeof shapes }[] =
      [];

    // Füge Ziel-Formen hinzu
    for (let i = 0; i < targetCount; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = randomInt(25, width - 25);
        y = randomInt(25, height - 25);
        attempts++;
      } while (
        attempts < 50 &&
        positions.some((p) => Math.abs(p.x - x) < 35 && Math.abs(p.y - y) < 35)
      );
      positions.push({ x, y, shape: targetShape });
    }

    // Füge andere Formen hinzu
    const otherShapes = shapeTypes.filter((s) => s !== targetShape);
    const otherCount = randomInt(3, 6);
    for (let i = 0; i < otherCount; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = randomInt(25, width - 25);
        y = randomInt(25, height - 25);
        attempts++;
      } while (
        attempts < 50 &&
        positions.some((p) => Math.abs(p.x - x) < 35 && Math.abs(p.y - y) < 35)
      );
      positions.push({ x, y, shape: randomChoice(otherShapes) });
    }

    const shuffledPositions = shuffle(positions);
    const shapesSvg = shuffledPositions
      .map((p) => shapes[p.shape](p.x, p.y, randomChoice(colors)))
      .join("\n");

    const svg = `<svg viewBox="0 0 ${width} ${height}" class="w-full h-32 bg-white rounded-lg border">${shapesSvg}</svg>`;

    const shapeNames: Record<keyof typeof shapes, keyof typeof t> = {
      circle: "circle",
      square: "square",
      triangle: "triangle",
      star: "star",
      heart: "heart",
    };

    return new CountingTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.howMany} ${t[shapeNames[targetShape]]} ${t.areThese}`,
      data: { count: targetCount, shape: targetShape, answer: targetCount },
    });
  },
};

// ============================================
// KLASSE 3: Symmetrie
// ============================================

export const symmetryRecognize: TaskDefinition<SymmetryData> = {
  typeId: "visual-symmetry",
  category: "geometry",
  grade: 3,
  description: "Symmetrie erkennen",

  generate(locale: Locale): TaskInstance<SymmetryData> {
    const t = texts[locale] || texts.de;
    const isSymmetric = Math.random() > 0.4; // 60% symmetrisch
    const { svg, axisType } = generateSymmetrySvg(isSymmetric);

    return new SymmetryTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.isSymmetric}\n\n${t.answerInstruction}`,
      data: { isSymmetric, answer: isSymmetric ? t.yes : t.no, axisType },
    });
  },
};

// ============================================
// KLASSE 4: Diagramme lesen
// ============================================

export const diagramBarTotal: TaskDefinition<DiagramData> = {
  typeId: "visual-diagram-bar-total",
  category: "data",
  grade: 4,
  description: "Balkendiagramm - Summe",

  generate(locale: Locale): TaskInstance<DiagramData> {
    const t = texts[locale] || texts.de;

    const labelsOptions = {
      de: [
        ["Mo", "Di", "Mi", "Do"],
        ["Rot", "Blau", "Grün", "Gelb"],
        ["Apfel", "Birne", "Banane", "Orange"],
      ],
      en: [
        ["Mon", "Tue", "Wed", "Thu"],
        ["Red", "Blue", "Green", "Yellow"],
        ["Apple", "Pear", "Banana", "Orange"],
      ],
      uk: [
        ["Пн", "Вт", "Ср", "Чт"],
        ["Черв", "Син", "Зел", "Жовт"],
        ["Яблуко", "Груша", "Банан", "Апельсин"],
      ],
    };

    const labels = randomChoice(labelsOptions[locale] || labelsOptions.de);
    const values = labels.map(() => randomInt(2, 12));
    const answer = values.reduce((sum, v) => sum + v, 0);

    const svg = generateBarChartSvg(values, labels);

    return new DiagramTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.howManyTotal}`,
      data: { values, labels, question: "total", answer, type: "bar" },
    });
  },
};

export const diagramBarDifference: TaskDefinition<DiagramData> = {
  typeId: "visual-diagram-bar-diff",
  category: "data",
  grade: 4,
  description: "Balkendiagramm - Differenz",

  generate(locale: Locale): TaskInstance<DiagramData> {
    const t = texts[locale] || texts.de;

    const labelsOptions = {
      de: ["Äpfel", "Birnen", "Bananen", "Orangen"],
      en: ["Apples", "Pears", "Bananas", "Oranges"],
      uk: ["Яблука", "Груші", "Банани", "Апельсини"],
    };

    const labels = labelsOptions[locale] || labelsOptions.de;
    const values = labels.map(() => randomInt(3, 15));

    // Finde max und min für die Frage
    const maxIdx = values.indexOf(Math.max(...values));
    const minIdx = values.indexOf(Math.min(...values));
    const answer = values[maxIdx] - values[minIdx];

    const svg = generateBarChartSvg(values, labels);
    const questionText = t.howManyMore
      .replace("{a}", labels[maxIdx])
      .replace("{b}", labels[minIdx]);

    return new DiagramTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${questionText}`,
      data: { values, labels, question: "difference", answer, type: "bar" },
    });
  },
};

// Export
export const visualTasks: TaskDefinition[] = [
  // Klasse 1 - Mengen zählen
  countCircles,
  countSquares,
  countTriangles,
  countMixed,
  // Klasse 3 - Symmetrie
  symmetryRecognize,
  // Klasse 4 - Diagramme
  diagramBarTotal,
  diagramBarDifference,
];
