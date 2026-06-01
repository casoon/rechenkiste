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
  return `<span class="text-2xl font-semibold text-gray-700">${escapeHtml(task.inputLabel)}</span>`;
}

function renderFeedbackContainer(): string {
  return `<div id="feedback-container" class="mt-6"></div>`;
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
    ? `<div class="bg-white/80 rounded-xl p-4 mb-4">${svg}</div>
      <p class="text-xl md:text-2xl whitespace-pre-line">${escapeHtml(text)}</p>`
    : `<span class="text-4xl md:text-5xl font-bold whitespace-pre-line">${escapeHtml(task.question)}</span>`;

  return `<div class="slide-up">
    <div class="task-question">${question}</div>
  </div>

  <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" class="mt-8 space-y-6">
    ${answerFormHiddenFields(task, sessionId, locale)}
    ${getArithmeticInput(task, locale)}
    <button type="submit" class="btn-success w-full">${escapeHtml(t(locale, "checkAnswer"))}</button>
  </form>

  ${renderFeedbackContainer()}`;
}

function renderWordTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const data = task.data as { story?: string } | undefined;
  return `<div class="slide-up">
    <div class="task-question">
      <div class="bg-white/60 rounded-xl p-6 mb-4 text-left">
        <p class="text-xl md:text-2xl leading-relaxed">${escapeHtml(data?.story ?? task.question)}</p>
      </div>
    </div>
  </div>

  <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" class="mt-6 space-y-6">
    ${answerFormHiddenFields(task, sessionId, locale)}
    <div>
      <label for="answer" class="sr-only">${escapeHtml(t(locale, "yourAnswer"))}</label>
      <input type="text" id="answer" name="answer" class="input-field" placeholder="${escapeAttr(t(locale, "yourAnswer"))}" autocomplete="off" inputmode="numeric" required autofocus />
    </div>
    <button type="submit" class="btn-success w-full">${escapeHtml(t(locale, "checkAnswer"))}</button>
  </form>

  ${renderFeedbackContainer()}`;
}

function renderGeometryTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const data = task.data as { svgMarkup?: string; prompt?: string } | undefined;
  return `<div class="slide-up">
    <div class="task-question">
      <div class="bg-white/80 rounded-xl p-4 mb-4">${data?.svgMarkup ?? ""}</div>
      <p class="text-xl md:text-2xl">${escapeHtml(data?.prompt ?? task.question)}</p>
    </div>
  </div>

  <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" class="mt-6 space-y-6">
    ${answerFormHiddenFields(task, sessionId, locale)}
    ${getArithmeticInput(task, locale)}
    <button type="submit" class="btn-success w-full">${escapeHtml(t(locale, "checkAnswer"))}</button>
  </form>

  ${renderFeedbackContainer()}`;
}

function renderMultipleChoiceTask(
  task: TaskInstance,
  sessionId: string,
  locale: Locale,
): string {
  const choices = task.choices ?? [];
  const buttons = choices
    .map(
      (choice: ChoiceOption) => `<button
        type="button"
        class="choice-button p-4 text-2xl font-bold rounded-xl border-2 transition-all duration-200"
        :class="selected === '${escapeAttr(choice.id)}' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'"
        @click="selected = '${escapeAttr(choice.id)}'"
      >${escapeHtml(choice.label)}</button>`,
    )
    .join("");

  return `<div class="slide-up">
    <div class="task-question">
      <span class="text-3xl md:text-4xl font-bold">${withLineBreaks(task.question)}</span>
    </div>
  </div>

  <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" class="mt-8 space-y-4" x-data="{ selected: '' }">
    ${answerFormHiddenFields(task, sessionId, locale)}
    <input type="hidden" name="answer" x-model="selected" />
    <div class="grid grid-cols-2 gap-3">${buttons}</div>
    <button type="submit" class="btn-success w-full mt-6" :disabled="!selected" :class="!selected && 'opacity-50 cursor-not-allowed'">${escapeHtml(t(locale, "checkAnswer"))}</button>
  </form>

  ${renderFeedbackContainer()}

  <style>
    .choice-button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
    }
  </style>`;
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

  return `<div class="slide-up">
    <div class="task-question">
      <span class="text-gray-500 text-xl block mb-2">${escapeHtml(t(locale, "matchItems"))}</span>
      <span class="text-2xl md:text-3xl font-bold">${withLineBreaks(task.question)}</span>
    </div>
  </div>

  <div id="drag-drop-container" class="mt-8" x-data="${escapeAttr(xData)}">
    <div class="flex flex-wrap gap-3 mb-6 p-4 bg-gray-100 rounded-xl min-h-15">
      <template x-for="item in items" :key="item.id">
        <div
          x-show="!isItemAssigned(item.id)"
          class="drag-item px-4 py-2 bg-white rounded-lg border-2 border-gray-300 cursor-grab text-xl font-semibold shadow-sm hover:shadow-md transition-shadow"
          :class="dragging === item.id && 'opacity-50 border-emerald-500'"
          draggable="true"
          @dragstart="startDrag(item.id)"
          @dragend="endDrag()"
          @touchstart="startDrag(item.id)"
          @click="startDrag(item.id)"
          x-text="item.content"
        ></div>
      </template>
      <div x-show="items.every(i => isItemAssigned(i.id))" class="text-gray-400 italic">Alle Elemente zugeordnet</div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <template x-for="target in targets" :key="target.id">
        <div
          class="drop-target p-4 rounded-xl border-2 border-dashed min-h-20 flex flex-col items-center justify-center transition-colors"
          :class="dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50'"
          @dragover.prevent
          @drop="dropOnTarget(target.id)"
          @click="dragging && dropOnTarget(target.id)"
        >
          <span class="text-sm text-gray-500 mb-2" x-text="target.label"></span>
          <template x-if="getItemInTarget(target.id)">
            <div class="px-4 py-2 bg-emerald-100 rounded-lg border-2 border-emerald-400 text-xl font-semibold cursor-pointer hover:bg-red-100 hover:border-red-400 transition-colors" @click.stop="removeFromTarget(target.id)" x-text="getItemInTarget(target.id)?.content" title="Klicken zum Entfernen"></div>
          </template>
          <template x-if="!getItemInTarget(target.id)">
            <span class="text-gray-400">-</span>
          </template>
        </div>
      </template>
    </div>

    <form id="answer-form" hx-post="/api/test/answer" hx-target="#feedback-container" hx-swap="innerHTML" class="mt-6">
      ${answerFormHiddenFields(task, sessionId, locale)}
      <input type="hidden" name="answer" :value="getAnswer()" />
      <button type="submit" class="btn-success w-full" :disabled="!isComplete()" :class="!isComplete() && 'opacity-50 cursor-not-allowed'">${escapeHtml(t(locale, "checkAnswer"))}</button>
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

    .drop-target {
      transition: all 0.2s ease;
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

export async function renderFeedbackFragment(
  result: ValidationResult,
  nextUrl: string,
  isComplete: boolean,
  locale: Locale,
): Promise<string> {
  if (result.isCorrect) {
    return `<div class="feedback-correct bounce-in" id="feedback-correct" data-next-url="${escapeAttr(nextUrl)}" data-delay="1500" data-is-complete="${isComplete ? "true" : "false"}" data-locale="${escapeAttr(locale)}">
      <div class="text-4xl mb-2">🎉</div>
      <p>${escapeHtml(t(locale, "correct"))}</p>
      <div class="mt-4 flex items-center justify-center gap-2 text-green-600">
        <span class="loading-dots"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>
      </div>
    </div>

    <style>
      .loading-dots .dot {
        animation: dot-pulse 1.4s infinite ease-in-out both;
        font-size: 2rem;
        font-weight: bold;
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
          const delay = parseInt(feedback.dataset.delay || "1500", 10);
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
    ? `<div class="mt-4 p-3 bg-yellow-100/80 rounded-lg text-left">
        <p class="text-sm text-yellow-800"><span class="font-semibold">💡 ${escapeHtml(t(locale, "hint"))}:</span> ${escapeHtml(result.hint)}</p>
      </div>`
    : "";

  const explanation = result.explanation
    ? `<div class="mt-3 p-3 bg-blue-100/80 rounded-lg text-left">
        <p class="font-semibold text-blue-900 mb-1">${escapeHtml(t(locale, "solution"))}:</p>
        <p class="text-sm text-blue-800 whitespace-pre-line">${escapeHtml(result.explanation)}</p>
      </div>`
    : "";

  const action = isComplete
    ? `<a href="${escapeAttr(nextUrl)}" class="btn-primary w-full inline-block text-center">${escapeHtml(t(locale, "showResult"))} →</a>`
    : `<button type="button" class="btn-primary w-full" hx-get="/api/test/task?locale=${escapeAttr(locale)}" hx-target="#task-container" hx-swap="innerHTML">${escapeHtml(t(locale, "nextTask"))} →</button>`;

  return `<div class="feedback-incorrect bounce-in">
    <div class="text-4xl mb-2">😅</div>
    <p class="text-xl font-bold">${escapeHtml(t(locale, "incorrect"))}</p>
    <p class="mt-2 text-lg">${escapeHtml(t(locale, "correctAnswerIs", { answer: result.correctAnswer }))}</p>
    ${hint}
    ${explanation}
    <div class="mt-6">${action}</div>
  </div>

  <style>
    .feedback-incorrect {
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
  </style>`;
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

function errorDetails(resultData: ResultData, locale: Locale): string {
  if (!resultData.results.some((result) => !result.isCorrect)) return "";

  const items = resultData.results
    .map((result, index) => {
      if (result.isCorrect) return "";
      const task = resultData.tasks[index];
      const taskData = task.data as { story?: string } | undefined;
      const questionText =
        task.category === "word-problem" && taskData?.story
          ? taskData.story
          : task.question;
      const displayText = questionText?.includes("<svg")
        ? questionText.replace(/<svg[\s\S]*?<\/svg>/gi, "").trim()
        : questionText;

      return `<div class="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
        <p class="font-bold text-gray-800 mb-2 whitespace-pre-line">${escapeHtml(displayText)}</p>
        <p class="text-red-600">${escapeHtml(t(locale, "yourAnswerWas", { answer: formatUserAnswer(result.userAnswer, task) }))}</p>
        <p class="text-green-600">${escapeHtml(t(locale, "correctAnswer", { answer: formatCorrectAnswer(result.correctAnswer, task) }))}</p>
      </div>`;
    })
    .join("");

  return `<div x-data="{ showErrors: false }" class="mb-8">
    <button @click="showErrors = !showErrors" class="btn-secondary w-full mb-4">
      <span x-text="showErrors ? '${escapeAttr(t(locale, "hideErrors"))}' : '${escapeAttr(t(locale, "showErrors"))}'"></span>
    </button>
    <div x-show="showErrors" x-transition class="space-y-3">${items}</div>
  </div>`;
}

export async function renderResultFragment(
  session: TestSession,
  resultData: ResultData,
  locale: Locale,
): Promise<string> {
  const { correct, total, percent } = resultData;
  const { feedbackKey, stars } = resultFeedback(percent);
  const starHtml = Array.from({ length: 5 })
    .map(
      (_, index) =>
        `<span class="star" style="animation-delay: ${index * 0.1}s">${index < stars ? "⭐" : "☆"}</span>`,
    )
    .join("");

  return `<div class="glass-card-strong p-6 md:p-10 max-w-2xl w-full mx-auto">
    <div class="text-center mb-8 bounce-in">
      <h1 class="text-3xl md:text-4xl font-bold text-purple-700 mb-4">${escapeHtml(t(locale, "result"))}</h1>
      <div class="flex justify-center gap-1 mb-4">${starHtml}</div>
      <div class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">${escapeHtml(t(locale, "youSolved", { correct, total }))}</div>
      <div class="text-xl text-purple-600 font-bold">${escapeHtml(t(locale, "percent", { percent }))}</div>
    </div>

    <div class="flex justify-center mb-8">
      <div class="relative size-40">
        <svg class="size-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"></circle>
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${percent * 2.83} 283" class="transition-all duration-1000 ease-out"></circle>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#22c55e"></stop>
              <stop offset="100%" stop-color="#10b981"></stop>
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-3xl font-bold text-gray-800">${percent}%</span>
        </div>
      </div>
    </div>

    <div class="text-center mb-8 slide-up">
      <p class="text-xl text-gray-700">${escapeHtml(t(locale, feedbackKey))}</p>
    </div>

    ${errorDetails(resultData, locale)}

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="${escapeAttr(getLocalizedPath(`/?grade=${session.grade}&count=${session.totalTasks}`, locale))}" class="btn-primary">${escapeHtml(t(locale, "tryAgain"))}</a>
      <a href="${escapeAttr(getLocalizedPath("/", locale))}" class="btn-secondary">${escapeHtml(t(locale, "backToStart"))}</a>
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
