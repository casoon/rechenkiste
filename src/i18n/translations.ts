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
    startTest: "Anfangen",

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
    answerQuotient: "Ergebnis",
    answerRemainder: "Rest",

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
    matchInstructions: "Wähle ein Element und danach das passende Ziel.",
    allItemsAssigned: "Alle Elemente sind zugeordnet.",
    removeAssignment: "Zuordnung entfernen",
    retryRound: "Wiederholungsrunde",
    retryInfo: "Jetzt wiederholst du die {count} falschen Aufgaben.",

    // Aufgabenkategorien
    catArithmetic: "Rechnen",
    catWordProblem: "Textaufgaben",
    catGeometry: "Geometrie",
    catNumberSense: "Zahlenverständnis",
    catMeasurement: "Maßeinheiten",
    catData: "Daten & Diagramme",

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

    // Seitentexte & Vorlesen
    keyClear: "löschen",
    keyBack: "eins zurück",
    readPage: "Seite vorlesen",
    readTask: "Aufgabe vorlesen",
    newPage: "Neue Seite im Rechenheft",
    newPageSub: "Klasse und Umfang eintragen",
    back: "Zurück",
    cancelPractice: "Übung abbrechen",
    pageDone: "Seite fertig",
    resultScore: "{correct} von {total} richtig",
    markRight: "richtig",
    markPractise: "noch üben",
    backToPractice: "Zurück zum Rechnen",

    // Navigation
    language: "Sprache",
    techInfo: "Technik & AHA-Stack",
    customTest: "Aufgaben selbst zusammenstellen",
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
    startTest: "Start",

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
    answerQuotient: "Result",
    answerRemainder: "Remainder",

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
    matchInstructions: "Select an item, then select its matching target.",
    allItemsAssigned: "All items are assigned.",
    removeAssignment: "Remove assignment",
    retryRound: "Retry round",
    retryInfo: "Now you'll retry the {count} incorrect tasks.",

    // Task categories
    catArithmetic: "Arithmetic",
    catWordProblem: "Word Problems",
    catGeometry: "Geometry",
    catNumberSense: "Number Sense",
    catMeasurement: "Measurements",
    catData: "Data & Charts",

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

    // Seitentexte & Vorlesen
    keyClear: "clear",
    keyBack: "one back",
    readPage: "Read page aloud",
    readTask: "Read task aloud",
    newPage: "A new page in the math book",
    newPageSub: "Pick your grade and how much to do",
    back: "Back",
    cancelPractice: "Stop practising",
    pageDone: "Page finished",
    resultScore: "{correct} of {total} correct",
    markRight: "correct",
    markPractise: "practise again",
    backToPractice: "Back to practising",

    // Navigation
    language: "Language",
    techInfo: "Tech & AHA-Stack",
    customTest: "Build your own set",
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
    startTest: "Почати",

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
    answerQuotient: "Результат",
    answerRemainder: "Остача",

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
    matchInstructions: "Вибери елемент, а потім відповідну ціль.",
    allItemsAssigned: "Усі елементи розподілено.",
    removeAssignment: "Видалити відповідність",
    retryRound: "Раунд повторення",
    retryInfo: "Тепер ти повториш {count} неправильних завдань.",

    // Категорії завдань
    catArithmetic: "Арифметика",
    catWordProblem: "Текстові задачі",
    catGeometry: "Геометрія",
    catNumberSense: "Числове чуття",
    catMeasurement: "Вимірювання",
    catData: "Дані та діаграми",

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

    // Seitentexte & Vorlesen
    keyClear: "очистити",
    keyBack: "на один назад",
    readPage: "Прочитати сторінку",
    readTask: "Прочитати завдання",
    newPage: "Нова сторінка у зошиті",
    newPageSub: "Вибери клас і кількість завдань",
    back: "Назад",
    cancelPractice: "Перервати вправу",
    pageDone: "Сторінку завершено",
    resultScore: "{correct} з {total} правильно",
    markRight: "правильно",
    markPractise: "ще потренуватись",
    backToPractice: "Повернутися до задач",

    // Navigation
    language: "Мова",
    techInfo: "Техніка & AHA-Stack",
    customTest: "Скласти власні завдання",
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

const categoryKeys = {
  arithmetic: "catArithmetic",
  "word-problem": "catWordProblem",
  geometry: "catGeometry",
  "number-sense": "catNumberSense",
  measurement: "catMeasurement",
  data: "catData",
} as const satisfies Record<string, TranslationKey>;

export function categoryLabel(locale: Locale, category: string): string {
  const key = categoryKeys[category as keyof typeof categoryKeys];
  return key ? t(locale, key) : category;
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
