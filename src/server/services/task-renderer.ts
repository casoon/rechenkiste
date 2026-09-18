import type {
  ChoiceOption,
  DragDropItem,
  DragDropTarget,
  TaskInstance,
  ValidationResult,
} from "@domain/task-system";
import type { SerializedTask, TestSession } from "@domain/session";
import { getLocalizedPath, t, type Locale } from "@i18n/translations";

export interface TaskProgress {
  current: number;
  total: number;
}

type ResultData = {
  correct: number;
  total: number;
  percent: number;
  results: Array<{
    taskId: string;
    isCorrect: boolean;
    userAnswer: string | number;
    correctAnswer: string | number;
  }>;
  tasks: Array<SerializedTask | TaskInstance>;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: unknown): string {
  return escapeHtml(value);
}

function withLineBreaks(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function inputHidden(name: string, value: unknown): string {
  return `<input type="hidden" name="${escapeAttr(name)}" value="${escapeAttr(value)}" />`;
}

function answerFormHiddenFields(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  return [
    inputHidden("sessionId", sessionId),
    inputHidden("locale", locale),
    inputHidden("taskId", task.id),
  ].join("\n");
}

function taskInputLabel(task: TaskInstance): string {
  if (!task.inputLabel) return "";
  return `<span class="text-xl font-semibold text-muted">${escapeHtml(task.inputLabel)}</span>`;
}

function questionBlock(main: string, prompt = ""): string {
  const promptHtml = prompt
    ? `<span class="text-base leading-relaxed text-muted">${escapeHtml(prompt)}</span>`
    : "";
  return `<div id="speak-task" class="flex flex-col gap-3 slide-up">
    ${promptHtml}
    ${main}
  </div>`;
}

function checkButton(locale: Locale): string {
  return `<button type="submit" class="btn-check">${escapeHtml(t(locale, "checkAnswer"))}</button>`;
}

function answerForm(inner: string, extraClass = ""): string {
  return `<form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" hx-disabled-elt="find button[type='submit']" class="mt-6 flex flex-col gap-5 ${extraClass}">${inner}</form>`;
}

function renderFeedbackContainer(): string {
  return `<div id="feedback-container" class="mt-6 empty:mt-0"></div>`;
}

function numpadInput(task: TaskInstance, locale: Locale): string {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(
      (digit) =>
        `<button type="button" class="key" x-on:click="push('${digit}')">${digit}</button>`,
    )
    .join("");

  return `<div x-data="{
      v: '',
      push(d) { if (this.v.length < 8) this.v += d; },
      clear() { this.v = ''; },
      back() { this.v = this.v.slice(0, -1); }
    }" class="flex flex-col gap-3.5">
    <label for="answer" class="sr-only">${escapeHtml(t(locale, "yourAnswer"))}</label>
    <div class="flex min-h-17 items-center gap-3 rounded-xl border-2 border-ink bg-field px-4.5 py-3">
      <input
        type="text"
        id="answer"
        name="answer"
        x-model="v"
        class="min-w-0 flex-1 border-0 bg-transparent text-[32px] font-bold text-ink outline-none placeholder:text-[20px] placeholder:font-normal placeholder:text-faint"
        placeholder="${escapeAttr(t(locale, "yourAnswer"))}"
        autocomplete="off"
        inputmode="none"
        required
        autofocus
      />
      ${taskInputLabel(task)}
    </div>
    <div class="grid grid-cols-3 gap-2">
      ${digits}
      <button type="button" class="key-alt" x-on:click="clear()">${escapeHtml(t(locale, "keyClear"))}</button>
      <button type="button" class="key" x-on:click="push('0')">0</button>
      <button type="button" class="key-alt" x-on:click="back()">${escapeHtml(t(locale, "keyBack"))}</button>
    </div>
  </div>`;
}

function getArithmeticInput(task: TaskInstance, locale: Locale): string {
  const lowerQuestion = task.question.toLowerCase();
  const needsTimeInput =
    task.typeId?.includes("clock") ||
    task.typeId?.includes("time") ||
    lowerQuestion.includes("wie spät") ||
    lowerQuestion.includes("uhrzeit") ||
    lowerQuestion.includes("what time");

  const needsDecimalInput =
    !needsTimeInput &&
    (task.typeId?.includes("to-decimal") ||
      task.typeId?.includes("decimal") ||
      lowerQuestion.includes("dezimalzahl"));

  const needsFractionInput =
    !needsDecimalInput &&
    !needsTimeInput &&
    (task.question.includes("/") ||
      task.typeId?.includes("fraction") ||
      task.typeId === "percent-identify");

  // Ziffernblock nur, wenn eine reine Zahl ohne Vorzeichen erwartet wird —
  // Uhrzeiten, Brüche, Kommazahlen und negative Werte brauchen die Tastatur.
  if (!needsTimeInput && !needsDecimalInput && !needsFractionInput) {
    const expected = String(task.getCorrectAnswer() ?? "");
    if (/^\d{1,8}$/.test(expected)) {
      return numpadInput(task, locale);
    }
  }

  const pattern = needsTimeInput
    ? "[^0-9:]"
    : needsFractionInput
      ? "[^0-9/]"
      : "[^0-9,.\\-]";

  return `<div>
    <label for="answer" class="sr-only">${escapeHtml(t(locale, "yourAnswer"))}</label>
    <div class="flex items-center gap-3">
      <input
        type="text"
        id="answer"
        name="answer"
        class="input-field flex-1"
        placeholder="${escapeAttr(t(locale, "yourAnswer"))}"
        autocomplete="off"
        inputmode="${needsFractionInput ? "text" : "decimal"}"
        required
        autofocus
        x-data="{ pattern: ${escapeAttr(JSON.stringify(pattern))} }"
        x-on:input="$el.value = $el.value.replace(new RegExp(pattern, 'g'), '')"
      />
      ${taskInputLabel(task)}
    </div>
  </div>`;
}

function splitSvgQuestion(question: string): { svg: string; text: string } {
  const svgMatch = question.match(/<svg[\s\S]*?<\/svg>/);
  if (!svgMatch) return { svg: "", text: question };
  return {
    svg: svgMatch[0],
    text: question.replace(svgMatch[0], "").trim(),
  };
}

function renderArithmeticTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const { svg, text } = splitSvgQuestion(task.question);
  const question = svg
    ? `<div class="rounded-xl border border-line bg-field p-4">${svg}</div>
      <span class="text-2xl leading-snug font-semibold whitespace-pre-line">${escapeHtml(text)}</span>`
    : `<span class="text-[40px] leading-[1.15] font-bold tracking-[-.01em] whitespace-pre-line">${escapeHtml(task.question)}</span>`;

  return `${questionBlock(question)}

  ${answerForm(`
    ${answerFormHiddenFields(task, sessionId, locale)}
    ${getArithmeticInput(task, locale)}
    ${checkButton(locale)}
  `)}

  ${renderFeedbackContainer()}`;
}

function renderWordTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const data = task.data as { story?: string } | undefined;
  const story = `<p class="rounded-xl border border-line bg-field p-5 text-xl leading-relaxed">${escapeHtml(data?.story ?? task.question)}</p>`;

  return `${questionBlock(story, t(locale, "wordProblem"))}

  ${answerForm(`
    ${answerFormHiddenFields(task, sessionId, locale)}
    <div>
      <label for="answer" class="sr-only">${escapeHtml(t(locale, "yourAnswer"))}</label>
      <input type="text" id="answer" name="answer" class="input-field" placeholder="${escapeAttr(t(locale, "yourAnswer"))}" autocomplete="off" inputmode="numeric" required autofocus />
    </div>
    ${checkButton(locale)}
  `)}

  ${renderFeedbackContainer()}`;
}

function renderGeometryTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const data = task.data as { svgMarkup?: string; prompt?: string } | undefined;
  const figure = `<div class="rounded-xl border border-line bg-field p-4">${data?.svgMarkup ?? ""}</div>
    <span class="text-2xl leading-snug font-semibold">${escapeHtml(data?.prompt ?? task.question)}</span>`;

  return `${questionBlock(figure)}

  ${answerForm(`
    ${answerFormHiddenFields(task, sessionId, locale)}
    ${getArithmeticInput(task, locale)}
    ${checkButton(locale)}
  `)}

  ${renderFeedbackContainer()}`;
}

function renderMultipleChoiceTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const choices = task.choices ?? [];
  // Drei Antworten (z. B. < > =) passen in eine Reihe, sonst zwei Spalten
  const choiceColumns = choices.length === 3 ? "grid-cols-3" : "grid-cols-2";
  const buttons = choices
    .map(
      (choice: ChoiceOption) => `<button
        type="button"
        class="choice-button min-h-[82px] w-full rounded-[14px] border-2 px-2 py-5 text-[30px] font-bold transition-colors"
        :class="selected === '${escapeAttr(choice.id)}' ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'"
        :aria-pressed="selected === '${escapeAttr(choice.id)}'"
        @click="selected = '${escapeAttr(choice.id)}'"
      >${escapeHtml(choice.label)}</button>`,
    )
    .join("");

  return `${questionBlock(
    `<span class="text-[40px] leading-[1.15] font-bold tracking-[-.01em]">${withLineBreaks(task.question)}</span>`,
  )}

  <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" hx-disabled-elt="find button[type='submit']" class="mt-6 flex flex-col gap-5" x-data="{ selected: '' }">
    ${answerFormHiddenFields(task, sessionId, locale)}
    <input type="hidden" name="answer" x-model="selected" />
    <div class="grid ${choiceColumns} gap-3">${buttons}</div>
    <button type="submit" class="btn-check" :disabled="!selected" :class="!selected && 'opacity-50 cursor-not-allowed'">${escapeHtml(t(locale, "checkAnswer"))}</button>
  </form>

  ${renderFeedbackContainer()}`;
}

function renderDragDropTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const dragItems = task.dragItems ?? [];
  const dropTargets = task.dropTargets ?? [];
  const xData = `{
    items: ${JSON.stringify(dragItems satisfies DragDropItem[])},
    targets: ${JSON.stringify(dropTargets satisfies DragDropTarget[])},
    assignments: {},
    dragging: null,
    startDrag(itemId) { this.dragging = itemId; },
    endDrag() { this.dragging = null; },
    dropOnTarget(targetId) {
      if (this.dragging) {
        Object.keys(this.assignments).forEach(key => {
          if (this.assignments[key] === this.dragging) delete this.assignments[key];
        });
        this.assignments[targetId] = this.dragging;
        this.dragging = null;
      }
    },
    removeFromTarget(targetId) { delete this.assignments[targetId]; },
    getItemInTarget(targetId) {
      const itemId = this.assignments[targetId];
      if (!itemId) return null;
      return this.items.find(i => i.id === itemId);
    },
    isItemAssigned(itemId) { return Object.values(this.assignments).includes(itemId); },
    getAnswer() {
      const answer = {};
      Object.entries(this.assignments).forEach(([targetId, itemId]) => {
        answer[itemId] = targetId;
      });
      return JSON.stringify(answer);
    },
    isComplete() { return Object.keys(this.assignments).length === this.items.length; }
  }`;

  return `${questionBlock(
    `<span class="text-[32px] leading-tight font-bold">${withLineBreaks(task.question)}</span>
     <span class="text-base leading-relaxed text-muted">${escapeHtml(t(locale, "matchInstructions"))}</span>`,
    t(locale, "matchItems"),
  )}

  <div id="drag-drop-container" class="mt-6 flex flex-col gap-4.5" x-data="${escapeAttr(xData)}">
    <div class="flex min-h-16 flex-wrap items-center gap-2.5">
      <template x-for="item in items" :key="item.id">
        <button
          type="button"
          x-show="!isItemAssigned(item.id)"
          class="drag-item min-h-15 cursor-grab rounded-xl border-2 border-ink bg-white px-5.5 py-3.5 text-2xl font-bold text-ink"
          :class="dragging === item.id && 'bg-field opacity-60'"
          :aria-pressed="dragging === item.id"
          draggable="true"
          @dragstart="startDrag(item.id)"
          @dragend="endDrag()"
          @touchstart="startDrag(item.id)"
          @click="startDrag(item.id)"
          x-text="item.content"
        ></button>
      </template>
      <div x-show="items.every(i => isItemAssigned(i.id))" class="text-muted">${escapeHtml(t(locale, "allItemsAssigned"))}</div>
    </div>

    <div class="flex items-center gap-2.5">
      <span class="block h-0.5 flex-1 bg-grid"></span>
      <span class="text-sm text-muted">${escapeHtml(t(locale, "matchInstructions"))}</span>
      <span class="block h-0.5 flex-1 bg-grid"></span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <template x-for="target in targets" :key="target.id">
        <button
          type="button"
          class="drop-target flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors"
          :class="getItemInTarget(target.id) ? 'border-ink bg-white' : 'border-faint bg-field'"
          @dragover.prevent
          @drop="dropOnTarget(target.id)"
          @click="dragging ? dropOnTarget(target.id) : getItemInTarget(target.id) && removeFromTarget(target.id)"
        >
          <span class="text-sm text-muted" x-text="target.label"></span>
          <template x-if="getItemInTarget(target.id)">
            <span class="text-2xl font-bold text-ink" x-text="getItemInTarget(target.id)?.content" title="${escapeAttr(t(locale, "removeAssignment"))}"></span>
          </template>
          <template x-if="!getItemInTarget(target.id)">
            <span class="text-2xl text-faint">-</span>
          </template>
        </button>
      </template>
    </div>

    <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" hx-disabled-elt="find button[type='submit']">
      ${answerFormHiddenFields(task, sessionId, locale)}
      <input type="hidden" name="answer" :value="getAnswer()" />
      <button type="submit" class="btn-check" :disabled="!isComplete()" :class="!isComplete() && 'opacity-50 cursor-not-allowed'">${escapeHtml(t(locale, "checkAnswer"))}</button>
    </form>
  </div>

  ${renderFeedbackContainer()}

  <style>
    .drag-item {
      user-select: none;
      touch-action: none;
    }

    .drag-item:active {
      cursor: grabbing;
    }
  </style>`;
}

export async function renderTaskFragment(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
  _progress?: TaskProgress,
): Promise<string> {
  if (task.inputType === "multiple-choice") {
    return renderMultipleChoiceTask(task, sessionId, locale);
  }

  if (task.inputType === "drag-drop") {
    return renderDragDropTask(task, sessionId, locale);
  }

  if (task.category === "word-problem") {
    return renderWordTask(task, sessionId, locale);
  }

  if (
    task.category === "geometry" &&
    task.data &&
    typeof task.data === "object" &&
    "svgMarkup" in task.data &&
    "prompt" in task.data
  ) {
    return renderGeometryTask(task, sessionId, locale);
  }

  return renderArithmeticTask(task, sessionId, locale);
}

// Wartezeit nach einer richtigen Antwort: lang genug, um das grüne
// "Richtig!" wahrzunehmen, kurz genug, dass ein Durchlauf nicht zäh wird.
const CORRECT_FEEDBACK_DELAY_MS = 600;

export async function renderFeedbackFragment(
  result: ValidationResult,
  nextUrl: string,
  isComplete: boolean,
  locale: Locale,
): Promise<string> {
  if (result.isCorrect) {
    return `<div class="feedback-correct flex flex-col gap-3 slide-up" id="feedback-correct" data-next-url="${escapeAttr(nextUrl)}" data-delay="${CORRECT_FEEDBACK_DELAY_MS}" data-is-complete="${isComplete ? "true" : "false"}" data-locale="${escapeAttr(locale)}">
      <div class="flex items-center gap-3">
        <span class="block size-6.5 shrink-0 rounded-full bg-ok"></span>
        <span class="text-[22px] font-bold">${escapeHtml(t(locale, "correct"))}</span>
      </div>
      <span class="loading-dots text-2xl font-bold" aria-hidden="true"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>
    </div>

    <style>
      .loading-dots .dot {
        animation: dot-pulse 1.4s infinite ease-in-out both;
      }
      .loading-dots .dot:nth-child(1) { animation-delay: 0s; }
      .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
      .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes dot-pulse {
        0%, 80%, 100% { opacity: 0.3; }
        40% { opacity: 1; }
      }
    </style>

    <script>
      (function () {
        const feedback = document.getElementById("feedback-correct");
        if (feedback) {
          const nextUrl = feedback.dataset.nextUrl;
          const delay = parseInt(feedback.dataset.delay || "600", 10);
          const isComplete = feedback.dataset.isComplete === "true";
          const locale = feedback.dataset.locale || "de";
          setTimeout(function () {
            if (nextUrl) {
              if (isComplete) {
                window.location.href = nextUrl;
              } else {
                const taskContainer = document.getElementById("task-container");
                if (taskContainer && window.htmx) {
                  htmx.ajax("GET", "/api/test/task?locale=" + locale, {
                    target: "#task-container",
                    swap: "innerHTML",
                  });
                } else {
                  window.location.href = nextUrl;
                }
              }
            }
          }, delay);
        }
      })();
    </script>`;
  }

  const hint = result.hint
    ? `<div class="rounded-xl border border-line bg-white/70 p-3.5 text-left text-[15px] leading-relaxed">
        <span class="font-semibold">${escapeHtml(t(locale, "hint"))}:</span> ${escapeHtml(result.hint)}
      </div>`
    : "";

  const explanation = result.explanation
    ? `<div class="rounded-xl border border-line bg-white/70 p-3.5 text-left text-[15px] leading-relaxed">
        <span class="mb-1 block font-semibold">${escapeHtml(t(locale, "solution"))}:</span>
        <span class="whitespace-pre-line">${escapeHtml(result.explanation)}</span>
      </div>`
    : "";

  const actionLabel = isComplete
    ? t(locale, "showResult")
    : t(locale, "nextTask");
  const actionClass =
    "min-h-13 self-start rounded-xl bg-mark px-5.5 py-3.5 text-[17px] font-bold text-white transition-colors hover:bg-mark-dark";
  const action = isComplete
    ? `<a href="${escapeAttr(nextUrl)}" class="${actionClass}">${escapeHtml(actionLabel)}</a>`
    : `<button type="button" class="${actionClass}" hx-get="/api/test/task?locale=${escapeAttr(locale)}" hx-target="#task-container" hx-swap="innerHTML">${escapeHtml(actionLabel)}</button>`;

  return `<div class="feedback-incorrect flex flex-col gap-3 slide-up">
    <div class="flex items-center gap-3">
      <span class="block size-6.5 shrink-0 rounded-full bg-mark"></span>
      <span class="text-[22px] font-bold">${escapeHtml(t(locale, "incorrect"))}</span>
    </div>
    <span class="text-base leading-relaxed">${escapeHtml(t(locale, "correctAnswerIs", { answer: result.correctAnswer }))}</span>
    ${hint}
    ${explanation}
    ${action}
  </div>`;
}

export async function renderFeedbackResponse(
  result: ValidationResult,
  nextUrl: string,
  isComplete: boolean,
  locale: Locale,
): Promise<Response> {
  const html = await renderFeedbackFragment(
    result,
    nextUrl,
    isComplete,
    locale,
  );

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "HX-Trigger": "feedbackShown",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

function formatUserAnswer(
  answer: string | number,
  task: SerializedTask | TaskInstance,
): string {
  const answerStr = String(answer);

  if (task.inputType === "multiple-choice" && task.choices) {
    const choice = task.choices.find((c) => c.id === answerStr);
    if (choice) return choice.label;
  }

  if (task.inputType === "drag-drop" && task.dragItems && task.dropTargets) {
    try {
      const assignments = JSON.parse(answerStr) as Record<string, string>;
      const parts: string[] = [];
      for (const [itemId, targetId] of Object.entries(assignments)) {
        const item = task.dragItems.find((i) => i.id === itemId);
        const target = task.dropTargets.find((drop) => drop.id === targetId);
        if (item && target) {
          parts.push(`${item.content} → ${target.label}`);
        }
      }
      return parts.join(", ");
    } catch {
      return answerStr;
    }
  }

  if (task.typeId?.includes("money") && !answerStr.includes("€")) {
    return `${answerStr} €`;
  }

  return answerStr;
}

function formatCorrectAnswer(
  answer: string | number,
  task: SerializedTask | TaskInstance,
): string {
  const answerStr = String(answer);

  if (task.inputType === "drag-drop" && task.dragItems && task.dropTargets) {
    try {
      const assignments = JSON.parse(answerStr) as Record<string, string>;
      const parts: string[] = [];
      for (const [itemId, targetId] of Object.entries(assignments)) {
        const item = task.dragItems.find((i) => i.id === itemId);
        const target = task.dropTargets.find((drop) => drop.id === targetId);
        if (item && target) {
          parts.push(`${item.content} → ${target.label}`);
        }
      }
      return parts.join(", ");
    } catch {
      return answerStr;
    }
  }

  return answerStr;
}

function resultFeedback(percent: number): {
  feedbackKey: "excellent" | "great" | "good" | "keepPracticing";
  stars: number;
} {
  if (percent >= 90) return { feedbackKey: "excellent", stars: 5 };
  if (percent >= 70) return { feedbackKey: "great", stars: 4 };
  if (percent >= 50) return { feedbackKey: "good", stars: 3 };
  return { feedbackKey: "keepPracticing", stars: 2 };
}

function reviewList(resultData: ResultData, locale: Locale): string {
  const rows = resultData.results
    .map((result) => {
      const task = resultData.tasks.find(
        (candidate) => candidate.id === result.taskId,
      );
      if (!task) return "";

      const taskData = task.data as { story?: string } | undefined;
      const questionText =
        task.category === "word-problem" && taskData?.story
          ? taskData.story
          : task.question;
      const displayText = questionText?.includes("<svg")
        ? questionText.replace(/<svg[\s\S]*?<\/svg>/gi, "").trim()
        : questionText;

      const detail = result.isCorrect
        ? ""
        : `<span class="mt-1 block text-sm text-muted">
            ${escapeHtml(t(locale, "yourAnswerWas", { answer: formatUserAnswer(result.userAnswer, task) }))}
            &middot;
            ${escapeHtml(t(locale, "correctAnswer", { answer: formatCorrectAnswer(result.correctAnswer, task) }))}
          </span>`;

      return `<div class="flex items-start gap-3.5 border-b border-rule px-4.5 py-3.5 last:border-b-0">
        <span class="mt-1.5 block size-5 shrink-0 rounded-full ${result.isCorrect ? "bg-ok" : "bg-mark"}"></span>
        <span class="min-w-0 flex-1">
          <span class="block text-[17px] leading-snug font-semibold whitespace-pre-line">${escapeHtml(displayText)}</span>
          ${detail}
        </span>
        <span class="shrink-0 text-[15px] font-semibold ${result.isCorrect ? "text-ok" : "text-mark"}">${escapeHtml(t(locale, result.isCorrect ? "markRight" : "markPractise"))}</span>
      </div>`;
    })
    .join("");

  if (!rows) return "";
  return `<div class="overflow-hidden rounded-[14px] border border-line">${rows}</div>`;
}

export async function renderResultFragment(
  session: TestSession,
  resultData: ResultData,
  locale: Locale,
): Promise<string> {
  const { correct, total, percent } = resultData;
  const { feedbackKey, stars } = resultFeedback(percent);

  const stamps = Array.from({ length: 5 })
    .map(
      (_, index) =>
        `<span class="block size-6.5 rounded-full border-2 ${index < stars ? "border-mark bg-mark" : "border-line"}"></span>`,
    )
    .join("");

  return `<div id="speak-page" class="paper-card mx-auto flex w-full max-w-[620px] flex-col gap-6 px-7 py-8">
    <div class="flex flex-col items-center gap-3.5 text-center">
      <span class="text-sm font-semibold tracking-[.1em] text-muted uppercase">${escapeHtml(t(locale, "pageDone"))}</span>
      <h1 class="text-[30px] leading-tight font-bold">${escapeHtml(t(locale, "resultScore", { correct, total }))}</h1>
      <div class="flex items-center gap-2.5" aria-hidden="true">${stamps}</div>
      <span class="text-[17px] text-muted">${escapeHtml(t(locale, feedbackKey))}</span>
      <span class="text-[15px] text-faint">${escapeHtml(t(locale, "percent", { percent }))}</span>
    </div>

    ${reviewList(resultData, locale)}

    <div class="flex flex-col gap-3.5">
      <a href="${escapeAttr(getLocalizedPath(`/?grade=${session.grade}&count=${session.totalTasks}`, locale))}" class="btn-primary text-center">${escapeHtml(t(locale, "tryAgain"))}</a>
      <a href="${escapeAttr(getLocalizedPath("/", locale))}" class="btn-secondary text-center">${escapeHtml(t(locale, "backToStart"))}</a>
    </div>
  </div>`;
}

export async function renderResultResponse(
  session: TestSession,
  resultData: ResultData,
  locale: Locale,
): Promise<Response> {
  const html = await renderResultFragment(session, resultData, locale);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "HX-Trigger": "resultShown",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export { renderTaskFragment as renderTask };
