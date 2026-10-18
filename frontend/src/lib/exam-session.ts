import type { ExamQuestion, ExamStartData } from "@/types/learner-exam";

export type ExamAnswer = string | string[];

/**
 * An exam attempt in progress, saved on this device so a page reload or tab
 * close keeps the learner's answers and place. The timer and question set
 * come from the server (POST /exams/:examId/start), which also enforces the
 * deadline; this copy is only for display and resuming.
 */
export interface ExamSession {
  version: 2;
  /** Server session id, sent back on submit. */
  sessionId: string;
  examId: string;
  learnerProfileId: string;
  title: string;
  /** When the attempt started on the server, in device-clock epoch ms. */
  startedAt: number;
  /**
   * When time runs out (server deadline, already capped at the exam's close
   * date), in device-clock epoch ms — shifted by the device's clock error.
   */
  deadline: number;
  /** Duration in minutes, frozen at start so a later edit can't shift it. */
  durationMinutes: number;
  /** The exact questions served (random set for REGULAR dynamic exams). */
  questions: ExamQuestion[];
  answers: Record<string, ExamAnswer>;
  flagged: string[];
  currentQuestion: number;
}

const KEY_PREFIX = "exam-session";
const CHANGE_EVENT = "exam-session-change";

const sessionKey = (learnerProfileId: string, examId: string) =>
  `${KEY_PREFIX}:${learnerProfileId}:${examId}`;

function isValidSession(value: unknown): value is ExamSession {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<ExamSession>;
  return (
    s.version === 2 &&
    typeof s.sessionId === "string" &&
    typeof s.examId === "string" &&
    typeof s.learnerProfileId === "string" &&
    typeof s.startedAt === "number" &&
    typeof s.deadline === "number" &&
    typeof s.durationMinutes === "number" &&
    Array.isArray(s.questions) &&
    s.questions.length > 0 &&
    !!s.answers &&
    typeof s.answers === "object"
  );
}

export function loadExamSession(
  learnerProfileId: string,
  examId: string,
): ExamSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(sessionKey(learnerProfileId, examId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSession(parsed)) return null;
    return {
      ...parsed,
      title: typeof parsed.title === "string" ? parsed.title : "Exam",
      flagged: Array.isArray(parsed.flagged) ? parsed.flagged : [],
      currentQuestion: Math.min(
        Math.max(0, Number(parsed.currentQuestion) || 0),
        parsed.questions.length - 1,
      ),
    };
  } catch {
    return null;
  }
}

export function saveExamSession(session: ExamSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      sessionKey(session.learnerProfileId, session.examId),
      JSON.stringify(session),
    );
  } catch {
    // Storage full or blocked (private mode) — the exam still works, it just
    // can't survive a reload.
  }
}

export function clearExamSession(
  learnerProfileId: string,
  examId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(sessionKey(learnerProfileId, examId));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Ignore — nothing to clear.
  }
}

/** Device-clock epoch ms at which the session's time runs out. */
export function getSessionDeadline(session: ExamSession): number {
  return session.deadline;
}

/**
 * Builds the local session from the server's start response. The device
 * clock may be wrong, so server times are shifted by the difference between
 * the server's "now" and the device's (network delay ignored — it only makes
 * the timer end slightly early, and submit has a grace period).
 */
export function sessionFromStart(
  start: ExamStartData,
  learnerProfileId: string,
): ExamSession {
  const clockOffset = Date.parse(start.serverNow) - Date.now();
  return {
    version: 2,
    sessionId: start.sessionId,
    examId: start.exam.id,
    learnerProfileId,
    title: start.exam.title,
    startedAt: Date.parse(start.startedAt) - clockOffset,
    deadline: Date.parse(start.deadline) - clockOffset,
    durationMinutes: start.exam.duration,
    questions: start.questions,
    answers: {},
    flagged: [],
    currentQuestion: 0,
  };
}

/**
 * Comma-separated ids of exams the profile has in progress on this device.
 * Returned as a string so it is a stable `useSyncExternalStore` snapshot.
 */
export function getActiveExamIds(learnerProfileId: string): string {
  if (typeof window === "undefined" || !learnerProfileId) return "";
  try {
    const prefix = `${KEY_PREFIX}:${learnerProfileId}:`;
    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) ids.push(key.slice(prefix.length));
    }
    return ids.sort().join(",");
  } catch {
    return "";
  }
}

export function subscribeExamSessions(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function isAnswered(answer: ExamAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  return answer.trim().length > 0;
}
