import { prisma } from "#/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateQuestionInput,
  CreateExamInput,
  SubmitExamInput,
} from "#/modules/exam/schema";

export class ExamService {
  // ──────────────────────────────────
  // Question Bank
  // ──────────────────────────────────

  async createQuestion(ownerId: string, input: CreateQuestionInput) {
    const question = await prisma.question.create({
      data: {
        scope: "INSTRUCTOR",
        ownerId,
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
        courseId: input.courseId ?? null,
      },
    });

    return question;
  }

  async getMyQuestions(ownerId: string) {
    return prisma.question.findMany({
      where: {
        scope: "INSTRUCTOR",
        ownerId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAdminQuestions() {
    return prisma.question.findMany({
      where: { scope: "ADMIN" },
      orderBy: { createdAt: "desc" },
    });
  }

  async getQuestionById(questionId: string, userId: string, userRole: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    // FR-QB-04: Isolation at query layer — 404 not 403
    if (userRole === "INSTRUCTOR") {
      if (question.scope === "INSTRUCTOR" && question.ownerId !== userId) {
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
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.scope === "INSTRUCTOR" && question.ownerId !== ownerId) {
      throw new NotFoundError("Question not found");
    }

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
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.scope === "INSTRUCTOR" && question.ownerId !== ownerId) {
      throw new NotFoundError("Question not found");
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

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only create exams for your own courses",
      );
    }

    // Check if final exam already exists (FR-EX-01: one final per course)
    if (input.type === "final") {
      const existingFinal = await prisma.exam.findFirst({
        where: {
          courseId: input.courseId,
          type: "final",
        },
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

    return exam;
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

    const examsWithAttempts = exams.map((exam) => {
      const examAttempts = attempts.filter((a) => a.examId === exam.id);
      const bestAttempt = examAttempts[0] ?? null;

      return {
        ...exam,
        attemptCount: examAttempts.length,
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

  async submitExam(accountId: string, input: SubmitExamInput) {
    const exam = await prisma.exam.findUnique({
      where: { id: input.examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    // Check learner profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Check if exam is open
    const now = new Date();
    if (exam.openDate && now < exam.openDate) {
      throw new ValidationError("Exam has not opened yet");
    }
    if (exam.closeDate && now > exam.closeDate) {
      throw new ValidationError("Exam has closed");
    }

    // Check attempt count and cooldown
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: input.examId,
        learnerProfileId: input.learnerProfileId,
      },
      orderBy: { attemptNumber: "desc" },
    });

    if (attempts.length >= exam.maxAttempts) {
      throw new ValidationError("Maximum attempts reached");
    }

    // Check cooldown
    const lastAttempt = attempts[0];
    if (lastAttempt && exam.cooldownHours > 0) {
      const cooldownEnd = new Date(
        lastAttempt.submittedAt!.getTime() +
          exam.cooldownHours * 60 * 60 * 1000,
      );
      if (now < cooldownEnd) {
        throw new ValidationError(
          `Please wait ${Math.ceil((cooldownEnd.getTime() - now.getTime()) / 3600000)} hours before retrying`,
        );
      }
    }

    const attemptNumber = attempts.length + 1;

    // Calculate score for auto-graded questions
    const examQuestions = exam.questions as Array<{
      questionId: string;
      marks?: number;
    }>;
    let score = 0;
    let totalGraded = 0;
    let needsManualGrading = false;

    for (const eq of examQuestions) {
      const question = await prisma.question.findUnique({
        where: { id: eq.questionId },
      });

      if (!question) continue;

      const userAnswer = input.answers[eq.questionId];
      const marks = eq.marks ?? question.marks;

      if (question.type === "mcq" || question.type === "true_false") {
        totalGraded += marks;
        const correct = question.correctAnswer as string;
        if (userAnswer === correct) {
          score += marks;
        } else if (question.negativeMarks > 0) {
          score -= question.negativeMarks;
        }
      } else if (question.type === "multi_select") {
        totalGraded += marks;
        const correct = question.correctAnswer as string[];
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];
        const isCorrect =
          correct.length === userAnswers.length &&
          correct.every((c) => userAnswers.includes(c));
        if (isCorrect) {
          score += marks;
        } else if (question.negativeMarks > 0) {
          score -= question.negativeMarks;
        }
      } else {
        // Short answer and essay — manual grading required
        needsManualGrading = true;
      }
    }

    const passed = !needsManualGrading ? score >= exam.passMark : null;

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: input.examId,
        learnerProfileId: input.learnerProfileId,
        attemptNumber,
        answers: JSON.parse(JSON.stringify(input.answers)),
        score: needsManualGrading ? null : score,
        totalMarks: exam.totalMarks,
        passed,
        graded: !needsManualGrading,
      },
    });

    return attempt;
  }

  async gradeWrittenAnswer(
    instructorId: string,
    attemptId: string,
    questionId: string,
    marksAwarded: number,
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { course: true } },
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    if (attempt.exam.course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only grade your own course exams");
    }

    // Update answers with marks
    const answers = attempt.answers as Record<string, unknown>;
    answers[`${questionId}_marks`] = marksAwarded;

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
      },
    });

    return { message: "Answer graded" };
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
      },
    });

    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

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
    };
  }

  async getExamQuestionsForLearner(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundError("Exam not found");
    }

    // Get question IDs from exam
    const examQuestions = exam.questions as Array<{
      questionId: string;
      marks?: number;
    }>;

    // Fetch full question details
    const questions = await prisma.question.findMany({
      where: {
        id: { in: examQuestions.map((q) => q.questionId) },
      },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
        correctAnswer: true, // Include for auto-grading
        marks: true,
        difficulty: true,
      },
    });

    // Return questions WITHOUT correctAnswer for learner
    const learnerQuestions = questions.map((question) => ({
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      marks: question.marks,
      difficulty: question.difficulty,
    }));

    return learnerQuestions;
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

    const bestAttempt =
      attempts
        .filter((a) => a.score !== null)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;

    return {
      exam,
      attempts: attempts.map((a) => ({
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
      })),
      bestAttempt: bestAttempt
        ? {
            id: bestAttempt.id,
            examId: bestAttempt.examId,
            examTitle: exam.title,
            learnerProfileId: bestAttempt.learnerProfileId,
            attemptNumber: bestAttempt.attemptNumber,
            score: bestAttempt.score,
            totalMarks: bestAttempt.totalMarks,
            passed: bestAttempt.passed,
            graded: bestAttempt.graded,
            startedAt: bestAttempt.startedAt,
            submittedAt: bestAttempt.submittedAt,
          }
        : null,
    };
  }
}

export const examService = new ExamService();
