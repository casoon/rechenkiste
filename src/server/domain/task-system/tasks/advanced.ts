/**
 * Erweiterte Aufgaben für Klasse 4-5
 *
 * Koordinatensystem, Negative Zahlen, Schriftliche Verfahren
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
interface CoordinateData {
  x: number;
  y: number;
  answer: string;
  type: "read" | "identify";
}

interface NegativeNumberData {
  a: number;
  b: number;
  operator: "+" | "-";
  answer: number;
}

interface WrittenMethodData {
  a: number;
  b: number;
  operator: "+" | "-" | "*";
  answer: number;
  steps: string[];
}

interface TriangleData {
  base: number;
  height: number;
  answer: number;
}

interface VolumeData {
  length: number;
  width: number;
  height: number;
  answer: number;
}

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Lokalisierte Texte
const texts = {
  de: {
    readCoordinate: "Welcher Punkt liegt bei den Koordinaten?",
    identifyCoordinate: "Wo liegt Punkt P?",
    coordinateFormat: "Schreibe die Koordinaten als (x, y)",
    calculate: "Rechne:",
    negativeHint: "Negative Zahlen sind kleiner als 0",
    writtenAdd: "Rechne schriftlich:",
    writtenMult: "Multipliziere schriftlich:",
    triangleArea: "Berechne die Fläche des Dreiecks:",
    triangleFormula: "Fläche = (Grundseite × Höhe) ÷ 2",
    volume: "Berechne das Volumen des Quaders:",
    volumeFormula: "Volumen = Länge × Breite × Höhe",
    cm: "cm",
    cm2: "cm²",
    cm3: "cm³",
  },
  en: {
    readCoordinate: "Which point is at the coordinates?",
    identifyCoordinate: "Where is point P?",
    coordinateFormat: "Write the coordinates as (x, y)",
    calculate: "Calculate:",
    negativeHint: "Negative numbers are less than 0",
    writtenAdd: "Calculate in writing:",
    writtenMult: "Multiply in writing:",
    triangleArea: "Calculate the area of the triangle:",
    triangleFormula: "Area = (base × height) ÷ 2",
    volume: "Calculate the volume of the cuboid:",
    volumeFormula: "Volume = length × width × height",
    cm: "cm",
    cm2: "cm²",
    cm3: "cm³",
  },
  uk: {
    readCoordinate: "Яка точка знаходиться за координатами?",
    identifyCoordinate: "Де знаходиться точка P?",
    coordinateFormat: "Запиши координати як (x, y)",
    calculate: "Обчисли:",
    negativeHint: "Від'ємні числа менші за 0",
    writtenAdd: "Обчисли письмово:",
    writtenMult: "Помнож письмово:",
    triangleArea: "Обчисли площу трикутника:",
    triangleFormula: "Площа = (основа × висота) ÷ 2",
    volume: "Обчисли об'єм паралелепіпеда:",
    volumeFormula: "Об'єм = довжина × ширина × висота",
    cm: "см",
    cm2: "см²",
    cm3: "см³",
  },
};

const hints = {
  de: {
    coordinate:
      "x ist die waagerechte Achse (→), y ist die senkrechte Achse (↑)",
    negative:
      "Bei Addition einer negativen Zahl: nach links auf dem Zahlenstrahl",
    written: "Stelle die Zahlen untereinander und rechne von rechts nach links",
    triangle: "Grundseite mal Höhe, dann durch 2 teilen",
    volume: "Länge mal Breite mal Höhe",
  },
  en: {
    coordinate: "x is the horizontal axis (→), y is the vertical axis (↑)",
    negative: "Adding a negative number: move left on the number line",
    written:
      "Place numbers one below the other and calculate from right to left",
    triangle: "Base times height, then divide by 2",
    volume: "Length times width times height",
  },
  uk: {
    coordinate: "x - горизонтальна вісь (→), y - вертикальна вісь (↑)",
    negative:
      "При додаванні від'ємного числа: рухайся вліво на числовій прямій",
    written: "Запиши числа одне під одним і рахуй справа наліво",
    triangle: "Основа помножена на висоту, потім поділи на 2",
    volume: "Довжина помножена на ширину помножена на висоту",
  },
};

// SVG für Koordinatensystem
function generateCoordinateSystemSvg(
  pointX: number,
  pointY: number,
  showPoint: boolean = true,
): string {
  const width = 240;
  const height = 240;
  const margin = 30;
  const gridSize = (width - 2 * margin) / 8;
  const originX = margin;
  const originY = height - margin;

  // Gitterlinien
  let grid = "";
  for (let i = 0; i <= 8; i++) {
    const x = margin + i * gridSize;
    const y = height - margin - i * gridSize;
    // Vertikale Linie
    grid += `<line x1="${x}" y1="${margin}" x2="${x}" y2="${height - margin}" stroke="#ddd" stroke-width="1"/>`;
    // Horizontale Linie
    grid += `<line x1="${margin}" y1="${y}" x2="${width - margin}" y2="${y}" stroke="#ddd" stroke-width="1"/>`;
    // X-Achsen-Beschriftung
    if (i > 0) {
      grid += `<text x="${x}" y="${height - margin + 15}" text-anchor="middle" font-size="10">${i}</text>`;
    }
    // Y-Achsen-Beschriftung
    if (i > 0) {
      grid += `<text x="${margin - 10}" y="${height - margin - i * gridSize + 4}" text-anchor="middle" font-size="10">${i}</text>`;
    }
  }

  // Achsen
  const axes = `
    <line x1="${margin}" y1="${height - margin}" x2="${width - margin + 10}" y2="${height - margin}" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>
    <line x1="${margin}" y1="${height - margin}" x2="${margin}" y2="${margin - 10}" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="${width - margin + 5}" y="${height - margin + 15}" font-size="12" font-weight="bold">x</text>
    <text x="${margin - 15}" y="${margin - 5}" font-size="12" font-weight="bold">y</text>
  `;

  // Punkt
  const px = margin + pointX * gridSize;
  const py = height - margin - pointY * gridSize;
  const point = showPoint
    ? `<circle cx="${px}" cy="${py}" r="6" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
       <text x="${px + 10}" y="${py - 5}" font-size="12" font-weight="bold">P</text>`
    : "";

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-56 h-56 mx-auto bg-white rounded-lg border">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#333"/>
        </marker>
      </defs>
      ${grid}
      ${axes}
      ${point}
    </svg>
  `;
}

// SVG für Dreieck
function generateTriangleSvg(base: number, height: number): string {
  const svgWidth = 200;
  const svgHeight = 150;
  const scale = 15;

  const x1 = 30;
  const y1 = svgHeight - 30;
  const x2 = x1 + base * scale;
  const y2 = y1;
  const x3 = x1 + (base * scale) / 2;
  const y3 = y1 - height * scale;

  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-48 h-36 mx-auto">
      <!-- Dreieck -->
      <polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}"
               fill="#4ecdc4" fill-opacity="0.3" stroke="#333" stroke-width="2"/>

      <!-- Grundseite -->
      <line x1="${x1}" y1="${y1 + 15}" x2="${x2}" y2="${y2 + 15}" stroke="#333" stroke-width="1"/>
      <line x1="${x1}" y1="${y1 + 10}" x2="${x1}" y2="${y1 + 20}" stroke="#333" stroke-width="1"/>
      <line x1="${x2}" y1="${y2 + 10}" x2="${x2}" y2="${y2 + 20}" stroke="#333" stroke-width="1"/>
      <text x="${(x1 + x2) / 2}" y="${y1 + 28}" text-anchor="middle" font-size="12">${base} cm</text>

      <!-- Höhe -->
      <line x1="${x3}" y1="${y1}" x2="${x3}" y2="${y3}" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="5,5"/>
      <text x="${x3 + 15}" y="${(y1 + y3) / 2}" font-size="12" fill="#ff6b6b">${height} cm</text>
    </svg>
  `;
}

// SVG für Quader
function generateCuboidSvg(
  length: number,
  width: number,
  height: number,
): string {
  const svgWidth = 280;
  const svgHeight = 220;

  // Isometrische Projektion
  const scale = 18;
  const startX = 60;
  const startY = 170;

  // Punkte berechnen
  const l = length * scale;
  const w = width * scale * 0.6;
  const h = height * scale;

  const points = {
    // Vorne unten links
    p1: [startX, startY],
    // Vorne unten rechts
    p2: [startX + l, startY],
    // Vorne oben rechts
    p3: [startX + l, startY - h],
    // Vorne oben links
    p4: [startX, startY - h],
    // Hinten unten links
    p5: [startX + w * 0.7, startY - w * 0.5],
    // Hinten unten rechts
    p6: [startX + l + w * 0.7, startY - w * 0.5],
    // Hinten oben rechts
    p7: [startX + l + w * 0.7, startY - h - w * 0.5],
    // Hinten oben links
    p8: [startX + w * 0.7, startY - h - w * 0.5],
  };

  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-64 h-56 mx-auto">
      <!-- Hintere Kanten (gestrichelt) -->
      <line x1="${points.p5[0]}" y1="${points.p5[1]}" x2="${points.p1[0]}" y2="${points.p1[1]}" stroke="#999" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="${points.p5[0]}" y1="${points.p5[1]}" x2="${points.p8[0]}" y2="${points.p8[1]}" stroke="#999" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="${points.p5[0]}" y1="${points.p5[1]}" x2="${points.p6[0]}" y2="${points.p6[1]}" stroke="#999" stroke-width="1" stroke-dasharray="3,3"/>

      <!-- Vorderseite -->
      <polygon points="${points.p1.join(",")},${points.p2.join(",")},${points.p3.join(",")},${points.p4.join(",")}"
               fill="#4ecdc4" fill-opacity="0.4" stroke="#333" stroke-width="2"/>

      <!-- Oberseite -->
      <polygon points="${points.p4.join(",")},${points.p3.join(",")},${points.p7.join(",")},${points.p8.join(",")}"
               fill="#45b7d1" fill-opacity="0.4" stroke="#333" stroke-width="2"/>

      <!-- Rechte Seite -->
      <polygon points="${points.p2.join(",")},${points.p6.join(",")},${points.p7.join(",")},${points.p3.join(",")}"
               fill="#96ceb4" fill-opacity="0.4" stroke="#333" stroke-width="2"/>

      <!-- Beschriftungen -->
      <text x="${(points.p1[0] + points.p2[0]) / 2}" y="${points.p1[1] + 18}" text-anchor="middle" font-size="14" font-weight="bold">${length} cm</text>
      <text x="${points.p2[0] + 25}" y="${(points.p2[1] + points.p6[1]) / 2}" font-size="14" font-weight="bold">${width} cm</text>
      <text x="${points.p3[0] + 15}" y="${(points.p2[1] + points.p3[1]) / 2}" font-size="14" font-weight="bold">${height} cm</text>
    </svg>
  `;
}

/**
 * Koordinaten-Aufgabe
 */
class CoordinateTask extends BaseTask<CoordinateData> {
  validate(userAnswer: string): ValidationResult {
    const correctAnswer = this.data.answer;

    // Normalisiere Eingabe: "(3, 2)" oder "3,2" oder "3 2"
    const normalized = userAnswer
      .replace(/[()]/g, "")
      .replace(/\s+/g, ",")
      .replace(/,+/g, ",")
      .trim();

    const match = normalized.match(/^(\d+),(\d+)$/);
    if (!match) {
      return {
        isCorrect: false,
        correctAnswer,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const userX = parseInt(match[1], 10);
    const userY = parseInt(match[2], 10);

    const isCorrect = userX === this.data.x && userY === this.data.y;

    return {
      isCorrect,
      correctAnswer,
      userAnswer: `(${userX}, ${userY})`,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.coordinate;
  }

  getCorrectAnswer(): string {
    return this.data.answer;
  }
}

/**
 * Negative Zahlen Aufgabe
 */
class NegativeNumberTask extends BaseTask<NegativeNumberData> {
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
    return h.negative;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

/**
 * Schriftliches Rechnen Aufgabe
 */
class WrittenMethodTask extends BaseTask<WrittenMethodData> {
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
      explanation: this.data.steps.join("\n"),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.written;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

/**
 * Dreiecksfläche Aufgabe
 */
class TriangleAreaTask extends BaseTask<TriangleData> {
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

    const isCorrect = this.compareNumeric(parsed, correctAnswer, 0.1);

    return {
      isCorrect,
      correctAnswer,
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    return h.triangle;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

/**
 * Volumen Aufgabe
 */
class VolumeTask extends BaseTask<VolumeData> {
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
    return h.volume;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 4: Koordinatensystem
// ============================================

export const coordinateRead: TaskDefinition<CoordinateData> = {
  typeId: "coordinate-read",
  category: "geometry",
  grade: 4,
  description: "Koordinaten ablesen",

  generate(locale: Locale): TaskInstance<CoordinateData> {
    const t = texts[locale] || texts.de;

    const x = randomInt(1, 7);
    const y = randomInt(1, 7);
    const svg = generateCoordinateSystemSvg(x, y, true);
    const answer = `(${x}, ${y})`;

    return new CoordinateTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.identifyCoordinate}\n\n${t.coordinateFormat}`,
      data: { x, y, answer, type: "identify" },
    });
  },
};

// ============================================
// KLASSE 4: Schriftliche Verfahren
// ============================================

export const writtenAddition: TaskDefinition<WrittenMethodData> = {
  typeId: "written-addition",
  category: "arithmetic",
  grade: 4,
  description: "Schriftliche Addition",

  generate(locale: Locale): TaskInstance<WrittenMethodData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(100, 999);
    const b = randomInt(100, 999);
    const answer = a + b;

    // Schritte für Erklärung
    const steps = [
      `  ${a.toString().padStart(4)}`,
      `+ ${b.toString().padStart(4)}`,
      `------`,
      `= ${answer.toString().padStart(4)}`,
    ];

    return new WrittenMethodTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.writtenAdd}\n${a} + ${b} = ?`,
      data: { a, b, operator: "+", answer, steps },
    });
  },
};

export const writtenSubtraction: TaskDefinition<WrittenMethodData> = {
  typeId: "written-subtraction",
  category: "arithmetic",
  grade: 4,
  description: "Schriftliche Subtraktion",

  generate(locale: Locale): TaskInstance<WrittenMethodData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(500, 999);
    const b = randomInt(100, a - 100);
    const answer = a - b;

    const steps = [
      `  ${a.toString().padStart(4)}`,
      `- ${b.toString().padStart(4)}`,
      `------`,
      `= ${answer.toString().padStart(4)}`,
    ];

    return new WrittenMethodTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.writtenAdd}\n${a} - ${b} = ?`,
      data: { a, b, operator: "-", answer, steps },
    });
  },
};

export const writtenMultiplication: TaskDefinition<WrittenMethodData> = {
  typeId: "written-multiplication",
  category: "arithmetic",
  grade: 4,
  description: "Schriftliche Multiplikation",

  generate(locale: Locale): TaskInstance<WrittenMethodData> {
    const t = texts[locale] || texts.de;

    const a = randomInt(12, 99);
    const b = randomInt(3, 9);
    const answer = a * b;

    const steps = [
      `  ${a.toString().padStart(4)}`,
      `× ${b.toString().padStart(4)}`,
      `------`,
      `= ${answer.toString().padStart(4)}`,
    ];

    return new WrittenMethodTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${t.writtenMult}\n${a} × ${b} = ?`,
      data: { a, b, operator: "*", answer, steps },
    });
  },
};

// ============================================
// KLASSE 5: Negative Zahlen
// ============================================

export const negativeAddition: TaskDefinition<NegativeNumberData> = {
  typeId: "negative-add",
  category: "arithmetic",
  grade: 5,
  description: "Addition mit negativen Zahlen",

  generate(locale: Locale): TaskInstance<NegativeNumberData> {
    const t = texts[locale] || texts.de;

    // Verschiedene Szenarien
    const scenarios = [
      // positiv + negativ
      { a: randomInt(5, 15), b: -randomInt(1, 10) },
      // negativ + positiv
      { a: -randomInt(1, 10), b: randomInt(5, 15) },
      // negativ + negativ
      { a: -randomInt(1, 10), b: -randomInt(1, 10) },
    ];

    const { a, b } = randomChoice(scenarios);
    const answer = a + b;

    const bStr = b < 0 ? `(${b})` : b.toString();

    return new NegativeNumberTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} + ${bStr} = ?`,
      data: { a, b, operator: "+", answer },
    });
  },
};

export const negativeSubtraction: TaskDefinition<NegativeNumberData> = {
  typeId: "negative-sub",
  category: "arithmetic",
  grade: 5,
  description: "Subtraktion mit negativen Zahlen",

  generate(locale: Locale): TaskInstance<NegativeNumberData> {
    const t = texts[locale] || texts.de;

    const scenarios = [
      // positiv - größere Zahl
      { a: randomInt(3, 10), b: randomInt(11, 20) },
      // positiv - negativ
      { a: randomInt(5, 15), b: -randomInt(1, 10) },
      // negativ - positiv
      { a: -randomInt(1, 10), b: randomInt(1, 10) },
    ];

    const { a, b } = randomChoice(scenarios);
    const answer = a - b;

    const bStr = b < 0 ? `(${b})` : b.toString();

    return new NegativeNumberTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${a} - ${bStr} = ?`,
      data: { a, b, operator: "-", answer },
    });
  },
};

// ============================================
// KLASSE 5: Dreiecksfläche
// ============================================

export const triangleArea: TaskDefinition<TriangleData> = {
  typeId: "geometry-triangle-area",
  category: "geometry",
  grade: 5,
  description: "Dreiecksfläche berechnen",

  generate(locale: Locale): TaskInstance<TriangleData> {
    const t = texts[locale] || texts.de;

    // Werte wählen, die ganzzahlige Ergebnisse ergeben
    const base = randomChoice([4, 6, 8, 10]);
    const height = randomChoice([3, 4, 5, 6]);
    const answer = (base * height) / 2;

    const svg = generateTriangleSvg(base, height);

    return new TriangleAreaTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.triangleArea}\n${t.triangleFormula}`,
      inputLabel: t.cm2,
      data: { base, height, answer },
    });
  },
};

// ============================================
// KLASSE 5: Volumen
// ============================================

export const cuboidVolume: TaskDefinition<VolumeData> = {
  typeId: "geometry-cuboid-volume",
  category: "geometry",
  grade: 5,
  description: "Quadervolumen berechnen",

  generate(locale: Locale): TaskInstance<VolumeData> {
    const t = texts[locale] || texts.de;

    const length = randomInt(2, 6);
    const width = randomInt(2, 5);
    const height = randomInt(2, 4);
    const answer = length * width * height;

    const svg = generateCuboidSvg(length, width, height);

    return new VolumeTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.volume}\n${t.volumeFormula}`,
      inputLabel: t.cm3,
      data: { length, width, height, answer },
    });
  },
};

// Export
export const advancedTasks: TaskDefinition[] = [
  // Klasse 4 - Koordinatensystem
  coordinateRead,
  // Klasse 4 - Schriftliche Verfahren
  writtenAddition,
  writtenSubtraction,
  writtenMultiplication,
  // Klasse 5 - Negative Zahlen
  negativeAddition,
  negativeSubtraction,
  // Klasse 5 - Geometrie
  triangleArea,
  cuboidVolume,
];
