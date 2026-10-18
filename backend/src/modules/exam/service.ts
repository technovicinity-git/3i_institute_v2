import type { Exam, ExamSession } from "#/generated/prisma/client";
import { prisma } from "#/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateQuestionInput,
  CreateExamInput,
  SubmitExamInput,
} from "#/modules/exam/schema";
import { notificationEvents } from "#/modules/notification/events";
import {
  getQuestionUsage,
  isQuestionUsed,
  usageReason,
} from "#/modules/exam/question-usage";
import { canManageCourse, isAdmin } from "#/shared/course-access";

// Scores can be fractional because of negative marking (e.g. -0.25).
// Rounding to 2 dp keeps float noise (2.9000000000000004) out of the DB.
const roundScore = (score: number) => Math.round(score * 100) / 100;

// Extra time after the deadline for the final submit to arrive: slow
// networks, or the client's auto-submit firing right at 0:00.
const SUBMIT_GRACE_MS = 2 * 60 * 1000;

// Exam details the learner screens need. No questions or answers.
function learnerExamInfo(exam: Exam) {
  return {
    id: exam.id,
    title: exam.title,
    type: exam.type,
    duration: exam.duration,
    passMark: exam.passMark,
    totalMarks: exam.totalMarks,
    maxAttempts: exam.maxAttempts,
    // Scheduled start time for ONLINE_CLASS exams (null for REGULAR).
    openDate: exam.openDate,
    closeDate: exam.closeDate,
  };
}

type QuestionSelection = { questionId: string; marks?: number };

// Negative marks apply only to answered-but-wrong questions: skipping a
// question is how a learner avoids the penalty, so a blank costs nothing.
function isAnswered(answer: unknown): boolean {
  if (answer === undefined || answer === null) return false;
  if (typeof answer === "string") return answer.trim() !== "";
  if (Array.isArray(answer)) return answer.length > 0;
  return true;
}

// Whether an auto-graded answer is right. Same rules as the scoring in
// submitExam: exact match, or for multi_select the same options in any order.
function isCorrectAnswer(
  type: string,
  correctAnswer: unknown,
  answer: unknown,
): boolean {
  if (type === "multi_select") {
    const correct = (correctAnswer as string[] | null) ?? [];
    const given = Array.isArray(answer) ? answer : [answer];
    return (
      correct.length === given.length && correct.every((c) => given.includes(c))
    );
  }
  return answer === correctAnswer;
}

type QuestionStatus =
  | "correct"
  | "partial"
  | "incorrect"
  | "unanswered"
  | "pending";

function assertNegativeMarksWithinMarks(
  negativeMarks: number | undefined,
  marks: number | undefined,
): void {
  if (
    negativeMarks !== undefined &&
    marks !== undefined &&
    negativeMarks > marks
  ) {
    throw new ValidationError(
      `Negative marks (${negativeMarks}) can't be more than the question's marks (${marks})`,
    );
  }
}

export class ExamService {
  // ──────────────────────────────────
  // Question Bank
  // ──────────────────────────────────

  async createQuestion(ownerId: string, input: CreateQuestionInput) {
    assertNegativeMarksWithinMarks(input.negativeMarks, input.marks);

    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (!(await canManageCourse(ownerId, course.instructorId))) {
      throw new ForbiddenError(
        "You can only add questions to your own courses",
      );
    }

    const question = await prisma.question.create({
      data: {
        scope: "INSTRUCTOR",
        ownerId,
        courseId: input.courseId,
        type: input.type,
        question: input.question,
        options: input.options
          ? JSON.parse(JSON.stringify(input.options))
          : undefined,
        correctAnswer: input.correctAnswer
          ? JSON.parse(JSON.stringify(input.correctAnswer))
          : undefined,
        suggestedAnswer: input.suggestedAnswer ?? null,
        marks: input.marks,
        negativeMarks: input.negativeMarks,
        partialCredit: input.partialCredit,
        difficulty: input.difficulty,
        explanation: input.explanation ?? null,
      },
    });

    return question;
  }

  async getMyQuestions(ownerId: string, courseId?: string) {
    // No course given: return questions across all of the instructor's courses
    if (!courseId) {
      return prisma.question.findMany({
        where: {
          scope: "INSTRUCTOR",
          course: { instructorId: ownerId },
          archivedAt: null,
        },
        include: { course: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (!(await canManageCourse(ownerId, course.instructorId))) {
      throw new ForbiddenError(
        "You can only view questions for your own courses",
      );
    }

    return prisma.question.findMany({
      where: {
        scope: "INSTRUCTOR",
        courseId,
        archivedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAdminQuestions() {
    return prisma.question.findMany({
      where: { scope: "ADMIN", archivedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async getQuestionById(questionId: string, userId: string, userRole: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (userRole === "INSTRUCTOR") {
      if (!(await canManageCourse(userId, question.course.instructorId))) {
        throw new NotFoundError("Question not found");
      }
    }

    return question;
  }

  async updateQuestion(
    questionId: string,
    ownerId: string,
    input: Partial<CreateQuestionInput>,
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (!(await canManageCourse(ownerId, question.course.instructorId))) {
      throw new NotFoundError("Question not found");
    }

    assertNegativeMarksWithinMarks(
      input.negativeMarks ?? question.negativeMarks,
      input.marks ?? question.marks,
    );

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...input,
        options: input.options
          ? JSON.parse(JSON.stringify(input.options))
          : undefined,
        correctAnswer: input.correctAnswer
          ? JSON.parse(JSON.stringify(input.correctAnswer))
          : undefined,
      },
    });

    return updated;
  }

  async deleteQuestion(questionId: string, ownerId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (!(await canManageCourse(ownerId, question.course.instructorId))) {
      throw new NotFoundError("Question not found");
    }

    // Exams and results reference questions from JSON, so deleting a used
    // one would leave them pointing at nothing.
    const usage = (await getQuestionUsage([questionId])).get(questionId)!;
    if (isQuestionUsed(usage)) {
      throw new ValidationError(
        usageReason(usage, "Ask an admin to archive it instead."),
      );
    }

    await prisma.question.delete({
      where: { id: questionId },
    });
  }

  // ──────────────────────────────────
  // Exams
  // ──────────────────────────────────

  async createExam(instructorId: string, input: CreateExamInput) {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (!(await canManageCourse(instructorId, course.instructorId))) {
      throw new ForbiddenError(
        "You can only create exams for your own courses",
      );
    }

    if (course.type === "ONLINE_CLASS") {
      if (!input.openDate) {
        throw new ValidationError("Exam start time is required for online class exams");
      }
      const startTime = new Date(input.openDate);
      if (Number.isNaN(startTime.getTime()) || startTime.getTime() <= Date.now()) {
        throw new ValidationError("Exam start time must be in the future");
      }
    }

    // REGULAR course exams may use a dynamic question bank (no fixed list):
    // per attempt, questions are randomly selected from the course up to the
    // instructor-defined total marks. ONLINE_CLASS exams still require an
    // explicit question list.
    const isDynamic = input.questions.length === 0;

    if (isDynamic && course.type !== "REGULAR") {
      throw new ValidationError(
        "Online class exams require selecting at least one question",
      );
    }

    // Verify all questions belong to this course
    if (!isDynamic) {
      const questionIds = input.questions.map((q) => q.questionId);
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          courseId: input.courseId,
          archivedAt: null,
        },
        select: { id: true },
      });

      if (questions.length !== questionIds.length) {
        throw new ValidationError(
          "All questions must belong to this course and not be archived",
        );
      }
    }

    // Check if final exam already exists
    if (input.type === "final") {
      const existingFinal = await prisma.exam.findFirst({
        where: { courseId: input.courseId, type: "final" },
      });

      if (existingFinal) {
        throw new ValidationError("Course already has a final exam");
      }
    }

    const exam = await prisma.exam.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        type: input.type,
        duration: input.duration,
        passMark: input.passMark,
        totalMarks: input.totalMarks,
        maxAttempts:
          course.type === "ONLINE_CLASS" && input.type === "final"
            ? 1
            : input.maxAttempts,
        cooldownHours: input.cooldownHours,
        openDate: input.openDate ? new Date(input.openDate) : null,
        closeDate: input.closeDate ? new Date(input.closeDate) : null,
        randomizeQuestions: input.randomizeQuestions,
        randomizeOptions: input.randomizeOptions,
        revealAnswers: input.revealAnswers,
        questions: JSON.parse(JSON.stringify(input.questions)),
      },
    });

    notificationEvents.examPublished(exam.id);

    return exam;
  }

  async updateExam(instructorId: string, examId: string, input: CreateExamInput) {
    const existingExam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { course: true },
    });

    if (!existingExam) {
      throw new NotFoundError("Exam not found");
    }
    if (!(await canManageCourse(instructorId, existingExam.course.instructorId))) {
      throw new ForbiddenError("You can only update your own course exams");
    }
    if (input.courseId !== existingExam.courseId) {
      throw new ValidationError("An exam cannot be moved to another course");
    }

    const isDynamic = input.questions.length === 0;
    if (isDynamic && existingExam.course.type !== "REGULAR") {
      throw new ValidationError(
        "Online class exams require selecting at least one question",
      );
    }
    if (existingExam.course.type === "ONLINE_CLASS" && !input.openDate) {
      throw new ValidationError("Exam start time is required for online class exams");
    }

    if (!isDynamic) {
      const questionIds = input.questions.map((question) => question.questionId);
      if (new Set(questionIds).size !== questionIds.length) {
        throw new ValidationError("A question can only be added once to an exam");
      }
      // An archived question the exam already had may stay; new ones can't
      // be archived.
      const alreadyInExam = (
        existingExam.questions as Array<{ questionId: string }>
      ).map((q) => q.questionId);
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          courseId: existingExam.courseId,
          OR: [{ archivedAt: null }, { id: { in: alreadyInExam } }],
        },
        select: { id: true },
      });
      if (questions.length !== questionIds.length) {
        throw new ValidationError(
          "All questions must belong to this course and not be archived",
        );
      }
    }

    if (input.type === "final") {
      const existingFinal = await prisma.exam.findFirst({
        where: {
          courseId: existingExam.courseId,
          type: "final",
          id: { not: examId },
        },
      });
      if (existingFinal) {
        throw new ValidationError("Course already has a final exam");
      }
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: input.title,
        type: input.type,
        duration: input.duration,
        passMark: input.passMark,
        totalMarks: input.totalMarks,
        maxAttempts: input.maxAttempts,
        cooldownHours: input.cooldownHours,
        openDate: input.openDate ? new Date(input.openDate) : null,
        closeDate: input.closeDate ? new Date(input.closeDate) : null,
        randomizeQuestions: input.randomizeQuestions,
        randomizeOptions: input.randomizeOptions,
        revealAnswers: input.revealAnswers,
        questions: JSON.parse(JSON.stringify(input.questions)),
      },
    });

    notificationEvents.examUpdated(examId, existingExam.openDate);

    return updatedExam;
  }

  async getCourseExams(courseId: string, learnerProfileId?: string) {
    const exams = await prisma.exam.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });

    if (!learnerProfileId) {
      return exams;
    }

    // Get learner's attempts for these exams
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: { in: exams.map((e) => e.id) },
        learnerProfileId,
      },
      orderBy: { score: "desc" },
    });

    // Started but never submitted, and now past the deadline: these use up
    // an attempt too (see startExam).
    const abandoned = await prisma.examSession.findMany({
      where: {
        examId: { in: exams.map((e) => e.id) },
        learnerProfileId,
        attemptId: null,
        deadline: { lt: new Date(Date.now() - SUBMIT_GRACE_MS) },
      },
      select: { examId: true },
    });

    const examsWithAttempts = exams.map((exam) => {
      const examAttempts = attempts.filter((a) => a.examId === exam.id);
      const abandonedCount = abandoned.filter(
        (session) => session.examId === exam.id,
      ).length;
      const bestAttempt = examAttempts[0] ?? null;
      const isDynamic =
        (exam.questions as Array<{ questionId: string }>).length === 0;

      return {
        ...exam,
        attemptCount: examAttempts.length + abandonedCount,
        // REGULAR dynamic exams have no attempt limit.
        maxAttempts: isDynamic ? null : exam.maxAttempts,
        lastAttemptAt:
          examAttempts.length > 0
            ? examAttempts[examAttempts.length - 1]!.createdAt
            : null,
        bestScore: bestAttempt?.score ?? null,
        passed: bestAttempt?.passed ?? null,
      };
    });

    return examsWithAttempts;
  }

  async getExamById(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    return exam;
  }

  /**
   * Convert a percentage pass mark into the absolute score a learner must
   * reach. `passMark` is stored as a percentage (e.g. 50 = 50% of the total
   * marks), so the threshold is rounded up to the nearest whole mark.
   */
  private getPassThreshold(totalMarks: number, passMark: number): number {
    return Math.ceil((totalMarks * passMark) / 100);
  }

  /**
   * Randomly pick questions from a course's question bank so their combined
   * marks reach (but never exceed) the instructor-defined `targetMarks`.
   * REGULAR course exams use this to build a fresh question set for every
   * learner attempt.
   */
  private async buildRandomQuestionSet(
    courseId: string,
    targetMarks: number,
  ): Promise<Array<{ questionId: string; marks: number }>> {
    const bank = await prisma.question.findMany({
      where: { courseId, archivedAt: null },
      select: { id: true, marks: true },
    });

    if (bank.length === 0 || targetMarks <= 0) {
      return [];
    }

    // Fisher–Yates shuffle so every attempt sees a different order.
    const shuffled = [...bank];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    const selected: Array<{ questionId: string; marks: number }> = [];
    let total = 0;

    for (const question of shuffled) {
      const marks = question.marks ?? 1;
      if (marks <= 0) continue;
      if (total + marks > targetMarks) continue;
      selected.push({ questionId: question.id, marks });
      total += marks;
      if (total === targetMarks) break;
    }

    return selected;
  }

  /**
   * Starts the learner's attempt, or resumes the one already running.
   * Timing uses the server clock only: the opening rules are checked here,
   * and the deadline fixed here is enforced by submitExam. Calling it again
   * mid-attempt (reload, second device) returns the same questions and
   * deadline, so the timer can't be restarted or the questions redrawn.
   */
  async startExam(accountId: string, examId: string, learnerProfileId: string) {
    const [exam, profile] = await Promise.all([
      prisma.exam.findUnique({ where: { id: examId } }),
      prisma.learnerProfile.findFirst({
        where: { id: learnerProfileId, accountId, deletedAt: null },
        select: { id: true },
      }),
    ]);
    if (!exam) throw new NotFoundError("Exam not found");
    if (!profile) throw new NotFoundError("Learner profile not found");

    // Exams stay open after the subscription ends (a learner shouldn't miss
    // one while a manual renewal is reviewed), but only for enrolled courses.
    const enrolled = await prisma.enrolment.findFirst({
      where: { learnerProfileId, courseId: exam.courseId, waitlisted: false },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenError("You are not enrolled in this course");
    }

    const lockKey = `exam-start:${examId}:${learnerProfileId}`;
    const session = await prisma.$transaction(async (tx) => {
      // One start at a time per learner + exam. Without this, two quick
      // calls could both create a session, and the unused one would later
      // count as an abandoned attempt.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const now = new Date();
      const sessions = await tx.examSession.findMany({
        where: { examId, learnerProfileId },
        orderBy: { startedAt: "desc" },
      });

      const running = sessions.find(
        (s) =>
          !s.attemptId &&
          s.deadline.getTime() + SUBMIT_GRACE_MS > now.getTime(),
      );
      if (running) return running;

      if (exam.openDate && now < exam.openDate) {
        throw new ValidationError("Exam has not opened yet");
      }
      if (exam.closeDate && now >= exam.closeDate) {
        throw new ValidationError("Exam has closed");
      }
      // ONLINE_CLASS exams are scheduled (openDate). They can be STARTED
      // from the start time until 50% of the duration has passed; once
      // started, the learner gets the full deadline below.
      if (exam.openDate) {
        const startWindowEnd = new Date(
          exam.openDate.getTime() + exam.duration * 0.5 * 60 * 1000,
        );
        if (now > startWindowEnd) {
          throw new ValidationError(
            "The exam start window has closed. Exams can only be started within 50% of the exam duration after the scheduled start time.",
          );
        }
      }

      // REGULAR course exams use a dynamic question bank: no fixed question
      // list is stored on the exam, no attempt limit and no cooldown.
      const examQuestions = exam.questions as QuestionSelection[];
      const isDynamic = examQuestions.length === 0;

      if (!isDynamic) {
        const attempts = await tx.examAttempt.findMany({
          where: { examId, learnerProfileId },
          select: { submittedAt: true, createdAt: true },
        });
        // Every unsubmitted session left here is past its deadline. It
        // still counts as an attempt; otherwise a learner could read the
        // questions, abandon, and start again with a fresh timer.
        const abandoned = sessions.filter((s) => !s.attemptId);

        if (attempts.length + abandoned.length >= exam.maxAttempts) {
          throw new ValidationError("Maximum attempts reached");
        }

        if (exam.cooldownHours > 0) {
          const lastEnded = Math.max(
            0,
            ...attempts.map((a) => (a.submittedAt ?? a.createdAt).getTime()),
            ...abandoned.map((s) => s.deadline.getTime()),
          );
          const cooldownEnd = lastEnded + exam.cooldownHours * 60 * 60 * 1000;
          if (lastEnded > 0 && now.getTime() < cooldownEnd) {
            throw new ValidationError(
              `Please wait ${Math.ceil((cooldownEnd - now.getTime()) / 3600000)} hours before retrying`,
            );
          }
        }
      }

      const questionSet: QuestionSelection[] = isDynamic
        ? await this.buildRandomQuestionSet(exam.courseId, exam.totalMarks)
        : examQuestions.map((q) => ({
            questionId: q.questionId,
            marks: q.marks,
          }));
      if (questionSet.length === 0) {
        throw new ValidationError("This exam has no questions yet");
      }

      const durationEnd = new Date(now.getTime() + exam.duration * 60 * 1000);
      const deadline =
        exam.closeDate && exam.closeDate < durationEnd
          ? exam.closeDate
          : durationEnd;

      return tx.examSession.create({
        data: {
          examId,
          learnerProfileId,
          questionSet: JSON.parse(JSON.stringify(questionSet)),
          startedAt: now,
          deadline,
        },
      });
    });

    return this.sessionResponse(exam, session);
  }

  // The running attempt as the learner's take screen needs it.
  private async sessionResponse(exam: Exam, session: ExamSession) {
    const selection = session.questionSet as QuestionSelection[];
    const questions = await prisma.question.findMany({
      where: { id: { in: selection.map((q) => q.questionId) } },
      // No correctAnswer: it must never reach the learner.
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        marks: true,
        difficulty: true,
      },
    });
    const byId = new Map(questions.map((q) => [q.id, q]));

    return {
      sessionId: session.id,
      startedAt: session.startedAt,
      deadline: session.deadline,
      // Lets the client correct for a wrong device clock when counting down.
      serverNow: new Date(),
      exam: learnerExamInfo(exam),
      // In the order served (shuffled for REGULAR exams).
      questions: selection.flatMap((sel) => {
        const question = byId.get(sel.questionId);
        return question
          ? [{ ...question, marks: sel.marks ?? question.marks }]
          : [];
      }),
    };
  }

  async submitExam(accountId: string, input: SubmitExamInput) {
    const session = await prisma.examSession.findUnique({
      where: { id: input.sessionId },
      include: {
        exam: true,
        learnerProfile: { select: { accountId: true, deletedAt: true } },
      },
    });

    if (
      !session ||
      session.learnerProfile.accountId !== accountId ||
      session.learnerProfile.deletedAt
    ) {
      throw new NotFoundError("Exam attempt not found");
    }
    if (session.attemptId) {
      throw new ConflictError("This attempt has already been submitted");
    }

    // The deadline was fixed by the server at start, so the learner's device
    // clock plays no part. A late attempt isn't saved, and still counts as
    // an attempt (see startExam).
    const now = new Date();
    if (now.getTime() > session.deadline.getTime() + SUBMIT_GRACE_MS) {
      throw new ValidationError(
        "Time is up. This attempt can no longer be submitted.",
      );
    }

    const exam = session.exam;
    const isDynamic = (exam.questions as QuestionSelection[]).length === 0;

    // Grade exactly the questions served at start, whatever the client sends.
    const selectedQuestions = session.questionSet as QuestionSelection[];
    const attemptTotalMarks = isDynamic
      ? selectedQuestions.reduce((sum, q) => sum + (q.marks ?? 1), 0)
      : exam.totalMarks;

    // Keep only answers to served questions. This also stops a learner from
    // planting reserved keys such as "__questionSet" in their answers.
    const servedIds = new Set(selectedQuestions.map((q) => q.questionId));
    const answers = Object.fromEntries(
      Object.entries(input.answers).filter(([id]) => servedIds.has(id)),
    );

    // Calculate score for auto-graded questions. Keep these rules in step
    // with the re-scoring loop in gradeWrittenAnswers.
    //   mcq / true_false: exact match
    //   multi_select: all-or-nothing (same options, any order); no partial marks
    let score = 0;
    let needsManualGrading = false;

    for (const eq of selectedQuestions) {
      const question = await prisma.question.findUnique({
        where: { id: eq.questionId },
      });

      if (!question) continue;

      const userAnswer = answers[eq.questionId];
      const marks = eq.marks ?? question.marks;

      if (question.type === "mcq" || question.type === "true_false") {
        const correct = question.correctAnswer as string;
        if (userAnswer === correct) {
          score += marks;
        } else if (question.negativeMarks > 0 && isAnswered(userAnswer)) {
          score -= question.negativeMarks;
        }
      } else if (question.type === "multi_select") {
        const correct = question.correctAnswer as string[];
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];
        const isCorrect =
          correct.length === userAnswers.length &&
          correct.every((c) => userAnswers.includes(c));
        if (isCorrect) {
          score += marks;
        } else if (question.negativeMarks > 0 && isAnswered(userAnswer)) {
          score -= question.negativeMarks;
        }
      } else {
        // Short answer and essay — manual grading required
        needsManualGrading = true;
      }
    }

    // With any written question, score/passed stay null until an instructor
    // grades it (gradeWrittenAnswers then computes the final score).
    score = roundScore(score);
    const passed = !needsManualGrading
      ? score >= this.getPassThreshold(attemptTotalMarks, exam.passMark)
      : null;

    // Persist the question set used for this attempt so grading and result
    // views can reconstruct exactly what the learner saw (important for
    // dynamic REGULAR exams where each attempt is a random sample). Fixed
    // exams keep using the exam-level question list.
    const storedAnswers: Record<string, unknown> = { ...answers };
    if (isDynamic) {
      storedAnswers["__questionSet"] = selectedQuestions;
    }

    let attempt;
    try {
      attempt = await prisma.$transaction(async (tx) => {
        const attemptNumber =
          (await tx.examAttempt.count({
            where: {
              examId: exam.id,
              learnerProfileId: session.learnerProfileId,
            },
          })) + 1;

        const created = await tx.examAttempt.create({
          data: {
            examId: exam.id,
            learnerProfileId: session.learnerProfileId,
            attemptNumber,
            answers: JSON.parse(JSON.stringify(storedAnswers)),
            score: needsManualGrading ? null : score,
            totalMarks: attemptTotalMarks,
            passed,
            graded: !needsManualGrading,
            startedAt: session.startedAt,
            submittedAt: now,
          },
        });

        // Guards against a double submit: only the first one links.
        const linked = await tx.examSession.updateMany({
          where: { id: session.id, attemptId: null },
          data: { attemptId: created.id },
        });
        if (linked.count === 0) {
          throw new ConflictError("This attempt has already been submitted");
        }
        return created;
      });
    } catch (error) {
      // Two submits at once can collide on attemptNumber.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictError("This attempt has already been submitted");
      }
      throw error;
    }

    notificationEvents.examSubmitted(attempt.id);

    return attempt;
  }

  async gradeWrittenAnswer(
    instructorId: string,
    attemptId: string,
    questionId: string,
    marksAwarded: number,
  ) {
    return this.gradeWrittenAnswers(instructorId, attemptId, [
      { questionId, marksAwarded },
    ]);
  }

  async gradeWrittenAnswers(
    instructorId: string,
    attemptId: string,
    grades: Array<{ questionId: string; marksAwarded: number }>,
  ) {
    if (grades.length === 0) {
      throw new ValidationError("At least one answer grade is required");
    }
    if (new Set(grades.map((grade) => grade.questionId)).size !== grades.length) {
      throw new ValidationError("Each question can only be graded once per submission");
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { course: true } },
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    if (!(await canManageCourse(instructorId, attempt.exam.course.instructorId))) {
      throw new ForbiddenError("You can only grade your own course exams");
    }

    const answers = attempt.answers as Record<string, unknown>;

    // Questions attached to this attempt's exam. For REGULAR dynamic exams
    // (no fixed list on the exam) the exact set the learner saw is persisted
    // on the attempt itself under the reserved `__questionSet` key.
    const storedQuestionSet = answers["__questionSet"] as
      | Array<{ questionId: string; marks: number }>
      | undefined;
    const examQuestions =
      storedQuestionSet && storedQuestionSet.length > 0
        ? storedQuestionSet
        : (attempt.exam.questions as Array<{
            questionId: string;
            marks?: number;
          }>);

    const questions = await prisma.question.findMany({
      where: { id: { in: examQuestions.map((q) => q.questionId) } },
      select: {
        id: true,
        type: true,
        correctAnswer: true,
        marks: true,
        negativeMarks: true,
      },
    });

    // Only written (short answer / essay) questions can be graded manually
    for (const { questionId, marksAwarded } of grades) {
      if (!Number.isFinite(marksAwarded) || marksAwarded < 0) {
        throw new ValidationError("Marks awarded must be a non-negative number");
      }
      const targetQuestion = questions.find((q) => q.id === questionId);
      if (
        !targetQuestion ||
        (targetQuestion.type !== "short_answer" && targetQuestion.type !== "essay")
      ) {
        throw new ValidationError(
          "Only short answer and essay questions can be manually graded",
        );
      }
      const examQuestion = examQuestions.find((q) => q.questionId === questionId);
      const maxMarks = examQuestion?.marks ?? targetQuestion.marks;
      if (marksAwarded > maxMarks) {
        throw new ValidationError(`Marks awarded cannot exceed ${maxMarks}`);
      }
      answers[`${questionId}_marks`] = marksAwarded;
    }

    // Recompute the attempt score every time a written question is graded:
    //   - Auto-graded questions (mcq, true_false, multi_select) use the answer
    //     the learner submitted on the attempt.
    //   - Written questions (short_answer, essay) use the marks the instructor
    //     already awarded (stored as "<questionId>_marks").
    // The attempt is only marked as fully graded once ALL written questions
    // have been given marks. Until then score/passed/graded stay pending.
    let score = 0;
    let manualPending = false;

    for (const eq of examQuestions) {
      const question = questions.find((q) => q.id === eq.questionId);
      if (!question) continue;

      const marks = eq.marks ?? question.marks;
      const userAnswer = answers[eq.questionId];

      if (question.type === "mcq" || question.type === "true_false") {
        const correct = question.correctAnswer as string;
        if (userAnswer === correct) {
          score += marks;
        } else if (question.negativeMarks > 0 && isAnswered(userAnswer)) {
          score -= question.negativeMarks;
        }
      } else if (question.type === "multi_select") {
        const correct = question.correctAnswer as string[];
        const userAnswers = (
          Array.isArray(userAnswer) ? userAnswer : [userAnswer]
        ) as unknown[];
        const isCorrect =
          correct.length === userAnswers.length &&
          correct.every((c) => userAnswers.includes(c));
        if (isCorrect) {
          score += marks;
        } else if (question.negativeMarks > 0 && isAnswered(userAnswer)) {
          score -= question.negativeMarks;
        }
      } else {
        // short_answer / essay — graded manually by the instructor
        const awarded = answers[`${eq.questionId}_marks`];
        if (typeof awarded === "number" && awarded >= 0) {
          score += awarded;
        } else {
          manualPending = true;
        }
      }
    }

    score = roundScore(score);
    const allGraded = !manualPending;
    const passThreshold = this.getPassThreshold(
      attempt.totalMarks,
      attempt.exam.passMark,
    );

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        // Once every written question has been graded, finalize the attempt:
        // store the total score and the pass/fail status.
        ...(allGraded
          ? {
              score,
              passed: score >= passThreshold,
              graded: true,
              gradedBy: instructorId,
            }
          : {}),
      },
    });

    if (allGraded) notificationEvents.examGraded(attemptId);

    return {
      message: allGraded ? "Attempt fully graded" : "Answer graded",
      graded: allGraded,
      ...(allGraded ? { score, passed: score >= passThreshold } : {}),
    };
  }

  /**
   * Submitted attempts still waiting for manual grading, oldest first.
   * Instructors only see their own courses; admins see every course.
   */
  async getPendingAttempts(
    userId: string,
    filters: { courseId?: string; examId?: string } = {},
  ) {
    const admin = await isAdmin(userId);

    const attempts = await prisma.examAttempt.findMany({
      where: {
        graded: false,
        submittedAt: { not: null },
        ...(filters.examId ? { examId: filters.examId } : {}),
        exam: {
          ...(filters.courseId ? { courseId: filters.courseId } : {}),
          ...(admin ? {} : { course: { instructorId: userId } }),
        },
      },
      select: {
        id: true,
        examId: true,
        attemptNumber: true,
        submittedAt: true,
        exam: {
          select: {
            title: true,
            courseId: true,
            course: { select: { title: true } },
          },
        },
        learnerProfile: { select: { displayName: true } },
      },
      orderBy: { submittedAt: "asc" },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      courseId: attempt.exam.courseId,
      courseTitle: attempt.exam.course.title,
      learnerName: attempt.learnerProfile?.displayName ?? "Unknown",
      attemptNumber: attempt.attemptNumber,
      submittedAt: attempt.submittedAt,
    }));
  }

  async getExamAttempts(examId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      learnerProfileId: attempt.learnerProfileId,
      learnerName: attempt.learnerProfile?.displayName ?? "Unknown",
      attemptNumber: attempt.attemptNumber,
      answers: attempt.answers,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      passed: attempt.passed,
      graded: attempt.graded,
      gradedBy: attempt.gradedBy,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    }));
  }

  async getAttemptDetails(attemptId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        exam: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    // Fetch the questions belonging to this attempt so grading pages get the
    // exact questions the learner had to answer (not the whole bank). REGULAR
    // dynamic exams store the per-attempt set under `__questionSet`.
    const storedQuestionSet = (attempt.answers as Record<string, unknown>)[
      "__questionSet"
    ] as
      | Array<{ questionId: string; marks: number }>
      | undefined;
    const examQuestions =
      storedQuestionSet && storedQuestionSet.length > 0
        ? storedQuestionSet
        : (attempt.exam.questions as Array<{
            questionId: string;
            marks?: number;
          }>);

    const questions = await prisma.question.findMany({
      where: {
        id: { in: examQuestions.map((q) => q.questionId) },
      },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true,
        suggestedAnswer: true,
        marks: true,
        explanation: true,
      },
    });

    // Attach per-question marks defined on the exam
    const questionList = examQuestions
      .map((examQuestion) => {
        const question = questions.find(
          (q) => q.id === examQuestion.questionId,
        );

        if (!question) return null;

        return {
          ...question,
          marks: examQuestion.marks ?? question.marks,
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null);

    return {
      id: attempt.id,
      examId: attempt.examId,
      learnerProfileId: attempt.learnerProfileId,
      learnerName: attempt.learnerProfile?.displayName ?? "Unknown",
      attemptNumber: attempt.attemptNumber,
      answers: attempt.answers,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      passed: attempt.passed,
      graded: attempt.graded,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      questions: questionList,
    };
  }

  /**
   * What the intro screen shows before the learner starts. No question
   * content: questions are only sent by startExam, once the timer is
   * running on the server.
   */
  async getExamIntro(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    // REGULAR course exams (dynamic) have an empty list and draw a random
    // set at start; a sample draw gives the expected count.
    const examQuestions = exam.questions as QuestionSelection[];
    const questionCount =
      examQuestions.length > 0
        ? examQuestions.length
        : (await this.buildRandomQuestionSet(exam.courseId, exam.totalMarks))
            .length;

    return { exam: learnerExamInfo(exam), questionCount };
  }

  async getMyAttempts(examId: string, learnerProfileId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        learnerProfileId,
      },
      orderBy: { attemptNumber: "desc" },
    });

    return attempts;
  }

  async getExamResult(examId: string, learnerProfileId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        passMark: true,
        totalMarks: true,
        type: true,
        duration: true,
        openDate: true,
        questions: true,
      },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        learnerProfileId,
      },
      orderBy: { attemptNumber: "asc" },
    });

    // Best graded attempt (highest score), reported as a summary. Attempts
    // with written answers have score = null until graded, so fall back to
    // the most recent one.
    const gradedAttempts = attempts
      .filter((a) => a.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const bestAttempt =
      gradedAttempts[0] ?? attempts[attempts.length - 1] ?? null;

    // The answer sheet is always the most recent attempt: right after
    // submitting, the learner wants to review the answers they just gave,
    // even if an earlier attempt scored higher.
    const latestAttempt = attempts[attempts.length - 1] ?? null;

    // Exam questions are stored as JSON on the Exam model. REGULAR dynamic
    // exams keep the per-attempt random set inside the attempt itself.
    const baseExamQuestions = exam.questions as Array<{
      questionId: string;
      marks?: number;
    }>;
    const storedQuestionSet = latestAttempt
      ? ((latestAttempt.answers as Record<string, unknown>)["__questionSet"] as
          | Array<{ questionId: string; marks: number }>
          | undefined)
      : undefined;
    const examQuestions =
      storedQuestionSet && storedQuestionSet.length > 0
        ? storedQuestionSet
        : baseExamQuestions;

    // Get the actual question records
    const questionIds = examQuestions.map((q) => q.questionId);

    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true,
        suggestedAnswer: true,
        marks: true,
        negativeMarks: true,
        explanation: true,
      },
    });

    // Convert learner answers into an easy lookup object
    const answers = latestAttempt?.answers as Record<string, unknown> | null;

    const attemptSummary = (a: (typeof attempts)[number]) => ({
      id: a.id,
      examId: a.examId,
      examTitle: exam.title,
      learnerProfileId: a.learnerProfileId,
      attemptNumber: a.attemptNumber,
      score: a.score,
      totalMarks: a.totalMarks,
      passed: a.passed,
      graded: a.graded,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    });

    // Build question-by-question result
    const questionResults = examQuestions
      .map((examQuestion) => {
        const question = questions.find(
          (q) => q.id === examQuestion.questionId,
        );

        if (!question) {
          return null;
        }

        const myAnswer = answers?.[question.id] ?? null;

        const marks = examQuestion.marks ?? question.marks;

        // Marks awarded for manually graded questions
        const marksAwarded = answers?.[`${question.id}_marks`] ?? null;
        const awarded = typeof marksAwarded === "number" ? marksAwarded : null;

        // Worked out here, not in the apps, so web and mobile agree with the
        // score (e.g. multi_select options picked in a different order).
        let status: QuestionStatus;
        let marksEarned: number | null;
        if (!isAnswered(myAnswer)) {
          status = "unanswered";
          marksEarned = awarded ?? 0;
        } else if (question.type === "short_answer" || question.type === "essay") {
          status =
            awarded === null
              ? "pending"
              : awarded >= marks
                ? "correct"
                : awarded > 0
                  ? "partial"
                  : "incorrect";
          marksEarned = awarded;
        } else if (isCorrectAnswer(question.type, question.correctAnswer, myAnswer)) {
          status = "correct";
          marksEarned = marks;
        } else {
          status = "incorrect";
          // Negative marking only hits answered-but-wrong questions.
          marksEarned = -question.negativeMarks;
        }

        return {
          questionId: question.id,
          question: question.question,
          type: question.type,
          options: question.options,

          // Correct answer
          correctAnswer: question.correctAnswer,

          // Learner's answer
          myAnswer,

          // Useful for written/manual questions
          suggestedAnswer: question.suggestedAnswer,

          marks,
          marksAwarded,
          status,
          // Negative when a wrong answer was penalised; null until graded.
          marksEarned,
          attemptNumber: latestAttempt?.attemptNumber ?? null,

          explanation: question.explanation,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // At-a-glance counts for the latest attempt (the one questionResults
    // shows). answered = correct + partial + incorrect + pending.
    const count = (status: QuestionStatus) =>
      questionResults.filter((q) => q.status === status).length;
    const summary = latestAttempt
      ? {
          totalQuestions: questionResults.length,
          answered: questionResults.length - count("unanswered"),
          unanswered: count("unanswered"),
          correct: count("correct"),
          partial: count("partial"),
          incorrect: count("incorrect"),
          pendingGrading: count("pending"),
          marksDeducted: roundScore(
            questionResults.reduce(
              (sum, q) =>
                q.marksEarned !== null && q.marksEarned < 0
                  ? sum - q.marksEarned
                  : sum,
              0,
            ),
          ),
        }
      : null;

    return {
      exam: {
        id: exam.id,
        title: exam.title,
        passMark: exam.passMark,
        totalMarks: exam.totalMarks,
        type: exam.type,
        duration: exam.duration,
        openDate: exam.openDate,
      },

      attempts: attempts.map(attemptSummary),
      bestAttempt: bestAttempt ? attemptSummary(bestAttempt) : null,
      // questionResults below belong to this attempt.
      latestAttempt: latestAttempt ? attemptSummary(latestAttempt) : null,
      summary,

      questionResults,
    };
  }
}

export const examService = new ExamService();
