import { prisma } from "#/lib/prisma";

export interface QuestionUsage {
  /** Exams whose fixed question list includes it. */
  exams: number;
  /** Submitted attempts that answered or were served it. */
  attempts: number;
  /** Attempts in progress that were served it. */
  sessions: number;
}

const EMPTY: QuestionUsage = { exams: 0, attempts: 0, sessions: 0 };

/**
 * Where each question is used. Questions are referenced from JSON (an exam's
 * `questions` list, an attempt's answers / `__questionSet`, a session's
 * `questionSet`) rather than by foreign key, so a used question can be
 * deleted without the database noticing — this is the check that stops it.
 */
export async function getQuestionUsage(
  questionIds: string[],
): Promise<Map<string, QuestionUsage>> {
  const usage = new Map<string, QuestionUsage>();
  if (questionIds.length === 0) return usage;

  const rows = await prisma.$queryRaw<
    Array<{ id: string; exams: number; attempts: number; sessions: number }>
  >`
    SELECT q.id,
      (SELECT COUNT(*) FROM "Exam" e
        WHERE e.questions @> jsonb_build_array(jsonb_build_object('questionId', q.id)))::int AS exams,
      (SELECT COUNT(*) FROM "ExamAttempt" a
        WHERE jsonb_exists(a.answers, q.id)
           OR COALESCE(a.answers -> '__questionSet', '[]'::jsonb)
                @> jsonb_build_array(jsonb_build_object('questionId', q.id)))::int AS attempts,
      (SELECT COUNT(*) FROM "ExamSession" s
        WHERE s."attemptId" IS NULL
          AND s."questionSet" @> jsonb_build_array(jsonb_build_object('questionId', q.id)))::int AS sessions
    FROM unnest(${questionIds}::text[]) AS q(id)
  `;
  for (const row of rows) {
    usage.set(row.id, {
      exams: row.exams,
      attempts: row.attempts,
      sessions: row.sessions,
    });
  }
  for (const id of questionIds) if (!usage.has(id)) usage.set(id, EMPTY);
  return usage;
}

export const isQuestionUsed = (usage: QuestionUsage) =>
  usage.exams + usage.attempts + usage.sessions > 0;

/** Why a used question can't be deleted, e.g. "Used in 2 exams and 5 attempts". */
export function usageReason(
  usage: QuestionUsage,
  advice = "Archive it instead, so those results keep their question.",
): string {
  const parts: string[] = [];
  if (usage.exams) parts.push(`${usage.exams} exam${usage.exams === 1 ? "" : "s"}`);
  const attempts = usage.attempts + usage.sessions;
  if (attempts) parts.push(`${attempts} attempt${attempts === 1 ? "" : "s"}`);
  return `Used in ${parts.join(" and ")}. ${advice}`;
}
