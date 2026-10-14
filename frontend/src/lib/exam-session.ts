import type { ExamQuestion } from "@/types/learner-exam";

export type ExamAnswer = string | string[];

/**
 * An exam attempt in progress, persisted on this device so a page reload,
 * tab close or accidental navigation does not reset the timer, reshuffle a
 * random question set or lose the learner's answers.
 */
export interface ExamSession {
  version: 1;
  examId: string;
  learnerProfileId: string;
  title: string;
  /** Hard close date of the exam (ISO), if any — the server rejects later submits. */
  closeDate: string | null;
  /** When the learner pressed "Start Exam" (epoch ms). Anchors the timer. */
  startedAt: number;
  /** Duration in minutes, frozen at start so a later edit can't shift it. */
  durationMinutes: number;
  /** The exact questions shown (random set for REGULAR dynamic exams). */
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
    s.version === 1 &&
    typeof s.examId === "string" &&
    typeof s.learnerProfileId === "string" &&
    typeof s.startedAt === "number" &&
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
      closeDate: typeof parsed.closeDate === "string" ? parsed.closeDate : null,
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

// Submit a little before a hard close date so the request lands in time.
const CLOSE_DATE_BUFFER_MS = 10 * 1000;

/**
 * Epoch ms at which the session's time runs out: the end of the exam
 * duration, or shortly before the exam's close date if that comes first.
 */
export function getSessionDeadline(session: ExamSession): number {
  const durationEnd = session.startedAt + session.durationMinutes * 60 * 1000;
  const closeMs = session.closeDate ? Date.parse(session.closeDate) : NaN;
  return Number.isNaN(closeMs)
    ? durationEnd
    : Math.min(durationEnd, closeMs - CLOSE_DATE_BUFFER_MS);
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
