/**
 * Textaufgaben / Word Problems
 *
 * Sachaufgaben mit Kontexten aus dem Alltag
 */

import type { Locale } from "@i18n/translations";
import type {
  Grade,
  TaskDefinition,
  TaskInstance,
  ValidationResult,
} from "../interfaces";
import { BaseTask, type WordProblemData } from "../base-task";

// Lokalisierte Texte für Hints
const hints = {
  de: {
    addition: "Lies die Aufgabe nochmal. Was wird zusammengezählt?",
    subtraction: "Lies die Aufgabe nochmal. Was wird weggenommen?",
    multiplication: "Lies die Aufgabe nochmal. Was wird mehrmals genommen?",
    division: "Lies die Aufgabe nochmal. Was wird aufgeteilt?",
    multiStep:
      "Diese Aufgabe hat mehrere Schritte. Rechne erst den ersten Teil aus.",
  },
  en: {
    addition: "Read the problem again. What is being added together?",
    subtraction: "Read the problem again. What is being taken away?",
    multiplication:
      "Read the problem again. What is being taken multiple times?",
    division: "Read the problem again. What is being shared?",
    multiStep:
      "This problem has multiple steps. Calculate the first part first.",
  },
  uk: {
    addition: "Прочитай задачу ще раз. Що складається разом?",
    subtraction: "Прочитай задачу ще раз. Що забирається?",
    multiplication: "Прочитай задачу ще раз. Що береться кілька разів?",
    division: "Прочитай задачу ще раз. Що ділиться?",
    multiStep: "Ця задача має кілька кроків. Спочатку обчисли перший.",
  },
};

// Hilfsfunktionen
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Problemvorlagen nach Operation
interface ProblemTemplate {
  template: (a: number, b: number) => string;
  op: "+" | "-" | "*" | "/";
}

interface MultiStepTemplate {
  template: (a: number, b: number, c: number) => string;
  calculate: (a: number, b: number, c: number) => number;
  steps: (a: number, b: number, c: number) => string[];
}

const simpleTemplates: Record<Locale, ProblemTemplate[]> = {
  de: [
    {
      template: (a, b) =>
        `Lisa hat ${a} Äpfel. Sie bekommt noch ${b} Äpfel dazu. Wie viele Äpfel hat Lisa jetzt?`,
      op: "+",
    },
    {
      template: (a, b) =>
        `Im Korb sind ${a} Birnen. Mama legt ${b} Birnen dazu. Wie viele Birnen sind jetzt im Korb?`,
      op: "+",
    },
    {
      template: (a, b) =>
        `Tom hat ${a} Murmeln. Er gibt ${b} Murmeln an seinen Freund. Wie viele Murmeln hat Tom noch?`,
      op: "-",
    },
    {
      template: (a, b) =>
        `Auf dem Tisch liegen ${a} Kekse. ${b} Kekse werden gegessen. Wie viele Kekse liegen noch auf dem Tisch?`,
      op: "-",
    },
    {
      template: (a, b) =>
        `Es gibt ${a} Kinder. Jedes Kind bekommt ${b} Bonbons. Wie viele Bonbons werden insgesamt verteilt?`,
      op: "*",
    },
    {
      template: (a, b) =>
        `Ein Auto hat ${a} Räder. Wie viele Räder haben ${b} Autos?`,
      op: "*",
    },
    {
      template: (a, b) =>
        `${a} Äpfel werden gleichmäßig auf ${b} Kinder verteilt. Wie viele Äpfel bekommt jedes Kind?`,
      op: "/",
    },
    {
      template: (a, b) =>
        `${a} Bonbons sollen in Tüten zu je ${b} Stück verpackt werden. Wie viele Tüten braucht man?`,
      op: "/",
    },
  ],
  en: [
    {
      template: (a, b) =>
        `Lisa has ${a} apples. She gets ${b} more apples. How many apples does Lisa have now?`,
      op: "+",
    },
    {
      template: (a, b) =>
        `There are ${a} pears in the basket. Mom adds ${b} more pears. How many pears are in the basket now?`,
      op: "+",
    },
    {
      template: (a, b) =>
        `Tom has ${a} marbles. He gives ${b} marbles to his friend. How many marbles does Tom have left?`,
      op: "-",
    },
    {
      template: (a, b) =>
        `There are ${a} cookies on the table. ${b} cookies are eaten. How many cookies are left on the table?`,
      op: "-",
    },
    {
      template: (a, b) =>
        `There are ${a} children. Each child gets ${b} candies. How many candies are given out in total?`,
      op: "*",
    },
    {
      template: (a, b) =>
        `A car has ${a} wheels. How many wheels do ${b} cars have?`,
      op: "*",
    },
    {
      template: (a, b) =>
        `${a} apples are shared equally among ${b} children. How many apples does each child get?`,
      op: "/",
    },
    {
      template: (a, b) =>
        `${a} candies need to be packed in bags of ${b} each. How many bags are needed?`,
      op: "/",
    },
  ],
  uk: [
    {
      template: (a, b) =>
        `У Лізи є ${a} яблук. Вона отримала ще ${b} яблук. Скільки яблук тепер у Лізи?`,
      op: "+",
    },
    {
      template: (a, b) =>
        `У кошику ${a} груш. Мама поклала ще ${b} груш. Скільки тепер груш у кошику?`,
      op: "+",
    },
    {
      template: (a, b) =>
        `У Тома є ${a} кульок. Він дав ${b} кульок другу. Скільки кульок залишилось у Тома?`,
      op: "-",
    },
    {
      template: (a, b) =>
        `На столі лежить ${a} печива. ${b} печива з'їли. Скільки печива залишилось на столі?`,
      op: "-",
    },
    {
      template: (a, b) =>
        `Є ${a} дітей. Кожна дитина отримує ${b} цукерок. Скільки всього цукерок роздано?`,
      op: "*",
    },
    {
      template: (a, b) =>
        `Автомобіль має ${a} колеса. Скільки коліс мають ${b} автомобілів?`,
      op: "*",
    },
    {
      template: (a, b) =>
        `${a} яблук розділили порівну між ${b} дітьми. Скільки яблук отримає кожна дитина?`,
      op: "/",
    },
    {
      template: (a, b) =>
        `${a} цукерок потрібно упакувати в пакети по ${b} штук. Скільки пакетів потрібно?`,
      op: "/",
    },
  ],
};

const multiStepTemplates: Record<Locale, MultiStepTemplate[]> = {
  de: [
    {
      template: (a, b, c) =>
        `In einer Klasse sind ${a} Kinder. Jedes Kind hat ${b} Bücher. ${c} Bücher werden noch dazu gekauft. Wie viele Bücher gibt es insgesamt?`,
      calculate: (a, b, c) => a * b + c,
      steps: (a, b, c) => [
        `Erst: ${a} × ${b} = ${a * b}`,
        `Dann: ${a * b} + ${c} = ${a * b + c}`,
      ],
    },
    {
      template: (a, b, c) =>
        `Ein Bauer hat ${a} Äpfel. Er verkauft ${b} Äpfel und bekommt dann noch ${c} neue Äpfel. Wie viele Äpfel hat er jetzt?`,
      calculate: (a, b, c) => a - b + c,
      steps: (a, b, c) => [
        `Erst: ${a} - ${b} = ${a - b}`,
        `Dann: ${a - b} + ${c} = ${a - b + c}`,
      ],
    },
    {
      template: (a, b, c) =>
        `In einem Regal stehen ${a} Reihen mit je ${b} Büchern. ${c} Bücher werden entnommen. Wie viele Bücher sind noch da?`,
      calculate: (a, b, c) => a * b - c,
      steps: (a, b, c) => [
        `Erst: ${a} × ${b} = ${a * b}`,
        `Dann: ${a * b} - ${c} = ${a * b - c}`,
      ],
    },
  ],
  en: [
    {
      template: (a, b, c) =>
        `In a class there are ${a} children. Each child has ${b} books. ${c} more books are bought. How many books are there in total?`,
      calculate: (a, b, c) => a * b + c,
      steps: (a, b, c) => [
        `First: ${a} × ${b} = ${a * b}`,
        `Then: ${a * b} + ${c} = ${a * b + c}`,
      ],
    },
    {
      template: (a, b, c) =>
        `A farmer has ${a} apples. He sells ${b} apples and then gets ${c} new apples. How many apples does he have now?`,
      calculate: (a, b, c) => a - b + c,
      steps: (a, b, c) => [
        `First: ${a} - ${b} = ${a - b}`,
        `Then: ${a - b} + ${c} = ${a - b + c}`,
      ],
    },
    {
      template: (a, b, c) =>
        `On a shelf there are ${a} rows with ${b} books each. ${c} books are taken out. How many books are left?`,
      calculate: (a, b, c) => a * b - c,
      steps: (a, b, c) => [
        `First: ${a} × ${b} = ${a * b}`,
        `Then: ${a * b} - ${c} = ${a * b - c}`,
      ],
    },
  ],
  uk: [
    {
      template: (a, b, c) =>
        `У класі ${a} дітей. Кожна дитина має ${b} книжок. Ще ${c} книжок купили. Скільки всього книжок?`,
      calculate: (a, b, c) => a * b + c,
      steps: (a, b, c) => [
        `Спочатку: ${a} × ${b} = ${a * b}`,
        `Потім: ${a * b} + ${c} = ${a * b + c}`,
      ],
    },
    {
      template: (a, b, c) =>
        `У фермера ${a} яблук. Він продає ${b} яблук і потім отримує ${c} нових яблук. Скільки яблук у нього тепер?`,
      calculate: (a, b, c) => a - b + c,
      steps: (a, b, c) => [
        `Спочатку: ${a} - ${b} = ${a - b}`,
        `Потім: ${a - b} + ${c} = ${a - b + c}`,
      ],
    },
    {
      template: (a, b, c) =>
        `На полиці ${a} рядів по ${b} книжок. ${c} книжок забрали. Скільки книжок залишилось?`,
      calculate: (a, b, c) => a * b - c,
      steps: (a, b, c) => [
        `Спочатку: ${a} × ${b} = ${a * b}`,
        `Потім: ${a * b} - ${c} = ${a * b - c}`,
      ],
    },
  ],
};

/**
 * Konkrete Textaufgabe
 */
class WordProblemTask extends BaseTask<WordProblemData> {
  private operation: "+" | "-" | "*" | "/" | "multi-step";

  constructor(
    params: ConstructorParameters<typeof BaseTask<WordProblemData>>[0] & {
      operation: "+" | "-" | "*" | "/" | "multi-step";
    },
  ) {
    super(params);
    this.operation = params.operation;
  }

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
      explanation: this.data.steps?.join("\n"),
    };
  }

  getHint(): string {
    const h = hints[this.locale] || hints.de;

    if (this.operation === "multi-step") {
      return h.multiStep;
    }

    switch (this.operation) {
      case "+":
        return h.addition;
      case "-":
        return h.subtraction;
      case "*":
        return h.multiplication;
      case "/":
        return h.division;
    }
  }

  getCorrectAnswer(): number {
    return this.data.answer;
  }
}

// ============================================
// KLASSE 3: Einfache Textaufgaben
// ============================================

export const simpleWordProblemAddition: TaskDefinition<WordProblemData> = {
  typeId: "word-simple-add",
  category: "word-problem",
  grade: 3,
  description: "Einfache Textaufgabe Addition",

  generate(locale: Locale): TaskInstance<WordProblemData> {
    const templates = simpleTemplates[locale] || simpleTemplates.de;
    const additionTemplates = templates.filter((t) => t.op === "+");
    const chosen = randomChoice(additionTemplates);

    const a = randomInt(10, 50);
    const b = randomInt(10, 50);
    const answer = a + b;
    const story = chosen.template(a, b);

    return new WordProblemTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: story,
      data: { story, answer },
      operation: "+",
    });
  },
};

export const simpleWordProblemSubtraction: TaskDefinition<WordProblemData> = {
  typeId: "word-simple-sub",
  category: "word-problem",
  grade: 3,
  description: "Einfache Textaufgabe Subtraktion",

  generate(locale: Locale): TaskInstance<WordProblemData> {
    const templates = simpleTemplates[locale] || simpleTemplates.de;
    const subTemplates = templates.filter((t) => t.op === "-");
    const chosen = randomChoice(subTemplates);

    const b = randomInt(10, 30);
    const answer = randomInt(10, 30);
    const a = answer + b;
    const story = chosen.template(a, b);

    return new WordProblemTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: story,
      data: { story, answer },
      operation: "-",
    });
  },
};

export const simpleWordProblemMultiplication: TaskDefinition<WordProblemData> =
  {
    typeId: "word-simple-mult",
    category: "word-problem",
    grade: 3,
    description: "Einfache Textaufgabe Multiplikation",

    generate(locale: Locale): TaskInstance<WordProblemData> {
      const templates = simpleTemplates[locale] || simpleTemplates.de;
      const multTemplates = templates.filter((t) => t.op === "*");
      const chosen = randomChoice(multTemplates);

      const a = randomInt(3, 8);
      const b = randomInt(2, 6);
      const answer = a * b;
      const story = chosen.template(a, b);

      return new WordProblemTask({
        typeId: this.typeId,
        category: this.category,
        grade: this.grade,
        locale,
        question: story,
        data: { story, answer },
        operation: "*",
      });
    },
  };

export const simpleWordProblemDivision: TaskDefinition<WordProblemData> = {
  typeId: "word-simple-div",
  category: "word-problem",
  grade: 3,
  description: "Einfache Textaufgabe Division",

  generate(locale: Locale): TaskInstance<WordProblemData> {
    const templates = simpleTemplates[locale] || simpleTemplates.de;
    const divTemplates = templates.filter((t) => t.op === "/");
    const chosen = randomChoice(divTemplates);

    const b = randomInt(2, 8);
    const answer = randomInt(2, 8);
    const a = b * answer;
    const story = chosen.template(a, b);

    return new WordProblemTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: story,
      data: { story, answer },
      operation: "/",
    });
  },
};

// ============================================
// KLASSE 4: Mehrstufige Textaufgaben
// ============================================

export const multiStepWordProblem: TaskDefinition<WordProblemData> = {
  typeId: "word-multi-step",
  category: "word-problem",
  grade: 4,
  description: "Mehrstufige Textaufgabe",

  generate(locale: Locale): TaskInstance<WordProblemData> {
    const templates = multiStepTemplates[locale] || multiStepTemplates.de;
    const chosen = randomChoice(templates);

    const a = randomInt(5, 12);
    const b = randomInt(3, 8);
    const c = randomInt(5, 20);

    const answer = chosen.calculate(a, b, c);
    const story = chosen.template(a, b, c);
    const steps = chosen.steps(a, b, c);

    return new WordProblemTask({
      typeId: this.typeId,
      category: this.category,
      grade: this.grade,
      locale,
      question: story,
      data: { story, answer, steps },
      operation: "multi-step",
    });
  },
};

// Export aller Textaufgaben-Typen
export const wordProblemTasks: TaskDefinition[] = [
  // Klasse 3
  simpleWordProblemAddition,
  simpleWordProblemSubtraction,
  simpleWordProblemMultiplication,
  simpleWordProblemDivision,
  // Klasse 4
  multiStepWordProblem,
];
