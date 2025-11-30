/**
 * Geometrie-Aufgaben
 *
 * Aufgaben zu Formen, Flächen, Umfängen etc.
 */

import type { Locale } from "@i18n/translations";
import type {
  Grade,
  TaskDefinition,
  TaskInstance,
  ValidationResult,
} from "../interfaces";
import { BaseTask, type GeometryData } from "../base-task";

// Lokalisierte Texte
const texts = {
  de: {
    countShapes: (shape: string) => `Zähle die ${shape}. Wie viele sind es?`,
    perimeter: (a: number, b: number) =>
      `Ein Rechteck hat die Seiten ${a} cm und ${b} cm. Wie groß ist der Umfang in cm?`,
    area: (a: number, b: number) =>
      `Ein Rechteck hat die Seiten ${a} cm und ${b} cm. Wie groß ist die Fläche in cm²?`,
    squarePerimeter: (a: number) =>
      `Ein Quadrat hat die Seitenlänge ${a} cm. Wie groß ist der Umfang in cm?`,
    squareArea: (a: number) =>
      `Ein Quadrat hat die Seitenlänge ${a} cm. Wie groß ist die Fläche in cm²?`,
    shapes: {
      circle: "Kreise",
      square: "Quadrate",
      triangle: "Dreiecke",
      rectangle: "Rechtecke",
    },
  },
  en: {
    countShapes: (shape: string) => `Count the ${shape}. How many are there?`,
    perimeter: (a: number, b: number) =>
      `A rectangle has sides of ${a} cm and ${b} cm. What is the perimeter in cm?`,
    area: (a: number, b: number) =>
      `A rectangle has sides of ${a} cm and ${b} cm. What is the area in cm²?`,
    squarePerimeter: (a: number) =>
      `A square has a side length of ${a} cm. What is the perimeter in cm?`,
    squareArea: (a: number) =>
      `A square has a side length of ${a} cm. What is the area in cm²?`,
    shapes: {
      circle: "circles",
      square: "squares",
      triangle: "triangles",
      rectangle: "rectangles",
    },
  },
  uk: {
    countShapes: (shape: string) => `Порахуй ${shape}. Скільки їх?`,
    perimeter: (a: number, b: number) =>
      `Прямокутник має сторони ${a} см і ${b} см. Який периметр в см?`,
    area: (a: number, b: number) =>
      `Прямокутник має сторони ${a} см і ${b} см. Яка площа в см²?`,
    squarePerimeter: (a: number) =>
      `Квадрат має сторону ${a} см. Який периметр в см?`,
    squareArea: (a: number) => `Квадрат має сторону ${a} см. Яка площа в см²?`,
    shapes: {
      circle: "кола",
      square: "квадрати",
      triangle: "трикутники",
      rectangle: "прямокутники",
    },
  },
};

const hints = {
  de: {
    count: "Zähle jede Form einzeln. Nimm dir Zeit!",
    perimeter:
      "Der Umfang ist die Summe aller Seiten. Ein Rechteck hat 2 lange und 2 kurze Seiten.",
    area: "Die Fläche berechnest du mit Länge × Breite.",
  },
  en: {
    count: "Count each shape one by one. Take your time!",
    perimeter:
      "The perimeter is the sum of all sides. A rectangle has 2 long and 2 short sides.",
    area: "You calculate the area with length × width.",
  },
  uk: {
    count: "Порахуй кожну фігуру окремо. Не поспішай!",
    perimeter:
      "Периметр - це сума всіх сторін. Прямокутник має 2 довгі і 2 короткі сторони.",
    area: "Площу обчислюєш як довжина × ширина.",
  },
};

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// SVG-Generator für Formen
function generateShapesSvg(
  shapeType: "circle" | "square" | "triangle",
  count: number,
): string {
  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#ffe66d",
    "#95e1d3",
    "#f38181",
    "#a8e6cf",
  ];
  let shapes = "";

  // Zufällige Positionen mit etwas Abstand
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;

    do {
      x = randomInt(30, 230);
      y = randomInt(25, 115);
      attempts++;
    } while (
      attempts < 50 &&
      positions.some((p) => Math.abs(p.x - x) < 45 && Math.abs(p.y - y) < 45)
    );

    positions.push({ x, y });
    const color = colors[i % colors.length];
    const size = randomInt(15, 25);

    if (shapeType === "circle") {
      shapes += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" stroke="#333" stroke-width="1"/>`;
    } else if (shapeType === "square") {
      shapes += `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" fill="${color}" stroke="#333" stroke-width="1"/>`;
    } else {
      const h = size * 1.7;
      shapes += `<polygon points="${x},${y - h / 2} ${x - size},${y + h / 2} ${x + size},${y + h / 2}" fill="${color}" stroke="#333" stroke-width="1"/>`;
    }
  }

  return `<svg viewBox="0 0 260 140" class="w-full h-40">${shapes}</svg>`;
}

// SVG für Rechteck mit Beschriftung
function generateRectangleSvg(width: number, height: number): string {
  const scale = Math.min(120 / width, 80 / height, 15);
  const w = width * scale;
  const h = height * scale;
  const x = (200 - w) / 2;
  const y = (120 - h) / 2;

  return `
    <svg viewBox="0 0 200 140" class="w-full h-32">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4ecdc4" fill-opacity="0.3" stroke="#4ecdc4" stroke-width="3"/>
      <text x="${x + w / 2}" y="${y - 8}" text-anchor="middle" fill="#333" font-size="14" font-weight="bold">${width} cm</text>
      <text x="${x + w + 8}" y="${y + h / 2}" text-anchor="start" fill="#333" font-size="14" font-weight="bold">${height} cm</text>
    </svg>
  `;
}

// SVG für Quadrat mit Beschriftung
function generateSquareSvg(side: number): string {
  const scale = Math.min(100 / side, 15);
  const s = side * scale;
  const x = (200 - s) / 2;
  const y = (120 - s) / 2;

  return `
    <svg viewBox="0 0 200 140" class="w-full h-32">
      <rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#ff6b6b" fill-opacity="0.3" stroke="#ff6b6b" stroke-width="3"/>
      <text x="${x + s / 2}" y="${y - 8}" text-anchor="middle" fill="#333" font-size="14" font-weight="bold">${side} cm</text>
    </svg>
  `;
}

/**
 * Konkrete Geometrie-Aufgabe
 */
class GeometryTask extends BaseTask<GeometryData> {
  validate(userAnswer: string): ValidationResult {
    const parsed = this.parseNumericAnswer(userAnswer);

    if (parsed === null) {
      return {
        isCorrect: false,
        correctAnswer: this.data.answer,
        userAnswer: userAnswer,
        hint: this.getHint(),
      };
    }

    const isCorrect = this.compareNumeric(parsed, this.data.answer);

    return {
      isCorrect,
      correctAnswer: this.data.answer,
      userAnswer: parsed,
      hint: isCorrect ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;

    switch (this.data.subtype) {
      case "count":
        return h.count;
      case "perimeter":
        return h.perimeter;
      case "area":
        return h.area;
      default:
        return h.count;
    }
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 5: Geometrie-Aufgaben
// ============================================

export const countShapes: TaskDefinition<GeometryData> = {
  typeId: "geometry-count",
  category: "geometry",
  grade: 5,
  description: "Formen zählen",

  generate(locale: Locale): TaskInstance<GeometryData> {
    const t = texts[locale] || texts.de;
    const shapeType = randomChoice(["circle", "square", "triangle"] as const);
    const count = randomInt(4, 9);

    const svgMarkup = generateShapesSvg(shapeType, count);
    const shapeName = t.shapes[shapeType];
    const prompt = t.countShapes(shapeName);

    return new GeometryTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: prompt,
      data: {
        svgMarkup,
        prompt,
        answer: count,
        subtype: "count",
      },
    });
  },
};

export const rectanglePerimeter: TaskDefinition<GeometryData> = {
  typeId: "geometry-rect-perimeter",
  category: "geometry",
  grade: 5,
  description: "Umfang Rechteck",

  generate(locale: Locale): TaskInstance<GeometryData> {
    const t = texts[locale] || texts.de;
    const a = randomInt(3, 12);
    const b = randomInt(3, 12);
    const perimeter = 2 * (a + b);

    const svgMarkup = generateRectangleSvg(a, b);
    const prompt = t.perimeter(a, b);

    return new GeometryTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: prompt,
      data: {
        svgMarkup,
        prompt,
        answer: perimeter,
        subtype: "perimeter",
      },
    });
  },
};

export const rectangleArea: TaskDefinition<GeometryData> = {
  typeId: "geometry-rect-area",
  category: "geometry",
  grade: 5,
  description: "Fläche Rechteck",

  generate(locale: Locale): TaskInstance<GeometryData> {
    const t = texts[locale] || texts.de;
    const a = randomInt(2, 8);
    const b = randomInt(2, 8);
    const area = a * b;

    const svgMarkup = generateRectangleSvg(a, b);
    const prompt = t.area(a, b);

    return new GeometryTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: prompt,
      data: {
        svgMarkup,
        prompt,
        answer: area,
        subtype: "area",
      },
    });
  },
};

export const squarePerimeter: TaskDefinition<GeometryData> = {
  typeId: "geometry-square-perimeter",
  category: "geometry",
  grade: 5,
  description: "Umfang Quadrat",

  generate(locale: Locale): TaskInstance<GeometryData> {
    const t = texts[locale] || texts.de;
    const a = randomInt(3, 12);
    const perimeter = 4 * a;

    const svgMarkup = generateSquareSvg(a);
    const prompt = t.squarePerimeter(a);

    return new GeometryTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: prompt,
      data: {
        svgMarkup,
        prompt,
        answer: perimeter,
        subtype: "perimeter",
      },
    });
  },
};

export const squareArea: TaskDefinition<GeometryData> = {
  typeId: "geometry-square-area",
  category: "geometry",
  grade: 5,
  description: "Fläche Quadrat",

  generate(locale: Locale): TaskInstance<GeometryData> {
    const t = texts[locale] || texts.de;
    const a = randomInt(2, 10);
    const area = a * a;

    const svgMarkup = generateSquareSvg(a);
    const prompt = t.squareArea(a);

    return new GeometryTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: prompt,
      data: {
        svgMarkup,
        prompt,
        answer: area,
        subtype: "area",
      },
    });
  },
};

// Export aller Geometrie-Aufgaben
export const geometryTasks: TaskDefinition[] = [
  countShapes,
  rectanglePerimeter,
  rectangleArea,
  squarePerimeter,
  squareArea,
];
