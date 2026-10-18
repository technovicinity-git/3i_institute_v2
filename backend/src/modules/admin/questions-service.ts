import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/prisma";
import { recordAudit } from "#/shared/audit";
import { NotFoundError, ValidationError } from "#/shared/errors";
import {
  getQuestionUsage,
  isQuestionUsed,
  usageReason,
} from "#/modules/exam/question-usage";

export interface AdminQuestionFilters {
  search?: string;
  courseId?: string;
  instructorId?: string;
  type?: string;
  difficulty?: string;
  /** ACTIVE (default view shows both), ARCHIVED */
  status?: string;
}

export type BulkQuestionAction = "archive" | "restore" | "delete";

const QUESTION_TYPES = ["mcq", "multi_select", "true_false", "short_answer", "essay"];
const DIFFICULTIES = ["easy", "medium", "hard"];

const listSelect = {
  id: true,
  question: true,
  type: true,
  difficulty: true,
  marks: true,
  negativeMarks: true,
  scope: true,
  archivedAt: true,
  createdAt: true,
  course: {
    select: {
      id: true,
      title: true,
      instructor: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} satisfies Prisma.QuestionSelect;

/** The admin Question Bank: every question on the platform, all courses. */
export class AdminQuestionsService {
  async list(page: number, limit: number, filters: AdminQuestionFilters = {}) {
    const search = filters.search?.trim();
    const where: Prisma.QuestionWhereInput = {
      ...(filters.status === "ACTIVE" ? { archivedAt: null } : {}),
      ...(filters.status === "ARCHIVED" ? { archivedAt: { not: null } } : {}),
      ...(filters.courseId ? { courseId: filters.courseId } : {}),
      ...(filters.instructorId
        ? { course: { instructorId: filters.instructorId } }
        : {}),
      ...(filters.type && QUESTION_TYPES.includes(filters.type)
        ? { type: filters.type }
        : {}),
      ...(filters.difficulty && DIFFICULTIES.includes(filters.difficulty)
        ? { difficulty: filters.difficulty }
        : {}),
      ...(search
        ? {
            OR: [
              { question: { contains: search, mode: "insensitive" } },
              { explanation: { contains: search, mode: "insensitive" } },
              { course: { title: { contains: search, mode: "insensitive" } } },
              {
                course: {
                  instructor: {
                    OR: [
                      { firstName: { contains: search, mode: "insensitive" } },
                      { lastName: { contains: search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, archivedCount, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.count({ where: { archivedAt: { not: null } } }),
      prisma.question.findMany({
        where,
        select: listSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const usage = await getQuestionUsage(questions.map((q) => q.id));
    return {
      total,
      archivedCount,
      questions: questions.map((q) => ({
        ...q,
        instructor: q.course.instructor,
        course: { id: q.course.id, title: q.course.title },
        usage: usage.get(q.id)!,
      })),
    };
  }

  /** Courses and instructors that have questions, for the filter menus. */
  async filterOptions() {
    const courses = await prisma.course.findMany({
      where: { questions: { some: {} } },
      select: {
        id: true,
        title: true,
        instructor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { title: "asc" },
    });
    const instructors = new Map<string, { id: string; name: string }>();
    for (const course of courses) {
      const { id, firstName, lastName } = course.instructor;
      instructors.set(id, { id, name: `${firstName} ${lastName}`.trim() });
    }
    return {
      courses: courses.map(({ id, title }) => ({ id, title })),
      instructors: [...instructors.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  }

  /** Full question (answers included) and the exams that use it. */
  async get(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!question) throw new NotFoundError("Question not found");

    const [usage, exams] = await Promise.all([
      getQuestionUsage([questionId]),
      prisma.$queryRaw<Array<{ id: string; title: string; type: string }>>`
        SELECT id, title, type FROM "Exam"
        WHERE questions @> jsonb_build_array(jsonb_build_object('questionId', ${questionId}::text))
        ORDER BY title
      `,
    ]);

    return { ...question, usage: usage.get(questionId)!, exams };
  }

  async archive(questionId: string, actorId: string) {
    return this.setArchived(questionId, actorId, true);
  }

  async restore(questionId: string, actorId: string) {
    return this.setArchived(questionId, actorId, false);
  }

  /** Only questions nothing uses can be deleted; the rest must be archived. */
  async delete(questionId: string, actorId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, question: true, courseId: true },
    });
    if (!question) throw new NotFoundError("Question not found");

    const usage = (await getQuestionUsage([questionId])).get(questionId)!;
    if (isQuestionUsed(usage)) throw new ValidationError(usageReason(usage));

    await prisma.question.delete({ where: { id: questionId } });
    await recordAudit({
      actorId,
      action: "QUESTION_DELETED",
      resource: "question",
      resourceId: questionId,
      details: { question: question.question.slice(0, 200), courseId: question.courseId },
    });
    return { message: "Question deleted" };
  }

  /**
   * Applies one action to many questions. Each is handled on its own, so
   * one that can't be deleted doesn't stop the rest; those come back in
   * `failed` with the reason.
   */
  async bulk(ids: string[], action: BulkQuestionAction, actorId: string) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) throw new ValidationError("Select at least one question");
    if (unique.length > 100) throw new ValidationError("Select at most 100 questions at a time");

    const failed: Array<{ id: string; reason: string }> = [];
    let succeeded = 0;
    for (const id of unique) {
      try {
        if (action === "archive") await this.archive(id, actorId);
        else if (action === "restore") await this.restore(id, actorId);
        else await this.delete(id, actorId);
        succeeded++;
      } catch (error) {
        failed.push({
          id,
          reason: error instanceof Error ? error.message : "Failed",
        });
      }
    }
    return { succeeded, failed };
  }

  private async setArchived(questionId: string, actorId: string, archived: boolean) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, question: true, archivedAt: true },
    });
    if (!question) throw new NotFoundError("Question not found");
    // Already in the requested state: nothing to do (keeps bulk actions simple).
    if (Boolean(question.archivedAt) === archived) {
      return { message: archived ? "Question archived" : "Question restored" };
    }

    await prisma.question.update({
      where: { id: questionId },
      data: { archivedAt: archived ? new Date() : null },
    });
    await recordAudit({
      actorId,
      action: archived ? "QUESTION_ARCHIVED" : "QUESTION_RESTORED",
      resource: "question",
      resourceId: questionId,
      details: { question: question.question.slice(0, 200) },
    });
    return { message: archived ? "Question archived" : "Question restored" };
  }
}

export const adminQuestionsService = new AdminQuestionsService();
