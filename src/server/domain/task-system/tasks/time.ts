/**
 * Zeit-Aufgaben
 *
 * Uhrzeiten lesen, Zeitspannen berechnen
 */

import type { Locale } from "@i18n/translations";
import type {
  TaskDefinition,
  TaskInstance,
  ValidationResult,
} from "../interfaces";
import { BaseTask } from "../base-task";

// Datentypen
interface ClockData {
  hours: number;
  minutes: number;
  answer: string;
  format: "full" | "half" | "quarter" | "minutes";
}

interface TimeSpanData {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  answer: number;
  unit: "minutes" | "hours";
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
    whatTime: "Wie spät ist es?",
    readClock: "Lies die Uhrzeit ab:",
    timeFormat: "(z.B. 3:30 oder 15:30)",
    howLong: "Wie lange dauert es von {start} bis {end}?",
    inMinutes: "(in Minuten)",
    inHours: "(in Stunden)",
    oclock: "Uhr",
  },
  en: {
    whatTime: "What time is it?",
    readClock: "Read the time:",
    timeFormat: "(e.g. 3:30 or 15:30)",
    howLong: "How long is it from {start} to {end}?",
    inMinutes: "(in minutes)",
    inHours: "(in hours)",
    oclock: "o'clock",
  },
  uk: {
    whatTime: "Котра година?",
    readClock: "Прочитай час:",
    timeFormat: "(напр. 3:30 або 15:30)",
    howLong: "Скільки часу від {start} до {end}?",
    inMinutes: "(у хвилинах)",
    inHours: "(у годинах)",
    oclock: "година",
  },
};

const hints = {
  de: {
    clock: "Der kleine Zeiger zeigt die Stunde, der große Zeiger die Minuten.",
    fullHour: "Bei voller Stunde steht der große Zeiger auf 12.",
    halfHour: "Bei halber Stunde steht der große Zeiger auf 6.",
    quarter: "Bei Viertel steht der große Zeiger auf 3 oder 9.",
    timeSpan: "Zähle die Stunden und Minuten zwischen Start und Ende.",
  },
  en: {
    clock: "The short hand shows hours, the long hand shows minutes.",
    fullHour: "At full hour, the long hand points to 12.",
    halfHour: "At half past, the long hand points to 6.",
    quarter: "At quarter past/to, the long hand points to 3 or 9.",
    timeSpan: "Count the hours and minutes between start and end.",
  },
  uk: {
    clock: "Маленька стрілка показує години, велика - хвилини.",
    fullHour: "О повній годині велика стрілка на 12.",
    halfHour: "О пів години велика стрілка на 6.",
    quarter: "О чверть години велика стрілка на 3 або 9.",
    timeSpan: "Порахуй години та хвилини між початком і кінцем.",
  },
};

// SVG Uhr generieren
function generateClockSvg(hours: number, minutes: number): string {
  const cx = 100;
  const cy = 100;
  const r = 80;

  // Stunden auf 12-Stunden-Format
  const h12 = hours % 12;

  // Winkel berechnen (0° = 12 Uhr, im Uhrzeigersinn)
  const minuteAngle = (minutes / 60) * 360 - 90;
  const hourAngle = ((h12 + minutes / 60) / 12) * 360 - 90;

  // Zeiger-Endpunkte
  const minuteHandLength = 60;
  const hourHandLength = 45;

  const minuteX =
    cx + minuteHandLength * Math.cos((minuteAngle * Math.PI) / 180);
  const minuteY =
    cy + minuteHandLength * Math.sin((minuteAngle * Math.PI) / 180);
  const hourX = cx + hourHandLength * Math.cos((hourAngle * Math.PI) / 180);
  const hourY = cy + hourHandLength * Math.sin((hourAngle * Math.PI) / 180);

  // Ziffern
  let numbers = "";
  for (let i = 1; i <= 12; i++) {
    const angle = ((i / 12) * 360 - 90) * (Math.PI / 180);
    const nx = cx + (r - 15) * Math.cos(angle);
    const ny = cy + (r - 15) * Math.sin(angle);
    numbers += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="bold">${i}</text>`;
  }

  // Minuten-Striche
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const angle = ((i / 60) * 360 - 90) * (Math.PI / 180);
    const innerR = i % 5 === 0 ? r - 8 : r - 4;
    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy + innerR * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const strokeWidth = i % 5 === 0 ? 2 : 1;
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="${strokeWidth}"/>`;
  }

  return `
    <svg viewBox="0 0 200 200" class="w-40 h-40 mx-auto">
      <!-- Uhr-Hintergrund -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#333" stroke-width="3"/>

      <!-- Minuten-Striche -->
      ${ticks}

      <!-- Ziffern -->
      ${numbers}

      <!-- Stundenzeiger -->
      <line x1="${cx}" y1="${cy}" x2="${hourX}" y2="${hourY}" stroke="#333" stroke-width="4" stroke-linecap="round"/>

      <!-- Minutenzeiger -->
      <line x1="${cx}" y1="${cy}" x2="${minuteX}" y2="${minuteY}" stroke="#4ecdc4" stroke-width="3" stroke-linecap="round"/>

      <!-- Mittelpunkt -->
      <circle cx="${cx}" cy="${cy}" r="5" fill="#333"/>
    </svg>
  `;
}

// Zeit formatieren
function formatTime(hours: number, minutes: number): string {
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Uhr-Aufgabe
 */
class ClockTask extends BaseTask<ClockData> {
  validate(userAnswer: string): ValidationResult {
    const correctAnswer = this.data.answer;

    // Normalisiere Eingabe
    const normalized = userAnswer
      .trim()
      .replace(/\s+/g, "")
      .replace(".", ":")
      .replace(",", ":")
      .replace("uhr", "")
      .replace("Uhr", "");

    // Extrahiere Stunden und Minuten
    const match = normalized.match(/^(\d{1,2}):?(\d{2})?$/);
    if (!match) {
      return {
        isCorrect: false,
        correctAnswer,
        userAnswer,
        hint: this.getHint(),
      };
    }

    const userHours = parseInt(match[1], 10);
    const userMinutes = match[2] ? parseInt(match[2], 10) : 0;

    // Vergleiche (akzeptiere 12h und 24h Format)
    const correctHours = this.data.hours % 12;
    const userHours12 = userHours % 12;

    const isCorrect =
      userHours12 === correctHours && userMinutes === this.data.minutes;

    // Auch volles 24h-Format akzeptieren
    const isCorrect24 =
      userHours === this.data.hours && userMinutes === this.data.minutes;

    return {
      isCorrect: isCorrect || isCorrect24,
      correctAnswer,
      userAnswer: formatTime(userHours, userMinutes),
      hint: isCorrect || isCorrect24 ? undefined : this.getHint(),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;
    switch (this.data.format) {
      case "full":
        return h.fullHour;
      case "half":
        return h.halfHour;
      case "quarter":
        return h.quarter;
      default:
        return h.clock;
    }
  }

  getCorrectAnswer(): string {
    return this.data.answer;
  }
}

/**
 * Zeitspannen-Aufgabe
 */
class TimeSpanTask extends BaseTask<TimeSpanData> {
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
    return h.timeSpan;
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 2: Uhrzeiten lesen
// ============================================

export const clockFullHour: TaskDefinition<ClockData> = {
  typeId: "time-clock-full",
  category: "measurement",
  grade: 2,
  description: "Volle Stunde lesen",

  generate(locale: Locale): TaskInstance<ClockData> {
    const t = texts[locale] || texts.de;

    const hours = randomInt(1, 12);
    const minutes = 0;
    const svg = generateClockSvg(hours, minutes);
    const answer = formatTime(hours, minutes);

    return new ClockTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.whatTime} ${t.timeFormat}`,
      data: { hours, minutes, answer, format: "full" },
    });
  },
};

export const clockHalfHour: TaskDefinition<ClockData> = {
  typeId: "time-clock-half",
  category: "measurement",
  grade: 2,
  description: "Halbe Stunde lesen",

  generate(locale: Locale): TaskInstance<ClockData> {
    const t = texts[locale] || texts.de;

    const hours = randomInt(1, 12);
    const minutes = 30;
    const svg = generateClockSvg(hours, minutes);
    const answer = formatTime(hours, minutes);

    return new ClockTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.whatTime} ${t.timeFormat}`,
      data: { hours, minutes, answer, format: "half" },
    });
  },
};

export const clockQuarterHour: TaskDefinition<ClockData> = {
  typeId: "time-clock-quarter",
  category: "measurement",
  grade: 2,
  description: "Viertelstunde lesen",

  generate(locale: Locale): TaskInstance<ClockData> {
    const t = texts[locale] || texts.de;

    const hours = randomInt(1, 12);
    const minutes = randomChoice([15, 45]);
    const svg = generateClockSvg(hours, minutes);
    const answer = formatTime(hours, minutes);

    return new ClockTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.whatTime} ${t.timeFormat}`,
      data: { hours, minutes, answer, format: "quarter" },
    });
  },
};

export const clockAnyTime: TaskDefinition<ClockData> = {
  typeId: "time-clock-any",
  category: "measurement",
  grade: 2,
  description: "Beliebige Uhrzeit lesen",

  generate(locale: Locale): TaskInstance<ClockData> {
    const t = texts[locale] || texts.de;

    const hours = randomInt(1, 12);
    // 5-Minuten-Schritte für einfacheres Ablesen
    const minutes = randomChoice([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
    ]);
    const svg = generateClockSvg(hours, minutes);
    const answer = formatTime(hours, minutes);

    return new ClockTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${svg}\n${t.whatTime} ${t.timeFormat}`,
      data: { hours, minutes, answer, format: "minutes" },
    });
  },
};

// ============================================
// KLASSE 3: Zeitspannen
// ============================================

export const timeSpanSimple: TaskDefinition<TimeSpanData> = {
  typeId: "time-span-simple",
  category: "measurement",
  grade: 3,
  description: "Einfache Zeitspanne (volle Stunden)",

  generate(locale: Locale): TaskInstance<TimeSpanData> {
    const t = texts[locale] || texts.de;

    const startHours = randomInt(8, 12);
    const duration = randomInt(1, 4);
    const endHours = startHours + duration;

    const startTime = formatTime(startHours, 0);
    const endTime = formatTime(endHours, 0);

    const question = t.howLong
      .replace("{start}", `${startTime} ${t.oclock}`)
      .replace("{end}", `${endTime} ${t.oclock}`);

    return new TimeSpanTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${question} ${t.inHours}`,
      inputLabel: locale === "en" ? "h" : locale === "uk" ? "год" : "Std.",
      data: {
        startHours,
        startMinutes: 0,
        endHours,
        endMinutes: 0,
        answer: duration,
        unit: "hours",
      },
    });
  },
};

export const timeSpanMinutes: TaskDefinition<TimeSpanData> = {
  typeId: "time-span-minutes",
  category: "measurement",
  grade: 3,
  description: "Zeitspanne in Minuten",

  generate(locale: Locale): TaskInstance<TimeSpanData> {
    const t = texts[locale] || texts.de;

    const startHours = randomInt(9, 14);
    const startMinutes = randomChoice([0, 15, 30, 45]);
    const durationMinutes = randomChoice([15, 30, 45, 60, 90]);

    const totalStartMinutes = startHours * 60 + startMinutes;
    const totalEndMinutes = totalStartMinutes + durationMinutes;
    const endHours = Math.floor(totalEndMinutes / 60);
    const endMinutes = totalEndMinutes % 60;

    const startTime = formatTime(startHours, startMinutes);
    const endTime = formatTime(endHours, endMinutes);

    const question = t.howLong
      .replace("{start}", startTime)
      .replace("{end}", endTime);

    return new TimeSpanTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${question} ${t.inMinutes}`,
      inputLabel: locale === "en" ? "min" : locale === "uk" ? "хв" : "Min.",
      data: {
        startHours,
        startMinutes,
        endHours,
        endMinutes,
        answer: durationMinutes,
        unit: "minutes",
      },
    });
  },
};

export const timeSpanMixed: TaskDefinition<TimeSpanData> = {
  typeId: "time-span-mixed",
  category: "measurement",
  grade: 3,
  description: "Zeitspanne gemischt",

  generate(locale: Locale): TaskInstance<TimeSpanData> {
    const t = texts[locale] || texts.de;

    // Realistische Zeitspannen (z.B. Schulstunden, Pausen)
    const scenarios = [
      { start: [8, 0], end: [8, 45], answer: 45 }, // Schulstunde
      { start: [9, 30], end: [10, 15], answer: 45 }, // Schulstunde
      { start: [10, 15], end: [10, 30], answer: 15 }, // Pause
      { start: [12, 0], end: [13, 0], answer: 60 }, // Mittagspause
      { start: [14, 0], end: [15, 30], answer: 90 }, // Nachmittag
    ];

    const scenario = randomChoice(scenarios);
    const [startHours, startMinutes] = scenario.start;
    const [endHours, endMinutes] = scenario.end;

    const startTime = formatTime(startHours, startMinutes);
    const endTime = formatTime(endHours, endMinutes);

    const question = t.howLong
      .replace("{start}", startTime)
      .replace("{end}", endTime);

    return new TimeSpanTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: `${question} ${t.inMinutes}`,
      inputLabel: locale === "en" ? "min" : locale === "uk" ? "хв" : "Min.",
      data: {
        startHours,
        startMinutes,
        endHours,
        endMinutes,
        answer: scenario.answer,
        unit: "minutes",
      },
    });
  },
};

// Export
export const timeTasks: TaskDefinition[] = [
  // Klasse 2 - Uhrzeiten
  clockFullHour,
  clockHalfHour,
  clockQuarterHour,
  clockAnyTime,
  // Klasse 3 - Zeitspannen
  timeSpanSimple,
  timeSpanMinutes,
  timeSpanMixed,
];
