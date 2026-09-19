import { describe, expect, it } from "vitest";
import {
  getActiveTaskCount,
  getCurrentTask,
  getResults,
  isCurrentTaskSubmission,
  nextTask,
  type SerializedTask,
  type TestSession,
} from "./session";

function task(id: string, answer: number): SerializedTask {
  return {
    id,
    typeId: "test-arithmetic",
    question: `${answer} + 0`,
    correctAnswer: answer,
    hint: "",
    category: "arithmetic",
    grade: 1,
    locale: "de",
  };
}

function session(): TestSession {
  return {
    id: "session-1",
    grade: 1,
    totalTasks: 3,
    currentIndex: 0,
    tasks: [task("task-1", 1), task("task-2", 2), task("task-3", 3)],
    results: [],
    locale: "de",
    options: {
      adaptiveDifficulty: false,
      retryIncorrect: true,
      retryAtEnd: true,
    },
    currentDifficulty: 1,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    incorrectTaskIds: [],
    retryTaskIds: [],
    retryMode: false,
    fragmentLoads: 0,
    pageLoads: 1,
  };
}

describe("test session", () => {
  it("keeps all original tasks when starting the retry round", () => {
    const testSession = session();
    testSession.currentIndex = 2;
    testSession.incorrectTaskIds = ["task-2"];

    nextTask(testSession);

    expect(testSession.retryMode).toBe(true);
    expect(testSession.tasks).toHaveLength(3);
    expect(testSession.totalTasks).toBe(3);
    expect(getActiveTaskCount(testSession)).toBe(1);
    expect(getCurrentTask(testSession)?.id).toBe("task-2");
  });

  it("matches result tasks by task id instead of array position", () => {
    const testSession = session();
    testSession.results = [
      {
        taskId: "task-3",
        userAnswer: "0",
        isCorrect: false,
        correctAnswer: 3,
        attempts: 1,
        isRetry: false,
      },
      {
        taskId: "task-1",
        userAnswer: "1",
        isCorrect: true,
        correctAnswer: 1,
        attempts: 1,
        isRetry: false,
      },
    ];

    expect(getResults(testSession).tasks.map((resultTask) => resultTask.id)).toEqual([
      "task-3",
      "task-1",
    ]);
  });

  it("validates a restored task with the rules of its own task type", () => {
    const testSession = session();
    testSession.tasks[0] = {
      id: "task-1",
      typeId: "arithmetic-div-remainder",
      question: "57 ÷ 9 = ? (mit Rest)",
      correctAnswer: "6 Rest 3",
      hint: "",
      category: "arithmetic",
      grade: 3,
      locale: "de",
      data: { dividend: 57, divisor: 9, quotient: 6, remainder: 3 },
    };

    const task = getCurrentTask(testSession);

    // Der Quotient allein ist nicht die Antwort — der generische
    // Zahlenvergleich hatte "6" durchgehen lassen
    expect(task?.validate("6").isCorrect).toBe(false);
    expect(task?.validate("6 Rest 3").isCorrect).toBe(true);
    expect(task?.validate("6r3").isCorrect).toBe(true);
    expect(task?.validate("6 Rest 4").isCorrect).toBe(false);
    expect(task?.getCorrectAnswer()).toBe("6 Rest 3");
    expect(task?.id).toBe("task-1");
  });

  it("falls back to the generic comparison for unknown task types", () => {
    const testSession = session();

    const task = getCurrentTask(testSession);

    expect(task?.validate("1").isCorrect).toBe(true);
    expect(task?.validate("2").isCorrect).toBe(false);
  });

  it("rejects submissions for another session or a stale task", () => {
    const testSession = session();

    expect(isCurrentTaskSubmission(testSession, "session-1", "task-1")).toBe(
      true,
    );
    expect(isCurrentTaskSubmission(testSession, "session-2", "task-1")).toBe(
      false,
    );
    expect(isCurrentTaskSubmission(testSession, "session-1", "task-2")).toBe(
      false,
    );
  });
});
