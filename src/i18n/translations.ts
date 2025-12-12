export type Locale = "de" | "en" | "uk";

export const translations = {
  de: {
    // Allgemein
    appName: "Rechenkiste",
    tagline: "Mathe macht Spaß!",

    // Startseite
    welcome: "Willkommen bei der Rechenkiste!",
    chooseGrade: "Wähle deine Klassenstufe",
    chooseCount: "Wie viele Aufgaben möchtest du lösen?",
    grade: "Klasse",
    tasks: "Aufgaben",
    startTest: "Test starten",

    // Klassenstufen
    grade1: "1. Klasse",
    grade2: "2. Klasse",
    grade3: "3. Klasse",
    grade4: "4. Klasse",
    grade5: "5. Klasse",

    // Test
    taskOf: "Aufgabe {current} von {total}",
    checkAnswer: "Antwort prüfen",
    nextTask: "Nächste Aufgabe",
    yourAnswer: "Deine Antwort",

    // Feedback
    correct: "Super! Das ist richtig!",
    incorrect: "Das war leider falsch.",
    correctAnswerIs: "Die richtige Antwort ist: {answer}",
    almostCorrect: "Fast richtig! Versuch es nochmal.",
    hint: "Hinweis",
    solution: "Lösungsweg",
    showResult: "Ergebnis anzeigen",

    // Ergebnis
    result: "Dein Ergebnis",
    youSolved: "Du hast {correct} von {total} Aufgaben richtig gelöst!",
    percent: "{percent}% richtig",
    excellent: "Ausgezeichnet! Du bist ein Mathe-Star!",
    great: "Super gemacht! Weiter so!",
    good: "Gut gemacht! Übung macht den Meister!",
    keepPracticing: "Bleib dran! Du schaffst das!",
    tryAgain: "Nochmal versuchen",
    backToStart: "Zurück zum Start",
    showErrors: "Fehler anzeigen",
    hideErrors: "Fehler ausblenden",
    yourAnswerWas: "Deine Antwort: {answer}",
    correctAnswer: "Richtige Antwort: {answer}",

    // Optionen
    options: "Optionen",
    adaptiveDifficulty:
      "Schwierigkeit anpassen (leichter/schwerer je nach Antworten)",
    retryIncorrect: "Fehler am Ende wiederholen",
    matchItems: "Ordne zu:",
    retryRound: "Wiederholungsrunde",
    retryInfo: "Jetzt wiederholst du die {count} falschen Aufgaben.",

    // Aufgabentypen
    calculate: "Rechne:",
    wordProblem: "Textaufgabe:",
    geometryProblem: "Geometrie:",

    // Textaufgaben
    apples: "Äpfel",
    bananas: "Bananen",
    children: "Kinder",
    candies: "Bonbons",
    books: "Bücher",
    marbles: "Murmeln",

    // Navigation
    language: "Sprache",
    techInfo: "Technik & AHA-Stack",
    customTest: "Eigener Test",
  },

  en: {
    // General
    appName: "Math Box",
    tagline: "Math is fun!",

    // Start page
    welcome: "Welcome to the Math Box!",
    chooseGrade: "Choose your grade level",
    chooseCount: "How many tasks do you want to solve?",
    grade: "Grade",
    tasks: "Tasks",
    startTest: "Start Test",

    // Grade levels
    grade1: "Grade 1",
    grade2: "Grade 2",
    grade3: "Grade 3",
    grade4: "Grade 4",
    grade5: "Grade 5",

    // Test
    taskOf: "Task {current} of {total}",
    checkAnswer: "Check Answer",
    nextTask: "Next Task",
    yourAnswer: "Your answer",

    // Feedback
    correct: "Great! That's correct!",
    incorrect: "That was incorrect.",
    correctAnswerIs: "The correct answer is: {answer}",
    almostCorrect: "Almost correct! Try again.",
    hint: "Hint",
    solution: "Solution",
    showResult: "Show Result",

    // Result
    result: "Your Result",
    youSolved: "You solved {correct} out of {total} tasks correctly!",
    percent: "{percent}% correct",
    excellent: "Excellent! You are a math star!",
    great: "Great job! Keep it up!",
    good: "Good job! Practice makes perfect!",
    keepPracticing: "Keep practicing! You can do it!",
    tryAgain: "Try Again",
    backToStart: "Back to Start",
    showErrors: "Show Errors",
    hideErrors: "Hide Errors",
    yourAnswerWas: "Your answer: {answer}",
    correctAnswer: "Correct answer: {answer}",

    // Options
    options: "Options",
    adaptiveDifficulty: "Adjust difficulty (easier/harder based on answers)",
    retryIncorrect: "Retry incorrect at end",
    matchItems: "Match:",
    retryRound: "Retry round",
    retryInfo: "Now you'll retry the {count} incorrect tasks.",

    // Task types
    calculate: "Calculate:",
    wordProblem: "Word Problem:",
    geometryProblem: "Geometry:",

    // Word problems
    apples: "apples",
    bananas: "bananas",
    children: "children",
    candies: "candies",
    books: "books",
    marbles: "marbles",

    // Navigation
    language: "Language",
    techInfo: "Tech & AHA-Stack",
    customTest: "Custom Test",
  },

  uk: {
    // Загальне
    appName: "Математична Скринька",
    tagline: "Математика — це весело!",

    // Стартова сторінка
    welcome: "Ласкаво просимо до Математичної Скриньки!",
    chooseGrade: "Обери свій клас",
    chooseCount: "Скільки завдань ти хочеш розв'язати?",
    grade: "Клас",
    tasks: "Завдання",
    startTest: "Почати тест",

    // Рівні класів
    grade1: "1 клас",
    grade2: "2 клас",
    grade3: "3 клас",
    grade4: "4 клас",
    grade5: "5 клас",

    // Тест
    taskOf: "Завдання {current} з {total}",
    checkAnswer: "Перевірити відповідь",
    nextTask: "Наступне завдання",
    yourAnswer: "Твоя відповідь",

    // Відгук
    correct: "Чудово! Це правильно!",
    incorrect: "На жаль, неправильно.",
    correctAnswerIs: "Правильна відповідь: {answer}",
    almostCorrect: "Майже правильно! Спробуй ще раз.",
    hint: "Підказка",
    solution: "Розв'язок",
    showResult: "Показати результат",

    // Результат
    result: "Твій результат",
    youSolved: "Ти правильно розв'язав {correct} з {total} завдань!",
    percent: "{percent}% правильно",
    excellent: "Відмінно! Ти зірка математики!",
    great: "Чудова робота! Так тримати!",
    good: "Добре! Практика веде до досконалості!",
    keepPracticing: "Продовжуй! У тебе все вийде!",
    tryAgain: "Спробувати знову",
    backToStart: "На початок",
    showErrors: "Показати помилки",
    hideErrors: "Сховати помилки",
    yourAnswerWas: "Твоя відповідь: {answer}",
    correctAnswer: "Правильна відповідь: {answer}",

    // Опції
    options: "Опції",
    adaptiveDifficulty:
      "Налаштувати складність (легше/важче залежно від відповідей)",
    retryIncorrect: "Повторити помилки в кінці",
    matchItems: "Встанови відповідність:",
    retryRound: "Раунд повторення",
    retryInfo: "Тепер ти повториш {count} неправильних завдань.",

    // Типи завдань
    calculate: "Обчисли:",
    wordProblem: "Задача:",
    geometryProblem: "Геометрія:",

    // Текстові задачі
    apples: "яблук",
    bananas: "бананів",
    children: "дітей",
    candies: "цукерок",
    books: "книжок",
    marbles: "кульок",

    // Навігація
    language: "Мова",
    techInfo: "Техніка & AHA-Stack",
    customTest: "Власний тест",
  },
} as const;

export type TranslationKey = keyof typeof translations.de;

export function t(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text: string = translations[locale][key] || translations.de[key] || key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
  }

  return text;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang === "en" || lang === "uk") {
    return lang;
  }
  return "de";
}

export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === "de") {
    return path;
  }
  return `/${locale}${path}`;
}
